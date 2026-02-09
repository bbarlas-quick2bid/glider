// Email parsing utilities

import { convert } from 'html-to-text';
import { GmailMessage, ParsedEmail } from '@/lib/types/email';
import { logger } from '@/lib/utils/logger';

// Extract header value from Gmail message
function getHeader(message: GmailMessage, headerName: string): string {
  const header = message.payload.headers.find(
    (h) => h.name.toLowerCase() === headerName.toLowerCase()
  );
  return header?.value || '';
}

// Decode base64url encoded string
function decodeBase64(str: string): string {
  try {
    // Convert base64url to base64
    const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    // Decode base64 to utf-8
    return Buffer.from(base64, 'base64').toString('utf-8');
  } catch (error) {
    logger.error('Base64 decode error:', error);
    return '';
  }
}

// Extract email body from Gmail message payload
function extractBody(message: GmailMessage): { html: string; text: string } {
  let html = '';
  let text = '';

  // Check if body has data directly
  if (message.payload.body?.data) {
    const decoded = decodeBase64(message.payload.body.data);
    text = decoded;
    return { html, text };
  }

  // Check parts for multipart messages
  if (message.payload.parts) {
    for (const part of message.payload.parts) {
      if (part.mimeType === 'text/plain' && part.body?.data) {
        text = decodeBase64(part.body.data);
      } else if (part.mimeType === 'text/html' && part.body?.data) {
        html = decodeBase64(part.body.data);
      } else if (part.parts) {
        // Nested parts (e.g., multipart/alternative within multipart/mixed)
        for (const nestedPart of part.parts) {
          if (nestedPart.mimeType === 'text/plain' && nestedPart.body?.data) {
            text = decodeBase64(nestedPart.body.data);
          } else if (nestedPart.mimeType === 'text/html' && nestedPart.body?.data) {
            html = decodeBase64(nestedPart.body.data);
          }
        }
      }
    }
  }

  return { html, text };
}

// Convert HTML to plain text
export function htmlToText(html: string): string {
  if (!html) return '';

  try {
    return convert(html, {
      wordwrap: false,
      selectors: [
        { selector: 'a', options: { ignoreHref: true } },
        { selector: 'img', format: 'skip' },
      ],
    });
  } catch (error) {
    logger.error('HTML to text conversion error:', error);
    return html; // Return raw HTML if conversion fails
  }
}

// Parse Gmail message into standardized format
export function parseGmailMessage(message: GmailMessage): ParsedEmail {
  const subject = getHeader(message, 'Subject');
  const from = getHeader(message, 'From');
  const to = getHeader(message, 'To');
  const date = getHeader(message, 'Date');

  // Extract name and email from "Name <email@example.com>" format
  const fromMatch = from.match(/^(.*?)\s*<(.+?)>$/) || [null, from, from];
  const fromName = fromMatch[1]?.trim() || '';
  const fromEmail = fromMatch[2]?.trim() || from;

  // Parse recipients
  const recipients = to
    .split(',')
    .map((r) => {
      const match = r.match(/<(.+?)>/) || [null, r.trim()];
      return match[1] || r.trim();
    })
    .filter(Boolean);

  // Extract body
  const { html, text } = extractBody(message);

  // If we have HTML but no text, convert HTML to text
  let bodyText = text;
  if (!bodyText && html) {
    bodyText = htmlToText(html);
  }

  // Parse date
  let emailDate: Date;
  try {
    emailDate = new Date(date || message.internalDate);
  } catch {
    emailDate = new Date(parseInt(message.internalDate));
  }

  // Check if read
  const isRead = !message.labelIds.includes('UNREAD');

  return {
    id: message.id,
    threadId: message.threadId,
    subject,
    from: fromEmail,
    fromName,
    to: recipients,
    date: emailDate,
    bodyText,
    bodyHtml: html,
    snippet: message.snippet,
    labels: message.labelIds,
    isRead,
  };
}

// Truncate text to specified word count
export function truncateText(text: string, maxWords: number = 500): string {
  const words = text.split(/\s+/);
  if (words.length <= maxWords) {
    return text;
  }
  return words.slice(0, maxWords).join(' ') + '...';
}
