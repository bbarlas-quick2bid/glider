# Glider - Email Workflow Assistant

AI-powered email workflow assistant that helps you "glide" through your day by intelligently surfacing what needs attention from your inbox.

## Features

- 📧 **Gmail Integration** - Pull emails via OAuth 2.0
- 🤖 **AI-Powered Analysis** - Extract action items using Claude AI
- 🎯 **Smart Recommendations** - Get next step suggestions for each email
- 📊 **Clean Dashboard** - View prioritized emails with AI insights
- 🔒 **Secure** - AES-256-GCM encrypted token storage

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **AI**: Anthropic Claude API
- **Database**: Vercel Postgres
- **Auth**: Google OAuth 2.0 + iron-session
- **Styling**: Tailwind CSS

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Google Cloud Console project with Gmail API enabled
- Anthropic API key
- Vercel Postgres database (or PostgreSQL)

### Setup

1. **Clone and install dependencies:**

```bash
npm install
```

2. **Set up environment variables:**

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

Required variables:
- `NEXT_PUBLIC_APP_URL` - Your app URL (http://localhost:3000 for local)
- `GOOGLE_CLIENT_ID` - From Google Cloud Console
- `GOOGLE_CLIENT_SECRET` - From Google Cloud Console
- `SESSION_SECRET` - Generate with: `openssl rand -base64 32`
- `TOKEN_ENCRYPTION_KEY` - Generate with: `openssl rand -hex 32`
- `ANTHROPIC_API_KEY` - From Anthropic Console
- `POSTGRES_URL` - Your database connection string

3. **Set up Google OAuth:**

- Go to [Google Cloud Console](https://console.cloud.google.com/)
- Create a new project or select existing
- Enable Gmail API
- Create OAuth 2.0 credentials
- Add authorized redirect URI: `http://localhost:3000/api/auth/callback`
- Copy Client ID and Client Secret to `.env.local`

4. **Set up database:**

Run the schema from `src/lib/db/schema.sql` in your PostgreSQL database:

```bash
# If using Vercel Postgres, run in the Vercel dashboard SQL editor
# Or connect via psql and run:
psql $POSTGRES_URL < src/lib/db/schema.sql
```

5. **Run development server:**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Project Structure

```
glider/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes
│   │   │   ├── auth/         # OAuth endpoints
│   │   │   ├── emails/       # Email fetching
│   │   │   └── analyze/      # AI analysis
│   │   ├── dashboard/        # Main dashboard
│   │   └── page.tsx          # Landing page
│   ├── components/           # React components
│   ├── lib/                  # Core logic
│   │   ├── auth/            # OAuth & session
│   │   ├── gmail/           # Gmail API
│   │   ├── ai/              # Claude AI
│   │   ├── db/              # Database
│   │   └── types/           # TypeScript types
│   └── middleware.ts         # Route protection
```

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Set up Vercel Postgres in Storage tab
5. Update Google OAuth redirect URI to your Vercel URL
6. Deploy!

## Roadmap

- [x] Phase 1: Email analysis (Traditional LLM)
- [ ] Phase 2: Agentic workflows with tool use
- [ ] Phase 3: Calendar integration
- [ ] Phase 4: Otter.ai meeting transcripts
- [ ] Phase 5: HubSpot CRM integration

## License

MIT
