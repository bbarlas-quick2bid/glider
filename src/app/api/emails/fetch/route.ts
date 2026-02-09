// API route to fetch emails from Gmail

import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { sessionOptions, isAuthenticated } from '@/lib/auth/session';
import { getTokens } from '@/lib/db/queries';
import { saveEmails, getEmailsByUserId } from '@/lib/db/email-queries';
import { GmailClient } from '@/lib/gmail/client';
import { fetchRecentEmails } from '@/lib/gmail/fetcher';
import { logger } from '@/lib/utils/logger';
import { AuthError } from '@/lib/utils/errors';

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getIronSession(await cookies(), sessionOptions);

    if (!isAuthenticated(session)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.userId;

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const refresh = searchParams.get('refresh') === 'true';
    const pageToken = searchParams.get('pageToken') || undefined;

    logger.info(`Fetching emails for user ${userId}, refresh=${refresh}`);

    // If not refreshing, return cached emails from database
    if (!refresh && !pageToken) {
      const cachedEmails = await getEmailsByUserId(userId, 50);

      if (cachedEmails.length > 0) {
        logger.info(`Returning ${cachedEmails.length} cached emails`);
        return NextResponse.json({
          success: true,
          data: {
            emails: cachedEmails,
            hasMore: false,
            fromCache: true,
          },
        });
      }
    }

    // Get OAuth tokens
    const tokens = await getTokens(userId);

    if (!tokens) {
      throw new AuthError('OAuth tokens not found', 'NO_TOKENS');
    }

    // Create Gmail client
    const gmailClient = new GmailClient(userId, tokens);

    // Fetch recent emails
    const { emails, nextPageToken } = await fetchRecentEmails(gmailClient, {
      maxResults: 50,
      daysBack: 7,
      pageToken,
    });

    // Save emails to database
    if (emails.length > 0) {
      await saveEmails(userId, emails);
      logger.info(`Saved ${emails.length} emails to database`);
    }

    return NextResponse.json({
      success: true,
      data: {
        emails,
        hasMore: !!nextPageToken,
        nextPageToken,
        fromCache: false,
      },
    });
  } catch (error: any) {
    logger.error('Fetch emails API error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch emails',
      },
      { status: error.statusCode || 500 }
    );
  }
}
