#!/bin/bash

# SentinelX Demo Script
# Starts both backend and frontend for demonstration

echo "🛡️  Starting SentinelX - AI-Powered Disaster Intelligence System"
echo "================================================================"

# Check if required tools are installed
command -v python3 >/dev/null 2>&1 || { echo "❌ Python 3 is required but not installed. Aborting." >&2; exit 1; }
command -v node >/dev/null 2>&1 || { echo "❌ Node.js is required but not installed. Aborting." >&2; exit 1; }
command -v npm >/dev/null 2>&1 || { echo "❌ npm is required but not installed. Aborting." >&2; exit 1; }

# Function to cleanup background processes
cleanup() {
    echo "🛑 Shutting down SentinelX..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup EXIT

echo "📦 Setting up SentinelX components..."

# Setup backend
echo "🔧 Setting up backend..."
cd backend

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "📦 Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install backend dependencies
echo "📦 Installing backend dependencies..."
pip install -q -r requirements.txt

# Start backend server
echo "🚀 Starting FastAPI backend server..."
python main.py &
BACKEND_PID=$!

# Give backend time to start
sleep 5

# Setup frontend
echo "🔧 Setting up frontend..."
cd ../frontend

# Install frontend dependencies
if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install --silent
fi

# Start frontend development server
echo "🚀 Starting React frontend server..."
npm start &
FRONTEND_PID=$!

# Give frontend time to start
sleep 10

echo ""
echo "✅ SentinelX is now running!"
echo "================================"
echo "🖥️  Frontend: http://localhost:3000"
echo "🔌 Backend API: http://localhost:8000"
echo "📖 API Docs: http://localhost:8000/docs"
echo ""
echo "🎯 Demo Features Available:"
echo "  • Unified Disaster Intelligence Dashboard"
echo "  • AI Misinformation Detection & Panic Scoring"
echo "  • Auto-Triage Emergency Request Classification"
echo "  • Real-time Network Outage Mapping"
echo "  • AI Fact-Check-as-a-Service API"
echo "  • Offline Disaster Navigation Assistant"
echo "  • AR Flood/Heatwave Simulation"
echo ""
echo "📱 Mobile-friendly PWA features work best on mobile devices"
echo "🥽 AR features require camera permissions"
echo ""
echo "Press Ctrl+C to stop all services"
echo "================================"

# Wait for user to stop
wait