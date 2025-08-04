from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
import asyncio

router = APIRouter()

class FactCheckRequest(BaseModel):
    claim: str = Field(..., description="The disaster-related claim to fact-check")
    context: Optional[str] = Field(None, description="Additional context or source")
    location: Optional[str] = Field(None, description="Location reference in claim")
    urgency: Optional[str] = Field("normal", description="Urgency level: low, normal, high")

class FactCheckResult(BaseModel):
    verdict: str = Field(..., description="Verdict: True, False, Partially True, Unverified")
    confidence: float = Field(..., ge=0, le=1, description="Confidence score 0-1")
    related_articles: List[Dict[str, Any]] = Field(..., description="Supporting/contradicting sources")
    model_explanation: str = Field(..., description="Detailed explanation of the verdict")
    risk_assessment: str = Field(..., description="Risk level if claim is true")
    verification_sources: List[str] = Field(..., description="Sources used for verification")

class BatchFactCheckRequest(BaseModel):
    claims: List[FactCheckRequest]

@router.post("/", response_model=FactCheckResult)
async def fact_check_claim(request_data: FactCheckRequest, request: Request):
    """
    Fact-check a disaster-related claim using AI analysis and web verification.
    
    Returns:
    - verdict: Classification of claim truthfulness
    - confidence: Model confidence in the verdict
    - related_articles: Supporting or contradicting sources
    - model_explanation: Detailed reasoning
    """
    try:
        # Get ML model from app state
        ml_models = request.app.state.ml_models
        factcheck_model = ml_models.get("factcheck")
        
        if not factcheck_model:
            raise HTTPException(status_code=503, detail="Fact-check model not available")
        
        # Perform fact-checking
        result = await factcheck_model.verify_claim(
            claim=request_data.claim,
            context=request_data.context,
            location=request_data.location,
            urgency=request_data.urgency
        )
        
        return FactCheckResult(**result)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Fact-check failed: {str(e)}")

@router.post("/batch")
async def batch_fact_check(batch_request: BatchFactCheckRequest, request: Request):
    """
    Fact-check multiple claims in batch.
    """
    try:
        ml_models = request.app.state.ml_models
        factcheck_model = ml_models.get("factcheck")
        
        if not factcheck_model:
            raise HTTPException(status_code=503, detail="Fact-check model not available")
        
        results = []
        for claim_request in batch_request.claims:
            result = await factcheck_model.verify_claim(
                claim=claim_request.claim,
                context=claim_request.context,
                location=claim_request.location,
                urgency=claim_request.urgency
            )
            results.append(FactCheckResult(**result))
        
        # Generate batch summary
        verdicts = [r.verdict for r in results]
        summary = {
            "total_claims": len(results),
            "verdict_breakdown": {
                "true": verdicts.count("True"),
                "false": verdicts.count("False"),
                "partially_true": verdicts.count("Partially True"),
                "unverified": verdicts.count("Unverified")
            },
            "average_confidence": sum(r.confidence for r in results) / len(results),
            "high_risk_claims": sum(1 for r in results if r.risk_assessment in ["HIGH", "CRITICAL"])
        }
        
        return {
            "results": results,
            "summary": summary
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Batch fact-check failed: {str(e)}")

@router.get("/trending")
async def get_trending_claims(request: Request, limit: int = 20, verified_only: bool = False):
    """
    Get trending disaster-related claims being fact-checked.
    """
    try:
        # Sample trending claims (would be from database in production)
        trending_claims = [
            {
                "id": 1,
                "claim": "Dam burst in Rajasthan causing massive flooding",
                "verdict": "False",
                "confidence": 0.89,
                "check_count": 247,
                "last_checked": "2024-01-15T11:30:00Z",
                "risk_level": "HIGH",
                "location": "Rajasthan, India"
            },
            {
                "id": 2,
                "claim": "Heatwave temperatures reaching 52°C in Delhi",
                "verdict": "Partially True",
                "confidence": 0.76,
                "check_count": 156,
                "last_checked": "2024-01-15T10:45:00Z",
                "risk_level": "MEDIUM",
                "location": "Delhi, India"
            },
            {
                "id": 3,
                "claim": "Emergency evacuation ordered for coastal areas due to cyclone",
                "verdict": "True",
                "confidence": 0.94,
                "check_count": 89,
                "last_checked": "2024-01-15T09:15:00Z",
                "risk_level": "CRITICAL",
                "location": "Coastal Andhra Pradesh"
            }
        ]
        
        # Filter verified claims if requested
        if verified_only:
            trending_claims = [c for c in trending_claims if c["verdict"] != "Unverified"]
        
        return {
            "trending_claims": trending_claims[:limit],
            "total": len(trending_claims),
            "filters": {"verified_only": verified_only}
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get trending claims: {str(e)}")

@router.get("/sources")
async def get_verification_sources(request: Request):
    """
    Get list of trusted sources used for fact verification.
    """
    try:
        sources = {
            "government": [
                {
                    "name": "India Meteorological Department",
                    "url": "https://mausam.imd.gov.in/",
                    "reliability": 0.95,
                    "categories": ["weather", "climate", "warnings"]
                },
                {
                    "name": "National Disaster Management Authority",
                    "url": "https://ndma.gov.in/",
                    "reliability": 0.92,
                    "categories": ["disasters", "warnings", "guidelines"]
                }
            ],
            "news_agencies": [
                {
                    "name": "Press Trust of India",
                    "url": "https://ptinews.com/",
                    "reliability": 0.88,
                    "categories": ["breaking_news", "disasters", "general"]
                },
                {
                    "name": "ANI",
                    "url": "https://www.aninews.in/",
                    "reliability": 0.85,
                    "categories": ["breaking_news", "live_updates"]
                }
            ],
            "research": [
                {
                    "name": "Indian Institute of Science",
                    "url": "https://iisc.ac.in/",
                    "reliability": 0.93,
                    "categories": ["climate_research", "environmental"]
                }
            ],
            "international": [
                {
                    "name": "NASA Earth Observatory",
                    "url": "https://earthobservatory.nasa.gov/",
                    "reliability": 0.96,
                    "categories": ["satellite", "natural_disasters", "climate"]
                }
            ]
        }
        
        return {
            "sources": sources,
            "total_sources": sum(len(sources[category]) for category in sources),
            "average_reliability": 0.91,
            "last_updated": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get sources: {str(e)}")

@router.get("/statistics")
async def get_factcheck_statistics(request: Request):
    """
    Get fact-checking statistics and performance metrics.
    """
    try:
        return {
            "last_24_hours": {
                "claims_checked": 1847,
                "false_claims": 267,
                "unverified_claims": 156,
                "average_confidence": 0.84
            },
            "verdict_distribution": {
                "True": 42.3,
                "False": 23.8,
                "Partially True": 19.2,
                "Unverified": 14.7
            },
            "risk_assessment": {
                "CRITICAL": 8,
                "HIGH": 34,
                "MEDIUM": 123,
                "LOW": 289
            },
            "top_claim_categories": [
                {"category": "flooding", "count": 89, "false_rate": 0.31},
                {"category": "heatwave", "count": 67, "false_rate": 0.18},
                {"category": "earthquake", "count": 45, "false_rate": 0.42}
            ],
            "verification_speed": {
                "average_time": "3.2 minutes",
                "fastest": "45 seconds",
                "median": "2.8 minutes"
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get statistics: {str(e)}")

@router.post("/report-claim")
async def report_suspicious_claim(request_data: FactCheckRequest, request: Request):
    """
    Report a suspicious claim for community fact-checking.
    """
    try:
        # In production, this would add to a moderation queue
        report_id = f"report_{int(datetime.now().timestamp())}"
        
        return {
            "message": "Claim reported successfully for community review",
            "report_id": report_id,
            "estimated_review_time": "15-30 minutes",
            "claim_summary": {
                "text": request_data.claim[:100] + "..." if len(request_data.claim) > 100 else request_data.claim,
                "location": request_data.location,
                "urgency": request_data.urgency
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to report claim: {str(e)}")