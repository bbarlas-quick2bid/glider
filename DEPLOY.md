# Deploying Glider to Vercel

## Prerequisites

- [Vercel account](https://vercel.com/signup) (free tier works!)
- [GitHub account](https://github.com/signup) (to connect repo)
- Google OAuth credentials configured
- Anthropic API key

## Deployment Steps

### 1. Push to GitHub

```bash
# Create a new repository on GitHub (https://github.com/new)
# Name it "glider" (or whatever you prefer)
# Don't initialize with README (we already have one)

# Add GitHub remote and push
git remote add origin https://github.com/YOUR_USERNAME/glider.git
git branch -M main
git push -u origin main
```

### 2. Import to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Select your GitHub repository: `glider`
4. Click **"Import"**

### 3. Configure Project Settings

Vercel will auto-detect Next.js. Keep these defaults:
- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

### 4. Add Environment Variables

Click **"Environment Variables"** and add:

```bash
# App URL (update after first deploy)
NEXT_PUBLIC_APP_URL=https://your-app-name.vercel.app

# Google OAuth (from Google Cloud Console)
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-secret

# Session & Encryption (generate new for production!)
SESSION_SECRET=<run: openssl rand -base64 32>
TOKEN_ENCRYPTION_KEY=<run: openssl rand -hex 32>

# Anthropic API
ANTHROPIC_API_KEY=sk-ant-api03-...

# Note: POSTGRES_URL will be auto-added in step 5
```

**Important**: Generate NEW secrets for production (don't reuse local ones)

### 5. Add Vercel Postgres Database

1. In your Vercel project, go to the **"Storage"** tab
2. Click **"Create Database"** → **"Postgres"**
3. Choose a name: `glider-db`
4. Select region: **US East (iad1)** (or closest to you)
5. Click **"Create"**

Vercel will automatically inject these variables:
- `POSTGRES_URL`
- `POSTGRES_PRISMA_URL`
- `POSTGRES_URL_NON_POOLING`

### 6. Initialize Database Schema

1. In Vercel project → **Storage** tab → Your database
2. Click **"Query"** tab (SQL editor)
3. Copy the contents of `src/lib/db/schema.sql` from your project
4. Paste into the SQL editor
5. Click **"Run Query"**

You should see: "Tables created successfully"

### 7. Update Google OAuth Redirect URI

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** → **Credentials**
3. Click on your OAuth 2.0 Client ID
4. Add to **Authorized redirect URIs**:
   ```
   https://your-app-name.vercel.app/api/auth/callback
   ```
5. Add to **Authorized JavaScript origins**:
   ```
   https://your-app-name.vercel.app
   ```
6. Click **"Save"**

### 8. Update NEXT_PUBLIC_APP_URL

After your first deploy, Vercel gives you a URL like: `https://glider-abc123.vercel.app`

1. Go to Vercel project → **Settings** → **Environment Variables**
2. Update `NEXT_PUBLIC_APP_URL` to your actual Vercel URL
3. Click **"Save"**
4. Redeploy: Go to **Deployments** tab → Click "..." on latest → **"Redeploy"**

### 9. Deploy!

Click **"Deploy"**

Vercel will:
- Install dependencies (~30 seconds)
- Build Next.js app (~1 minute)
- Deploy to global CDN

You'll get a URL like: `https://glider-abc123.vercel.app`

### 10. Test Your Deployment

1. Visit your Vercel URL
2. Click **"Sign in with Google"**
3. Authorize Gmail access
4. You should land on the dashboard
5. Click **"Refresh"** to fetch emails
6. AI analysis should run automatically

## Troubleshooting

### OAuth Error: "redirect_uri_mismatch"
- Make sure you added the EXACT Vercel URL to Google OAuth settings
- Include `/api/auth/callback` path
- No trailing slash

### Database Connection Error
- Verify Postgres database is created in Vercel
- Check that schema was run successfully
- Environment variables are auto-injected by Vercel

### "Failed to fetch emails"
- Check `NEXT_PUBLIC_APP_URL` matches your actual Vercel URL
- Verify Google OAuth credentials are correct
- Check Gmail API is enabled in Google Cloud Console

### AI Analysis Not Working
- Verify `ANTHROPIC_API_KEY` is set correctly
- Check API key has credits/quota
- View logs: Vercel Dashboard → Your Project → **Logs** tab

## Monitoring & Logs

View logs in Vercel Dashboard:
1. Go to your project
2. Click **"Logs"** tab (top navigation)
3. Filter by:
   - **Errors only** - see what's failing
   - **Function logs** - API route execution
   - **Build logs** - deployment issues

## Custom Domain (Optional)

1. Go to Vercel project → **Settings** → **Domains**
2. Add your domain: `glider.yourdomain.com`
3. Update DNS records (Vercel provides instructions)
4. Update `NEXT_PUBLIC_APP_URL` to your custom domain
5. Update Google OAuth redirect URI to custom domain
6. Redeploy

## Cost Estimate

**Vercel Free Tier includes:**
- Unlimited deployments
- 100GB bandwidth/month
- Serverless function execution
- Automatic HTTPS

**Vercel Postgres:**
- Free tier: 256MB storage, 10k rows (good for testing)
- Paid: ~$10-20/month (scales with usage)

**Anthropic API:**
- ~$0.012 per email analyzed
- 1,000 emails = ~$12
- Set a monthly budget in Anthropic Console

**Total: $0-30/month** for typical usage

## Production Optimizations

### 1. Enable Edge Functions (Optional)
In `src/middleware.ts`, add:
```typescript
export const config = {
  matcher: ['/dashboard/:path*'],
  runtime: 'edge', // Run on edge for faster auth checks
};
```

### 2. Add Error Tracking (Optional)
```bash
npm install @vercel/analytics
```

Add to `src/app/layout.tsx`:
```typescript
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

### 3. Set Up Monitoring
- **Vercel Dashboard** → Your Project → **Analytics** tab
- View page performance, API latency, errors

## Continuous Deployment

Every time you push to GitHub `main` branch, Vercel automatically:
1. Builds your app
2. Runs tests (if configured)
3. Deploys to production
4. Preserves environment variables

```bash
# Make changes
git add .
git commit -m "Add new feature"
git push

# Vercel deploys automatically! 🚀
```

## Rollback

If something breaks:
1. Vercel Dashboard → **Deployments** tab
2. Find previous working deployment
3. Click "..." → **"Promote to Production"**

Instant rollback!

## Next Steps

✅ Deployed to Vercel
✅ Database running
✅ OAuth configured

Now you can:
- Share your Vercel URL with others
- Monitor usage in Vercel Dashboard
- Add custom domain
- Scale as needed (Vercel handles it automatically)

**You're live! 🎉**
