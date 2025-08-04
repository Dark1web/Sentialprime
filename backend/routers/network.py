from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta
import random

router = APIRouter()

class SpeedTestReport(BaseModel):
    download_speed: float = Field(..., ge=0, description="Download speed in Mbps")
    upload_speed: float = Field(..., ge=0, description="Upload speed in Mbps")
    ping: Optional[float] = Field(None, ge=0, description="Ping latency in ms")
    location: Dict[str, float] = Field(..., description="Location coordinates {lat, lng}")
    timestamp: Optional[datetime] = Field(None, description="Test timestamp")
    user_agent: Optional[str] = Field(None, description="Device/browser info")

class NetworkOutageData(BaseModel):
    region_id: str
    region_name: str
    connectivity_score: float = Field(..., ge=0, le=1)
    status: str  # "online", "degraded", "offline"
    affected_users: int
    last_updated: datetime
    outage_duration: Optional[str] = None

class ConnectivityZone(BaseModel):
    zone_id: str
    zone_name: str
    polygon_coordinates: List[List[float]]  # GeoJSON polygon
    connectivity_level: str  # "good", "fair", "poor", "offline"
    color_code: str  # For map visualization
    metrics: Dict[str, Any]

@router.post("/speed-test")
async def submit_speed_test(report: SpeedTestReport, request: Request):
    """
    Submit a crowd-sourced speed test report.
    """
    try:
        # In production, this would store in database
        processed_report = {
            "id": f"test_{int(datetime.now().timestamp())}",
            "download_speed": report.download_speed,
            "upload_speed": report.upload_speed,
            "ping": report.ping,
            "location": report.location,
            "timestamp": report.timestamp or datetime.utcnow(),
            "connectivity_score": min(1.0, (report.download_speed + report.upload_speed) / 100),
            "zone_classification": _classify_connectivity(report.download_speed, report.upload_speed)
        }
        
        return {
            "message": "Speed test report submitted successfully",
            "report_id": processed_report["id"],
            "processed_data": processed_report
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to submit speed test: {str(e)}")

@router.get("/outages", response_model=List[NetworkOutageData])
async def get_network_outages(
    request: Request,
    region: Optional[str] = None,
    status_filter: Optional[str] = None
):
    """
    Get current network outages and connectivity status by region.
    """
    try:
        # Sample outage data (would be from database/APIs in production)
        outages = [
            {
                "region_id": "IN_DL_001",
                "region_name": "Delhi Central",
                "connectivity_score": 0.85,
                "status": "degraded",
                "affected_users": 15420,
                "last_updated": datetime.utcnow() - timedelta(minutes=15),
                "outage_duration": "2 hours"
            },
            {
                "region_id": "IN_MH_002",
                "region_name": "Mumbai Suburban",
                "connectivity_score": 0.12,
                "status": "offline",
                "affected_users": 89300,
                "last_updated": datetime.utcnow() - timedelta(minutes=45),
                "outage_duration": "6 hours"
            },
            {
                "region_id": "IN_KA_003",
                "region_name": "Bangalore Tech Hub",
                "connectivity_score": 0.95,
                "status": "online",
                "affected_users": 0,
                "last_updated": datetime.utcnow() - timedelta(minutes=5)
            }
        ]
        
        # Filter by region if specified
        if region:
            outages = [o for o in outages if region.lower() in o["region_name"].lower()]
        
        # Filter by status if specified
        if status_filter:
            outages = [o for o in outages if o["status"] == status_filter.lower()]
        
        return [NetworkOutageData(**outage) for outage in outages]
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get outages: {str(e)}")

@router.get("/connectivity-map")
async def get_connectivity_map(request: Request):
    """
    Get connectivity zones data for choropleth map visualization.
    """
    try:
        # Sample connectivity zones (would be generated from real data)
        zones = [
            {
                "zone_id": "zone_001",
                "zone_name": "Downtown Business District",
                "polygon_coordinates": [
                    [77.2090, 28.6139], [77.2150, 28.6139],
                    [77.2150, 28.6200], [77.2090, 28.6200], [77.2090, 28.6139]
                ],
                "connectivity_level": "good",
                "color_code": "#28a745",
                "metrics": {
                    "avg_download": 85.3,
                    "avg_upload": 42.1,
                    "avg_ping": 25,
                    "reports_count": 156
                }
            },
            {
                "zone_id": "zone_002",
                "zone_name": "Flood Affected Area",
                "polygon_coordinates": [
                    [77.1800, 28.5800], [77.1900, 28.5800],
                    [77.1900, 28.5900], [77.1800, 28.5900], [77.1800, 28.5800]
                ],
                "connectivity_level": "offline",
                "color_code": "#dc3545",
                "metrics": {
                    "avg_download": 0.1,
                    "avg_upload": 0.05,
                    "avg_ping": 999,
                    "reports_count": 89
                }
            },
            {
                "zone_id": "zone_003",
                "zone_name": "Suburban Residential",
                "polygon_coordinates": [
                    [77.2500, 28.5500], [77.2600, 28.5500],
                    [77.2600, 28.5600], [77.2500, 28.5600], [77.2500, 28.5500]
                ],
                "connectivity_level": "fair",
                "color_code": "#ffc107",
                "metrics": {
                    "avg_download": 25.8,
                    "avg_upload": 12.3,
                    "avg_ping": 85,
                    "reports_count": 67
                }
            }
        ]
        
        return {
            "zones": [ConnectivityZone(**zone) for zone in zones],
            "legend": {
                "good": {"color": "#28a745", "description": "Good connectivity (>50 Mbps)"},
                "fair": {"color": "#ffc107", "description": "Fair connectivity (10-50 Mbps)"},
                "poor": {"color": "#fd7e14", "description": "Poor connectivity (1-10 Mbps)"},
                "offline": {"color": "#dc3545", "description": "No connectivity (<1 Mbps)"}
            },
            "last_updated": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get connectivity map: {str(e)}")

@router.get("/tower-status")
async def get_tower_status(request: Request, lat: float, lng: float, radius: float = 10.0):
    """
    Get mobile tower status within a radius of given coordinates.
    """
    try:
        # Sample tower data (would be from real APIs in production)
        towers = []
        for i in range(random.randint(3, 8)):
            # Generate random towers around the location
            tower_lat = lat + random.uniform(-radius/111, radius/111)  # Rough km to degree conversion
            tower_lng = lng + random.uniform(-radius/111, radius/111)
            
            status_options = ["operational", "degraded", "offline", "maintenance"]
            tower = {
                "tower_id": f"TOWER_{1000 + i}",
                "operator": random.choice(["Airtel", "Jio", "Vodafone", "BSNL"]),
                "location": {"lat": tower_lat, "lng": tower_lng},
                "status": random.choice(status_options),
                "signal_strength": random.uniform(0.1, 1.0),
                "last_ping": datetime.utcnow() - timedelta(minutes=random.randint(1, 60)),
                "coverage_radius": random.uniform(2.0, 8.0)
            }
            towers.append(tower)
        
        # Calculate area coverage
        operational_towers = [t for t in towers if t["status"] == "operational"]
        coverage_percentage = (len(operational_towers) / len(towers)) * 100 if towers else 0
        
        return {
            "towers": towers,
            "summary": {
                "total_towers": len(towers),
                "operational": len(operational_towers),
                "coverage_percentage": coverage_percentage,
                "search_radius": radius,
                "center": {"lat": lat, "lng": lng}
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get tower status: {str(e)}")

@router.get("/statistics")
async def get_network_statistics(request: Request):
    """
    Get network connectivity statistics and trends.
    """
    try:
        return {
            "current_status": {
                "total_regions_monitored": 45,
                "regions_with_issues": 8,
                "users_affected": 125430,
                "average_connectivity": 0.73
            },
            "speed_test_data": {
                "reports_last_24h": 2847,
                "avg_download_speed": 42.3,
                "avg_upload_speed": 18.7,
                "avg_ping": 45
            },
            "outage_trends": {
                "current_outages": 12,
                "resolved_today": 18,
                "avg_resolution_time": "2.4 hours"
            },
            "coverage_by_zone": {
                "urban": {"coverage": 0.89, "avg_speed": 67.2},
                "suburban": {"coverage": 0.76, "avg_speed": 34.8},
                "rural": {"coverage": 0.45, "avg_speed": 12.1}
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get statistics: {str(e)}")

def _classify_connectivity(download: float, upload: float) -> str:
    """Classify connectivity level based on speeds."""
    avg_speed = (download + upload) / 2
    
    if avg_speed >= 50:
        return "good"
    elif avg_speed >= 10:
        return "fair"
    elif avg_speed >= 1:
        return "poor"
    else:
        return "offline"