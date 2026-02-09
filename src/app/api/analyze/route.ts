// API route to analyze emails with AI

import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { sessionOptions, isAuthenticated } from '@/lib/auth/session';
import { getUnanalyzedEmails } from '@/lib/db/email-queries';
import { batchAnalyzeEmails } from '@/lib/ai/batch-processor';
import { saveAnalyses } from '@/lib/db/analysis-queries';
import { logger } from '@/lib/utils/logger';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session: any = await getIronSession(await cookies(), sessionOptions);

    if (!isAuthenticated(session)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.userId;

    logger.info(`Analyzing emails for user ${userId}`);

    // Get unanalyzed emails from database
    const emails = await getUnanalyzedEmails(userId, 50);

    if (emails.length === 0) {
      logger.info('No unanalyzed emails found');
      return NextResponse.json({
        success: true,
        data: {
          analyzed: 0,
          message: 'No new emails to analyze',
        },
      });
    }

    logger.info(`Found ${emails.length} unanalyzed emails`);

    // Batch analyze emails
    const results = await batchAnalyzeEmails(emails);

    // Filter out failed analyses
    const successful = results.filter(r => !r.error);
    const failed = results.filter(r => r.error);

    logger.info(`Analysis complete: ${successful.length} successful, ${failed.length} failed`);

    // Save analyses to database
    if (successful.length > 0) {
      await saveAnalyses(userId, successful);
    }

    return NextResponse.json({
      success: true,
      data: {
        analyzed: successful.length,
        failed: failed.length,
        failedEmailIds: failed.map(r => r.emailId),
      },
    });
  } catch (error: any) {
    logger.error('Analyze API error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to analyze emails',
      },
      { status: error.statusCode || 500 }
    );
  }
}

// GET endpoint to check analysis status
export async function GET(request: NextRequest) {
  try {
    const session: any = await getIronSession(await cookies(), sessionOptions);

    if (!isAuthenticated(session)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.userId;

    // Count unanalyzed emails
    const unanalyzedEmails = await getUnanalyzedEmails(userId, 1000);

    return NextResponse.json({
      success: true,
      data: {
        unanalyzedCount: unanalyzedEmails.length,
      },
    });
  } catch (error: any) {
    logger.error('Analysis status check error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to check analysis status',
      },
      { status: 500 }
    );
  }
}
