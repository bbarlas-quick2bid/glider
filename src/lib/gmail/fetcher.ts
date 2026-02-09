// Email fetching logic with rate limiting

import PQueue from 'p-queue';
import { GmailClient } from './client';
import { parseGmailMessage } from './parser';
import { ParsedEmail } from '@/lib/types/email';
import { logger } from '@/lib/utils/logger';

// Rate limiter: 10 requests per second
const queue = new PQueue({
  interval: 1000,
  intervalCap: 10,
});

export interface FetchOptions {
  maxResults?: number;
  daysBack?: number;
  pageToken?: string;
}

export async function fetchRecentEmails(
  gmailClient: GmailClient,
  options: FetchOptions = {}
): Promise<{ emails: ParsedEmail[]; nextPageToken?: string }> {
  const {
    maxResults = 50,
    daysBack = 7,
    pageToken,
  } = options;

  logger.info(`Fetching emails: maxResults=${maxResults}, daysBack=${daysBack}`);

  try {
    // Calculate date for query
    const date = new Date();
    date.setDate(date.getDate() - daysBack);
    const dateStr = date.toISOString().split('T')[0].replace(/-/g, '/');

    // Build Gmail query
    const query = `after:${dateStr}`;

    // List messages with rate limiting
    const result = await queue.add(() =>
      gmailClient.listMessages({
        maxResults,
        query,
        pageToken,
      })
    );

    const messages = result?.messages || [];
    const nextPageToken = result?.nextPageToken;

    if (!messages || messages.length === 0) {
      logger.info('No messages found');
      return { emails: [], nextPageToken };
    }

    logger.info(`Found ${messages.length} messages, fetching details...`);

    // Fetch full message details with rate limiting
    const messageIds = messages.map(m => m.id);
    const fullMessages = await fetchMessagesWithRateLimit(gmailClient, messageIds);

    // Parse messages
    const parsedEmails = fullMessages.map(msg => parseGmailMessage(msg));

    logger.info(`Successfully parsed ${parsedEmails.length} emails`);

    return { emails: parsedEmails, nextPageToken };
  } catch (error) {
    logger.error('Fetch emails error:', error);
    throw error;
  }
}

async function fetchMessagesWithRateLimit(
  gmailClient: GmailClient,
  messageIds: string[]
) {
  // Process in chunks of 10 to respect rate limits
  const chunkSize = 10;
  const messages = [];

  for (let i = 0; i < messageIds.length; i += chunkSize) {
    const chunk = messageIds.slice(i, i + chunkSize);

    const promises = chunk.map(id =>
      queue.add(() => gmailClient.getMessage(id))
    );

    const results = await Promise.allSettled(promises);

    for (const result of results) {
      if (result.status === 'fulfilled' && result.value) {
        messages.push(result.value);
      } else {
        logger.error('Failed to fetch message:', result.status === 'rejected' ? result.reason : 'No value');
      }
    }
  }

  return messages;
}
