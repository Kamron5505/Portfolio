import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { cookies } from 'next/headers';
import { db, isDbConfigured } from '@/lib/db';
import { SESSION_COOKIE, verifySession } from '@/lib/session';

// Живой чат поверх обычных HTTP-роутов — единственный вариант, который
// работает на Vercel (serverless не держит WebSocket). Клиент (ChatWidget)
// опрашивает GET раз в несколько секунд и шлёт сообщения через POST.
// Хранилище — таблицы chat_messages / chat_presence в той же базе, что и
// контент сайта (Neon на проде, PGlite локально).

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

// Схема создаётся лениво один раз на инстанс функции: serverless не даёт
// точки «при старте сервера», а гонять DDL на каждый запрос расточительно.
let schemaReady: Promise<void> | null = null;
function ensureSchema(): Promise<void> {
  if (!schemaReady) {
    schemaReady = (async () => {
      const sql = db();
      await sql.query(`
        create table if not exists chat_messages (
          id         uuid primary key,
          seq        bigserial,
          client_id  text,
          name       text not null,
          text       text not null,
          is_admin   boolean not null default false,
          created_at timestamptz not null default now()
        )
      `);
      // Таблица могла быть создана старой версией без этих колонок.
      await sql.query('alter table chat_messages add column if not exists seq bigserial');
      await sql.query('alter table chat_messages add column if not exists client_id text');
      await sql.query('create index if not exists chat_messages_seq_idx on chat_messages (seq)');
      await sql.query(`
        create table if not exists chat_presence (
          client_id text primary key,
          last_seen timestamptz not null default now()
        )
      `);
    })().catch((error) => {
      // Не кэшируем неудачу: следующий запрос попробует снова.
      schemaReady = null;
      throw error;
    });
  }
  return schemaReady;
}

type MessageRow = Record<string, unknown>;

function toMessage(r: MessageRow) {
  return {
    id: String(r.id),
    seq: Number(r.seq),
    name: String(r.name),
    text: String(r.text),
    isAdmin: Boolean(r.is_admin),
    ts: new Date(r.created_at as string).getTime(),
  };
}

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

async function touchPresence(clientId: string) {
  const sql = db();
  await sql.query(
    `insert into chat_presence (client_id, last_seen) values ($1, now())
     on conflict (client_id) do update set last_seen = now()`,
    [clientId],
  );
  // Изредка подчищаем давно ушедших, чтобы таблица не росла вечно.
  if (Math.random() < 0.02) {
    await sql.query(`delete from chat_presence where last_seen < now() - interval '1 hour'`);
  }
}

async function onlineCount(): Promise<number> {
  const rows = await db().query(
    `select count(*)::int as n from chat_presence where last_seen > now() - interval '${PRESENCE_TTL_SEC} seconds'`,
  );
  return Number(rows[0]?.n ?? 0);
}

// GET /api/chat?cid=<uuid>&after=<seq> — новые сообщения, онлайн и «кто я».
export async function GET(req: NextRequest) {
  if (!isDbConfigured()) return NextResponse.json({ ok: false, disabled: true }, { status: 503 });

  try {
    await ensureSchema();
    const sql = db();
    const cid = req.nextUrl.searchParams.get('cid') ?? '';
    const after = Number(req.nextUrl.searchParams.get('after') ?? 0);

    if (cid) await touchPresence(cid);

    let rows: MessageRow[];
    if (after > 0) {
      rows = await sql.query(
        'select id, seq, name, text, is_admin, created_at from chat_messages where seq > $1 order by seq asc limit $2',
        [after, BATCH_LIMIT],
      );
    } else {
      // Первый запрос: последние HISTORY_LIMIT сообщений.
      rows = (
        await sql.query(
          'select id, seq, name, text, is_admin, created_at from chat_messages order by seq desc limit $1',
          [HISTORY_LIMIT],
        )
      ).reverse();
    }

    const admin = await currentAdmin();
    return NextResponse.json({
      ok: true,
      you: { isAdmin: Boolean(admin), name: admin?.username ?? null },
      online: await onlineCount(),
      messages: rows.map(toMessage),
    });
  } catch (error) {
    console.error('[chat] GET не выполнен:', error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

// POST /api/chat { cid, name, text } — отправка сообщения.
export async function POST(req: NextRequest) {
  if (!isDbConfigured()) return NextResponse.json({ ok: false, disabled: true }, { status: 503 });

  try {
    await ensureSchema();
    const sql = db();
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

    const recent = await sql.query(
      `select count(*)::int as n from chat_messages
       where client_id = $1 and created_at > now() - interval '${RATE_WINDOW_SEC} seconds'`,
      [cid],
    );
    if (Number(recent[0]?.n ?? 0) >= RATE_MAX) {
      return NextResponse.json({ ok: false, error: 'rate_limited' }, { status: 429 });
    }

    const id = randomUUID();
    await sql.query(
      'insert into chat_messages (id, client_id, name, text, is_admin) values ($1, $2, $3, $4, $5)',
      [id, cid, name, text, Boolean(admin)],
    );
    await touchPresence(cid);

    const rows = await sql.query(
      'select id, seq, name, text, is_admin, created_at from chat_messages where id = $1',
      [id],
    );
    return NextResponse.json({ ok: true, message: rows[0] ? toMessage(rows[0]) : null });
  } catch (error) {
    console.error('[chat] POST не выполнен:', error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
