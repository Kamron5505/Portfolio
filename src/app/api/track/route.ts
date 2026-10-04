import { NextResponse, type NextRequest } from 'next/server';
import { saveSession, type SessionSnapshot } from '@/lib/analytics-store';

export const dynamic = 'force-dynamic';

// Приём снимков визита от VisitTracker (sendBeacon). Всё, что пришло от
// браузера, считается недоверенным: обрезаем строки, ограничиваем числа и
// списки, оставляем только известные поля. IP не сохраняется.

const MAX_BODY = 8 * 1024;
const BOT_UA = /bot|crawl|spider|slurp|preview|headless|lighthouse|pagespeed|facebookexternalhit|telegrambot/i;
const ID_RE = /^[a-z0-9-]{8,64}$/i;

// Грубый лимит на инстанс функции: живой посетитель шлёт снимок раз в 15 с,
// 40 запросов за 10 минут с запасом. Защищает бесплатную квоту Redis от спама.
const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_MAX = 40;
const g = globalThis as { __trackRate?: Map<string, number[]> };
function rateLimited(ip: string) {
  const state = (g.__trackRate ??= new Map<string, number[]>());
  const now = Date.now();
  const hits = (state.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  hits.push(now);
  state.set(ip, hits);
  if (state.size > 5000) state.clear();
  return hits.length > RATE_MAX;
}

const str = (v: unknown, max = 120) => (typeof v === 'string' ? v.slice(0, max) : '');
const num = (v: unknown, min: number, max: number) =>
  typeof v === 'number' && Number.isFinite(v) ? Math.min(max, Math.max(min, Math.round(v))) : min;

function parseUa(ua: string) {
  const browser = /edg\//i.test(ua)
    ? 'Edge'
    : /opr\//i.test(ua)
      ? 'Opera'
      : /yabrowser/i.test(ua)
        ? 'Yandex'
        : /chrome|crios/i.test(ua)
          ? 'Chrome'
          : /firefox|fxios/i.test(ua)
            ? 'Firefox'
            : /safari/i.test(ua)
              ? 'Safari'
              : 'Other';
  const os = /iphone|ipad|ios/i.test(ua)
    ? 'iOS'
    : /android/i.test(ua)
      ? 'Android'
      : /windows/i.test(ua)
        ? 'Windows'
        : /mac os/i.test(ua)
          ? 'macOS'
          : /linux/i.test(ua)
            ? 'Linux'
            : 'Other';
  return { browser, os };
}

export async function POST(req: NextRequest) {
  const ua = req.headers.get('user-agent') ?? '';
  if (!ua || BOT_UA.test(ua)) return new NextResponse(null, { status: 204 });
  // IP используется только для лимита в памяти и нигде не сохраняется.
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local';
  if (rateLimited(ip)) return new NextResponse(null, { status: 429 });

  const raw = await req.text().catch(() => '');
  if (!raw || raw.length > MAX_BODY) return new NextResponse(null, { status: 413 });

  let body: Record<string, unknown>;
  try {
    body = JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return new NextResponse(null, { status: 400 });
  }

  const sid = str(body.sid, 64);
  const vid = str(body.vid, 64);
  if (!ID_RE.test(sid) || !ID_RE.test(vid)) return new NextResponse(null, { status: 400 });

  const sections: Record<string, number> = {};
  if (body.sections && typeof body.sections === 'object') {
    for (const [id, seconds] of Object.entries(body.sections as Record<string, unknown>).slice(0, 20)) {
      if (/^[a-z0-9-]{1,32}$/i.test(id)) sections[id] = num(seconds, 0, 6 * 3600);
    }
  }

  const utm = (body.utm ?? {}) as Record<string, unknown>;
  const device = body.device === 'mobile' || body.device === 'tablet' ? body.device : 'desktop';
  // Город Vercel кодирует через encodeURIComponent.
  let city = '';
  try {
    city = decodeURIComponent(req.headers.get('x-vercel-ip-city') ?? '');
  } catch {}

  const snapshot: SessionSnapshot = {
    sid,
    vid,
    returning: body.returning === true,
    locale: str(body.locale, 5),
    path: str(body.path, 80),
    referrer: str(body.referrer, 120),
    utm: { source: str(utm.source, 40), medium: str(utm.medium, 40), campaign: str(utm.campaign, 60) },
    device,
    lang: str(body.lang, 16),
    startedAt: num(body.startedAt, 0, Date.now() + 60_000),
    durationSec: num(body.durationSec, 0, 6 * 3600),
    maxScroll: num(body.maxScroll, 0, 100),
    sections,
    clicks: Array.isArray(body.clicks) ? body.clicks.slice(0, 30).map((c) => str(c, 60)).filter(Boolean) : [],
    quizStarted: body.quizStarted === true,
    country: str(req.headers.get('x-vercel-ip-country'), 4),
    city: city.slice(0, 60),
    ...parseUa(ua),
  };

  try {
    await saveSession(snapshot);
  } catch (error) {
    console.error('[track] не удалось сохранить визит:', error);
  }
  return new NextResponse(null, { status: 204 });
}
