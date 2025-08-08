#!/bin/bash

# SentinelX Barba.js Verification Script
# This script verifies that no Barba.js components exist in the project

echo "🔍 Verifying SentinelX is free of Barba.js components..."

# Check for Barba.js files
echo "📁 Checking for Barba.js files..."
BARBA_FILES=$(find . -name "*.js" -o -name "*.ts" -o -name "*.tsx" -o -name "*.json" | grep -v node_modules | xargs grep -l "barba\|@barba" 2>/dev/null)

if [ -z "$BARBA_FILES" ]; then
    echo "✅ No Barba.js files found"
else
    echo "❌ Found Barba.js references in:"
    echo "$BARBA_FILES"
    exit 1
fi

# Check for React development servers
echo "🔍 Checking for React development servers..."
REACT_PROCESSES=$(ps aux | grep -E "(react-scripts|webpack-dev-server)" | grep -v grep)

if [ -z "$REACT_PROCESSES" ]; then
    echo "✅ No React development servers running"
else
    echo "❌ Found React development servers:"
    echo "$REACT_PROCESSES"
    exit 1
fi

# Check if Next.js is running on port 3000
echo "🔍 Checking Next.js server on port 3000..."
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 2>/dev/null)

if [ "$HTTP_STATUS" = "200" ]; then
    echo "✅ Next.js server is responding on port 3000"
else
    echo "❌ Next.js server is not responding on port 3000 (Status: $HTTP_STATUS)"
    exit 1
fi

# Check if the correct application is running
echo "🔍 Verifying correct application..."
TITLE=$(curl -s http://localhost:3000 | grep -o "<title>.*</title>" | head -1)

if [[ "$TITLE" == *"SentinelX"* ]]; then
    echo "✅ Correct SentinelX application is running"
    echo "   Title: $TITLE"
else
    echo "❌ Wrong application is running"
    echo "   Title: $TITLE"
    exit 1
fi

# Check if static bundle.js returns 404 (should not exist)
echo "🔍 Checking that old React bundle is not served..."
BUNDLE_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/static/js/bundle.js 2>/dev/null)

if [ "$BUNDLE_STATUS" = "404" ]; then
    echo "✅ Old React bundle is not being served (404 as expected)"
else
    echo "❌ Old React bundle is still being served (Status: $BUNDLE_STATUS)"
    exit 1
fi

# Test AI API
echo "🔍 Testing AI API..."
API_RESPONSE=$(curl -X POST http://localhost:3000/api/ai/misinformation -H "Content-Type: application/json" -d '{"text": "test"}' -s 2>/dev/null)

if [[ "$API_RESPONSE" == *"is_misinformation"* ]]; then
    echo "✅ AI API is responding correctly"
else
    echo "❌ AI API is not responding correctly"
    echo "   Response: $API_RESPONSE"
    exit 1
fi

# Check dashboard
echo "🔍 Testing dashboard..."
DASHBOARD_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/dashboard 2>/dev/null)

if [ "$DASHBOARD_STATUS" = "200" ]; then
    echo "✅ Dashboard is accessible"
else
    echo "❌ Dashboard is not accessible (Status: $DASHBOARD_STATUS)"
    exit 1
fi

echo ""
echo "🎉 ALL CHECKS PASSED!"
echo "✅ SentinelX is running correctly without any Barba.js components"
echo "🚀 System is ready for use at http://localhost:3000"
echo ""
echo "Available pages:"
echo "  🏠 Landing: http://localhost:3000"
echo "  📊 Dashboard: http://localhost:3000/dashboard"
echo "  🚨 Emergency: http://localhost:3000/emergency"
echo "  🧪 Test: http://localhost:3000/test.html"
