// AI analysis types

export type Priority = 'high' | 'medium' | 'low';
export type ActionCategory =
  | 'response_needed'
  | 'meeting_request'
  | 'task'
  | 'decision_required'
  | 'follow_up';

export type RecommendedAction =
  | 'reply'
  | 'schedule_meeting'
  | 'delegate'
  | 'archive'
  | 'follow_up'
  | 'prioritize';

export type Sentiment = 'positive' | 'neutral' | 'urgent' | 'negative';
export type Confidence = 'high' | 'medium' | 'low';

export interface ActionItem {
  description: string;
  priority: Priority;
  estimatedTime: string;
  category: ActionCategory;
  deadline: string | null; // ISO date string or null
}

export interface RecommendationDetails {
  keyPoints?: string[];
  suggestedAttendees?: string[];
  purpose?: string;
  suggestedDate?: string;
}

export interface EmailAnalysis {
  id: string;
  emailId: string;
  userId: string;
  summary: string | null;
  sentiment: Sentiment | null;
  actionItems: ActionItem[];
  hasActionItems: boolean;
  recommendedAction: RecommendedAction | null;
  recommendationReason: string | null;
  recommendationConfidence: Confidence | null;
  recommendationDetails: RecommendationDetails | null;
  analyzedAt: Date;
  modelVersion: string;
}

export interface ActionExtractionResponse {
  actionItems: ActionItem[];
  hasActionItems: boolean;
}

export interface RecommendationResponse {
  recommendedAction: RecommendedAction;
  reason: string;
  confidence: Confidence;
  suggestedDetails: RecommendationDetails;
  sentiment: Sentiment;
  summary: string;
}

export interface BatchAnalysisResult {
  emailId: string;
  analysis: {
    actionItems: ActionItem[];
    hasActionItems: boolean;
    recommendedAction: RecommendedAction;
    reason: string;
    confidence: Confidence;
    suggestedDetails: RecommendationDetails;
    sentiment: Sentiment;
    summary: string;
  };
  error?: string;
}
