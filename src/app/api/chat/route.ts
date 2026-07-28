import { NextRequest, NextResponse } from 'next/server';
import * as chat from '@/lib/chat-store';

// Живой чат поверх обычных HTTP-роутов — единственный вариант, который
// работает на Vercel (serverless не держит WebSocket). Клиент (ChatWidget)
// опрашивает GET раз в несколько секунд и шлёт сообщения через POST.
//
// Хранилище — память процесса (см. lib/chat-store.ts): базы у проекта нет.

export const dynamic = 'force-dynamic';

const MESSAGE_MAX_LEN = 500;
const NAME_MAX_LEN = 32;
// Антифлуд: не больше RATE_MAX сообщений за RATE_WINDOW_SEC от одного клиента.
const RATE_WINDOW_SEC = 5;
const RATE_MAX = 5;
// Кто опрашивал чат за последние N секунд, тот «онлайн».
const PRESENCE_TTL_SEC = 25;
const HISTORY_LIMIT = 50;
const BATCH_LIMIT = 100;

function sanitizeName(raw: unknown): string {
  if (typeof raw !== 'string') return '';
  return raw.replace(/\s+/g, ' ').trim().slice(0, NAME_MAX_LEN);
}

// GET /api/chat?cid=<uuid>&after=<seq> — новые сообщения и счётчик онлайна.
export async function GET(req: NextRequest) {
  try {
    const cid = req.nextUrl.searchParams.get('cid') ?? '';
    const after = Number(req.nextUrl.searchParams.get('after') ?? 0);

    if (cid) await chat.touch(cid);

    const messages =
      after > 0 ? await chat.since(after, BATCH_LIMIT) : await chat.latest(HISTORY_LIMIT);

    return NextResponse.json({
      ok: true,
      // Поля сохранены ради формы ответа, которую ждёт виджет. Админки нет,
      // поэтому админом не является никто.
      you: { isAdmin: false, name: null },
      online: await chat.online(PRESENCE_TTL_SEC),
      persistent: false,
      messages,
    });
  } catch (error) {
    console.error('[chat] GET не выполнен:', error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

// POST /api/chat { cid, name, text } — отправка сообщения.
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as {
      cid?: unknown;
      name?: unknown;
      text?: unknown;
    };

    const cid = typeof body.cid === 'string' ? body.cid.slice(0, 64) : '';
    const text = typeof body.text === 'string' ? body.text.trim().slice(0, MESSAGE_MAX_LEN) : '';
    const name = sanitizeName(body.name);

    if (!text || !name || !cid) {
      return NextResponse.json({ ok: false, error: 'bad_request' }, { status: 400 });
    }

    if ((await chat.recentCount(cid, RATE_WINDOW_SEC)) >= RATE_MAX) {
      return NextResponse.json({ ok: false, error: 'rate_limited' }, { status: 429 });
    }

    const message = await chat.add({ clientId: cid, name, text });
    await chat.touch(cid);

    return NextResponse.json({ ok: true, message });
  } catch (error) {
    console.error('[chat] POST не выполнен:', error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
