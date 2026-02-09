-- Glider Database Schema
-- PostgreSQL database schema for email workflow assistant

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  google_id VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  picture TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- OAuth tokens (encrypted)
CREATE TABLE IF NOT EXISTS oauth_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  provider VARCHAR(50) DEFAULT 'google',
  encrypted_access_token TEXT NOT NULL,
  encrypted_refresh_token TEXT NOT NULL,
  token_expiry TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, provider)
);

-- Emails (cached from Gmail)
CREATE TABLE IF NOT EXISTS emails (
  id VARCHAR(255) PRIMARY KEY,          -- Gmail message ID
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  thread_id VARCHAR(255),
  subject TEXT,
  sender_email VARCHAR(255),
  sender_name VARCHAR(255),
  recipient_emails TEXT[],
  email_date TIMESTAMP,
  body_text TEXT,
  body_html TEXT,
  snippet TEXT,
  labels TEXT[],
  is_read BOOLEAN DEFAULT false,
  fetched_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- AI analyses
CREATE TABLE IF NOT EXISTS email_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email_id VARCHAR(255) REFERENCES emails(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  summary TEXT,
  sentiment VARCHAR(50),                -- positive, neutral, urgent, negative
  action_items JSONB,                   -- Array of action objects
  has_action_items BOOLEAN DEFAULT false,
  recommended_action VARCHAR(50),       -- reply, schedule_meeting, delegate, archive, follow_up, prioritize
  recommendation_reason TEXT,
  recommendation_confidence VARCHAR(20), -- high, medium, low
  recommendation_details JSONB,
  analyzed_at TIMESTAMP DEFAULT NOW(),
  model_version VARCHAR(50) DEFAULT 'claude-3-5-sonnet-20241022',
  UNIQUE(email_id, user_id)
);

-- Action item completions (for future tracking)
CREATE TABLE IF NOT EXISTS action_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id UUID REFERENCES email_analyses(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  action_item_index INT,
  completed_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);
CREATE INDEX IF NOT EXISTS idx_oauth_tokens_user_id ON oauth_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_emails_user_id ON emails(user_id);
CREATE INDEX IF NOT EXISTS idx_emails_email_date ON emails(email_date DESC);
CREATE INDEX IF NOT EXISTS idx_emails_thread_id ON emails(thread_id);
CREATE INDEX IF NOT EXISTS idx_email_analyses_email_id ON email_analyses(email_id);
CREATE INDEX IF NOT EXISTS idx_email_analyses_user_id ON email_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_action_completions_analysis_id ON action_completions(analysis_id);
