#!/bin/bash
# =================================
# Secrets Security Checker
# POS Cesariel
# =================================
#
# This script checks for common secrets management issues
# Run before committing to ensure no secrets are exposed

set -e

echo "🔒 Checking secrets security..."
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0
WARNINGS=0

# =================================
# Check 1: .env file exists
# =================================
echo "📝 Check 1: .env file..."
if [ ! -f .env ]; then
    echo -e "${RED}❌ .env file not found!${NC}"
    echo "   Run: cp .env.example .env"
    ERRORS=$((ERRORS + 1))
else
    echo -e "${GREEN}✅ .env file exists${NC}"
fi
echo ""

# =================================
# Check 2: .env is in .gitignore
# =================================
echo "📝 Check 2: .env in .gitignore..."
if grep -q "^\.env$" .gitignore 2>/dev/null; then
    echo -e "${GREEN}✅ .env is in .gitignore${NC}"
else
    echo -e "${RED}❌ .env is NOT in .gitignore!${NC}"
    echo "   Add '.env' to .gitignore"
    ERRORS=$((ERRORS + 1))
fi
echo ""

# =================================
# Check 3: .env is not tracked by git
# =================================
echo "📝 Check 3: .env not tracked by git..."
if git ls-files | grep -q "^\.env$"; then
    echo -e "${RED}❌ .env is tracked by git!${NC}"
    echo "   Run: git rm --cached .env"
    echo "   Then commit the removal"
    ERRORS=$((ERRORS + 1))
else
    echo -e "${GREEN}✅ .env is not tracked${NC}"
fi
echo ""

# =================================
# Check 4: No hardcoded secrets in docker-compose.yml
# =================================
echo "📝 Check 4: Checking docker-compose.yml for hardcoded secrets..."
HARDCODED_SECRETS=0

# Check for literal passwords (not ${VAR} format)
if grep -E "PASSWORD=.*[^$]" docker-compose.yml | grep -v "\${" | grep -q "PASSWORD="; then
    echo -e "${YELLOW}⚠️  Possible hardcoded PASSWORD in docker-compose.yml${NC}"
    WARNINGS=$((WARNINGS + 1))
    HARDCODED_SECRETS=1
fi

# Check for literal API keys
if grep -E "API_KEY=.*[^$]" docker-compose.yml | grep -v "\${" | grep -q "API_KEY="; then
    echo -e "${YELLOW}⚠️  Possible hardcoded API_KEY in docker-compose.yml${NC}"
    WARNINGS=$((WARNINGS + 1))
    HARDCODED_SECRETS=1
fi

# Check for literal API secrets
if grep -E "API_SECRET=.*[^$]" docker-compose.yml | grep -v "\${" | grep -q "API_SECRET="; then
    echo -e "${YELLOW}⚠️  Possible hardcoded API_SECRET in docker-compose.yml${NC}"
    WARNINGS=$((WARNINGS + 1))
    HARDCODED_SECRETS=1
fi

if [ $HARDCODED_SECRETS -eq 0 ]; then
    echo -e "${GREEN}✅ No hardcoded secrets found${NC}"
fi
echo ""

# =================================
# Check 5: .env has required variables
# =================================
echo "📝 Check 5: Required variables in .env..."
if [ -f .env ]; then
    REQUIRED_VARS=("DB_PASSWORD" "JWT_SECRET_KEY" "CLOUDINARY_API_KEY" "CLOUDINARY_API_SECRET")
    MISSING_VARS=0
    
    for VAR in "${REQUIRED_VARS[@]}"; do
        if ! grep -q "^${VAR}=" .env; then
            echo -e "${RED}❌ Missing required variable: ${VAR}${NC}"
            ERRORS=$((ERRORS + 1))
            MISSING_VARS=1
        fi
    done
    
    if [ $MISSING_VARS -eq 0 ]; then
        echo -e "${GREEN}✅ All required variables present${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Skipped (no .env file)${NC}"
fi
echo ""

# =================================
# Check 6: .env has no example/placeholder values
# =================================
echo "📝 Check 6: No placeholder values in .env..."
if [ -f .env ]; then
    PLACEHOLDERS=0
    
    if grep -q "your_" .env; then
        echo -e "${YELLOW}⚠️  Found placeholder values (your_...)${NC}"
        WARNINGS=$((WARNINGS + 1))
        PLACEHOLDERS=1
    fi
    
    if grep -q "change_this" .env; then
        echo -e "${YELLOW}⚠️  Found placeholder values (change_this)${NC}"
        WARNINGS=$((WARNINGS + 1))
        PLACEHOLDERS=1
    fi
    
    if grep -q "example" .env; then
        echo -e "${YELLOW}⚠️  Found placeholder values (example)${NC}"
        WARNINGS=$((WARNINGS + 1))
        PLACEHOLDERS=1
    fi
    
    if [ $PLACEHOLDERS -eq 0 ]; then
        echo -e "${GREEN}✅ No placeholder values detected${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Skipped (no .env file)${NC}"
fi
echo ""

# =================================
# Check 7: No secrets in staged files
# =================================
echo "📝 Check 7: No secrets in staged files..."
STAGED_SECRETS=0

# Check for common secret patterns in staged files
if git diff --cached --name-only | xargs -I {} grep -l "password.*=.*['\"]" {} 2>/dev/null | grep -v ".example" | grep -q .; then
    echo -e "${RED}❌ Possible password in staged files!${NC}"
    ERRORS=$((ERRORS + 1))
    STAGED_SECRETS=1
fi

if git diff --cached --name-only | xargs -I {} grep -l "api.*key.*=.*['\"]" {} 2>/dev/null | grep -v ".example" | grep -q .; then
    echo -e "${RED}❌ Possible API key in staged files!${NC}"
    ERRORS=$((ERRORS + 1))
    STAGED_SECRETS=1
fi

if [ $STAGED_SECRETS -eq 0 ]; then
    echo -e "${GREEN}✅ No secrets detected in staged files${NC}"
fi
echo ""

# =================================
# Summary
# =================================
echo "================================="
echo "Summary:"
echo "================================="

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✅ All checks passed!${NC}"
    echo ""
    echo "Safe to commit. No secrets detected."
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠️  ${WARNINGS} warning(s)${NC}"
    echo ""
    echo "Review warnings before committing."
    exit 0
else
    echo -e "${RED}❌ ${ERRORS} error(s), ${WARNINGS} warning(s)${NC}"
    echo ""
    echo "Fix errors before committing!"
    exit 1
fi
