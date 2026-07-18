import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { db } from './db';
import { SESSION_COOKIE, SESSION_TTL_HOURS, signSession, verifySession, type Session } from './session';

// Серверная часть аутентификации: хеши паролей и cookie сессии.
// Пароль хранится в базе только как хеш bcrypt и никогда не покидает сервер.

export const hashPassword = (plain: string) => bcrypt.hash(plain, 12);

export async function verifyCredentials(username: string, password: string): Promise<Session | null> {
  const sql = db();
  const rows = (await sql`
    select id, username, password_hash from admin_users where username = ${username} limit 1
  `) as Record<string, unknown>[];

  const user = rows[0];
  // Хешируем даже при отсутствии пользователя: одинаковое время ответа не даёт
  // перебором выяснить, какие логины существуют.
  const hash = user ? String(user.password_hash) : '$2a$12$invalidinvalidinvalidinvalidinvalidinvalidinvalidinva';
  const ok = await bcrypt.compare(password, hash);

  if (!user || !ok) return null;
  return { userId: Number(user.id), username: String(user.username) };
}

export async function getSession(): Promise<Session | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  return token ? verifySession(token) : null;
}

export async function startSession(session: Session) {
  const token = await signSession(session);
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_TTL_HOURS * 60 * 60,
  });
}

export async function endSession() {
  (await cookies()).delete(SESSION_COOKIE);
}

/**
 * Защита для server actions. Middleware закрывает страницы, но actions
 * вызываются собственным POST-запросом, поэтому каждое действие, меняющее
 * данные, обязано проверять сессию само.
 */
export async function requireSession(): Promise<Session> {
  const session = await getSession();
  if (!session) throw new Error('Не авторизован. Войдите в админку заново.');
  return session;
}

export type { Session };
