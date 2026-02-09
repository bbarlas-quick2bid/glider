# What You Need to Deploy Glider

## 📋 Information Needed

### 1. Google OAuth Credentials
**Where to get**: https://console.cloud.google.com/apis/credentials

**Steps**:
1. Create a new project or select existing
2. Enable **Gmail API**
3. Create **OAuth 2.0 Client ID**
   - Application type: Web application
   - Authorized redirect URI: (will add Vercel URL later)
4. Copy these:
   - ✅ **Client ID**: `something.apps.googleusercontent.com`
   - ✅ **Client Secret**: `GOCSPX-...`

### 2. Anthropic API Key
**Where to get**: https://console.anthropic.com/

**Steps**:
1. Sign in or create account
2. Go to API Keys
3. Click "Create Key"
4. Copy:
   - ✅ **API Key**: `sk-ant-api03-...`

### 3. Vercel Account
**Where**: https://vercel.com/

**What you have**:
- ✅ Vercel Pro account (already set up)
- ✅ GitHub connected

## 🔐 How Security Is Handled

### Three-Layer Security System

**Layer 1: Git Protection**
```
.gitignore blocks:
├── .env.local (your local secrets)
├── .env (any environment files)
└── .deployment-secrets.txt (wizard temp file)

Result: ZERO secrets in GitHub ✅
```

**Layer 2: Vercel Environment Variables**
```
Secrets stored in: Vercel Dashboard → Settings → Environment Variables

How it works:
├── You add secrets in Vercel UI
├── Vercel encrypts them
├── Injected at runtime
└── NEVER in code or GitHub

Security: AES-256 encryption ✅
```

**Layer 3: Application Security**
```
In your app:
├── Tokens encrypted with AES-256-GCM
├── HttpOnly secure cookies
├── Session-based auth (iron-session)
└── No secrets in client-side code

Security: Industry-standard ✅
```

## 📝 What Gets Stored Where

| Secret | Local Dev | GitHub | Vercel Production |
|--------|-----------|--------|-------------------|
| Google Client ID | `.env.local` | ❌ Never | Environment Variables |
| Google Client Secret | `.env.local` | ❌ Never | Environment Variables |
| Session Secret | `.env.local` | ❌ Never | Environment Variables (different!) |
| Encryption Key | `.env.local` | ❌ Never | Environment Variables (different!) |
| Anthropic Key | `.env.local` | ❌ Never | Environment Variables |
| Database URL | `.env.local` | ❌ Never | Auto-injected by Vercel |

**What IS in GitHub**:
- ✅ Source code (no secrets)
- ✅ `.env.example` (template with placeholders)
- ✅ Documentation

## 🚀 Quick Deploy Process

### Option 1: Use the Wizard (Recommended)
```bash
./scripts/deploy-wizard.sh
```

The wizard will:
1. ✅ Generate production secrets automatically
2. ✅ Collect your API credentials
3. ✅ Guide you through Vercel setup
4. ✅ Walk you through database setup
5. ✅ Help configure Google OAuth
6. ✅ Save everything to a temp file (gitignored)

**Time: ~10 minutes**

### Option 2: Manual Deploy
Follow `VERCEL_SETUP.md` for step-by-step instructions.

## 🔑 Secret Generation

The wizard auto-generates these:

```bash
# Session secret (32 characters)
openssl rand -base64 32

# Encryption key (32 bytes = 64 hex chars)
openssl rand -hex 32
```

**Important**: Use DIFFERENT secrets for:
- Local development (`.env.local`)
- Production (Vercel environment variables)

## 🛡️ Security Guarantees

### ✅ What's Protected
1. **Git**: `.gitignore` prevents secret commits
2. **GitHub**: Zero secrets in repository
3. **Vercel**: Encrypted environment variables
4. **App**: AES-256-GCM token encryption
5. **Transit**: All HTTPS/TLS
6. **Storage**: Encrypted OAuth tokens in database

### ✅ What's Safe to Share
- GitHub repository URL (public)
- Vercel deployment URL (public)
- `.env.example` file (templates only)

### ❌ What's NEVER Shared
- `.env.local` (stays on your machine)
- Vercel environment variables (encrypted in Vercel)
- Database credentials (auto-injected)
- OAuth tokens (encrypted in database)

## 📊 Verification

After deployment, you can verify security:

```bash
# Check git doesn't track secrets
git ls-files | grep env
# Should only show: .env.example ✅

# Check no secrets in git history
git log --all --full-history -- .env.local
# Should be empty ✅

# Check gitignore is working
git status
# Should NOT show .env.local or .deployment-secrets.txt ✅
```

## 🎯 Summary

**What you need to provide**:
1. Google OAuth credentials (Client ID + Secret)
2. Anthropic API key

**What the wizard handles**:
1. Generating session secrets
2. Generating encryption keys
3. Guiding you through Vercel setup
4. Ensuring nothing leaks to GitHub

**Security result**:
- ✅ GitHub: Clean (no secrets)
- ✅ Vercel: Encrypted environment variables
- ✅ App: Industry-standard security
- ✅ Database: Encrypted tokens

**Time to deploy**: ~10 minutes with wizard

Ready? Run:
```bash
./scripts/deploy-wizard.sh
```
