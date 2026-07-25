import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { chatIsPersistent, chatStore } from '@/lib/chat-store';
import { SESSION_COOKIE, verifySession } from '@/lib/session';

// Живой чат поверх обычных HTTP-роутов — единственный вариант, который
// работает на Vercel (serverless не держит WebSocket). Клиент (ChatWidget)
// опрашивает GET раз в несколько секунд и шлёт сообщения через POST.
//
// Хранилище выбирает chatStore(): таблицы chat_messages / chat_presence, если
// база настроена, иначе память процесса. Без базы чат не отключается —
// раньше роут отдавал 503, и виджет по нему прятал кнопку с сайта совсем.

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

async function currentAdmin(): Promise<{ username: string } | null> {
  try {
    const token = (await cookies()).get(SESSION_COOKIE)?.value;
    if (!token) return null;
    const session = await verifySession(token);
    return session ? { username: session.username || 'admin' } : null;
  } catch {
    return null;
  }
}

function sanitizeName(raw: unknown): string {
  if (typeof raw !== 'string') return '';
  return raw.replace(/\s+/g, ' ').trim().slice(0, NAME_MAX_LEN);
}

// GET /api/chat?cid=<uuid>&after=<seq> — новые сообщения, онлайн и «кто я».
export async function GET(req: NextRequest) {
  try {
    const store = chatStore();
    const cid = req.nextUrl.searchParams.get('cid') ?? '';
    const after = Number(req.nextUrl.searchParams.get('after') ?? 0);

    if (cid) await store.touch(cid);

    const messages =
      after > 0 ? await store.since(after, BATCH_LIMIT) : await store.latest(HISTORY_LIMIT);

    const admin = await currentAdmin();
    return NextResponse.json({
      ok: true,
      you: { isAdmin: Boolean(admin), name: admin?.username ?? null },
      online: await store.online(PRESENCE_TTL_SEC),
      persistent: chatIsPersistent(),
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
    const store = chatStore();
    const body = (await req.json().catch(() => ({}))) as {
      cid?: unknown;
      name?: unknown;
      text?: unknown;
    };

    const cid = typeof body.cid === 'string' ? body.cid.slice(0, 64) : '';
    const text = typeof body.text === 'string' ? body.text.trim().slice(0, MESSAGE_MAX_LEN) : '';

    // Админа определяем по cookie сессии — имя из формы игнорируется.
    const admin = await currentAdmin();
    const name = admin ? admin.username : sanitizeName(body.name);
    if (!text || !name || !cid) {
      return NextResponse.json({ ok: false, error: 'bad_request' }, { status: 400 });
    }

    if ((await store.recentCount(cid, RATE_WINDOW_SEC)) >= RATE_MAX) {
      return NextResponse.json({ ok: false, error: 'rate_limited' }, { status: 429 });
    }

    const message = await store.add({ clientId: cid, name, text, isAdmin: Boolean(admin) });
    await store.touch(cid);

    return NextResponse.json({ ok: true, message });
  } catch (error) {
    console.error('[chat] POST не выполнен:', error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
