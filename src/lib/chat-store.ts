import { randomUUID } from 'node:crypto';

// Хранилище живого чата — в памяти процесса. Базы данных у проекта нет.
//
// Что это значит на практике: посетители, попавшие на один и тот же инстанс
// функции, видят сообщения друг друга; история теряется при перезапуске, а на
// serverless с несколькими инстансами может разойтись. Для чата на портфолио
// этого достаточно — альтернативой было бы тянуть Postgres ради виджета.

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
};

// Сколько сообщений держим: чат на портфолио, длинная история тут никому не
// нужна, а расти бесконечно нельзя.
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

function state(): MemoryState {
  if (!g.__chatMemory) {
    g.__chatMemory = { messages: [], seq: 0, presence: new Map() };
  }
  return g.__chatMemory;
}

function strip({ clientId: _clientId, ...msg }: StoredMessage): ChatMessage {
  return msg;
}

/** Сообщения со seq строго больше указанного, по возрастанию. */
export async function since(after: number, limit: number): Promise<ChatMessage[]> {
  return state()
    .messages.filter((m) => m.seq > after)
    .slice(0, limit)
    .map(strip);
}

/** Последние `limit` сообщений, по возрастанию. */
export async function latest(limit: number): Promise<ChatMessage[]> {
  return state().messages.slice(-limit).map(strip);
}

/** Сколько сообщений этот клиент отправил за последние `windowSec` секунд. */
export async function recentCount(clientId: string, windowSec: number): Promise<number> {
  const from = Date.now() - windowSec * 1000;
  return state().messages.filter((m) => m.clientId === clientId && m.ts > from).length;
}

export async function add({ clientId, name, text }: NewMessage): Promise<ChatMessage> {
  const s = state();
  const message: StoredMessage = {
    id: randomUUID(),
    seq: ++s.seq,
    name,
    text,
    // Админки нет — метить сообщения как «от админа» больше некому.
    isAdmin: false,
    ts: Date.now(),
    clientId,
  };
  s.messages.push(message);
  if (s.messages.length > MEMORY_CAP) {
    s.messages.splice(0, s.messages.length - MEMORY_CAP);
  }
  return strip(message);
}

/** Отметить клиента живым (для счётчика «онлайн»). */
export async function touch(clientId: string): Promise<void> {
  const s = state();
  s.presence.set(clientId, Date.now());
  // Подчищаем давно ушедших, чтобы карта не росла вечно.
  const stale = Date.now() - 60 * 60 * 1000;
  for (const [id, seen] of s.presence) {
    if (seen < stale) s.presence.delete(id);
  }
}

export async function online(ttlSec: number): Promise<number> {
  const from = Date.now() - ttlSec * 1000;
  let n = 0;
  for (const seen of state().presence.values()) if (seen > from) n++;
  return n;
}
