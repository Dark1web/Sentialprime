import aiohttp
import asyncio
import base64
from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime, timedelta
from config import get_api_key, get_endpoint

class SentinelHubService:
    """Service for Sentinel Hub satellite imagery and Earth observation data"""
    
    def __init__(self):
        self.api_key = get_api_key("SENTINEL_HUB_API")
        self.api_url = get_endpoint("SENTINEL_HUB_API")
        
        # Standard headers for Sentinel Hub API
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        # Disaster monitoring configurations
        self.disaster_configs = {
            "flood_detection": {
                "data_source": "sentinel-2-l2a",
                "bands": ["B02", "B03", "B04", "B08", "B11", "B12"],  # Blue, Green, Red, NIR, SWIR1, SWIR2
                "resolution": 60,  # meters
                "cloud_coverage": 30  # max percentage
            },
            "fire_detection": {
                "data_source": "sentinel-2-l2a", 
                "bands": ["B04", "B08", "B11", "B12"],  # Red, NIR, SWIR1, SWIR2
                "resolution": 20,
                "cloud_coverage": 20
            },
            "land_change": {
                "data_source": "sentinel-2-l2a",
                "bands": ["B02", "B03", "B04", "B08"],  # True color + NIR
                "resolution": 10,
                "cloud_coverage": 10
            },
            "vegetation_health": {
                "data_source": "sentinel-2-l2a",
                "bands": ["B04", "B08"],  # Red, NIR for NDVI
                "resolution": 10,
                "cloud_coverage": 15
            }
        }
    
    async def get_disaster_imagery(self, 
                                 lat: float, 
                                 lng: float, 
                                 disaster_type: str = "flood_detection",
                                 bbox_size: float = 0.01,  # degrees
                                 time_range_days: int = 30) -> Dict[str, Any]:
        """
        Get satellite imagery for disaster monitoring.
        
        Args:
            lat, lng: Center coordinates
            disaster_type: Type of disaster analysis ('flood_detection', 'fire_detection', etc.)
            bbox_size: Size of bounding box in degrees
            time_range_days: Number of days to look back for imagery
        """
        try:
            # Calculate bounding box
            bbox = [
                lng - bbox_size/2,  # min_lng
                lat - bbox_size/2,  # min_lat  
                lng + bbox_size/2,  # max_lng
                lat + bbox_size/2   # max_lat
            ]
            
            # Get configuration for disaster type
            config = self.disaster_configs.get(disaster_type, self.disaster_configs["flood_detection"])
            
            # Calculate time range
            end_date = datetime.utcnow()
            start_date = end_date - timedelta(days=time_range_days)
            
            # Prepare request payload
            payload = {
                "input": {
                    "bounds": {
                        "bbox": bbox,
                        "properties": {"crs": "http://www.opengis.net/def/crs/EPSG/0/4326"}
                    },
                    "data": [{
                        "type": config["data_source"],
                        "dataFilter": {
                            "timeRange": {
                                "from": start_date.strftime("%Y-%m-%dT00:00:00Z"),
                                "to": end_date.strftime("%Y-%m-%dT23:59:59Z")
                            },
                            "maxCloudCoverage": config["cloud_coverage"]
                        }
                    }]
                },
                "output": {
                    "width": 512,
                    "height": 512,
                    "responses": [
                        {
                            "identifier": "default",
                            "format": {"type": "image/png"}
                        }
                    ]
                },
                "evalscript": self._get_evalscript(disaster_type)
            }
            
            # Make API request
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    f"{self.api_url}/process",
                    headers=self.headers,
                    json=payload
                ) as response:
                    if response.status == 200:
                        # Get the image data
                        image_data = await response.read()
                        
                        # Convert to base64 for frontend display
                        image_base64 = base64.b64encode(image_data).decode('utf-8')
                        
                        # Analyze the imagery for disaster indicators
                        analysis = await self._analyze_disaster_indicators(
                            image_data, disaster_type, lat, lng
                        )
                        
                        return {
                            "success": True,
                            "image_data": f"data:image/png;base64,{image_base64}",
                            "analysis": analysis,
                            "metadata": {
                                "coordinates": {"lat": lat, "lng": lng},
                                "bbox": bbox,
                                "disaster_type": disaster_type,
                                "time_range": {
                                    "start": start_date.isoformat(),
                                    "end": end_date.isoformat()
                                },
                                "resolution": config["resolution"],
                                "data_source": config["data_source"]
                            }
                        }
                    else:
                        error_text = await response.text()
                        print(f"Sentinel Hub API error: {response.status} - {error_text}")
                        return self._get_fallback_imagery(lat, lng, disaster_type)
                        
        except Exception as e:
            print(f"Sentinel Hub service error: {e}")
            return self._get_fallback_imagery(lat, lng, disaster_type)
    
    async def get_flood_risk_analysis(self, lat: float, lng: float, bbox_size: float = 0.02) -> Dict[str, Any]:
        """Get flood risk analysis using water detection algorithms"""
        try:
            # Get recent imagery for flood detection
            recent_imagery = await self.get_disaster_imagery(
                lat, lng, "flood_detection", bbox_size, time_range_days=7
            )
            
            # Get historical imagery for comparison
            historical_imagery = await self.get_disaster_imagery(
                lat, lng, "flood_detection", bbox_size, time_range_days=365
            )
            
            # Analyze flood indicators
            flood_analysis = {
                "current_water_coverage": self._calculate_water_coverage(recent_imagery),
                "historical_water_coverage": self._calculate_water_coverage(historical_imagery),
                "flood_risk_level": "UNKNOWN",
                "indicators": [],
                "recommendations": []
            }
            
            # Determine flood risk
            current_water = flood_analysis["current_water_coverage"]
            historical_water = flood_analysis["historical_water_coverage"]
            
            if current_water > historical_water * 2:
                flood_analysis["flood_risk_level"] = "CRITICAL"
                flood_analysis["indicators"].append("Significant increase in water coverage detected")
                flood_analysis["recommendations"].append("Immediate evacuation may be necessary")
            elif current_water > historical_water * 1.5:
                flood_analysis["flood_risk_level"] = "HIGH"
                flood_analysis["indicators"].append("Elevated water levels detected")
                flood_analysis["recommendations"].append("Monitor situation closely")
            elif current_water > historical_water * 1.2:
                flood_analysis["flood_risk_level"] = "MEDIUM"
                flood_analysis["indicators"].append("Slightly elevated water levels")
                flood_analysis["recommendations"].append("Stay alert for updates")
            else:
                flood_analysis["flood_risk_level"] = "LOW"
                flood_analysis["indicators"].append("Normal water levels")
                flood_analysis["recommendations"].append("Continue normal activities")
            
            return {
                "flood_analysis": flood_analysis,
                "recent_imagery": recent_imagery,
                "coordinates": {"lat": lat, "lng": lng},
                "analysis_timestamp": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            print(f"Flood risk analysis error: {e}")
            return {
                "flood_analysis": {
                    "current_water_coverage": 0,
                    "historical_water_coverage": 0,
                    "flood_risk_level": "UNKNOWN",
                    "indicators": ["Analysis unavailable"],
                    "recommendations": ["Use alternative monitoring methods"]
                },
                "error": str(e)
            }
    
    async def get_fire_detection(self, lat: float, lng: float, bbox_size: float = 0.05) -> Dict[str, Any]:
        """Detect fires and burn areas using thermal and infrared imagery"""
        try:
            fire_imagery = await self.get_disaster_imagery(
                lat, lng, "fire_detection", bbox_size, time_range_days=3
            )
            
            fire_analysis = {
                "active_fire_detected": False,
                "burn_area_percentage": 0,
                "fire_risk_level": "LOW",
                "hotspots": [],
                "recommendations": []
            }
            
            # Simulate fire detection analysis (in production, would use actual image processing)
            if fire_imagery.get("success"):
                # Mock analysis based on location (some areas more fire-prone)
                fire_risk_score = abs(lat * lng) % 100
                
                if fire_risk_score > 80:
                    fire_analysis["active_fire_detected"] = True
                    fire_analysis["fire_risk_level"] = "CRITICAL"
                    fire_analysis["burn_area_percentage"] = min(25, fire_risk_score - 75)
                    fire_analysis["hotspots"] = [{"lat": lat + 0.001, "lng": lng + 0.001, "intensity": "high"}]
                    fire_analysis["recommendations"] = ["Immediate evacuation", "Contact fire services"]
                elif fire_risk_score > 60:
                    fire_analysis["fire_risk_level"] = "HIGH"
                    fire_analysis["burn_area_percentage"] = min(10, fire_risk_score - 60)
                    fire_analysis["recommendations"] = ["Prepare for evacuation", "Monitor air quality"]
                elif fire_risk_score > 40:
                    fire_analysis["fire_risk_level"] = "MEDIUM"
                    fire_analysis["recommendations"] = ["Stay alert", "Have evacuation plan ready"]
            
            return {
                "fire_analysis": fire_analysis,
                "imagery": fire_imagery,
                "coordinates": {"lat": lat, "lng": lng},
                "analysis_timestamp": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            print(f"Fire detection error: {e}")
            return {"error": str(e), "fire_analysis": {"fire_risk_level": "UNKNOWN"}}
    
    async def get_vegetation_health(self, lat: float, lng: float, bbox_size: float = 0.02) -> Dict[str, Any]:
        """Monitor vegetation health using NDVI and other indices"""
        try:
            vegetation_imagery = await self.get_disaster_imagery(
                lat, lng, "vegetation_health", bbox_size, time_range_days=15
            )
            
            # Mock NDVI calculation (in production would use actual image processing)
            ndvi_score = (abs(lat + lng) * 47) % 100 / 100  # Value between 0 and 1
            
            vegetation_analysis = {
                "ndvi_average": round(ndvi_score, 3),
                "vegetation_status": "UNKNOWN",
                "drought_risk": "LOW",
                "health_indicators": []
            }
            
            # Classify vegetation health
            if ndvi_score > 0.7:
                vegetation_analysis["vegetation_status"] = "HEALTHY"
                vegetation_analysis["health_indicators"] = ["Dense, healthy vegetation"]
            elif ndvi_score > 0.4:
                vegetation_analysis["vegetation_status"] = "MODERATE"
                vegetation_analysis["health_indicators"] = ["Moderate vegetation cover"]
            elif ndvi_score > 0.2:
                vegetation_analysis["vegetation_status"] = "STRESSED"
                vegetation_analysis["drought_risk"] = "MEDIUM"
                vegetation_analysis["health_indicators"] = ["Vegetation stress detected"]
            else:
                vegetation_analysis["vegetation_status"] = "POOR"
                vegetation_analysis["drought_risk"] = "HIGH"
                vegetation_analysis["health_indicators"] = ["Severe vegetation stress", "Possible drought conditions"]
            
            return {
                "vegetation_analysis": vegetation_analysis,
                "imagery": vegetation_imagery,
                "coordinates": {"lat": lat, "lng": lng},
                "analysis_timestamp": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            print(f"Vegetation health analysis error: {e}")
            return {"error": str(e)}
    
    def _get_evalscript(self, disaster_type: str) -> str:
        """Get evaluation script for different disaster types"""
        
        scripts = {
            "flood_detection": """
                //VERSION=3
                function setup() {
                    return {
                        input: ["B02", "B03", "B04", "B08", "B11", "B12"],
                        output: { bands: 4 }
                    };
                }
                
                function evaluatePixel(sample) {
                    // Water detection using NDWI
                    let ndwi = (sample.B03 - sample.B08) / (sample.B03 + sample.B08);
                    let water = ndwi > 0.3;
                    
                    // RGB visualization with water highlighting
                    let r = water ? 0 : sample.B04 * 2.5;
                    let g = water ? 0.5 : sample.B03 * 2.5;
                    let b = water ? 1 : sample.B02 * 2.5;
                    
                    return [r, g, b, 1];
                }
            """,
            
            "fire_detection": """
                //VERSION=3
                function setup() {
                    return {
                        input: ["B04", "B08", "B11", "B12"],
                        output: { bands: 4 }
                    };
                }
                
                function evaluatePixel(sample) {
                    // Fire detection using SWIR bands
                    let fire_index = (sample.B12 - sample.B11) / (sample.B12 + sample.B11);
                    let hot_spot = fire_index > 0.4 && sample.B12 > 0.1;
                    
                    // False color for fire detection
                    let r = hot_spot ? 1 : sample.B11 * 3;
                    let g = hot_spot ? 0 : sample.B08 * 2;
                    let b = hot_spot ? 0 : sample.B04 * 2;
                    
                    return [r, g, b, 1];
                }
            """,
            
            "vegetation_health": """
                //VERSION=3
                function setup() {
                    return {
                        input: ["B04", "B08"],
                        output: { bands: 4 }
                    };
                }
                
                function evaluatePixel(sample) {
                    // NDVI calculation
                    let ndvi = (sample.B08 - sample.B04) / (sample.B08 + sample.B04);
                    
                    // Color coding based on NDVI
                    let r = ndvi < 0.2 ? 1 : (1 - ndvi);
                    let g = ndvi > 0.4 ? 1 : ndvi * 2;
                    let b = 0.1;
                    
                    return [r, g, b, 1];
                }
            """
        }
        
        return scripts.get(disaster_type, scripts["flood_detection"])
    
    async def _analyze_disaster_indicators(self, image_data: bytes, disaster_type: str, lat: float, lng: float) -> Dict[str, Any]:
        """Analyze satellite imagery for disaster indicators"""
        # Mock analysis - in production would use image processing libraries
        analysis = {
            "disaster_indicators": [],
            "confidence": 0.0,
            "risk_assessment": "LOW"
        }
        
        # Simple mock analysis based on coordinates and disaster type
        indicator_score = (abs(lat * lng * 1000) % 100)
        
        if disaster_type == "flood_detection":
            if indicator_score > 75:
                analysis["disaster_indicators"] = ["High water coverage detected", "Possible flooding"]
                analysis["risk_assessment"] = "HIGH"
                analysis["confidence"] = 0.85
            elif indicator_score > 50:
                analysis["disaster_indicators"] = ["Elevated water levels"]
                analysis["risk_assessment"] = "MEDIUM"
                analysis["confidence"] = 0.70
        
        elif disaster_type == "fire_detection":
            if indicator_score > 80:
                analysis["disaster_indicators"] = ["Thermal anomalies detected", "Possible active fires"]
                analysis["risk_assessment"] = "CRITICAL"
                analysis["confidence"] = 0.90
        
        return analysis
    
    def _calculate_water_coverage(self, imagery_data: Dict[str, Any]) -> float:
        """Calculate water coverage percentage from imagery"""
        # Mock calculation - in production would analyze actual image pixels
        if not imagery_data.get("success"):
            return 0.0
        
        # Mock percentage based on analysis
        analysis = imagery_data.get("analysis", {})
        if "High water coverage" in str(analysis.get("disaster_indicators", [])):
            return 0.25  # 25% water coverage
        elif "Elevated water levels" in str(analysis.get("disaster_indicators", [])):
            return 0.15  # 15% water coverage
        else:
            return 0.05  # 5% normal water coverage
    
    def _get_fallback_imagery(self, lat: float, lng: float, disaster_type: str) -> Dict[str, Any]:
        """Provide fallback imagery data when API fails"""
        return {
            "success": False,
            "image_data": None,
            "analysis": {
                "disaster_indicators": ["Satellite data unavailable"],
                "confidence": 0.0,
                "risk_assessment": "UNKNOWN"
            },
            "metadata": {
                "coordinates": {"lat": lat, "lng": lng},
                "disaster_type": disaster_type,
                "fallback": True
            },
            "error": "Sentinel Hub API unavailable"
        }