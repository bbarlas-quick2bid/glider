// Email types

export interface Email {
  id: string; // Gmail message ID
  userId: string;
  threadId: string;
  subject: string | null;
  senderEmail: string | null;
  senderName: string | null;
  recipientEmails: string[];
  emailDate: Date;
  bodyText: string | null;
  bodyHtml: string | null;
  snippet: string | null;
  labels: string[];
  isRead: boolean;
  fetchedAt: Date;
  createdAt: Date;
}

export interface GmailMessage {
  id: string;
  threadId: string;
  labelIds: string[];
  snippet: string;
  payload: {
    headers: Array<{ name: string; value: string }>;
    body?: { data?: string };
    parts?: Array<{
      mimeType: string;
      body?: { data?: string };
      parts?: any[];
    }>;
  };
  internalDate: string;
}

export interface ParsedEmail {
  id: string;
  threadId: string;
  subject: string;
  from: string;
  fromName: string;
  to: string[];
  date: Date;
  bodyText: string;
  bodyHtml: string;
  snippet: string;
  labels: string[];
  isRead: boolean;
}
