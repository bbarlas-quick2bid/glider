// API route to get emails with their analyses for the dashboard

import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { sessionOptions, isAuthenticated } from '@/lib/auth/session';
import { getEmailsByUserId } from '@/lib/db/email-queries';
import { getAnalysesByUserId } from '@/lib/db/analysis-queries';
import { logger } from '@/lib/utils/logger';

export async function GET(request: NextRequest) {
  try {
    const session = await getIronSession(await cookies(), sessionOptions);

    if (!isAuthenticated(session)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.userId;

    // Get emails and analyses
    const [emails, analyses] = await Promise.all([
      getEmailsByUserId(userId, 50),
      getAnalysesByUserId(userId, 50),
    ]);

    // Create a map of analyses by email ID for quick lookup
    const analysisMap = new Map(
      analyses.map(analysis => [analysis.emailId, analysis])
    );

    // Combine emails with their analyses
    const emailsWithAnalyses = emails.map(email => ({
      ...email,
      analysis: analysisMap.get(email.id),
    }));

    return NextResponse.json({
      success: true,
      data: {
        emails: emailsWithAnalyses,
        total: emails.length,
        analyzed: analyses.length,
      },
    });
  } catch (error: any) {
    logger.error('Dashboard API error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to load dashboard data',
      },
      { status: 500 }
    );
  }
}
