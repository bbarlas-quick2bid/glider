// Middleware to protect authenticated routes

import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions } from '@/lib/auth/session';

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Only protect /dashboard routes
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    try {
      const session = await getIronSession(request, response, sessionOptions);

      // Check if user is authenticated
      if (!session.user?.isLoggedIn) {
        // Redirect to home page
        return NextResponse.redirect(new URL('/', request.url));
      }
    } catch (error) {
      console.error('Middleware error:', error);
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
