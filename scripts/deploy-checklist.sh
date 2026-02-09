#!/bin/bash

# Glider Deployment Checklist Script
# Run this before deploying to Vercel

echo "🚀 Glider Deployment Checklist"
echo "================================"
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

checks_passed=0
checks_failed=0

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check 1: Git initialized
echo -n "✓ Checking Git repository... "
if [ -d .git ]; then
    echo -e "${GREEN}PASS${NC}"
    ((checks_passed++))
else
    echo -e "${RED}FAIL${NC} - Run: git init"
    ((checks_failed++))
fi

# Check 2: Dependencies installed
echo -n "✓ Checking node_modules... "
if [ -d node_modules ]; then
    echo -e "${GREEN}PASS${NC}"
    ((checks_passed++))
else
    echo -e "${RED}FAIL${NC} - Run: npm install"
    ((checks_failed++))
fi

# Check 3: .env.example exists
echo -n "✓ Checking .env.example... "
if [ -f .env.example ]; then
    echo -e "${GREEN}PASS${NC}"
    ((checks_passed++))
else
    echo -e "${RED}FAIL${NC} - Missing .env.example"
    ((checks_failed++))
fi

# Check 4: Build succeeds
echo -n "✓ Checking build... "
if npm run build > /dev/null 2>&1; then
    echo -e "${GREEN}PASS${NC}"
    ((checks_passed++))
else
    echo -e "${RED}FAIL${NC} - Run: npm run build"
    ((checks_failed++))
fi

# Check 5: TypeScript compiles
echo -n "✓ Checking TypeScript... "
if npx tsc --noEmit > /dev/null 2>&1; then
    echo -e "${GREEN}PASS${NC}"
    ((checks_passed++))
else
    echo -e "${YELLOW}WARNING${NC} - TypeScript errors detected"
fi

echo ""
echo "================================"
echo "Checks passed: ${checks_passed}"
echo "Checks failed: ${checks_failed}"
echo ""

if [ $checks_failed -eq 0 ]; then
    echo -e "${GREEN}✓ Ready to deploy!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Push to GitHub:"
    echo "   git remote add origin https://github.com/YOUR_USERNAME/glider.git"
    echo "   git push -u origin main"
    echo ""
    echo "2. Follow instructions in DEPLOY.md"
else
    echo -e "${RED}✗ Fix the issues above before deploying${NC}"
fi
