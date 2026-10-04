import { Redis } from '@upstash/redis';

// ─────────────────────────────────────────────────────────────────────────────
// Хранилище дневной аналитики для ИИ-отчёта (Upstash Redis).
//
// Храним только анонимные данные визита: случайный id из браузера, страну и
// город из заголовков Vercel, устройство, источник, время по секциям, клики.
// IP-адреса не сохраняются. Ключи живут 4 дня и удаляются сами.
//
// «День» отчёта идёт с 21:00 до 21:00 по Ташкенту: отчёт уходит в 21:00 и
// должен покрыть всё, что было после прошлого отчёта.
// ─────────────────────────────────────────────────────────────────────────────

const TTL_SECONDS = 4 * 24 * 60 * 60;
const MAX_SESSIONS_PER_DAY = 5000;

export type SessionSnapshot = {
  sid: string;
  vid: string;
  returning: boolean;
  locale: string;
  path: string;
  referrer: string;
  utm: { source: string; medium: string; campaign: string };
  device: 'mobile' | 'tablet' | 'desktop';
  lang: string;
  startedAt: number;
  durationSec: number;
  maxScroll: number;
  sections: Record<string, number>;
  clicks: string[];
  quizStarted: boolean;
  // Заполняет сервер из заголовков Vercel.
  country: string;
  city: string;
  browser: string;
  os: string;
};

export type QuizLead = {
  sid: string;
  locale: string;
  at: number;
  answers: { question: string; answer: string }[];
  summary: string;
};

let client: Redis | null | undefined;

/** null, если Redis не настроен (локальная разработка) — аналитика молча выключена. */
export function getRedis(): Redis | null {
  if (client !== undefined) return client;
  // Поддерживаем оба набора имён: от интеграции Vercel Marketplace (KV_*) и
  // «родные» Upstash.
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  client = url && token ? new Redis({ url, token }) : null;
  return client;
}

/** Ключ «дня» отчёта: дата по UTC+8 = Ташкент (UTC+5) со сдвигом на 3 часа. */
export function windowKey(at: Date = new Date()): string {
  return new Date(at.getTime() + 8 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

const sessionsKey = (day: string) => `analytics:${day}:sessions`;
const leadsKey = (day: string) => `analytics:${day}:leads`;

export async function saveSession(snapshot: SessionSnapshot): Promise<void> {
  const redis = getRedis();
  if (!redis) return;
  const key = sessionsKey(windowKey());
  // Снимок одной сессии перезаписывается целиком — в отчёт идёт последнее
  // состояние. Новые сессии сверх лимита отбрасываем (защита от флуда).
  const exists = await redis.hexists(key, snapshot.sid);
  if (!exists && (await redis.hlen(key)) >= MAX_SESSIONS_PER_DAY) return;
  await redis.hset(key, { [snapshot.sid]: JSON.stringify(snapshot) });
  await redis.expire(key, TTL_SECONDS);
}

export async function saveQuizLead(lead: QuizLead): Promise<void> {
  const redis = getRedis();
  if (!redis) return;
  const key = leadsKey(windowKey());
  await redis.rpush(key, JSON.stringify(lead));
  await redis.expire(key, TTL_SECONDS);
}

const parse = <T>(value: unknown): T | null => {
  if (value && typeof value === 'object') return value as T;
  try {
    return JSON.parse(String(value)) as T;
  } catch {
    return null;
  }
};

export async function loadDay(day: string): Promise<{ sessions: SessionSnapshot[]; leads: QuizLead[] }> {
  const redis = getRedis();
  if (!redis) return { sessions: [], leads: [] };
  const [rawSessions, rawLeads] = await Promise.all([
    redis.hgetall<Record<string, unknown>>(sessionsKey(day)),
    redis.lrange(leadsKey(day), 0, -1),
  ]);
  const sessions = Object.values(rawSessions ?? {})
    .map((v) => parse<SessionSnapshot>(v))
    .filter((s): s is SessionSnapshot => s !== null);
  const leads = (rawLeads ?? []).map((v) => parse<QuizLead>(v)).filter((l): l is QuizLead => l !== null);
  return { sessions, leads };
}
