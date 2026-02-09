// Gmail API client wrapper

import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { getOAuth2Client, refreshAccessToken } from '@/lib/auth/oauth';
import { OAuthTokens } from '@/lib/types/auth';
import { GmailMessage } from '@/lib/types/email';
import { GmailError } from '@/lib/utils/errors';
import { logger } from '@/lib/utils/logger';
import { saveTokens } from '@/lib/db/queries';

export class GmailClient {
  private oauth2Client: OAuth2Client;
  private gmail: any;
  private userId: string;
  private tokens: OAuthTokens;

  constructor(userId: string, tokens: OAuthTokens) {
    this.userId = userId;
    this.tokens = tokens;
    this.oauth2Client = getOAuth2Client();
    this.oauth2Client.setCredentials({
      access_token: tokens.accessToken,
      refresh_token: tokens.refreshToken,
      expiry_date: tokens.expiryDate,
    });

    this.gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });
  }

  // Ensure token is valid, refresh if needed
  private async ensureValidToken(): Promise<void> {
    const now = Date.now();
    const buffer = 5 * 60 * 1000; // 5 minutes buffer

    // Check if token is expired or about to expire
    if (this.tokens.expiryDate - buffer < now) {
      logger.info('Access token expired, refreshing...');

      try {
        const newTokens = await refreshAccessToken(this.tokens.refreshToken);

        // Update tokens
        this.tokens.accessToken = newTokens.accessToken;
        this.tokens.expiryDate = newTokens.expiryDate;

        // Save to database
        await saveTokens(this.userId, this.tokens);

        // Update OAuth2 client
        this.oauth2Client.setCredentials({
          access_token: this.tokens.accessToken,
          refresh_token: this.tokens.refreshToken,
          expiry_date: this.tokens.expiryDate,
        });

        logger.info('Access token refreshed successfully');
      } catch (error) {
        logger.error('Failed to refresh access token:', error);
        throw new GmailError('Failed to refresh access token', 'TOKEN_REFRESH_FAILED');
      }
    }
  }

  // List messages with query
  async listMessages(options: {
    maxResults?: number;
    query?: string;
    pageToken?: string;
  } = {}): Promise<{ messages: Array<{ id: string; threadId: string }>; nextPageToken?: string }> {
    await this.ensureValidToken();

    try {
      const response = await this.gmail.users.messages.list({
        userId: 'me',
        maxResults: options.maxResults || 50,
        q: options.query || 'in:inbox',
        pageToken: options.pageToken,
      });

      return {
        messages: response.data.messages || [],
        nextPageToken: response.data.nextPageToken,
      };
    } catch (error: any) {
      logger.error('Gmail list messages error:', error);

      if (error.code === 429) {
        throw new GmailError('Rate limit exceeded', 'RATE_LIMIT');
      }

      throw new GmailError('Failed to list messages', 'LIST_FAILED');
    }
  }

  // Get a single message by ID
  async getMessage(messageId: string): Promise<GmailMessage> {
    await this.ensureValidToken();

    try {
      const response = await this.gmail.users.messages.get({
        userId: 'me',
        id: messageId,
        format: 'full',
      });

      return response.data as GmailMessage;
    } catch (error: any) {
      logger.error('Gmail get message error:', error);

      if (error.code === 429) {
        throw new GmailError('Rate limit exceeded', 'RATE_LIMIT');
      }

      throw new GmailError('Failed to get message', 'GET_FAILED');
    }
  }

  // Batch get multiple messages
  async batchGetMessages(messageIds: string[]): Promise<GmailMessage[]> {
    await this.ensureValidToken();

    const messages: GmailMessage[] = [];

    // Process in chunks of 100 (Gmail API limit)
    const chunkSize = 100;
    for (let i = 0; i < messageIds.length; i += chunkSize) {
      const chunk = messageIds.slice(i, i + chunkSize);

      try {
        const promises = chunk.map(id => this.getMessage(id));
        const results = await Promise.all(promises);
        messages.push(...results);
      } catch (error) {
        logger.error('Batch get messages error:', error);
        // Continue with other chunks even if one fails
      }
    }

    return messages;
  }

  // Get user profile
  async getProfile(): Promise<{ emailAddress: string }> {
    await this.ensureValidToken();

    try {
      const response = await this.gmail.users.getProfile({
        userId: 'me',
      });

      return {
        emailAddress: response.data.emailAddress,
      };
    } catch (error) {
      logger.error('Gmail get profile error:', error);
      throw new GmailError('Failed to get profile', 'PROFILE_FAILED');
    }
  }
}
