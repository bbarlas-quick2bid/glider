// Logout endpoint

import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { sessionOptions } from '@/lib/auth/session';
import { logger } from '@/lib/utils/logger';

export async function POST(request: NextRequest) {
  try {
    const session = await getIronSession(await cookies(), sessionOptions);

    logger.info('User logging out:', session.user?.email);

    // Destroy session
    session.destroy();

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Failed to logout' },
      { status: 500 }
    );
  }
}
