import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const protectedRoutes = ['/dashboard', '/profile', '/admin', '/jobs', '/get-started', '/conversational-ai', '/job-description'];
const publicRoutes = ['/login', '/register', '/', '/landing-page'];

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route));
  const isPublicRoute = publicRoutes.includes(path);

  // Get token from cookie
  const token = req.cookies.get('access_token')?.value;

  // Check if token is valid
  let isAuthenticated = false;
  if (token) {
    try {
      // For development, we'll skip JWT verification since we don't have the secret
      // In production, you should verify the JWT properly
      if (process.env.NODE_ENV === 'development') {
        // Simple expiration check by decoding the payload
        const payload = JSON.parse(atob(token.split('.')[1]));
        const currentTime = Date.now() / 1000;
        isAuthenticated = payload.exp > currentTime;
      } else {
        // For production with proper JWT secret
        const secret = new TextEncoder().encode(process.env.NEXT_PUBLIC_JWT_SECRET);
        await jwtVerify(token, secret);
        isAuthenticated = true;
      }
    } catch {
      isAuthenticated = false;
    }
  }

  // Redirect logic
  if (isProtectedRoute && !isAuthenticated) {
    return NextResponse.redirect(new URL('/login', req.nextUrl));
  }

  if (isPublicRoute && isAuthenticated && path === '/login') {
    // Redirect to a route that will check jobs and redirect appropriately
    return NextResponse.redirect(new URL('/auth-redirect', req.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};
