from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from services.news_service import NewsService
from services.weather_service import WeatherService
from services.sentinel_hub_service import SentinelHubService
from services.gemini_service import get_gemini_service

router = APIRouter()

class LocationRequest(BaseModel):
    lat: float
    lng: float
    location_name: Optional[str] = None

class NewsSearchRequest(BaseModel):
    keywords: Optional[List[str]] = None
    location: Optional[str] = None
    limit: Optional[int] = 20

class SatelliteImageryRequest(BaseModel):
    lat: float
    lng: float
    disaster_type: Optional[str] = "flood_detection"  # flood_detection, fire_detection, vegetation_health
    bbox_size: Optional[float] = 0.01  # degrees
    time_range_days: Optional[int] = 30

@router.get("/news/disaster-feed")
async def get_disaster_news_feed(limit: int = 50, ai_filter: bool = True):
    """
    Get real-time disaster news from multiple sources with optional AI filtering.
    """
    try:
        news_service = NewsService()
        articles = await news_service.fetch_disaster_news(limit)
        
        # Apply Gemini AI filtering if requested
        if ai_filter:
            try:
                gemini_service = get_gemini_service()
                articles = await gemini_service.filter_disaster_news(articles)
            except Exception as ai_error:
                print(f"AI filtering failed, returning unfiltered news: {ai_error}")
        
        return {
            "articles": articles,
            "total": len(articles),
            "ai_filtered": ai_filter,
            "sources": list(set(article.get('api_source', 'unknown') for article in articles)),
            "last_updated": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch news feed: {str(e)}")

@router.post("/news/search-location")
async def search_location_news(search_request: NewsSearchRequest):
    """
    Search for disaster news in a specific location.
    """
    try:
        news_service = NewsService()
        
        if not search_request.location:
            raise HTTPException(status_code=400, detail="Location is required")
            
        articles = await news_service.search_news_by_location(
            location=search_request.location,
            keywords=search_request.keywords
        )
        
        return {
            "articles": articles[:search_request.limit],
            "location": search_request.location,
            "keywords": search_request.keywords,
            "total": len(articles),
            "last_updated": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Location news search failed: {str(e)}")

@router.post("/weather/current")
async def get_current_weather(location_request: LocationRequest, ai_analysis: bool = True):
    """
    Get current weather data for coordinates with optional AI risk analysis.
    """
    try:
        weather_service = WeatherService()
        weather_data = await weather_service.get_current_weather(
            lat=location_request.lat,
            lon=location_request.lng
        )
        
        # Add AI analysis if requested
        ai_enhanced_weather = weather_data
        if ai_analysis:
            try:
                gemini_service = get_gemini_service()
                ai_enhanced_weather = await gemini_service.analyze_weather_forecast(weather_data)
            except Exception as ai_error:
                print(f"AI weather analysis failed: {ai_error}")
        
        return {
            "weather": ai_enhanced_weather,
            "coordinates": {"lat": location_request.lat, "lng": location_request.lng},
            "location_name": location_request.location_name,
            "ai_analyzed": ai_analysis,
            "last_updated": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Weather fetch failed: {str(e)}")

@router.post("/weather/alerts")
async def get_weather_alerts(location_request: LocationRequest):
    """
    Get weather alerts and warnings for coordinates.
    """
    try:
        weather_service = WeatherService()
        alerts_data = await weather_service.get_weather_alerts(
            lat=location_request.lat,
            lon=location_request.lng
        )
        
        return {
            "alerts": alerts_data,
            "coordinates": {"lat": location_request.lat, "lng": location_request.lng},
            "location_name": location_request.location_name,
            "last_updated": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Weather alerts fetch failed: {str(e)}")

@router.post("/weather/extreme-check")
async def check_extreme_weather(location_request: LocationRequest):
    """
    Check for extreme weather conditions at location.
    """
    try:
        weather_service = WeatherService()
        extreme_data = await weather_service.check_extreme_weather(
            lat=location_request.lat,
            lon=location_request.lng
        )
        
        return {
            "extreme_weather": extreme_data,
            "coordinates": {"lat": location_request.lat, "lng": location_request.lng},
            "location_name": location_request.location_name,
            "last_updated": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Extreme weather check failed: {str(e)}")

# Satellite Imagery Endpoints
@router.post("/satellite/disaster-imagery")
async def get_disaster_satellite_imagery(imagery_request: SatelliteImageryRequest):
    """
    Get satellite imagery for disaster monitoring.
    """
    try:
        sentinel_service = SentinelHubService()
        imagery_data = await sentinel_service.get_disaster_imagery(
            lat=imagery_request.lat,
            lng=imagery_request.lng,
            disaster_type=imagery_request.disaster_type,
            bbox_size=imagery_request.bbox_size,
            time_range_days=imagery_request.time_range_days
        )
        
        return {
            "satellite_imagery": imagery_data,
            "request_params": {
                "coordinates": {"lat": imagery_request.lat, "lng": imagery_request.lng},
                "disaster_type": imagery_request.disaster_type,
                "bbox_size": imagery_request.bbox_size,
                "time_range_days": imagery_request.time_range_days
            },
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Satellite imagery fetch failed: {str(e)}")

@router.post("/satellite/flood-analysis")
async def get_flood_risk_satellite_analysis(location_request: LocationRequest):
    """
    Get flood risk analysis using satellite imagery.
    """
    try:
        sentinel_service = SentinelHubService()
        flood_analysis = await sentinel_service.get_flood_risk_analysis(
            lat=location_request.lat,
            lng=location_request.lng
        )
        
        return {
            "flood_satellite_analysis": flood_analysis,
            "coordinates": {"lat": location_request.lat, "lng": location_request.lng},
            "location_name": location_request.location_name,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Satellite flood analysis failed: {str(e)}")

@router.post("/satellite/fire-detection")
async def get_fire_detection_satellite(location_request: LocationRequest):
    """
    Detect fires using satellite thermal imagery.
    """
    try:
        sentinel_service = SentinelHubService()
        fire_detection = await sentinel_service.get_fire_detection(
            lat=location_request.lat,
            lng=location_request.lng
        )
        
        return {
            "fire_satellite_detection": fire_detection,
            "coordinates": {"lat": location_request.lat, "lng": location_request.lng},
            "location_name": location_request.location_name,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Satellite fire detection failed: {str(e)}")

@router.post("/satellite/vegetation-health")
async def get_vegetation_health_satellite(location_request: LocationRequest):
    """
    Monitor vegetation health using satellite NDVI data.
    """
    try:
        sentinel_service = SentinelHubService()
        vegetation_health = await sentinel_service.get_vegetation_health(
            lat=location_request.lat,
            lng=location_request.lng
        )
        
        return {
            "vegetation_satellite_health": vegetation_health,
            "coordinates": {"lat": location_request.lat, "lng": location_request.lng},
            "location_name": location_request.location_name,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Satellite vegetation analysis failed: {str(e)}")

@router.get("/combined/disaster-intelligence")
async def get_combined_disaster_intelligence(
    lat: float, 
    lng: float, 
    location_name: Optional[str] = None
):
    """
    Get combined disaster intelligence: news + weather + alerts.
    """
    try:
        news_service = NewsService()
        weather_service = WeatherService()
        sentinel_service = SentinelHubService()
        
        # Fetch data concurrently
        import asyncio
        news_task = news_service.fetch_disaster_news(20)
        weather_task = weather_service.get_current_weather(lat, lng)
        alerts_task = weather_service.get_weather_alerts(lat, lng)
        extreme_task = weather_service.check_extreme_weather(lat, lng)
        
        # Add satellite data tasks
        flood_satellite_task = sentinel_service.get_flood_risk_analysis(lat, lng)
        fire_satellite_task = sentinel_service.get_fire_detection(lat, lng)
        
        if location_name:
            location_news_task = news_service.search_news_by_location(location_name, limit=10)
            news, weather, alerts, extreme, location_news, flood_satellite, fire_satellite = await asyncio.gather(
                news_task, weather_task, alerts_task, extreme_task, location_news_task, 
                flood_satellite_task, fire_satellite_task
            )
        else:
            news, weather, alerts, extreme, flood_satellite, fire_satellite = await asyncio.gather(
                news_task, weather_task, alerts_task, extreme_task, 
                flood_satellite_task, fire_satellite_task
            )
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
        
        # News analysis risk
        recent_disasters = [article for article in news if any(
            keyword in article.get('title', '').lower() 
            for keyword in ['flood', 'fire', 'earthquake', 'storm', 'emergency']
        )]
        
        if len(recent_disasters) > 5:
            risk_factors.append(f"High disaster activity: {len(recent_disasters)} reports")
            if overall_risk == "LOW":
                overall_risk = "MEDIUM"
        
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

@router.get("/health-check")
async def health_check_apis():
    """
    Check the health of all external APIs.
    """
    try:
        results = {
            "news_api": "unknown",
            "gnews_api": "unknown", 
            "google_rss": "unknown",
            "weather_api": "unknown",
            "huggingface_api": "unknown",
            "sentinel_hub_api": "unknown"
        }
        
        # Test a simple news fetch
        try:
            news_service = NewsService()
            await news_service.fetch_disaster_news(1)
            results["news_apis"] = "operational"
        except:
            results["news_apis"] = "degraded"
            
        # Test weather API
        try:
            weather_service = WeatherService()
            await weather_service.get_current_weather(28.6139, 77.2090)  # Delhi coordinates
            results["weather_api"] = "operational"
        except:
            results["weather_api"] = "degraded"
            
        # Test Sentinel Hub API
        try:
            sentinel_service = SentinelHubService()
            await sentinel_service.get_disaster_imagery(28.6139, 77.2090, "flood_detection", 0.01, 7)
            results["sentinel_hub_api"] = "operational"
        except:
            results["sentinel_hub_api"] = "degraded"
        
        return {
            "api_status": results,
            "overall_status": "operational" if all(status in ["operational", "unknown"] for status in results.values()) else "degraded",
            "checked_at": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Health check failed: {str(e)}")