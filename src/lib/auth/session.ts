// Session management with iron-session

import { SessionOptions } from 'iron-session';
import { SessionData } from '@/lib/types/auth';

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET!,
  cookieName: 'glider_session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: '/',
  },
};

// Type augmentation for iron-session
declare module 'iron-session' {
  interface IronSessionData {
    user?: SessionData;
  }
}

// Helper to check if session is valid
export function isAuthenticated(session: any): session is { user: SessionData } {
  return session?.user?.isLoggedIn === true && !!session.user.userId;
}
