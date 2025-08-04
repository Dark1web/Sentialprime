from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
import math
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from services.gemini_service import get_gemini_service

router = APIRouter()

class Location(BaseModel):
    lat: float = Field(..., ge=-90, le=90)
    lng: float = Field(..., ge=-180, le=180)

class SafeZone(BaseModel):
    id: str
    name: str
    location: Location
    type: str  # "shelter", "hospital", "evacuation_center", "safe_building"
    capacity: int
    current_occupancy: int
    amenities: List[str]
    contact_info: Optional[str] = None
    status: str  # "available", "full", "closed"
    distance_km: Optional[float] = None

class DangerZone(BaseModel):
    id: str
    name: str
    polygon_coordinates: List[List[float]]  # GeoJSON polygon
    risk_type: str  # "flood", "fire", "landslide", "building_collapse"
    risk_level: str  # "low", "medium", "high", "critical"
    description: str
    last_updated: datetime

class NavigationRequest(BaseModel):
    start_location: Location
    destination_type: str  # "safe_zone", "hospital", "evacuation_center"
    max_distance_km: Optional[float] = 10.0
    transportation_mode: Optional[str] = "walking"  # "walking", "driving", "cycling"

class Route(BaseModel):
    distance_km: float
    duration_minutes: float
    waypoints: List[Location]
    instructions: List[str]
    safety_notes: List[str]
    avoid_zones: List[str]

class OfflineMapData(BaseModel):
    region_id: str
    region_name: str
    bounds: Dict[str, float]  # {north, south, east, west}
    zoom_levels: List[int]
    tile_count: int
    size_mb: float
    last_updated: datetime

@router.get("/safezones")
async def get_safe_zones(
    request: Request,
    lat: float,
    lng: float,
    radius_km: float = 10.0,
    zone_type: Optional[str] = None
):
    """
    Get safe zones near a location for disaster navigation.
    """
    try:
        # Sample safe zones (would be from database/APIs in production)
        all_safe_zones = [
            {
                "id": "shelter_001",
                "name": "City Community Center",
                "location": {"lat": lat + 0.01, "lng": lng + 0.01},
                "type": "shelter",
                "capacity": 500,
                "current_occupancy": 234,
                "amenities": ["food", "water", "medical_aid", "power", "wifi"],
                "contact_info": "+91-11-2345-6789",
                "status": "available"
            },
            {
                "id": "hospital_001",
                "name": "District General Hospital",
                "location": {"lat": lat + 0.02, "lng": lng - 0.01},
                "type": "hospital",
                "capacity": 200,
                "current_occupancy": 156,
                "amenities": ["emergency_care", "surgery", "ambulance", "blood_bank"],
                "contact_info": "+91-11-2345-6790",
                "status": "available"
            },
            {
                "id": "evac_001",
                "name": "Stadium Evacuation Center",
                "location": {"lat": lat - 0.015, "lng": lng + 0.02},
                "type": "evacuation_center",
                "capacity": 2000,
                "current_occupancy": 1890,
                "amenities": ["temporary_housing", "food", "water", "communication"],
                "contact_info": "+91-11-2345-6791",
                "status": "nearly_full"
            },
            {
                "id": "building_001",
                "name": "High-Rise Safe Building",
                "location": {"lat": lat + 0.005, "lng": lng - 0.008},
                "type": "safe_building",
                "capacity": 150,
                "current_occupancy": 23,
                "amenities": ["elevated_floors", "emergency_supplies"],
                "contact_info": "+91-11-2345-6792",
                "status": "available"
            }
        ]
        
        # Filter by type if specified
        if zone_type:
            all_safe_zones = [zone for zone in all_safe_zones if zone["type"] == zone_type]
        
        # Calculate distances and filter by radius
        safe_zones = []
        for zone in all_safe_zones:
            distance = _calculate_distance(
                lat, lng, 
                zone["location"]["lat"], zone["location"]["lng"]
            )
            if distance <= radius_km:
                zone["distance_km"] = round(distance, 2)
                safe_zones.append(SafeZone(**zone))
        
        # Sort by distance
        safe_zones.sort(key=lambda x: x.distance_km or 0)
        
        return {
            "safe_zones": safe_zones,
            "total_found": len(safe_zones),
            "search_radius": radius_km,
            "center_location": {"lat": lat, "lng": lng}
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get safe zones: {str(e)}")

@router.get("/dangerzones")
async def get_danger_zones(
    request: Request,
    lat: float,
    lng: float,
    radius_km: float = 15.0
):
    """
    Get danger zones to avoid during navigation.
    """
    try:
        # Sample danger zones
        danger_zones = [
            {
                "id": "flood_001",
                "name": "Riverside Flood Zone",
                "polygon_coordinates": [
                    [lng - 0.02, lat - 0.01], [lng + 0.01, lat - 0.01],
                    [lng + 0.01, lat + 0.005], [lng - 0.02, lat + 0.005],
                    [lng - 0.02, lat - 0.01]
                ],
                "risk_type": "flood",
                "risk_level": "high",
                "description": "River overflow causing severe flooding. Water level 2-4 feet.",
                "last_updated": datetime.utcnow()
            },
            {
                "id": "fire_001",
                "name": "Industrial Fire Hazard",
                "polygon_coordinates": [
                    [lng + 0.02, lat + 0.02], [lng + 0.03, lat + 0.02],
                    [lng + 0.03, lat + 0.03], [lng + 0.02, lat + 0.03],
                    [lng + 0.02, lat + 0.02]
                ],
                "risk_type": "fire",
                "risk_level": "critical",
                "description": "Chemical plant fire with toxic smoke. Evacuation zone 3km radius.",
                "last_updated": datetime.utcnow()
            },
            {
                "id": "landslide_001",
                "name": "Hill Slope Instability",
                "polygon_coordinates": [
                    [lng - 0.01, lat + 0.015], [lng + 0.005, lat + 0.015],
                    [lng + 0.005, lat + 0.025], [lng - 0.01, lat + 0.025],
                    [lng - 0.01, lat + 0.015]
                ],
                "risk_type": "landslide",
                "risk_level": "medium",
                "description": "Unstable hill slope due to heavy rains. Risk of landslide.",
                "last_updated": datetime.utcnow()
            }
        ]
        
        return {
            "danger_zones": [DangerZone(**zone) for zone in danger_zones],
            "total_zones": len(danger_zones),
            "search_area": {"lat": lat, "lng": lng, "radius_km": radius_km}
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get danger zones: {str(e)}")

@router.post("/route")
async def calculate_safe_route(nav_request: NavigationRequest, request: Request):
    """
    Calculate a safe route avoiding danger zones.
    """
    try:
        start = nav_request.start_location
        
        # Find nearest safe zone of requested type
        safe_zones_response = await get_safe_zones(
            request, start.lat, start.lng, 
            nav_request.max_distance_km, nav_request.destination_type
        )
        
        if not safe_zones_response["safe_zones"]:
            raise HTTPException(status_code=404, detail="No safe zones found within range")
        
        nearest_zone = safe_zones_response["safe_zones"][0]
        
        # Get danger zones to avoid
        danger_zones_response = await get_danger_zones(request, start.lat, start.lng)
        
        # Calculate route (simplified - in production would use real routing API)
        distance_km = _calculate_distance(
            start.lat, start.lng,
            nearest_zone.location.lat, nearest_zone.location.lng
        )
        
        # Estimate duration based on transportation mode
        speed_kmh = {
            "walking": 5,
            "cycling": 15,
            "driving": 30
        }.get(nav_request.transportation_mode, 5)
        
        duration_minutes = (distance_km / speed_kmh) * 60
        
        # Generate simple waypoints
        waypoints = [
            start,
            Location(
                lat=(start.lat + nearest_zone.location.lat) / 2,
                lng=(start.lng + nearest_zone.location.lng) / 2
            ),
            nearest_zone.location
        ]
        
        # Generate instructions
        instructions = [
            f"Start from your location ({start.lat:.4f}, {start.lng:.4f})",
            f"Head towards {nearest_zone.name}",
            "Avoid marked danger zones",
            f"Arrive at {nearest_zone.name}"
        ]
        
        safety_notes = [
            "Stay on main roads when possible",
            "Keep emergency contacts handy",
            "Monitor weather conditions"
        ]
        
        avoid_zones = [zone.name for zone in danger_zones_response["danger_zones"] 
                      if zone.risk_level in ["high", "critical"]]
        
        route = Route(
            distance_km=round(distance_km, 2),
            duration_minutes=round(duration_minutes),
            waypoints=waypoints,
            instructions=instructions,
            safety_notes=safety_notes,
            avoid_zones=avoid_zones
        )
        
        return {
            "route": route,
            "destination": nearest_zone,
            "transportation_mode": nav_request.transportation_mode
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Route calculation failed: {str(e)}")

@router.get("/offline-maps")
async def get_offline_map_regions(request: Request):
    """
    Get available offline map regions for download.
    """
    try:
        regions = [
            {
                "region_id": "delhi_central",
                "region_name": "Delhi Central District",
                "bounds": {
                    "north": 28.7041,
                    "south": 28.5100,
                    "east": 77.3300,
                    "west": 77.1000
                },
                "zoom_levels": [10, 11, 12, 13, 14, 15],
                "tile_count": 15420,
                "size_mb": 45.2,
                "last_updated": datetime.utcnow()
            },
            {
                "region_id": "mumbai_suburban",
                "region_name": "Mumbai Suburban Areas",
                "bounds": {
                    "north": 19.2700,
                    "south": 19.0000,
                    "east": 72.9700,
                    "west": 72.7700
                },
                "zoom_levels": [10, 11, 12, 13, 14],
                "tile_count": 12890,
                "size_mb": 38.7,
                "last_updated": datetime.utcnow()
            }
        ]
        
        return {
            "regions": [OfflineMapData(**region) for region in regions],
            "total_regions": len(regions),
            "total_size_mb": sum(r["size_mb"] for r in regions)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get offline maps: {str(e)}")

@router.get("/emergency-procedures")
async def get_emergency_procedures(request: Request, disaster_type: Optional[str] = None):
    """
    Get emergency procedures for offline storage.
    """
    try:
        procedures = {
            "flood": [
                "Move to higher ground immediately",
                "Avoid walking/driving through flood water",
                "Stay away from electrical lines",
                "Listen to emergency broadcasts",
                "If trapped, signal for help from highest point"
            ],
            "fire": [
                "Evacuate immediately using stairs, not elevators",
                "Stay low to avoid smoke inhalation",
                "Feel doors before opening - if hot, don't open",
                "Meet at designated assembly point",
                "Call emergency services once safe"
            ],
            "earthquake": [
                "Drop, Cover, and Hold On",
                "Stay away from windows and heavy objects",
                "If outdoors, move away from buildings",
                "After shaking stops, evacuate if building is damaged",
                "Be prepared for aftershocks"
            ],
            "heatwave": [
                "Stay indoors during peak hours (10 AM - 4 PM)",
                "Drink water regularly, avoid alcohol",
                "Wear light-colored, loose clothing",
                "Use fans, AC, or visit cooling centers",
                "Never leave anyone in parked vehicles"
            ]
        }
        
        if disaster_type and disaster_type in procedures:
            return {
                "disaster_type": disaster_type,
                "procedures": procedures[disaster_type],
                "emergency_numbers": {
                    "national_emergency": "112",
                    "fire": "101",
                    "police": "100",
                    "medical": "108"
                }
            }
        
        return {
            "all_procedures": procedures,
            "emergency_numbers": {
                "national_emergency": "112",
                "fire": "101",
                "police": "100",
                "medical": "108",
                "disaster_management": "1078"
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get procedures: {str(e)}")

@router.post("/ai-enhanced-route")
async def get_ai_enhanced_route(request: NavigationRequest):
    """
    Get AI-enhanced route recommendations using Gemini AI analysis.
    """
    try:
        # First get the basic route
        basic_route = await get_safe_route(request)
        
        # Get current conditions (mock data for now)
        current_conditions = {
            "weather": {
                "temperature": 25,
                "humidity": 70,
                "wind_speed": 15,
                "conditions": "partly cloudy"
            },
            "traffic": "moderate",
            "active_alerts": ["flood warning in district 5"],
            "time_of_day": datetime.now().strftime('%H:%M')
        }
        
        # Enhance with Gemini AI
        try:
            gemini_service = get_gemini_service()
            enhanced_route = await gemini_service.enhance_navigation_recommendations(
                route_data=basic_route,
                current_conditions=current_conditions
            )
            
            return {
                "basic_route": basic_route,
                "ai_enhanced": enhanced_route,
                "timestamp": datetime.utcnow().isoformat()
            }
        except Exception as ai_error:
            print(f"AI enhancement failed: {ai_error}")
            return {
                "basic_route": basic_route,
                "ai_enhanced": None,
                "ai_error": "AI enhancement temporarily unavailable",
                "timestamp": datetime.utcnow().isoformat()
            }
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get AI-enhanced route: {str(e)}")

@router.get("/ai-dashboard-data")
async def get_ai_dashboard_data(lat: float, lng: float):
    """
    Get AI-analyzed data for the dashboard including news, weather, and navigation insights.
    """
    try:
        # Import live data functions
        import requests
        
        # Get AI-filtered news
        news_response = requests.get(f"http://localhost:8000/api/live/news/disaster-feed?ai_filter=true&limit=10")
        news_data = news_response.json() if news_response.status_code == 200 else {"articles": []}
        
        # Get AI-analyzed weather
        weather_response = requests.post(
            "http://localhost:8000/api/live/weather/current",
            json={"lat": lat, "lng": lng, "location_name": None}
        )
        weather_data = weather_response.json() if weather_response.status_code == 200 else {"weather": {}}
        
        # Get safe zones
        safe_zones_response = await get_safe_zones_near(lat=lat, lng=lng, radius_km=10)
        
        return {
            "ai_dashboard": {
                "news_intelligence": {
                    "filtered_articles": news_data.get("articles", [])[:5],
                    "total_articles": news_data.get("total", 0),
                    "ai_filtered": news_data.get("ai_filtered", False)
                },
                "weather_intelligence": {
                    "current_conditions": weather_data.get("weather", {}),
                    "ai_risk_analysis": weather_data.get("weather", {}).get("ai_analysis", {}),
                    "ai_analyzed": weather_data.get("ai_analyzed", False)
                },
                "navigation_intelligence": {
                    "nearby_safe_zones": safe_zones_response.get("safe_zones", [])[:3],
                    "total_safe_zones": len(safe_zones_response.get("safe_zones", [])),
                    "coordinates": {"lat": lat, "lng": lng}
                }
            },
            "last_updated": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        # Return fallback data if AI services fail
        return {
            "ai_dashboard": {
                "news_intelligence": {
                    "filtered_articles": [],
                    "total_articles": 0,
                    "ai_filtered": False,
                    "error": "AI news filtering unavailable"
                },
                "weather_intelligence": {
                    "current_conditions": {},
                    "ai_risk_analysis": {},
                    "ai_analyzed": False,
                    "error": "AI weather analysis unavailable"
                },
                "navigation_intelligence": {
                    "nearby_safe_zones": [],
                    "total_safe_zones": 0,
                    "coordinates": {"lat": lat, "lng": lng},
                    "error": "Navigation data unavailable"
                }
            },
            "error": f"Dashboard data fetch failed: {str(e)}",
            "last_updated": datetime.utcnow().isoformat()
        }

def _calculate_distance(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """Calculate distance between two points using Haversine formula."""
    R = 6371  # Earth's radius in kilometers
    
    lat1_rad = math.radians(lat1)
    lat2_rad = math.radians(lat2)
    delta_lat = math.radians(lat2 - lat1)
    delta_lng = math.radians(lng2 - lng1)
    
    a = (math.sin(delta_lat/2) * math.sin(delta_lat/2) +
         math.cos(lat1_rad) * math.cos(lat2_rad) *
         math.sin(delta_lng/2) * math.sin(delta_lng/2))
    
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    distance = R * c
    
    return distance