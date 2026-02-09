# Quick Vercel Setup (5 Minutes)

## 🎯 Goal
Get Glider running on Vercel with database, OAuth, and AI working.

## 📋 What You Need
- [ ] Vercel account (sign up at vercel.com)
- [ ] GitHub account
- [ ] Google Cloud Console access
- [ ] Anthropic API key

## 🚀 Deployment (Step by Step)

### Step 1: Push to GitHub (2 minutes)

```bash
# 1. Create new repo on GitHub.com
#    Go to: https://github.com/new
#    Name: glider
#    DON'T initialize with README

# 2. Add remote and push
git remote add origin https://github.com/YOUR_USERNAME/glider.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy to Vercel (1 minute)

1. Go to https://vercel.com/new
2. Click "Import Git Repository"
3. Select your `glider` repo
4. Click "Import"
5. **DON'T DEPLOY YET** - we need environment variables first

### Step 3: Generate Secrets (30 seconds)

```bash
# Run these commands and save the output
openssl rand -base64 32  # SESSION_SECRET
openssl rand -hex 32     # TOKEN_ENCRYPTION_KEY
```

### Step 4: Add Environment Variables (1 minute)

In Vercel project settings, add these variables:

```bash
# Required NOW (without these, deploy will fail)
GOOGLE_CLIENT_ID=your-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-secret
SESSION_SECRET=<output from step 3>
TOKEN_ENCRYPTION_KEY=<output from step 3>
ANTHROPIC_API_KEY=sk-ant-api03-...

# Add AFTER first deploy
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

### Step 5: Create Postgres Database (1 minute)

1. In Vercel project → **Storage** tab
2. Click "Create Database" → "Postgres"
3. Name: `glider-db`
4. Region: US East (or closest)
5. Click "Create"

### Step 6: Initialize Database Schema (30 seconds)

1. Stay in **Storage** → Your database
2. Click **"Query"** tab
3. Copy all of `src/lib/db/schema.sql`
4. Paste in SQL editor
5. Click "Run Query"
6. Should see success messages

### Step 7: First Deploy (2 minutes)

1. Go to **Deployments** tab
2. Vercel will auto-deploy (or click "Deploy")
3. Wait for build (~2 minutes)
4. You'll get a URL like: `glider-abc123.vercel.app`

### Step 8: Update URLs (1 minute)

**A. Update Vercel env:**
1. Settings → Environment Variables
2. Add `NEXT_PUBLIC_APP_URL=https://your-actual-url.vercel.app`
3. Save

**B. Update Google OAuth:**
1. Google Cloud Console → Credentials
2. Your OAuth Client ID
3. Add to Authorized redirect URIs:
   ```
   https://your-actual-url.vercel.app/api/auth/callback
   ```
4. Add to Authorized JavaScript origins:
   ```
   https://your-actual-url.vercel.app
   ```
5. Save

### Step 9: Redeploy (30 seconds)

1. Deployments tab
2. Click "..." on latest deployment
3. Click "Redeploy"
4. Wait for build

### Step 10: Test! (1 minute)

1. Visit your Vercel URL
2. Click "Sign in with Google"
3. Authorize Gmail
4. Click "Refresh" in dashboard
5. Watch AI analyze your emails! 🎉

## ✅ You're Live!

Your app is now:
- Running on Vercel's global CDN
- Backed by PostgreSQL database
- Secured with OAuth 2.0
- Analyzing emails with Claude AI

## 📊 Monitor

- **Logs**: Vercel Dashboard → Your Project → Logs
- **Analytics**: Analytics tab
- **Database**: Storage tab

## 🐛 Common Issues

**"redirect_uri_mismatch"**
- Double-check Google OAuth redirect URI is EXACT
- Must include `/api/auth/callback`
- No trailing slash

**"Database connection error"**
- Verify database created in Storage tab
- Check schema was run successfully
- Redeploy to inject database env vars

**"Unauthorized" after login**
- Check `NEXT_PUBLIC_APP_URL` matches your Vercel URL exactly
- Redeploy after updating env vars

## 💰 Cost Estimate

- **Vercel Hobby**: FREE
- **Postgres**: FREE (256MB tier) or ~$10/mo
- **Anthropic API**: ~$0.012 per email
  - 1,000 emails = $12
  - Set budget in Anthropic Console

**Total: $0-25/month** for typical usage

## 🔄 Auto-Deploy

Every `git push` to main → Vercel auto-deploys!

```bash
# Make changes
git add .
git commit -m "New feature"
git push

# Vercel deploys automatically ✨
```

## 🎨 Custom Domain (Optional)

1. Vercel Settings → Domains
2. Add your domain
3. Update DNS (Vercel provides records)
4. Update env vars with new domain
5. Update Google OAuth URLs

---

**Need help?** Check `DEPLOY.md` for detailed troubleshooting.
