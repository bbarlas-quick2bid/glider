// API response types

import { Email, ParsedEmail } from './email';
import { EmailAnalysis } from './ai';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface FetchEmailsResponse {
  emails: ParsedEmail[];
  hasMore: boolean;
  nextPageToken?: string;
}

export interface AnalyzeEmailsResponse {
  analyses: EmailAnalysis[];
  failed: string[]; // Email IDs that failed to analyze
}

export interface EmailWithAnalysis extends Email {
  analysis?: EmailAnalysis;
}
