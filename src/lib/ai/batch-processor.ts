// Batch email processing with AI

import PQueue from 'p-queue';
import { callClaudeJSON } from './claude-client';
import { buildBatchAnalysisPrompt } from './prompts';
import { truncateText } from '@/lib/gmail/parser';
import { Email } from '@/lib/types/email';
import { BatchAnalysisResult } from '@/lib/types/ai';
import { logger } from '@/lib/utils/logger';

// Rate limiter: Process 3 batches concurrently
const queue = new PQueue({ concurrency: 3 });

const BATCH_SIZE = 10; // Process 10 emails per API call

export async function batchAnalyzeEmails(
  emails: Email[]
): Promise<BatchAnalysisResult[]> {
  logger.info(`Starting batch analysis for ${emails.length} emails`);

  // Split into batches
  const batches: Email[][] = [];
  for (let i = 0; i < emails.length; i += BATCH_SIZE) {
    batches.push(emails.slice(i, i + BATCH_SIZE));
  }

  logger.info(`Created ${batches.length} batches`);

  // Process batches with rate limiting
  const results: BatchAnalysisResult[] = [];

  for (const batch of batches) {
    const batchResults = await queue.add(() => processBatch(batch));
    results.push(...batchResults);
  }

  logger.info(`Completed batch analysis: ${results.length} emails analyzed`);

  return results;
}

async function processBatch(emails: Email[]): Promise<BatchAnalysisResult[]> {
  try {
    // Prepare email data for prompt
    const emailData = emails.map(email => ({
      id: email.id,
      from: email.senderEmail || 'Unknown',
      subject: email.subject || '(No subject)',
      date: email.emailDate.toISOString(),
      body: truncateText(email.bodyText || email.snippet || '', 500),
    }));

    // Build prompt
    const prompt = buildBatchAnalysisPrompt(emailData);

    // Call Claude API
    const analyses = await callClaudeJSON<any[]>(prompt, {
      temperature: 0.3,
      maxTokens: 8192,
    });

    // Map results
    return analyses.map(analysis => ({
      emailId: analysis.emailId,
      analysis: {
        actionItems: analysis.actionItems || [],
        hasActionItems: analysis.hasActionItems || false,
        recommendedAction: analysis.recommendedAction,
        reason: analysis.reason,
        confidence: analysis.confidence,
        suggestedDetails: analysis.suggestedDetails || {},
        sentiment: analysis.sentiment,
        summary: analysis.summary,
      },
    }));
  } catch (error) {
    logger.error('Batch processing error:', error);

    // Return empty results for failed batch
    return emails.map(email => ({
      emailId: email.id,
      analysis: {
        actionItems: [],
        hasActionItems: false,
        recommendedAction: 'archive' as const,
        reason: 'Failed to analyze',
        confidence: 'low' as const,
        suggestedDetails: {},
        sentiment: 'neutral' as const,
        summary: 'Analysis failed',
      },
      error: error instanceof Error ? error.message : 'Unknown error',
    }));
  }
}

// Single email analysis (fallback for individual processing)
export async function analyzeSingleEmail(email: Email): Promise<BatchAnalysisResult> {
  const results = await batchAnalyzeEmails([email]);
  return results[0];
}
