import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const protectedRoutes = ['/dashboard', '/profile', '/admin', '/get-started', '/conversational-ai', '/job-description', '/job-dashboard'];
const publicRoutes = ['/login', '/signup', '/'];

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // Redirect old /jobs route to /dashboard
  if (path === '/jobs' || path.startsWith('/jobs/') || path === '/jobs/') {
    console.log(`🔄 Middleware: Redirecting ${path} to /dashboard`);
    const redirectUrl = new URL('/dashboard', req.nextUrl);
    return NextResponse.redirect(redirectUrl, { status: 301 }); // Permanent redirect
  }

  const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route));
  const isPublicRoute = publicRoutes.includes(path);

  // Get tokens from cookies
  const token = req.cookies.get('access_token')?.value;
  const refreshToken = req.cookies.get('refresh_token')?.value;

  // Check if token is valid
  let isAuthenticated = false;
  let tokenExpired = false;

  if (token) {
    try {
      // For development, we'll skip JWT verification since we don't have the secret
      // In production, you should verify the JWT properly
      if (process.env.NODE_ENV === 'development') {
        // Simple expiration check by decoding the payload
        const payload = JSON.parse(atob(token.split('.')[1]));
        const currentTime = Date.now() / 1000;
        const timeUntilExpiry = payload.exp - currentTime;

        // Consider token valid if it hasn't expired
        isAuthenticated = timeUntilExpiry > 0;
        tokenExpired = timeUntilExpiry <= 0;

        // Log token status for debugging
        if (tokenExpired) {
          console.log('⚠️ Middleware: Access token expired', {
            expiredBy: Math.abs(timeUntilExpiry),
            hasRefreshToken: !!refreshToken
          });
        }
      } else {
        // For production with proper JWT secret
        const secret = new TextEncoder().encode(process.env.NEXT_PUBLIC_JWT_SECRET);
        await jwtVerify(token, secret);
        isAuthenticated = true;
      }
    } catch (error) {
      console.log('⚠️ Middleware: Token validation failed:', error);
      isAuthenticated = false;
      tokenExpired = true;
    }
  }

  // Redirect logic - only redirect if no refresh token is available
  // If refresh token exists, let the page load and handle token refresh client-side
  if (isProtectedRoute && !isAuthenticated) {
    // If we have a refresh token, allow the request to proceed
    // The client-side code will handle token refresh
    if (refreshToken && tokenExpired) {
      console.log('✅ Middleware: Allowing request with expired access token (refresh token available)');
      return NextResponse.next();
    }

    // No refresh token available, redirect to login
    console.log('🔒 Middleware: Redirecting to login (no valid tokens)');
    return NextResponse.redirect(new URL('/login', req.nextUrl));
  }

  // If user is authenticated and trying to access public routes, redirect to dashboard
  if (isPublicRoute && isAuthenticated) {
    if (path === '/login' || path === '/signup' || path === '/') {
      // Redirect to a route that will check jobs and redirect appropriately
      return NextResponse.redirect(new URL('/auth-redirect', req.nextUrl));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};
