// Database queries for emails

import { query } from './client';
import { Email, ParsedEmail } from '@/lib/types/email';

export async function saveEmail(userId: string, email: ParsedEmail): Promise<void> {
  await query(
    `INSERT INTO emails (
      id, user_id, thread_id, subject, sender_email, sender_name,
      recipient_emails, email_date, body_text, body_html, snippet,
      labels, is_read, created_at
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW())
    ON CONFLICT (id) DO UPDATE SET
      subject = EXCLUDED.subject,
      sender_email = EXCLUDED.sender_email,
      sender_name = EXCLUDED.sender_name,
      recipient_emails = EXCLUDED.recipient_emails,
      email_date = EXCLUDED.email_date,
      body_text = EXCLUDED.body_text,
      body_html = EXCLUDED.body_html,
      snippet = EXCLUDED.snippet,
      labels = EXCLUDED.labels,
      is_read = EXCLUDED.is_read,
      fetched_at = NOW()`,
    [
      email.id,
      userId,
      email.threadId,
      email.subject,
      email.from,
      email.fromName,
      email.to,
      email.date,
      email.bodyText,
      email.bodyHtml,
      email.snippet,
      email.labels,
      email.isRead,
    ]
  );
}

export async function saveEmails(userId: string, emails: ParsedEmail[]): Promise<void> {
  // Save emails in parallel
  await Promise.all(emails.map(email => saveEmail(userId, email)));
}

export async function getEmailsByUserId(
  userId: string,
  limit: number = 50,
  offset: number = 0
): Promise<Email[]> {
  const result = await query<Email>(
    `SELECT * FROM emails
     WHERE user_id = $1
     ORDER BY email_date DESC
     LIMIT $2 OFFSET $3`,
    [userId, limit, offset]
  );

  return result.rows;
}

export async function getEmailById(emailId: string): Promise<Email | null> {
  const result = await query<Email>(
    'SELECT * FROM emails WHERE id = $1',
    [emailId]
  );

  return result.rows[0] || null;
}

export async function getUnanalyzedEmails(
  userId: string,
  limit: number = 50
): Promise<Email[]> {
  const result = await query<Email>(
    `SELECT e.* FROM emails e
     LEFT JOIN email_analyses a ON e.id = a.email_id
     WHERE e.user_id = $1 AND a.id IS NULL
     ORDER BY e.email_date DESC
     LIMIT $2`,
    [userId, limit]
  );

  return result.rows;
}
