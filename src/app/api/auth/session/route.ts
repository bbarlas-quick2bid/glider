// Get current session status

import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { sessionOptions, isAuthenticated } from '@/lib/auth/session';

export async function GET(request: NextRequest) {
  try {
    const session = await getIronSession(await cookies(), sessionOptions);

    if (isAuthenticated(session)) {
      return NextResponse.json({
        authenticated: true,
        user: session.user,
      });
    }

    return NextResponse.json({
      authenticated: false,
    });
  } catch (error) {
    return NextResponse.json(
      { authenticated: false },
      { status: 500 }
    );
  }
}
