import { WebSocketServer, WebSocket } from 'ws';
import { randomUUID } from 'node:crypto';
import { db, isDbConfigured } from '@/lib/db';
import { SESSION_COOKIE, verifySession } from '@/lib/session';

// Живой чат: один общий канал, где посетители общаются между собой,
// а администратор (по cookie admin_session) — с посетителями.
//
// Сервер поднимается из src/instrumentation.ts на отдельном порту
// (CHAT_WS_PORT, по умолчанию 3001) внутри процесса Next — отдельный
// процесс не нужен. История держится в памяти (последние HISTORY_LIMIT
// сообщений) и, если настроена база, дублируется в chat_messages.

const HISTORY_LIMIT = 200;
const MESSAGE_MAX_LEN = 500;
const NAME_MAX_LEN = 32;
// Простейший антифлуд: не больше RATE_MAX сообщений за RATE_WINDOW_MS.
const RATE_WINDOW_MS = 5000;
const RATE_MAX = 5;

export type ChatMessage = {
  id: string;
  name: string;
  text: string;
  isAdmin: boolean;
  ts: number; // unix ms
};

type ConnState = {
  name: string;
  isAdmin: boolean;
  sentAt: number[]; // отметки времени последних сообщений — для антифлуда
};

// При hot reload в next dev модуль может пересоздаться — сервер и историю
// держим на globalThis, чтобы не ловить EADDRINUSE и не терять сообщения.
const g = globalThis as {
  __chatWss?: WebSocketServer;
  __chatHistory?: ChatMessage[];
};

function history(): ChatMessage[] {
  if (!g.__chatHistory) g.__chatHistory = [];
  return g.__chatHistory;
}

function sanitizeName(raw: unknown): string {
  if (typeof raw !== 'string') return '';
  return raw.replace(/\s+/g, ' ').trim().slice(0, NAME_MAX_LEN);
}

function parseCookies(header: string | undefined): Record<string, string> {
  const out: Record<string, string> = {};
  if (!header) return out;
  for (const part of header.split(';')) {
    const eq = part.indexOf('=');
    if (eq === -1) continue;
    out[part.slice(0, eq).trim()] = decodeURIComponent(part.slice(eq + 1).trim());
  }
  return out;
}

async function ensureTable() {
  await db().query(`
    create table if not exists chat_messages (
      id         uuid primary key,
      name       text not null,
      text       text not null,
      is_admin   boolean not null default false,
      created_at timestamptz not null default now()
    )
  `);
  await db().query('create index if not exists chat_messages_created_idx on chat_messages (created_at)');
}

async function loadHistory() {
  const rows = await db().query(
    'select id, name, text, is_admin, created_at from chat_messages order by created_at desc limit $1',
    [HISTORY_LIMIT],
  );
  g.__chatHistory = rows
    .map((r) => ({
      id: String(r.id),
      name: String(r.name),
      text: String(r.text),
      isAdmin: Boolean(r.is_admin),
      ts: new Date(r.created_at as string).getTime(),
    }))
    .reverse();
}

function persist(msg: ChatMessage) {
  if (!isDbConfigured()) return;
  db()
    .query('insert into chat_messages (id, name, text, is_admin, created_at) values ($1, $2, $3, $4, $5)', [
      msg.id,
      msg.name,
      msg.text,
      msg.isAdmin,
      new Date(msg.ts).toISOString(),
    ])
    .catch((error) => console.error('[chat] сообщение не записалось в базу:', error));
}

export async function startChatServer() {
  if (g.__chatWss) return;

  if (isDbConfigured()) {
    try {
      await ensureTable();
      await loadHistory();
    } catch (error) {
      console.error('[chat] база недоступна, история будет только в памяти:', error);
    }
  }

  const port = Number(process.env.CHAT_WS_PORT || 3001);
  const wss = new WebSocketServer({ port });
  g.__chatWss = wss;

  const states = new Map<WebSocket, ConnState>();

  const broadcast = (payload: unknown) => {
    const data = JSON.stringify(payload);
    for (const client of wss.clients) {
      if (client.readyState === WebSocket.OPEN) client.send(data);
    }
  };

  const broadcastPresence = () => broadcast({ type: 'presence', online: wss.clients.size });

  wss.on('connection', async (ws, req) => {
    // Админа узнаём по той же JWT-cookie, что и админка: cookie привязана
    // к хосту (не к порту), поэтому браузер шлёт её и на WS-порт.
    let admin: { username: string } | null = null;
    try {
      const token = parseCookies(req.headers.cookie)[SESSION_COOKIE];
      if (token) {
        const session = await verifySession(token);
        if (session) admin = { username: session.username || 'admin' };
      }
    } catch {
      // Нет секрета или битый токен — значит, обычный посетитель.
    }

    const state: ConnState = { name: admin?.username ?? '', isAdmin: Boolean(admin), sentAt: [] };
    states.set(ws, state);

    ws.send(
      JSON.stringify({
        type: 'welcome',
        you: { name: state.name, isAdmin: state.isAdmin },
        online: wss.clients.size,
      }),
    );
    ws.send(JSON.stringify({ type: 'history', messages: history() }));
    broadcastPresence();

    ws.on('message', (raw) => {
      try {
        handleMessage(raw);
      } catch (error) {
        // Ошибка обработки одного сообщения не должна ронять соединение молча.
        console.error('[chat] ошибка обработки сообщения:', error);
      }
    });

    const handleMessage = (raw: unknown) => {
      let data: { type?: string; name?: unknown; text?: unknown };
      try {
        data = JSON.parse(String(raw));
      } catch {
        return;
      }

      if (data.type === 'hello') {
        // Посетитель представляется; имя админа берётся из сессии и не меняется.
        if (!state.isAdmin) {
          const name = sanitizeName(data.name);
          if (name) state.name = name;
        }
        return;
      }

      if (data.type === 'message') {
        const text = typeof data.text === 'string' ? data.text.trim().slice(0, MESSAGE_MAX_LEN) : '';
        if (!text || !state.name) return;

        const now = Date.now();
        state.sentAt = state.sentAt.filter((t) => now - t < RATE_WINDOW_MS);
        if (state.sentAt.length >= RATE_MAX) {
          ws.send(JSON.stringify({ type: 'error', code: 'rate_limited' }));
          return;
        }
        state.sentAt.push(now);

        const msg: ChatMessage = {
          id: randomUUID(),
          name: state.name,
          text,
          isAdmin: state.isAdmin,
          ts: now,
        };
        const h = history();
        h.push(msg);
        if (h.length > HISTORY_LIMIT) h.splice(0, h.length - HISTORY_LIMIT);
        persist(msg);
        broadcast({ type: 'message', message: msg });
      }
    };

    ws.on('close', () => {
      states.delete(ws);
      broadcastPresence();
    });
    ws.on('error', () => ws.close());
  });

  wss.on('error', (error: NodeJS.ErrnoException) => {
    if (error.code === 'EADDRINUSE') {
      // В dev Next может выполнить instrumentation в нескольких контекстах —
      // порт уже слушает первый из них, это штатная ситуация.
      console.log(`[chat] порт ${port} уже занят другим воркером — пропускаю повторный запуск`);
    } else {
      console.error('[chat] WebSocket-сервер не запустился:', error);
    }
    g.__chatWss = undefined;
  });

  wss.on('listening', () => console.log(`[chat] WebSocket-сервер слушает порт ${port}`));
}
