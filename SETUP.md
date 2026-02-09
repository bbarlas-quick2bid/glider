# Glider Setup Guide

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Generate secrets:
```bash
# Generate SESSION_SECRET
openssl rand -base64 32

# Generate TOKEN_ENCRYPTION_KEY
openssl rand -hex 32
```

Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Fill in your `.env.local` with:
- `NEXT_PUBLIC_APP_URL=http://localhost:3000`
- `GOOGLE_CLIENT_ID` (from Google Cloud Console)
- `GOOGLE_CLIENT_SECRET` (from Google Cloud Console)
- `SESSION_SECRET` (generated above)
- `TOKEN_ENCRYPTION_KEY` (generated above)
- `ANTHROPIC_API_KEY` (from Anthropic Console)
- `POSTGRES_URL` (from Vercel or your PostgreSQL database)

### 3. Set Up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable **Gmail API**:
   - Navigate to "APIs & Services" > "Library"
   - Search for "Gmail API" and enable it
4. Create **OAuth 2.0 Credentials**:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Application type: "Web application"
   - Authorized JavaScript origins: `http://localhost:3000`
   - Authorized redirect URIs: `http://localhost:3000/api/auth/callback`
   - Copy the Client ID and Client Secret to `.env.local`

### 4. Set Up Database

#### Option A: Vercel Postgres (Recommended for production)

1. Create a Vercel account and project
2. Go to Storage tab → Create Postgres database
3. Copy connection strings to `.env.local`
4. Run schema in Vercel dashboard SQL editor:
   - Copy contents of `src/lib/db/schema.sql`
   - Paste into SQL editor and execute

#### Option B: Local PostgreSQL

```bash
# Install PostgreSQL if needed
brew install postgresql  # macOS
# or use Docker: docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=password postgres

# Create database
createdb glider

# Run schema
psql glider < src/lib/db/schema.sql

# Update .env.local with connection string
# POSTGRES_URL=postgres://username:password@localhost:5432/glider
```

### 5. Get Anthropic API Key

1. Go to [Anthropic Console](https://console.anthropic.com/)
2. Create an account or sign in
3. Generate an API key
4. Add to `.env.local` as `ANTHROPIC_API_KEY`

### 6. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app!

## Testing the App

1. **Login**: Click "Sign in with Google" → Authorize Gmail access
2. **Fetch Emails**: Click "Refresh" in dashboard → Fetches last 7 days of emails
3. **AI Analysis**: Automatically analyzes emails with Claude
4. **View Results**: See action items and recommendations for each email

## Troubleshooting

### "Failed to fetch emails"
- Check Google OAuth credentials are correct
- Verify Gmail API is enabled in Google Cloud Console
- Check redirect URI matches exactly: `http://localhost:3000/api/auth/callback`

### "Database query error"
- Verify POSTGRES_URL is correct in `.env.local`
- Ensure database schema has been run
- Check database connection (try connecting with psql)

### "AI analysis failed"
- Verify ANTHROPIC_API_KEY is correct
- Check API key has credits/quota
- View logs in console for detailed error messages

### OAuth "redirect_uri_mismatch"
- Ensure authorized redirect URI in Google Cloud Console exactly matches: `http://localhost:3000/api/auth/callback`
- No trailing slash
- Must include the full path

## Production Deployment

See [README.md](README.md) for Vercel deployment instructions.

## What's Next?

Once you have the app running:

1. **Test with real emails** - See how AI extracts action items
2. **Iterate on prompts** - Edit `src/lib/ai/prompts.ts` to improve extraction
3. **Add features** - Calendar integration, HubSpot, Otter.ai (see roadmap in README)
4. **Deploy to Vercel** - Share with others!

## Need Help?

- Check the logs: `npm run dev` shows detailed error messages
- Review the plan file: `.claude/plans/lively-twirling-gosling.md`
- Check environment variables are all set correctly
