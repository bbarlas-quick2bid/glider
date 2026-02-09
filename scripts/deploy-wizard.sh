#!/bin/bash

# Glider Deployment Wizard
# Interactive guide to deploy to Vercel

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

clear
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}   🚀 Glider Deployment Wizard${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "This wizard will help you deploy Glider to Vercel."
echo "I'll collect the information needed and guide you through the process."
echo ""

# Function to pause
pause() {
    echo ""
    read -p "Press Enter to continue..."
    echo ""
}

# Step 1: Check prerequisites
echo -e "${CYAN}Step 1/8: Checking Prerequisites${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ ! -d .git ]; then
    echo -e "${RED}✗ Not a git repository${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Git repository${NC}"

if [ ! -f package.json ]; then
    echo -e "${RED}✗ package.json not found${NC}"
    exit 1
fi
echo -e "${GREEN}✓ package.json found${NC}"

if [ ! -f .env.example ]; then
    echo -e "${RED}✗ .env.example not found${NC}"
    exit 1
fi
echo -e "${GREEN}✓ .env.example found${NC}"

echo -e "${GREEN}✓ All prerequisites met!${NC}"
pause

# Step 2: Generate secrets
echo -e "${CYAN}Step 2/8: Generate Production Secrets${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Generating fresh secrets for production..."
echo ""

SESSION_SECRET=$(openssl rand -base64 32)
TOKEN_ENCRYPTION_KEY=$(openssl rand -hex 32)

echo -e "${GREEN}Generated SESSION_SECRET:${NC}"
echo "$SESSION_SECRET"
echo ""
echo -e "${GREEN}Generated TOKEN_ENCRYPTION_KEY:${NC}"
echo "$TOKEN_ENCRYPTION_KEY"
echo ""

# Save to temp file
cat > .deployment-secrets.txt << EOF
# Glider Production Secrets
# Generated: $(date)
#
# Copy these to Vercel Environment Variables
# DO NOT commit this file to git!

SESSION_SECRET=$SESSION_SECRET
TOKEN_ENCRYPTION_KEY=$TOKEN_ENCRYPTION_KEY
EOF

echo -e "${YELLOW}✓ Secrets saved to: .deployment-secrets.txt${NC}"
echo -e "${YELLOW}  (This file is temporary and gitignored)${NC}"
pause

# Step 3: Collect API credentials
echo -e "${CYAN}Step 3/8: Collect API Credentials${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "I need your API credentials. These will be saved to .deployment-secrets.txt"
echo ""

echo -e "${BLUE}Google OAuth Credentials:${NC}"
echo "Get these from: https://console.cloud.google.com/apis/credentials"
echo ""
read -p "Enter GOOGLE_CLIENT_ID: " GOOGLE_CLIENT_ID
read -p "Enter GOOGLE_CLIENT_SECRET: " GOOGLE_CLIENT_SECRET
echo ""

echo -e "${BLUE}Anthropic API Key:${NC}"
echo "Get this from: https://console.anthropic.com/"
echo ""
read -p "Enter ANTHROPIC_API_KEY: " ANTHROPIC_API_KEY
echo ""

# Add to secrets file
cat >> .deployment-secrets.txt << EOF

# API Credentials
GOOGLE_CLIENT_ID=$GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET=$GOOGLE_CLIENT_SECRET
ANTHROPIC_API_KEY=$ANTHROPIC_API_KEY
EOF

echo -e "${GREEN}✓ Credentials collected${NC}"
pause

# Step 4: Open Vercel
echo -e "${CYAN}Step 4/8: Deploy to Vercel${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "I'm going to open Vercel's import page in your browser."
echo ""
echo "Follow these steps:"
echo "1. Click 'Import' on the glider repository"
echo "2. Configure the project (defaults are fine)"
echo "3. DON'T deploy yet - we need to add environment variables first"
echo ""

read -p "Ready? Press Enter to open Vercel..."
open "https://vercel.com/new/git/external?filter=repos&search=glider"

pause

# Step 5: Add environment variables
echo -e "${CYAN}Step 5/8: Add Environment Variables${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "In Vercel, before deploying, add these environment variables:"
echo ""
echo -e "${YELLOW}Copy from .deployment-secrets.txt:${NC}"
echo ""
cat .deployment-secrets.txt | grep -v "^#" | grep -v "^$"
echo ""
echo -e "${BLUE}Note: You'll add NEXT_PUBLIC_APP_URL after first deploy${NC}"
echo ""

read -p "Have you added all environment variables in Vercel? (y/n): " ADDED_VARS

if [ "$ADDED_VARS" != "y" ]; then
    echo ""
    echo -e "${YELLOW}Go back and add them, then run this script again.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Environment variables added${NC}"
pause

# Step 6: Deploy
echo -e "${CYAN}Step 6/8: Initial Deploy${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Now click 'Deploy' in Vercel."
echo "This will take about 2-3 minutes."
echo ""

read -p "Press Enter when deployment is complete..."
echo ""

read -p "Enter your Vercel deployment URL (e.g., glider-abc123.vercel.app): " VERCEL_URL

# Add to secrets file
echo "" >> .deployment-secrets.txt
echo "# Vercel Deployment" >> .deployment-secrets.txt
echo "NEXT_PUBLIC_APP_URL=https://$VERCEL_URL" >> .deployment-secrets.txt

echo -e "${GREEN}✓ Initial deployment complete${NC}"
pause

# Step 7: Set up database
echo -e "${CYAN}Step 7/8: Set Up Database${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Now we need to create the Postgres database."
echo ""
echo "In Vercel:"
echo "1. Go to your project"
echo "2. Click 'Storage' tab"
echo "3. Click 'Create Database' → 'Postgres'"
echo "4. Name: glider-db"
echo "5. Region: US East (or closest to you)"
echo "6. Click 'Create'"
echo ""

read -p "Press Enter to open Vercel Storage tab..."
open "https://vercel.com/dashboard/stores"

pause

echo "Now initialize the database schema:"
echo ""
echo "1. In your new database, click 'Query' tab"
echo "2. Copy the contents of: src/lib/db/schema.sql"
echo "3. Paste into SQL editor"
echo "4. Click 'Run Query'"
echo ""

read -p "Have you initialized the database schema? (y/n): " SCHEMA_DONE

if [ "$SCHEMA_DONE" != "y" ]; then
    echo ""
    echo -e "${YELLOW}Please initialize the schema, then run this script again.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Database set up${NC}"
pause

# Step 8: Final configuration
echo -e "${CYAN}Step 8/8: Final Configuration${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Almost done! Two more things:"
echo ""
echo -e "${BLUE}A. Add NEXT_PUBLIC_APP_URL to Vercel:${NC}"
echo "   1. Settings → Environment Variables"
echo "   2. Add: NEXT_PUBLIC_APP_URL = https://$VERCEL_URL"
echo "   3. Save"
echo ""
echo -e "${BLUE}B. Update Google OAuth:${NC}"
echo "   1. Go to: https://console.cloud.google.com/apis/credentials"
echo "   2. Edit your OAuth Client ID"
echo "   3. Add to Authorized redirect URIs:"
echo "      https://$VERCEL_URL/api/auth/callback"
echo "   4. Add to Authorized JavaScript origins:"
echo "      https://$VERCEL_URL"
echo "   5. Save"
echo ""

read -p "Press Enter when both are done..."

echo ""
echo -e "${BLUE}C. Redeploy with new environment variable:${NC}"
echo "   1. Go to Deployments tab"
echo "   2. Click '...' on latest deployment"
echo "   3. Click 'Redeploy'"
echo ""

read -p "Press Enter when redeployment is complete..."

# Success!
clear
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}   ✅ Deployment Complete!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${CYAN}Your Glider app is live at:${NC}"
echo -e "${BLUE}https://$VERCEL_URL${NC}"
echo ""
echo -e "${CYAN}Test it:${NC}"
echo "1. Visit your URL"
echo "2. Click 'Sign in with Google'"
echo "3. Authorize Gmail access"
echo "4. Click 'Refresh' to fetch emails"
echo "5. Watch AI analyze your emails!"
echo ""
echo -e "${YELLOW}Security Notes:${NC}"
echo "• Your secrets are in .deployment-secrets.txt"
echo "• This file is gitignored (safe)"
echo "• You can delete it after confirming everything works"
echo "• Secrets are now stored securely in Vercel"
echo ""
echo -e "${GREEN}🎉 You're gliding!${NC}"
echo ""
