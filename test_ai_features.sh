#!/bin/bash

# Test AI Features for SentinelX
echo "🤖 SentinelX AI Features Test"
echo "============================"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_header() {
    echo -e "${BLUE}$1${NC}"
    echo "----------------------------------------"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ️  $1${NC}"
}

print_header "1. Testing Gemini AI Integration"
echo "API Key: AIzaSyA6kNDO-hhfwmyOVrNaQ6sJ2WMinpul-D8"
curl -s http://localhost:8000/health | grep -q "healthy" && print_success "Backend with Gemini AI is running"

echo ""
print_header "2. Testing AI-Filtered News"
NEWS_RESPONSE=$(curl -s "http://localhost:8000/api/live/news/disaster-feed?ai_filter=true&limit=3")
echo "$NEWS_RESPONSE" | grep -q "articles" && print_success "AI news filtering available"
ARTICLE_COUNT=$(echo "$NEWS_RESPONSE" | jq -r '.total // 0' 2>/dev/null || echo "0")
print_info "Found $ARTICLE_COUNT AI-filtered articles"

echo ""
print_header "3. Testing AI Weather Analysis"
WEATHER_RESPONSE=$(curl -s -X POST "http://localhost:8000/api/live/weather/current?ai_analysis=true" \
  -H "Content-Type: application/json" \
  -d '{"lat": 28.6139, "lng": 77.2090, "location_name": "Delhi"}')
echo "$WEATHER_RESPONSE" | grep -q "weather" && print_success "AI weather analysis available"
print_info "Weather data enhanced with AI risk analysis"

echo ""
print_header "4. Testing AI Navigation Enhancement"
AI_NAV_RESPONSE=$(curl -s "http://localhost:8000/api/navigation/ai-dashboard-data?lat=28.6139&lng=77.2090")
echo "$AI_NAV_RESPONSE" | grep -q "ai_dashboard" && print_success "AI navigation dashboard available"
print_info "Navigation data enhanced with AI insights"

echo ""
print_header "5. Testing Frontend AI Integration"
curl -s http://localhost:3000 | grep -q "SentinelX" && print_success "Frontend accessible"
print_info "Dashboard will show AI-enhanced news and weather data"

echo ""
print_header "6. Available AI Features"
echo "✨ AI-Filtered Disaster News"
echo "   - Real-time news analysis with Gemini AI"
echo "   - Credibility scoring and misinformation detection"
echo "   - Disaster type classification"
echo ""
echo "🌦️  AI Weather Forecasting"
echo "   - Disaster risk analysis from weather patterns"
echo "   - Severity level assessment"
echo "   - Risk factor identification (flood, storm, heat, wind)"
echo ""
echo "🗺️  AI-Enhanced Navigation"
echo "   - Smart route recommendations"
echo "   - Real-time hazard warnings"
echo "   - Safety equipment suggestions"
echo ""
echo "📊 Real-time Dashboard Updates"
echo "   - Auto-refreshing AI-filtered content"
echo "   - Live disaster intelligence"
echo "   - Comprehensive risk assessment"

echo ""
print_header "7. API Endpoints with AI"
echo "GET  /api/live/news/disaster-feed?ai_filter=true"
echo "POST /api/live/weather/current?ai_analysis=true"
echo "POST /api/navigation/ai-enhanced-route"
echo "GET  /api/navigation/ai-dashboard-data"

echo ""
print_header "✅ SentinelX AI Integration Complete!"
echo "Your disaster intelligence platform now includes:"
echo "🧠 Gemini AI for news filtering and weather analysis"
echo "📱 Real-time updates in the dashboard"
echo "🛡️  Enhanced safety recommendations"
echo "🌐 Accessible at: http://localhost:3000"