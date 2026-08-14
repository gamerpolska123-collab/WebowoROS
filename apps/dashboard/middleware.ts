import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'dev-secret-change-me');

// Ścieżki publiczne — nie wymagają auth
const PUBLIC_PATHS = ['/login', '/forbidden', '/_next', '/favicon.ico'];

// Dozwolone role w dashboard
const ALLOWED_ROLES = ['admin', 'kitchen', 'driver'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Publiczne ścieżki — przepuść
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Statyczne assety — przepuść
  if (pathname.match(/\.(ico|png|jpg|jpeg|svg|css|js)$/)) {
    return NextResponse.next();
  }

  const token = request.cookies.get('access_token')?.value;

  // Brak tokena → login
  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET, {
      clockTolerance: 60,
    });

    const role = payload.role as string;

    // Rola niedozwolona → forbidden
    if (!ALLOWED_ROLES.includes(role)) {
      return NextResponse.redirect(new URL('/forbidden', request.url));
    }

    // Dodaj nagłówek z userId dla SSR (opcjonalnie)
    const response = NextResponse.next();
    response.headers.set('x-user-id', payload.sub as string);
    response.headers.set('x-user-role', role);
    return response;
  } catch {
    // Token nieważny/wygasł → login
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
};
