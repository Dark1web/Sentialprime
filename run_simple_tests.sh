#!/bin/bash

# Simple Test Runner for SentinelX
echo "🛡️  SentinelX Simple Test Runner"
echo "================================"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_status() {
    echo -e "${YELLOW}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[PASS]${NC} $1"
}

print_error() {
    echo -e "${RED}[FAIL]${NC} $1"
}

# Test 1: Basic Frontend Test
print_status "Running basic frontend unit test..."
cd frontend
if CI=true npm test -- --testPathPattern=Dashboard.test.js --verbose --watchAll=false > /dev/null 2>&1; then
    print_success "Frontend unit tests work"
    FRONTEND_UNIT_PASS=true
else
    print_error "Frontend unit tests failed"
    FRONTEND_UNIT_PASS=false
fi

# Test 2: Simple E2E Test
print_status "Running simple authentication E2E test..."
if npx playwright test tests/e2e/auth.spec.js --project=chromium --headed=false > /dev/null 2>&1; then
    print_success "Basic E2E tests work"
    E2E_PASS=true
else
    print_error "E2E tests failed"
    E2E_PASS=false
fi

# Test 3: Backend Health Check
print_status "Testing backend health..."
cd ../
if curl -s http://localhost:8000/health | grep -q "healthy"; then
    print_success "Backend is healthy"
    BACKEND_PASS=true
else
    print_error "Backend health check failed"
    BACKEND_PASS=false
fi

# Test 4: Frontend Accessibility
print_status "Testing frontend accessibility..."
if curl -s http://localhost:3000 | grep -q "SentinelX"; then
    print_success "Frontend is accessible"
    FRONTEND_ACCESS_PASS=true
else
    print_error "Frontend is not accessible"
    FRONTEND_ACCESS_PASS=false
fi

# Summary
echo ""
echo "📊 Test Summary:"
echo "=================="
[ "$FRONTEND_UNIT_PASS" = true ] && print_success "Frontend Unit Tests" || print_error "Frontend Unit Tests"
[ "$E2E_PASS" = true ] && print_success "E2E Tests" || print_error "E2E Tests"
[ "$BACKEND_PASS" = true ] && print_success "Backend Health" || print_error "Backend Health"
[ "$FRONTEND_ACCESS_PASS" = true ] && print_success "Frontend Access" || print_error "Frontend Access"

# Count passes
TOTAL_PASS=0
[ "$FRONTEND_UNIT_PASS" = true ] && ((TOTAL_PASS++))
[ "$E2E_PASS" = true ] && ((TOTAL_PASS++))
[ "$BACKEND_PASS" = true ] && ((TOTAL_PASS++))
[ "$FRONTEND_ACCESS_PASS" = true ] && ((TOTAL_PASS++))

echo ""
echo "📈 Results: $TOTAL_PASS/4 tests passed"

if [ $TOTAL_PASS -ge 3 ]; then
    print_success "✅ SentinelX is mostly working! ($TOTAL_PASS/4 tests passed)"
    exit 0
else
    print_error "❌ SentinelX needs fixes ($TOTAL_PASS/4 tests passed)"
    exit 1
fi