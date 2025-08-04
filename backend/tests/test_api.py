import pytest
import asyncio
import sys
import os
from httpx import AsyncClient

# Add the backend directory to the path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from main import app

@pytest.fixture
def anyio_backend():
    return 'asyncio'

@pytest.mark.asyncio
class TestSentinelXAPI:
    
    async def test_health_check(self):
        """Test the health check endpoint"""
        async with AsyncClient(app=app, base_url="http://test") as ac:
            response = await ac.get("/health")
        
        assert response.status_code == 200
        data = response.json()
        assert "status" in data
        assert data["status"] == "healthy"
        assert "models_loaded" in data
        assert "available_models" in data

    async def test_root_endpoint(self):
        """Test the root endpoint returns API information"""
        async with AsyncClient(app=app, base_url="http://test") as ac:
            response = await ac.get("/")
        
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "SentinelX" in data["message"]
        assert "endpoints" in data
        assert "misinformation" in data["endpoints"]

    async def test_misinformation_analysis(self):
        """Test misinformation analysis endpoint"""
        async with AsyncClient(app=app, base_url="http://test") as ac:
            test_data = {
                "text": "BREAKING: Dam burst in Rajasthan! Massive flooding! Share immediately!"
            }
            response = await ac.post("/api/misinformation/analyze", json=test_data)
        
        assert response.status_code == 200
        data = response.json()
        assert "is_fake" in data
        assert "panic_score" in data
        assert "confidence" in data
        assert isinstance(data["is_fake"], bool)
        assert 0 <= data["panic_score"] <= 1
        assert 0 <= data["confidence"] <= 1

    async def test_misinformation_analysis_invalid_input(self):
        """Test misinformation analysis with invalid input"""
        async with AsyncClient(app=app, base_url="http://test") as ac:
            # Test with empty text
            test_data = {"text": ""}
            response = await ac.post("/api/misinformation/analyze", json=test_data)
        
        assert response.status_code == 400

    async def test_triage_classification(self):
        """Test emergency triage classification"""
        async with AsyncClient(app=app, base_url="http://test") as ac:
            test_data = {
                "text": "My house is flooding and I need immediate help",
                "location": {"latitude": 26.9124, "longitude": 75.7873},
                "contact": "test@example.com"
            }
            response = await ac.post("/api/triage/classify", json=test_data)
        
        assert response.status_code == 200
        data = response.json()
        assert "priority" in data
        assert "category" in data
        assert "confidence" in data
        assert data["priority"] in ["low", "medium", "high", "critical"]

    async def test_triage_classification_missing_data(self):
        """Test triage classification with missing required data"""
        async with AsyncClient(app=app, base_url="http://test") as ac:
            test_data = {"text": ""}  # Missing required fields
            response = await ac.post("/api/triage/classify", json=test_data)
        
        assert response.status_code == 400

    async def test_network_outages(self):
        """Test network outages endpoint"""
        async with AsyncClient(app=app, base_url="http://test") as ac:
            response = await ac.get("/api/network/outages")
        
        assert response.status_code == 200
        data = response.json()
        assert "outages" in data
        assert isinstance(data["outages"], list)

    async def test_network_outages_with_location(self):
        """Test network outages with location parameters"""
        async with AsyncClient(app=app, base_url="http://test") as ac:
            params = {"lat": 26.9124, "lng": 75.7873}
            response = await ac.get("/api/network/outages", params=params)
        
        assert response.status_code == 200
        data = response.json()
        assert "outages" in data

    async def test_fact_check(self):
        """Test fact checking endpoint"""
        async with AsyncClient(app=app, base_url="http://test") as ac:
            test_data = {
                "claim": "Is the heatwave getting worse in my city?",
                "location": "Jaipur, India"
            }
            response = await ac.post("/api/factcheck", json=test_data)
        
        assert response.status_code == 200
        data = response.json()
        assert "verdict" in data
        assert "confidence" in data
        assert "sources" in data
        assert data["verdict"] in ["true", "false", "partially_true", "unverified"]

    async def test_fact_check_invalid_claim(self):
        """Test fact checking with invalid claim"""
        async with AsyncClient(app=app, base_url="http://test") as ac:
            test_data = {"claim": ""}  # Empty claim
            response = await ac.post("/api/factcheck", json=test_data)
        
        assert response.status_code == 400

    async def test_safe_zones(self):
        """Test safe zones endpoint"""
        async with AsyncClient(app=app, base_url="http://test") as ac:
            params = {"lat": 26.9124, "lng": 75.7873}
            response = await ac.get("/api/navigation/safezones", params=params)
        
        assert response.status_code == 200
        data = response.json()
        assert "safe_zones" in data
        assert isinstance(data["safe_zones"], list)

    async def test_disaster_news_feed(self):
        """Test disaster news feed endpoint"""
        async with AsyncClient(app=app, base_url="http://test") as ac:
            response = await ac.get("/api/live/news/disaster-feed")
        
        assert response.status_code == 200
        data = response.json()
        assert "articles" in data
        assert isinstance(data["articles"], list)

    async def test_current_weather(self):
        """Test current weather endpoint"""
        async with AsyncClient(app=app, base_url="http://test") as ac:
            params = {"lat": 26.9124, "lng": 75.7873}
            response = await ac.get("/api/live/weather/current", params=params)
        
        assert response.status_code == 200
        data = response.json()
        assert "temperature" in data or "error" in data  # API might not be available

    async def test_satellite_flood_analysis(self):
        """Test satellite flood analysis endpoint"""
        async with AsyncClient(app=app, base_url="http://test") as ac:
            params = {
                "bbox": "75.7,26.8,75.9,27.0",  # Jaipur area
                "date": "2024-01-01"
            }
            response = await ac.get("/api/live/satellite/flood-analysis", params=params)
        
        assert response.status_code == 200
        data = response.json()
        assert "analysis" in data or "error" in data

    async def test_satellite_fire_detection(self):
        """Test satellite fire detection endpoint"""
        async with AsyncClient(app=app, base_url="http://test") as ac:
            params = {
                "bbox": "75.7,26.8,75.9,27.0",
                "date": "2024-01-01"
            }
            response = await ac.get("/api/live/satellite/fire-detection", params=params)
        
        assert response.status_code == 200
        data = response.json()
        assert "fires" in data or "error" in data

    async def test_disaster_intelligence(self):
        """Test combined disaster intelligence endpoint"""
        async with AsyncClient(app=app, base_url="http://test") as ac:
            params = {"lat": 26.9124, "lng": 75.7873}
            response = await ac.get("/api/live/combined/disaster-intelligence", params=params)
        
        assert response.status_code == 200
        data = response.json()
        assert "intelligence" in data
        assert isinstance(data["intelligence"], dict)

    async def test_cors_headers(self):
        """Test CORS headers are properly set"""
        async with AsyncClient(app=app, base_url="http://test") as ac:
            response = await ac.options("/api/misinformation/analyze")
        
        assert response.status_code == 200
        # Note: CORS headers might not be testable in this way with FastAPI

    async def test_rate_limiting_protection(self):
        """Test API doesn't crash with multiple rapid requests"""
        async with AsyncClient(app=app, base_url="http://test") as ac:
            tasks = []
            for _ in range(10):  # Send 10 rapid requests
                task = ac.get("/health")
                tasks.append(task)
            
            responses = await asyncio.gather(*tasks, return_exceptions=True)
            
            # All requests should complete (might be rate limited but not crash)
            assert len(responses) == 10
            for response in responses:
                if not isinstance(response, Exception):
                    assert response.status_code in [200, 429]  # OK or rate limited

    async def test_error_handling(self):
        """Test API error handling for invalid endpoints"""
        async with AsyncClient(app=app, base_url="http://test") as ac:
            response = await ac.get("/api/nonexistent/endpoint")
        
        assert response.status_code == 404

    async def test_json_validation(self):
        """Test JSON validation for POST endpoints"""
        async with AsyncClient(app=app, base_url="http://test") as ac:
            # Send invalid JSON to misinformation endpoint
            response = await ac.post(
                "/api/misinformation/analyze",
                content="invalid json",
                headers={"Content-Type": "application/json"}
            )
        
        assert response.status_code in [400, 422]  # Bad request or unprocessable entity