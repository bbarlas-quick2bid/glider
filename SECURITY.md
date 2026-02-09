# Security & Secrets Management

## ✅ What's Safe in GitHub

Your GitHub repository is **secure**. Here's what's included:

### Safe Files (Committed to GitHub)
- ✅ `.env.example` - Template with NO real values
- ✅ All source code - No secrets embedded
- ✅ Configuration files - No sensitive data

### Protected Files (NOT in GitHub)
- 🔒 `.env.local` - Your actual secrets (gitignored)
- 🔒 `.env` - Any environment files (gitignored)
- 🔒 `node_modules/` - Dependencies (gitignored)
- 🔒 `.next/` - Build artifacts (gitignored)

## 🔐 How Secrets Work

### Local Development
```bash
# Create .env.local (never committed to git)
cp .env.example .env.local

# Add your REAL secrets to .env.local:
GOOGLE_CLIENT_ID=your-real-id
GOOGLE_CLIENT_SECRET=your-real-secret
SESSION_SECRET=your-real-session-secret
TOKEN_ENCRYPTION_KEY=your-real-encryption-key
ANTHROPIC_API_KEY=your-real-api-key
POSTGRES_URL=your-real-database-url
```

**The `.gitignore` prevents these files from ever reaching GitHub.**

### Vercel Production
Secrets are stored in **Vercel Environment Variables**:
1. Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add each secret manually
3. Vercel injects them at runtime
4. They NEVER appear in your code or GitHub

## 🛡️ Security Checklist

### ✅ Already Protected
- [x] `.env.local` and `.env` in `.gitignore`
- [x] No secrets in source code
- [x] No secrets in git history
- [x] Token encryption (AES-256-GCM)
- [x] HttpOnly cookies
- [x] Secure session management

### 📋 When You Deploy
- [ ] Generate NEW secrets for production (don't reuse local)
- [ ] Add secrets to Vercel (not in code)
- [ ] Use Vercel's secret scanning
- [ ] Rotate API keys if ever exposed

## 🚨 If a Secret is Ever Exposed

### Immediate Actions
1. **Rotate the secret immediately**:
   - Google OAuth: Generate new credentials in Google Cloud Console
   - Anthropic API: Revoke and create new key
   - Session Secret: Generate new with `openssl rand -base64 32`

2. **Update Vercel**:
   - Add new secret to environment variables
   - Redeploy

3. **Update Local**:
   - Update `.env.local`
   - Restart dev server

### Check Git History (if needed)
```bash
# Search git history for potential secrets
git log -p | grep -i "secret\|key\|password"

# If found, remove from history (nuclear option):
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env.local" \
  --prune-empty --tag-name-filter cat -- --all
```

## 🔑 Secret Management Best Practices

### Generate Strong Secrets
```bash
# Session secret (32+ characters)
openssl rand -base64 32

# Encryption key (32 bytes = 64 hex chars)
openssl rand -hex 32

# Or use password generator
# Minimum 32 characters, mixed case, numbers, symbols
```

### Different Secrets for Each Environment
```
Development (.env.local):
SESSION_SECRET=dev-secret-123...

Production (Vercel):
SESSION_SECRET=prod-secret-xyz...
```

**NEVER use the same secrets across environments!**

## 🎯 Vercel-Specific Security

### Auto-Protected
- Vercel automatically encrypts environment variables
- Secrets only available to your deployments
- Not exposed in build logs
- Not visible to collaborators (unless explicitly granted)

### Secret Scanning
Vercel scans for accidentally committed secrets:
- API keys
- Database URLs
- OAuth credentials

If detected, you'll get a warning.

## 📊 What's in .env.example

```bash
# This file is SAFE to commit
# It shows WHAT secrets are needed
# But contains NO real values

GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
SESSION_SECRET=<run: openssl rand -base64 32>
TOKEN_ENCRYPTION_KEY=<run: openssl rand -hex 32>
ANTHROPIC_API_KEY=sk-ant-api03-...
POSTGRES_URL=postgres://...
```

## 🔍 Verify No Secrets in Repo

```bash
# Check what's tracked by git
git ls-files | grep env

# Should only show:
# .env.example ✅
# NOT .env or .env.local ❌

# Check if any secrets were ever committed
git log --all --full-history -- .env.local

# Should be empty ✅
```

## 📱 Team Access

### Sharing the Project
When team members clone:
1. They get `.env.example` (safe template)
2. They create their OWN `.env.local`
3. They generate their OWN secrets
4. Their secrets stay on their machine

### Sharing Secrets Securely (if needed)
**❌ Don't**: Email, Slack, or commit secrets

**✅ Do**: Use secure sharing tools:
- 1Password (shared vaults)
- Vercel (team environment variables)
- HashiCorp Vault
- AWS Secrets Manager

## 🎓 Why This Matters

**Exposed secrets = Security breach:**
- 🚫 Unauthorized access to your Gmail
- 🚫 Stolen API credits ($$$ charges)
- 🚫 Database access
- 🚫 User data exposure

**Our setup prevents this:**
- ✅ Secrets in environment (not code)
- ✅ Gitignore prevents commits
- ✅ Different secrets per environment
- ✅ Encrypted at rest (Vercel)
- ✅ Encrypted in transit (HTTPS)

---

## ✨ Summary

**You're secure!**

- GitHub repo: No secrets ✅
- Local dev: `.env.local` gitignored ✅
- Production: Vercel environment variables ✅
- Encryption: AES-256-GCM for stored tokens ✅

**Next steps:**
1. Keep `.env.local` on your machine only
2. Add secrets to Vercel (not code)
3. Generate new secrets for production
4. Never commit `.env` files

Your secrets are safe! 🔒
