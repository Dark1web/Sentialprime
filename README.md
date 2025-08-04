# SentinelX: AI-Powered Disaster Intelligence & Crisis Response System

## ✨ **Latest Updates**

### 🆕 **New Features Added:**
- 🗺️ **Interactive Leaflet Maps** - Real-time disaster visualization with custom markers
- 🔐 **Complete Authentication System** - Login/register with Supabase integration  
- 🛰️ **Sentinel Hub Satellite Integration** - Real flood/fire detection from space
- 📊 **Supabase Database** - Full schema with geospatial support
- 📱 **Mobile-Responsive Design** - Optimized for all devices
- 🎯 **Demo Mode** - Instant testing with demo credentials

### 🚀 **Quick Start**
```bash
# Start backend
cd backend && python main.py &

# Start frontend
cd frontend && npm start
```
**Demo Login:** `demo@sentinelx.com` / `demo123` or click "Demo Login"

## Overview
SentinelX is a comprehensive AI-powered disaster monitoring and response system that integrates:
- Physical disaster detection (floods, heatwaves)
- Misinformation filtering with panic emotion detection
- Auto-triage of helpline requests
- Real-time network outage mapping
- Offline disaster navigation assistance
- AR-based disaster awareness simulation

## Architecture
```
SentinelX/
├── backend/          # FastAPI backend with ML models
├── frontend/         # React dashboard and interfaces
├── mobile/           # PWA for offline navigation
├── ml_models/        # AI/ML model implementations
├── data/            # Sample datasets and configurations
├── docs/            # Documentation and API specs
└── deployment/      # Docker and deployment configs
```

## Key Features

### 🔹 Emotion-Aware Misinformation Filtering
- Real-time social media/news monitoring
- BERT/RoBERTa-based misinformation detection
- Panic score assignment using emotion classification
- JSON output: `{post_text, is_fake, panic_score, confidence}`

### 🔹 Auto-Triage of Helpline Requests
- NLP-powered priority classification
- Location-based emergency categorization
- Output: `{urgency_score, resource_required, triage_level}`

### 🔹 Real-Time Network Outage Mapping
- Choropleth visualization of connectivity zones
- Crowd-sourced speed test integration
- Red/yellow/green zone classification

### 🔹 AI Fact-Check API
- RESTful `/factcheck` endpoint
- Fine-tuned RoBERTa for claim verification
- Web scraping for context validation

### 🔹 Offline Navigation Assistant
- OpenStreetMap offline integration
- Safe zone and danger zone mapping
- Emergency procedure storage

### 🔹 AR Disaster Simulation
- Flood level overlay based on elevation
- Heatwave impact visualization
- Camera-based street scanning

## Quick Start

### Backend Setup
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend Setup
```bash
cd frontend
npm install
npm start
```

### API Endpoints
- `POST /api/misinformation/analyze` - Analyze content for misinformation
- `POST /api/triage/classify` - Triage helpline requests
- `GET /api/network/outages` - Get network outage data
- `POST /api/factcheck` - Fact-check disaster claims
- `GET /api/navigation/safezones` - Get safe zone locations

## Tech Stack
- **Backend**: FastAPI + PostgreSQL
- **Frontend**: React + Mapbox/Leaflet
- **ML/NLP**: HuggingFace Transformers + scikit-learn
- **Maps**: OpenStreetMap + Mapbox
- **AR**: WebAR (AR.js/Three.js)
- **Deployment**: Railway/Render + Netlify

## Sample Testing Data
```json
{
  "emergency_text": "My house is filling with water and my phone is dying please help.",
  "social_post": "Evacuate! The dam just broke near Jaipur!",
  "speed_report": {"upload": 0.01, "download": 0.02, "location": [26.9124, 75.7873]},
  "fact_query": "Is the heatwave getting worse in my city?"
}
```

## License
MIT License - Built for disaster response and public safety