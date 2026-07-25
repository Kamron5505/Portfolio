import { randomUUID } from 'node:crypto';
import { db, isDbConfigured } from './db';

// Хранилище живого чата. Две реализации за одним интерфейсом:
//
//   • Postgres — когда задан DATABASE_URL или LOCAL_DB=1. История переживает
//     перезапуск и общая для всех инстансов функции.
//   • Память процесса — когда база не настроена вовсе. Чат при этом работает
//     «как есть»: посетители одного сервера видят друг друга, но история
//     теряется при перезапуске, а на serverless-платформе с несколькими
//     инстансами у разных посетителей она может разойтись.
//
// Раньше без базы роут отдавал 503, а виджет по нему прятал кнопку совсем —
// чат просто исчезал с сайта. Теперь недоступность базы понижает качество,
// но не выключает функцию.

export type ChatMessage = {
  id: string;
  seq: number;
  name: string;
  text: string;
  isAdmin: boolean;
  ts: number;
};

export type NewMessage = {
  clientId: string;
  name: string;
  text: string;
  isAdmin: boolean;
};

export type ChatStore = {
  /** Сообщения со seq строго больше указанного, по возрастанию. */
  since: (after: number, limit: number) => Promise<ChatMessage[]>;
  /** Последние `limit` сообщений, по возрастанию. */
  latest: (limit: number) => Promise<ChatMessage[]>;
  /** Сколько сообщений этот клиент отправил за последние `windowSec` секунд. */
  recentCount: (clientId: string, windowSec: number) => Promise<number>;
  add: (msg: NewMessage) => Promise<ChatMessage>;
  /** Отметить клиента живым (для счётчика «онлайн»). */
  touch: (clientId: string) => Promise<void>;
  online: (ttlSec: number) => Promise<number>;
};

// ─────────────────────────── хранилище в памяти ───────────────────────────

// Сколько сообщений держим в памяти: чат на портфолио, длинная история тут
// никому не нужна, а расти бесконечно нельзя.
const MEMORY_CAP = 500;

type StoredMessage = ChatMessage & { clientId: string };

type MemoryState = {
  messages: StoredMessage[];
  seq: number;
  presence: Map<string, number>;
};

// Состояние на globalThis: в next dev модуль пересоздаётся при каждой правке,
// и обычная переменная модуля обнуляла бы чат на ровном месте.
const g = globalThis as { __chatMemory?: MemoryState };

function memoryState(): MemoryState {
  if (!g.__chatMemory) {
    g.__chatMemory = { messages: [], seq: 0, presence: new Map() };
  }
  return g.__chatMemory;
}

function strip({ clientId: _clientId, ...msg }: StoredMessage): ChatMessage {
  return msg;
}

function memoryStore(): ChatStore {
  return {
    async since(after, limit) {
      return memoryState()
        .messages.filter((m) => m.seq > after)
        .slice(0, limit)
        .map(strip);
    },

    async latest(limit) {
      return memoryState().messages.slice(-limit).map(strip);
    },

    async recentCount(clientId, windowSec) {
      const from = Date.now() - windowSec * 1000;
      return memoryState().messages.filter((m) => m.clientId === clientId && m.ts > from).length;
    },

    async add({ clientId, name, text, isAdmin }) {
      const state = memoryState();
      const message: StoredMessage = {
        id: randomUUID(),
        seq: ++state.seq,
        name,
        text,
        isAdmin,
        ts: Date.now(),
        clientId,
      };
      state.messages.push(message);
      if (state.messages.length > MEMORY_CAP) {
        state.messages.splice(0, state.messages.length - MEMORY_CAP);
      }
      return strip(message);
    },

    async touch(clientId) {
      const state = memoryState();
      state.presence.set(clientId, Date.now());
      // Подчищаем давно ушедших, чтобы карта не росла вечно.
      const stale = Date.now() - 60 * 60 * 1000;
      for (const [id, seen] of state.presence) {
        if (seen < stale) state.presence.delete(id);
      }
    },

    async online(ttlSec) {
      const from = Date.now() - ttlSec * 1000;
      let n = 0;
      for (const seen of memoryState().presence.values()) if (seen > from) n++;
      return n;
    },
  };
}

// ────────────────────────── хранилище в Postgres ──────────────────────────

// Схема создаётся лениво один раз на инстанс функции: serverless не даёт точки
// «при старте сервера», а гонять DDL на каждый запрос расточительно.
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

const COLUMNS = 'id, seq, name, text, is_admin, created_at';

function toMessage(r: Record<string, unknown>): ChatMessage {
  return {
    id: String(r.id),
    seq: Number(r.seq),
    name: String(r.name),
    text: String(r.text),
    isAdmin: Boolean(r.is_admin),
    ts: new Date(r.created_at as string).getTime(),
  };
}

function dbStore(): ChatStore {
  return {
    async since(after, limit) {
      await ensureSchema();
      const rows = await db().query(
        `select ${COLUMNS} from chat_messages where seq > $1 order by seq asc limit $2`,
        [after, limit],
      );
      return rows.map(toMessage);
    },

    async latest(limit) {
      await ensureSchema();
      const rows = await db().query(
        `select ${COLUMNS} from chat_messages order by seq desc limit $1`,
        [limit],
      );
      return rows.reverse().map(toMessage);
    },

    async recentCount(clientId, windowSec) {
      await ensureSchema();
      const rows = await db().query(
        `select count(*)::int as n from chat_messages
         where client_id = $1 and created_at > now() - interval '${windowSec} seconds'`,
        [clientId],
      );
      return Number(rows[0]?.n ?? 0);
    },

    async add({ clientId, name, text, isAdmin }) {
      await ensureSchema();
      const sql = db();
      const id = randomUUID();
      await sql.query(
        'insert into chat_messages (id, client_id, name, text, is_admin) values ($1, $2, $3, $4, $5)',
        [id, clientId, name, text, isAdmin],
      );
      const rows = await sql.query(`select ${COLUMNS} from chat_messages where id = $1`, [id]);
      if (!rows[0]) throw new Error('сообщение не записалось');
      return toMessage(rows[0]);
    },

    async touch(clientId) {
      await ensureSchema();
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
    },

    async online(ttlSec) {
      await ensureSchema();
      const rows = await db().query(
        `select count(*)::int as n from chat_presence
         where last_seen > now() - interval '${ttlSec} seconds'`,
      );
      return Number(rows[0]?.n ?? 0);
    },
  };
}

/** Хранилище чата: Postgres, если он настроен, иначе память процесса. */
export function chatStore(): ChatStore {
  return isDbConfigured() ? dbStore() : memoryStore();
}

/** Есть ли у чата постоянное хранилище (нужно только для диагностики). */
export const chatIsPersistent = () => isDbConfigured();
