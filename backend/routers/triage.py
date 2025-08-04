from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum

router = APIRouter()

class UrgencyLevel(str, Enum):
    CRITICAL = "CRITICAL"
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"

class ResourceType(str, Enum):
    MEDICAL = "medical"
    RESCUE = "rescue"
    FOOD_WATER = "food_water"
    SHELTER = "shelter"
    TRANSPORTATION = "transportation"
    COMMUNICATION = "communication"

class HelplineRequest(BaseModel):
    message: str = Field(..., description="Free-text emergency message")
    location: Optional[str] = Field(None, description="Location information")
    phone: Optional[str] = Field(None, description="Contact phone number")
    name: Optional[str] = Field(None, description="Person's name")
    additional_info: Optional[str] = Field(None, description="Additional context")

class TriageResult(BaseModel):
    urgency_score: float = Field(..., ge=0, le=1, description="Urgency score from 0-1")
    triage_level: UrgencyLevel = Field(..., description="Overall urgency classification")
    resource_required: List[ResourceType] = Field(..., description="Required resources")
    estimated_response_time: str = Field(..., description="Estimated response time")
    keywords_detected: List[str] = Field(..., description="Key indicators found")
    location_parsed: Optional[str] = Field(None, description="Parsed location")
    medical_emergency: bool = Field(..., description="Whether this is a medical emergency")
    explanation: str = Field(..., description="Explanation of triage decision")

class BatchTriageRequest(BaseModel):
    requests: List[HelplineRequest]

@router.post("/classify", response_model=TriageResult)
async def classify_helpline_request(request_data: HelplineRequest, request: Request):
    """
    Classify and triage a helpline request based on urgency and resource needs.
    
    Returns:
    - urgency_score: Float (0-1) indicating urgency level
    - triage_level: Classification (CRITICAL/HIGH/MEDIUM/LOW)
    - resource_required: List of required resource types
    - estimated_response_time: Expected response time
    """
    try:
        # Get ML model from app state
        ml_models = request.app.state.ml_models
        triage_model = ml_models.get("triage")
        
        if not triage_model:
            raise HTTPException(status_code=503, detail="Triage model not available")
        
        # Classify the request
        result = await triage_model.classify_request(
            message=request_data.message,
            location=request_data.location,
            additional_info=request_data.additional_info
        )
        
        return TriageResult(**result)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Triage classification failed: {str(e)}")

@router.post("/batch-classify")
async def batch_classify_requests(batch_request: BatchTriageRequest, request: Request):
    """
    Classify multiple helpline requests in batch.
    """
    try:
        ml_models = request.app.state.ml_models
        triage_model = ml_models.get("triage")
        
        if not triage_model:
            raise HTTPException(status_code=503, detail="Triage model not available")
        
        results = []
        for req in batch_request.requests:
            result = await triage_model.classify_request(
                message=req.message,
                location=req.location,
                additional_info=req.additional_info
            )
            results.append(TriageResult(**result))
        
        # Generate batch summary
        summary = {
            "total_requests": len(results),
            "critical_count": sum(1 for r in results if r.triage_level == UrgencyLevel.CRITICAL),
            "high_count": sum(1 for r in results if r.triage_level == UrgencyLevel.HIGH),
            "medical_emergencies": sum(1 for r in results if r.medical_emergency),
            "average_urgency": sum(r.urgency_score for r in results) / len(results),
            "resource_breakdown": {}
        }
        
        # Count resource requirements
        all_resources = [resource for result in results for resource in result.resource_required]
        for resource in ResourceType:
            summary["resource_breakdown"][resource.value] = all_resources.count(resource)
        
        return {
            "results": results,
            "summary": summary
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Batch triage failed: {str(e)}")

@router.get("/queue")
async def get_triage_queue(
    request: Request,
    urgency_filter: Optional[UrgencyLevel] = None,
    limit: int = 50
):
    """
    Get the current triage queue of pending requests.
    """
    try:
        # Sample queue data (would be from database in real implementation)
        sample_queue = [
            {
                "id": 1,
                "message": "My house is flooding and I'm trapped on the second floor",
                "location": "Downtown District",
                "triage_level": "CRITICAL",
                "urgency_score": 0.95,
                "resource_required": ["rescue", "medical"],
                "timestamp": "2024-01-15T10:45:00Z",
                "status": "pending",
                "estimated_response": "5-10 minutes"
            },
            {
                "id": 2,
                "message": "Need food and water supplies for elderly neighbor",
                "location": "Suburb Area",
                "triage_level": "MEDIUM",
                "urgency_score": 0.4,
                "resource_required": ["food_water"],
                "timestamp": "2024-01-15T10:30:00Z",
                "status": "assigned",
                "estimated_response": "2-4 hours"
            },
            {
                "id": 3,
                "message": "Power outage affecting entire neighborhood",
                "location": "Industrial Zone",
                "triage_level": "LOW",
                "urgency_score": 0.2,
                "resource_required": ["communication"],
                "timestamp": "2024-01-15T09:15:00Z",
                "status": "pending",
                "estimated_response": "12-24 hours"
            }
        ]
        
        # Filter by urgency if specified
        if urgency_filter:
            sample_queue = [req for req in sample_queue if req["triage_level"] == urgency_filter.value]
        
        # Sort by urgency score (highest first)
        sample_queue.sort(key=lambda x: x["urgency_score"], reverse=True)
        
        return {
            "queue": sample_queue[:limit],
            "total": len(sample_queue),
            "filters": {"urgency_level": urgency_filter.value if urgency_filter else None}
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get queue: {str(e)}")

@router.get("/statistics")
async def get_triage_statistics(request: Request):
    """
    Get triage system statistics and performance metrics.
    """
    try:
        return {
            "last_24_hours": {
                "total_requests": 346,
                "critical_requests": 12,
                "average_response_time": "18 minutes",
                "completion_rate": 0.89
            },
            "urgency_distribution": {
                "CRITICAL": 3.5,
                "HIGH": 15.2,
                "MEDIUM": 45.8,
                "LOW": 35.5
            },
            "resource_demand": {
                "medical": 89,
                "rescue": 34,
                "food_water": 156,
                "shelter": 67,
                "transportation": 45,
                "communication": 23
            },
            "location_hotspots": [
                {"area": "Downtown District", "requests": 45, "avg_urgency": 0.72},
                {"area": "Riverside", "requests": 38, "avg_urgency": 0.68},
                {"area": "Industrial Zone", "requests": 29, "avg_urgency": 0.34}
            ]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get statistics: {str(e)}")

@router.post("/simulate")
async def simulate_request(request: Request):
    """
    Generate a simulated emergency request for testing purposes.
    """
    try:
        import random
        
        # Sample emergency scenarios
        scenarios = [
            {
                "message": "House is flooding rapidly, water level rising, need immediate evacuation",
                "location": "Riverside Area",
                "urgency": "CRITICAL"
            },
            {
                "message": "Elderly person having chest pain, can't reach hospital due to blocked roads",
                "location": "Suburb District",
                "urgency": "CRITICAL"
            },
            {
                "message": "Family of 4 without food for 2 days, local stores closed",
                "location": "Downtown",
                "urgency": "HIGH"
            },
            {
                "message": "Internet and phone lines down in entire neighborhood",
                "location": "Tech Park",
                "urgency": "MEDIUM"
            },
            {
                "message": "Minor injury from falling debris, need first aid supplies",
                "location": "Construction Zone",
                "urgency": "LOW"
            }
        ]
        
        scenario = random.choice(scenarios)
        
        # Create and classify the simulated request
        simulated_request = HelplineRequest(
            message=scenario["message"],
            location=scenario["location"],
            name=f"Simulation User {random.randint(1000, 9999)}",
            phone=f"+1-555-{random.randint(100, 999)}-{random.randint(1000, 9999)}"
        )
        
        # Use the existing classification endpoint
        return await classify_helpline_request(simulated_request, request)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Simulation failed: {str(e)}")