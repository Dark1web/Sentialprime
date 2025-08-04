from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from typing import List, Optional
import asyncio
from datetime import datetime

router = APIRouter()

class SocialMediaPost(BaseModel):
    text: str
    source: Optional[str] = "unknown"
    timestamp: Optional[datetime] = None
    author: Optional[str] = None
    location: Optional[str] = None

class MisinformationAnalysis(BaseModel):
    post_text: str
    is_fake: bool
    panic_score: float
    confidence: float
    emotion_breakdown: dict
    model_explanation: str
    risk_level: str
    flagged_keywords: List[str]

class BatchAnalysisRequest(BaseModel):
    posts: List[SocialMediaPost]

@router.post("/analyze", response_model=MisinformationAnalysis)
async def analyze_misinformation(post: SocialMediaPost, request: Request):
    """
    Analyze a social media post for misinformation and panic scoring.
    
    Returns:
    - is_fake: Boolean indicating if content is likely misinformation
    - panic_score: Float (0-1) indicating panic/fear level
    - confidence: Model confidence in the prediction
    - emotion_breakdown: Dictionary of detected emotions
    """
    try:
        # Get ML model from app state
        ml_models = request.app.state.ml_models
        misinformation_model = ml_models.get("misinformation")
        
        if not misinformation_model:
            raise HTTPException(status_code=503, detail="Misinformation model not available")
        
        # Analyze the post
        analysis = await misinformation_model.analyze_post(post.text)
        
        return MisinformationAnalysis(
            post_text=post.text,
            is_fake=analysis["is_fake"],
            panic_score=analysis["panic_score"],
            confidence=analysis["confidence"],
            emotion_breakdown=analysis["emotions"],
            model_explanation=analysis["explanation"],
            risk_level=analysis["risk_level"],
            flagged_keywords=analysis["flagged_keywords"]
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@router.post("/batch-analyze")
async def batch_analyze_misinformation(batch_request: BatchAnalysisRequest, request: Request):
    """
    Analyze multiple posts for misinformation in batch.
    """
    try:
        ml_models = request.app.state.ml_models
        misinformation_model = ml_models.get("misinformation")
        
        if not misinformation_model:
            raise HTTPException(status_code=503, detail="Misinformation model not available")
        
        # Process posts in batch
        results = []
        for post in batch_request.posts:
            analysis = await misinformation_model.analyze_post(post.text)
            results.append(MisinformationAnalysis(
                post_text=post.text,
                is_fake=analysis["is_fake"],
                panic_score=analysis["panic_score"],
                confidence=analysis["confidence"],
                emotion_breakdown=analysis["emotions"],
                model_explanation=analysis["explanation"],
                risk_level=analysis["risk_level"],
                flagged_keywords=analysis["flagged_keywords"]
            ))
        
        return {
            "analyses": results,
            "summary": {
                "total_posts": len(results),
                "fake_posts": sum(1 for r in results if r.is_fake),
                "high_panic_posts": sum(1 for r in results if r.panic_score > 0.7),
                "average_panic_score": sum(r.panic_score for r in results) / len(results)
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Batch analysis failed: {str(e)}")

@router.get("/feed")
async def get_misinformation_feed(request: Request, limit: int = 50, risk_level: Optional[str] = None):
    """
    Get recent flagged misinformation posts.
    """
    try:
        # This would connect to a database in a real implementation
        # For demo purposes, return sample data
        sample_feed = [
            {
                "id": 1,
                "text": "BREAKING: Dam burst in Jaipur! Evacuate immediately! 🚨",
                "is_fake": True,
                "panic_score": 0.95,
                "confidence": 0.87,
                "timestamp": "2024-01-15T10:30:00Z",
                "source": "twitter",
                "risk_level": "HIGH"
            },
            {
                "id": 2,
                "text": "Heat wave temperatures reaching 50°C in Delhi, stay hydrated",
                "is_fake": False,
                "panic_score": 0.3,
                "confidence": 0.92,
                "timestamp": "2024-01-15T09:15:00Z",
                "source": "news",
                "risk_level": "LOW"
            }
        ]
        
        # Filter by risk level if specified
        if risk_level:
            sample_feed = [post for post in sample_feed if post["risk_level"] == risk_level.upper()]
        
        return {
            "posts": sample_feed[:limit],
            "total": len(sample_feed),
            "filters": {"risk_level": risk_level}
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get feed: {str(e)}")

@router.get("/statistics")
async def get_misinformation_statistics(request: Request):
    """
    Get misinformation detection statistics.
    """
    try:
        # Return sample statistics - would be from database in real implementation
        return {
            "last_24_hours": {
                "total_analyzed": 1247,
                "fake_detected": 89,
                "high_panic": 23,
                "accuracy_rate": 0.94
            },
            "top_flagged_keywords": [
                {"keyword": "dam burst", "count": 15, "panic_score": 0.92},
                {"keyword": "evacuate immediately", "count": 12, "panic_score": 0.88},
                {"keyword": "breaking news", "count": 28, "panic_score": 0.65}
            ],
            "emotion_distribution": {
                "fear": 0.35,
                "anger": 0.22,
                "urgency": 0.18,
                "neutral": 0.25
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get statistics: {str(e)}")