from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
from contextlib import asynccontextmanager
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime

# Import mock services
from services.mock_services import initialize_mock_services

# Global state for services
services = {}

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Load mock services on startup
    print("Loading mock services...")
    global services
    services = initialize_mock_services()
    print("Mock services loaded successfully!")
    yield
    # Cleanup
    services.clear()

# Create FastAPI app with lifespan
app = FastAPI(
    title="SentinelX API",
    description="AI-Powered Disaster Intelligence & Crisis Response System",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request models
class MisinformationRequest(BaseModel):
    text: str

class TriageRequest(BaseModel):
    text: str
    location: Optional[str] = None

class LocationRequest(BaseModel):
    lat: float
    lng: float
    location_name: Optional[str] = None

class FactCheckRequest(BaseModel):
    claim: str

# Root endpoint
@app.get("/")
async def root():
    return {
        "message": "SentinelX API - AI-Powered Disaster Intelligence & Crisis Response System",
        "version": "1.0.0",
        "status": "running_with_mock_services",
        "endpoints": {
            "misinformation": "/api/misinformation/analyze",
            "triage": "/api/triage/classify",
            "network": "/api/network/outages",
            "factcheck": "/api/factcheck",
            "navigation": "/api/navigation/safezones",
            "live_news": "/api/live/news/disaster-feed",
            "live_weather": "/api/live/weather/current",
            "satellite_imagery": "/api/live/satellite/disaster-imagery",
            "disaster_intelligence": "/api/live/combined/disaster-intelligence",
            "health_check": "/health"
        }
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy", 
        "services_loaded": len(services),
        "available_services": list(services.keys()),
        "timestamp": datetime.utcnow().isoformat()
    }

# Misinformation Analysis
@app.post("/api/misinformation/analyze")
async def analyze_misinformation(request: MisinformationRequest):
    try:
        result = services["misinformation"].analyze(request.text)
        return {
            "analysis": result,
            "input_text": request.text,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

# Triage Classification
@app.post("/api/triage/classify")
async def classify_triage(request: TriageRequest):
    try:
        result = services["triage"].classify(request.text)
        return {
            "classification": result,
            "input_text": request.text,
            "location": request.location,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Classification failed: {str(e)}")

# Fact Check
@app.post("/api/factcheck")
async def fact_check(request: FactCheckRequest):
    try:
        result = services["factcheck"].check_fact(request.claim)
        return {
            "fact_check": result,
            "input_claim": request.claim,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Fact check failed: {str(e)}")

# Network Outages (mock data)
@app.get("/api/network/outages")
async def get_network_outages():
    return {
        "outages": [
            {
                "location": "Mumbai Central",
                "severity": "HIGH",
                "affected_users": 15000,
                "estimated_repair": "2 hours"
            },
            {
                "location": "Delhi NCR", 
                "severity": "MEDIUM",
                "affected_users": 5000,
                "estimated_repair": "30 minutes"
            }
        ],
        "timestamp": datetime.utcnow().isoformat()
    }

# Safe Zones (mock data)
@app.get("/api/navigation/safezones")
async def get_safe_zones():
    return {
        "safe_zones": [
            {
                "name": "Community Center",
                "coordinates": {"lat": 28.6139, "lng": 77.2090},
                "capacity": 500,
                "facilities": ["Medical", "Food", "Shelter"]
            },
            {
                "name": "School Auditorium",
                "coordinates": {"lat": 28.6129, "lng": 77.2080},
                "capacity": 300,
                "facilities": ["Shelter", "Communication"]
            }
        ],
        "timestamp": datetime.utcnow().isoformat()
    }

# Live Data Endpoints
@app.get("/api/live/news/disaster-feed")
async def get_disaster_news_feed(limit: int = 50, ai_filter: bool = True):
    try:
        articles = await services["news"].fetch_disaster_news(limit)
        
        if ai_filter:
            articles = await services["gemini"].filter_disaster_news(articles)
        
        return {
            "articles": articles,
            "total": len(articles),
            "ai_filtered": ai_filter,
            "sources": list(set(article.get('api_source', 'unknown') for article in articles)),
            "last_updated": datetime.utcnow().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch news feed: {str(e)}")

@app.post("/api/live/weather/current")
async def get_current_weather(location_request: LocationRequest, ai_analysis: bool = True):
    try:
        weather_data = await services["weather"].get_current_weather(
            lat=location_request.lat,
            lon=location_request.lng
        )
        
        if ai_analysis:
            weather_data = await services["gemini"].analyze_weather_forecast(weather_data)
        
        return {
            "weather": weather_data,
            "coordinates": {"lat": location_request.lat, "lng": location_request.lng},
            "location_name": location_request.location_name,
            "ai_analyzed": ai_analysis,
            "last_updated": datetime.utcnow().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Weather fetch failed: {str(e)}")

@app.post("/api/live/satellite/disaster-imagery")
async def get_disaster_satellite_imagery(location_request: LocationRequest):
    try:
        imagery_data = await services["sentinel"].get_disaster_imagery(
            lat=location_request.lat,
            lng=location_request.lng,
            disaster_type="flood_detection",
            bbox_size=0.01,
            time_range_days=30
        )
        
        return {
            "satellite_imagery": imagery_data,
            "coordinates": {"lat": location_request.lat, "lng": location_request.lng},
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Satellite imagery fetch failed: {str(e)}")

@app.get("/api/live/combined/disaster-intelligence")
async def get_combined_disaster_intelligence(
    lat: float, 
    lng: float, 
    location_name: Optional[str] = None
):
    try:
        # Fetch data from mock services
        news = await services["news"].fetch_disaster_news(20)
        weather = await services["weather"].get_current_weather(lat, lng)
        alerts = await services["weather"].get_weather_alerts(lat, lng)
        extreme = await services["weather"].check_extreme_weather(lat, lng)
        flood_satellite = await services["sentinel"].get_flood_risk_analysis(lat, lng)
        fire_satellite = await services["sentinel"].get_fire_detection(lat, lng)
        
        if location_name:
            location_news = await services["news"].search_news_by_location(location_name, limit=10)
        else:
            location_news = []
        
        # Combine risk assessment
        risk_factors = []
        overall_risk = "LOW"
        
        # Weather risk
        if extreme.get('risk_level') in ['HIGH', 'CRITICAL']:
            risk_factors.append(f"Extreme weather: {extreme.get('risk_level')}")
            overall_risk = extreme.get('risk_level')
        
        # Satellite flood risk
        flood_risk = flood_satellite.get('flood_analysis', {}).get('flood_risk_level', 'LOW')
        if flood_risk in ['HIGH', 'CRITICAL']:
            risk_factors.append(f"Satellite flood detection: {flood_risk}")
            if flood_risk == 'CRITICAL' or overall_risk != 'CRITICAL':
                overall_risk = flood_risk
        
        # Satellite fire risk
        fire_risk = fire_satellite.get('fire_analysis', {}).get('fire_risk_level', 'LOW')
        if fire_risk in ['HIGH', 'CRITICAL']:
            risk_factors.append(f"Satellite fire detection: {fire_risk}")
            if fire_risk == 'CRITICAL' or (overall_risk not in ['CRITICAL'] and fire_risk == 'HIGH'):
                overall_risk = fire_risk
        
        return {
            "disaster_intelligence": {
                "overall_risk": overall_risk,
                "risk_factors": risk_factors,
                "coordinates": {"lat": lat, "lng": lng},
                "location_name": location_name
            },
            "news_feed": {
                "general_disasters": news[:10],
                "location_specific": location_news[:5],
                "total_articles": len(news)
            },
            "weather_data": {
                "current": weather,
                "alerts": alerts,
                "extreme_conditions": extreme
            },
            "satellite_data": {
                "flood_analysis": flood_satellite,
                "fire_detection": fire_satellite
            },
            "last_updated": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Combined intelligence fetch failed: {str(e)}")

@app.get("/api/live/health-check")
async def health_check_apis():
    return {
        "api_status": {
            "news_apis": "operational",
            "weather_api": "operational", 
            "sentinel_hub_api": "operational"
        },
        "overall_status": "operational",
        "service_type": "mock_services",
        "checked_at": datetime.utcnow().isoformat()
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)