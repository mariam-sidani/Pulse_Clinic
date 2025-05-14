import { NextResponse } from 'next/server';
import { verifyTokenEdge } from './lib/jwt-edge';
import { logInfo } from './log';

const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

export function middleware(request) {
  // NextResponse.next() is used to continue the request without modifying it
  const res = NextResponse.next();
  const { pathname } = request.nextUrl;

  // Legacy redirect for old paths
  if (pathname.startsWith('/settings/schedule')) {
    const url = request.nextUrl.clone();
    url.pathname = '/appointments';
    return NextResponse.redirect(url);
  }

  // Protected routes check
  const protectedPaths = ['/dashboard', '/appointments', '/settings', '/patients'];
  const isPathProtected = protectedPaths.some((path) =>
    pathname === path || pathname.startsWith(`${path}/`)
  );

  if (isPathProtected) {
    logInfo('Middleware', `Protected path access: ${pathname}`);
    const token = request.cookies.get('token')?.value;

    if (!token) {
      logInfo('Middleware', 'No token found, redirecting to login page');
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      url.search = `?callback=${encodeURIComponent(pathname)}`;
      return NextResponse.redirect(url);
    }

    try {
      // Use our Edge-compatible JWT verification
      const payload = verifyTokenEdge(token);
      
      if (!payload) {
        throw new Error('Invalid token');
      }

      // Set user info in headers for the page
      res.headers.set('x-user-id', payload.userId || '');
      res.headers.set('x-user-role', payload.role || '');
      
      return res;
    } catch (error) {
      console.error('Authentication error:', error);
      logInfo('Middleware', `Authentication error: ${error.message}`);
      
      // Clear the invalid token
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('token');
      return response;
    }
  }

  return res;
}

export { config }; 