import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public paths that should never be redirected
  const publicPaths = ['/login', '/menu', '/', '/bag', '/checkout', '/track', '/privacy', '/terms', '/offline'];
  const isPublic = publicPaths.some(route => pathname === route || pathname.startsWith(route + '/'));

  if (isPublic) {
    return NextResponse.next();
  }

  // Protected routes that require authentication
  const protectedRoutes = ['/account', '/orders'];
  const isProtected = protectedRoutes.some(route => pathname.startsWith(route));

  if (isProtected) {
    const token = request.cookies.get('access_token')?.value;
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|sw.js|manifest.json).*)'],
};
