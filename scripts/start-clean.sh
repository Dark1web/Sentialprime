#!/bin/bash

# SentinelX Clean Start Script
# This script ensures only the Next.js application runs on port 3000

echo "🚀 Starting SentinelX Clean Environment..."

# Kill any processes on port 3000
echo "🔄 Cleaning port 3000..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || echo "✅ Port 3000 is clean"

# Kill any React development servers
echo "🔄 Stopping any React development servers..."
pkill -f "react-scripts" 2>/dev/null || echo "✅ No React servers running"
pkill -f "webpack-dev-server" 2>/dev/null || echo "✅ No webpack servers running"

# Clear all caches
echo "🔄 Clearing all caches..."
rm -rf .next
rm -rf node_modules/.cache
rm -rf public/static 2>/dev/null || true

# Remove any old React app directories
echo "🔄 Removing old React app directories..."
rm -rf frontend_old_react_app 2>/dev/null || true
rm -rf frontend 2>/dev/null || true

# Ensure no Barba.js files exist
echo "🔄 Checking for Barba.js files..."
find . -name "*.js" -o -name "*.ts" -o -name "*.tsx" | grep -v node_modules | xargs grep -l "barba\|@barba" 2>/dev/null && echo "⚠️ Found Barba.js references" || echo "✅ No Barba.js references found"

# Wait a moment for cleanup
sleep 1

# Start the Next.js development server
echo "🚀 Starting Next.js server..."
npm run dev:frontend &

# Wait for server to start
sleep 3

echo "✅ SentinelX is running at http://localhost:3000"
echo "🧪 Test page available at http://localhost:3000/test.html"
echo "📊 Dashboard available at http://localhost:3000/dashboard"
echo "🚨 Emergency page available at http://localhost:3000/emergency"
