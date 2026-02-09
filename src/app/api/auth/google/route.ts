// Initiate Google OAuth flow

import { NextRequest, NextResponse } from 'next/server';
import { getAuthorizationUrl } from '@/lib/auth/oauth';
import { logger } from '@/lib/utils/logger';

export async function GET(request: NextRequest) {
  try {
    logger.info('Initiating Google OAuth flow');

    const authUrl = getAuthorizationUrl();

    return NextResponse.redirect(authUrl);
  } catch (error) {
    logger.error('OAuth initiation error:', error);
    return NextResponse.json(
      { error: 'Failed to initiate authentication' },
      { status: 500 }
    );
  }
}
