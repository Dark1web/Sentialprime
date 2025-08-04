"""Mock services for testing and development"""
import asyncio
from typing import List, Dict, Any
from datetime import datetime

class MockMisinformationDetector:
    """Mock misinformation detector"""
    
    def analyze(self, text: str) -> Dict[str, Any]:
        # Mock analysis based on keywords
        fake_indicators = ["BREAKING", "URGENT", "Share immediately", "Dam burst"]
        is_fake = any(indicator.lower() in text.lower() for indicator in fake_indicators)
        
        return {
            "is_fake": is_fake,
            "confidence": 0.85 if is_fake else 0.75,
            "panic_score": 0.9 if is_fake else 0.3,
            "reasoning": "Mock analysis based on keywords"
        }

class MockTriageClassifier:
    """Mock triage classifier"""
    
    def classify(self, text: str) -> Dict[str, Any]:
        # Mock classification based on urgency keywords
        high_urgency = ["dying", "drowning", "trapped", "emergency", "help"]
        urgency = "HIGH" if any(word in text.lower() for word in high_urgency) else "MEDIUM"
        
        return {
            "urgency_score": 0.9 if urgency == "HIGH" else 0.5,
            "triage_level": urgency,
            "resource_required": "Emergency Response" if urgency == "HIGH" else "Standard Support",
            "estimated_response_time": "5 minutes" if urgency == "HIGH" else "30 minutes"
        }

class MockFactCheckEngine:
    """Mock fact check engine"""
    
    def check_fact(self, claim: str) -> Dict[str, Any]:
        return {
            "is_factual": True,
            "confidence": 0.7,
            "sources": ["Mock Source 1", "Mock Source 2"],
            "explanation": "Mock fact check result"
        }

class MockNewsService:
    """Mock news service"""
    
    async def fetch_disaster_news(self, limit: int = 50) -> List[Dict[str, Any]]:
        # Return mock news articles
        mock_articles = [
            {
                "title": "Heavy Rainfall Causes Flooding in Mumbai",
                "description": "Mumbai experiences severe flooding due to heavy monsoon rains",
                "url": "https://example.com/news1",
                "source": "Mock News",
                "published_at": datetime.utcnow().isoformat(),
                "api_source": "mock"
            },
            {
                "title": "Earthquake Alert: 5.2 Magnitude Tremor Hits Delhi",
                "description": "Mild earthquake felt across Delhi NCR region",
                "url": "https://example.com/news2", 
                "source": "Mock News",
                "published_at": datetime.utcnow().isoformat(),
                "api_source": "mock"
            }
        ]
        return mock_articles[:limit]
    
    async def search_news_by_location(self, location: str, keywords: List[str] = None, limit: int = 10) -> List[Dict[str, Any]]:
        mock_articles = [
            {
                "title": f"Weather Alert for {location}",
                "description": f"Current weather conditions in {location}",
                "url": "https://example.com/weather",
                "source": "Mock Weather",
                "published_at": datetime.utcnow().isoformat(),
                "api_source": "mock"
            }
        ]
        return mock_articles[:limit]

class MockWeatherService:
    """Mock weather service"""
    
    async def get_current_weather(self, lat: float, lon: float) -> Dict[str, Any]:
        return {
            "temperature": 28.5,
            "humidity": 65,
            "description": "Partly cloudy",
            "wind_speed": 5.2,
            "coordinates": {"lat": lat, "lon": lon}
        }
    
    async def get_weather_alerts(self, lat: float, lon: float) -> List[Dict[str, Any]]:
        return [
            {
                "alert_type": "Heat Wave Warning",
                "severity": "MODERATE",
                "description": "High temperatures expected",
                "valid_until": datetime.utcnow().isoformat()
            }
        ]
    
    async def check_extreme_weather(self, lat: float, lon: float) -> Dict[str, Any]:
        return {
            "risk_level": "LOW",
            "conditions": ["Normal weather conditions"],
            "recommendations": ["Stay hydrated"]
        }

class MockSentinelHubService:
    """Mock Sentinel Hub service"""
    
    async def get_disaster_imagery(self, lat: float, lng: float, disaster_type: str, bbox_size: float, time_range_days: int) -> Dict[str, Any]:
        return {
            "imagery_url": "https://example.com/satellite_image.jpg",
            "analysis": f"Mock {disaster_type} analysis",
            "coordinates": {"lat": lat, "lng": lng},
            "timestamp": datetime.utcnow().isoformat()
        }
    
    async def get_flood_risk_analysis(self, lat: float, lng: float) -> Dict[str, Any]:
        return {
            "flood_analysis": {
                "flood_risk_level": "LOW",
                "water_level": "Normal",
                "risk_factors": ["No immediate flood risk detected"]
            }
        }
    
    async def get_fire_detection(self, lat: float, lng: float) -> Dict[str, Any]:
        return {
            "fire_analysis": {
                "fire_risk_level": "LOW", 
                "hotspots": 0,
                "risk_factors": ["No fire activity detected"]
            }
        }
    
    async def get_vegetation_health(self, lat: float, lng: float) -> Dict[str, Any]:
        return {
            "vegetation_health": {
                "ndvi_score": 0.7,
                "health_status": "Good",
                "stress_indicators": []
            }
        }

class MockGeminiService:
    """Mock Gemini AI service"""
    
    async def filter_disaster_news(self, articles: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        # Mock filtering - just return the articles
        return articles
    
    async def analyze_weather_forecast(self, weather_data: Dict[str, Any]) -> Dict[str, Any]:
        # Mock weather analysis
        weather_data["ai_analysis"] = {
            "risk_assessment": "Low risk conditions",
            "recommendations": ["Normal precautions advised"]
        }
        return weather_data

def initialize_mock_services():
    """Initialize all mock services"""
    return {
        "misinformation": MockMisinformationDetector(),
        "triage": MockTriageClassifier(), 
        "factcheck": MockFactCheckEngine(),
        "news": MockNewsService(),
        "weather": MockWeatherService(),
        "sentinel": MockSentinelHubService(),
        "gemini": MockGeminiService()
    }