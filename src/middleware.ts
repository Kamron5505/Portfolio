import { NextResponse, type NextRequest } from 'next/server';
import { SESSION_COOKIE, verifySession } from '@/lib/session';

// Закрывает весь /admin, кроме страницы входа. Это первый рубеж: сами server
// actions дополнительно проверяют сессию через requireSession().
export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (pathname === '/admin/login') return NextResponse.next();

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySession(token) : null;

  if (!session) {
    const url = request.nextUrl.clone();
    url.pathname = '/admin/login';
    // Куда вернуть после входа.
    url.search = `?next=${encodeURIComponent(pathname + search)}`;
    const response = NextResponse.redirect(url);
    if (token) response.cookies.delete(SESSION_COOKIE);
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
