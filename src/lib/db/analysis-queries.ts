// Database queries for email analyses

import { query } from './client';
import { EmailAnalysis } from '@/lib/types/ai';
import { BatchAnalysisResult } from '@/lib/types/ai';

export async function saveAnalysis(
  userId: string,
  result: BatchAnalysisResult
): Promise<void> {
  const { emailId, analysis } = result;

  await query(
    `INSERT INTO email_analyses (
      email_id, user_id, summary, sentiment, action_items,
      has_action_items, recommended_action, recommendation_reason,
      recommendation_confidence, recommendation_details
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    ON CONFLICT (email_id, user_id) DO UPDATE SET
      summary = EXCLUDED.summary,
      sentiment = EXCLUDED.sentiment,
      action_items = EXCLUDED.action_items,
      has_action_items = EXCLUDED.has_action_items,
      recommended_action = EXCLUDED.recommended_action,
      recommendation_reason = EXCLUDED.recommendation_reason,
      recommendation_confidence = EXCLUDED.recommendation_confidence,
      recommendation_details = EXCLUDED.recommendation_details,
      analyzed_at = NOW()`,
    [
      emailId,
      userId,
      analysis.summary,
      analysis.sentiment,
      JSON.stringify(analysis.actionItems),
      analysis.hasActionItems,
      analysis.recommendedAction,
      analysis.reason,
      analysis.confidence,
      JSON.stringify(analysis.suggestedDetails),
    ]
  );
}

export async function saveAnalyses(
  userId: string,
  results: BatchAnalysisResult[]
): Promise<void> {
  await Promise.all(results.map(result => saveAnalysis(userId, result)));
}

export async function getAnalysisByEmailId(
  emailId: string
): Promise<EmailAnalysis | null> {
  const result = await query<any>(
    'SELECT * FROM email_analyses WHERE email_id = $1',
    [emailId]
  );

  if (result.rows.length === 0) {
    return null;
  }

  const row = result.rows[0];

  return {
    id: row.id,
    emailId: row.email_id,
    userId: row.user_id,
    summary: row.summary,
    sentiment: row.sentiment,
    actionItems: row.action_items || [],
    hasActionItems: row.has_action_items,
    recommendedAction: row.recommended_action,
    recommendationReason: row.recommendation_reason,
    recommendationConfidence: row.recommendation_confidence,
    recommendationDetails: row.recommendation_details || {},
    analyzedAt: row.analyzed_at,
    modelVersion: row.model_version,
  };
}

export async function getAnalysesByUserId(
  userId: string,
  limit: number = 50
): Promise<EmailAnalysis[]> {
  const result = await query<any>(
    `SELECT * FROM email_analyses
     WHERE user_id = $1
     ORDER BY analyzed_at DESC
     LIMIT $2`,
    [userId, limit]
  );

  return result.rows.map(row => ({
    id: row.id,
    emailId: row.email_id,
    userId: row.user_id,
    summary: row.summary,
    sentiment: row.sentiment,
    actionItems: row.action_items || [],
    hasActionItems: row.has_action_items,
    recommendedAction: row.recommended_action,
    recommendationReason: row.recommendation_reason,
    recommendationConfidence: row.recommendation_confidence,
    recommendationDetails: row.recommendation_details || {},
    analyzedAt: row.analyzed_at,
    modelVersion: row.model_version,
  }));
}
