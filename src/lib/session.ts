import { SignJWT, jwtVerify } from 'jose';

// Только работа с JWT: никаких next/headers и обращений к базе, поэтому модуль
// безопасно импортируется из middleware, которое исполняется на edge-рантайме.

export const SESSION_COOKIE = 'admin_session';
export const SESSION_TTL_HOURS = 12;

export type Session = { userId: number; username: string };

function secret() {
  const value = process.env.ADMIN_SESSION_SECRET;
  if (!value || value.length < 32) {
    throw new Error(
      'ADMIN_SESSION_SECRET не задан или короче 32 символов. Сгенерируйте: openssl rand -base64 32',
    );
  }
  return new TextEncoder().encode(value);
}

export async function signSession(session: Session): Promise<string> {
  return new SignJWT({ username: session.username })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(String(session.userId))
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_HOURS}h`)
    .sign(secret());
}

export async function verifySession(token: string): Promise<Session | null> {
  try {
    const { payload } = await jwtVerify(token, secret());
    if (!payload.sub) return null;
    return { userId: Number(payload.sub), username: String(payload.username ?? '') };
  } catch {
    // Просроченный, подделанный или подписанный другим секретом токен —
    // во всех случаях это просто «не авторизован».
    return null;
  }
}
