from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime
import base64
import json
import uuid
import os
from PIL import Image
from PIL.ExifTags import TAGS
import io

router = APIRouter()

# Pydantic models
class CommunityReport(BaseModel):
    text: str
    lat: float
    lng: float
    location_name: Optional[str] = None
    category: Optional[str] = "general"  # flood, fire, earthquake, medical, etc.

class ReportResponse(BaseModel):
    id: str
    text: str
    location: Dict[str, float]
    credibility_score: float
    credibility_level: str
    category: str
    timestamp: str
    image_url: Optional[str] = None

# Mock database - in production use MongoDB/PostgreSQL
reports_db = []

# Disaster keywords for emergency detection
EMERGENCY_KEYWORDS = {
    "fire": ["fire", "smoke", "burning", "flames", "aag", "dhuan"],
    "flood": ["flood", "water", "rain", "drowning", "baadh", "paani"],
    "earthquake": ["earthquake", "shaking", "tremor", "bhukamp"],
    "medical": ["injured", "help", "emergency", "hospital", "hurt", "madad"],
    "violence": ["violence", "riot", "attack", "fighting"]
}

def analyze_text_credibility(text: str) -> Dict[str, Any]:
    """
    AI-based text credibility analysis
    In production, use fine-tuned BERT/RoBERTa model
    """
    # Mock credibility analysis based on patterns
    suspicious_patterns = [
        "BREAKING", "URGENT", "SHARE IMMEDIATELY", "FAKE NEWS",
        "100% TRUE", "GOVERNMENT HIDING", "MEDIA WON'T SHOW"
    ]
    
    credible_patterns = [
        "witnessed", "saw", "happening now", "at location",
        "need help", "emergency", "please assist"
    ]
    
    text_upper = text.upper()
    
    # Calculate suspicion score
    suspicion_score = sum(1 for pattern in suspicious_patterns if pattern in text_upper)
    credible_score = sum(1 for pattern in credible_patterns if pattern.upper() in text_upper)
    
    # Basic length and coherence check
    if len(text) < 10:
        credibility = 0.3  # Too short
    elif len(text) > 500:
        credibility = 0.4  # Potentially spam
    else:
        credibility = 0.7  # Base credibility
    
    # Adjust based on patterns
    credibility -= (suspicion_score * 0.2)
    credibility += (credible_score * 0.1)
    credibility = max(0.0, min(1.0, credibility))  # Clamp between 0-1
    
    # Determine credibility level
    if credibility >= 0.8:
        level = "high"
    elif credibility >= 0.5:
        level = "medium"
    else:
        level = "low"
    
    return {
        "score": credibility,
        "level": level,
        "reasoning": f"Pattern analysis: {suspicion_score} suspicious, {credible_score} credible indicators"
    }

def detect_emergency_category(text: str) -> str:
    """Detect emergency category from text"""
    text_lower = text.lower()
    
    for category, keywords in EMERGENCY_KEYWORDS.items():
        if any(keyword in text_lower for keyword in keywords):
            return category
    
    return "general"

def extract_image_metadata(image_file: UploadFile) -> Dict[str, Any]:
    """Extract metadata from uploaded image including GPS if available"""
    try:
        image = Image.open(image_file.file)
        exifdata = image.getexif()
        
        metadata = {
            "width": image.width,
            "height": image.height,
            "format": image.format,
            "gps_location": None,
            "timestamp": None
        }
        
        # Extract EXIF data
        for tag_id in exifdata:
            tag = TAGS.get(tag_id, tag_id)
            data = exifdata.get(tag_id)
            
            if tag == "DateTime":
                metadata["timestamp"] = str(data)
            elif tag == "GPSInfo":
                # GPS coordinates extraction (simplified)
                metadata["gps_location"] = "GPS data found"
        
        return metadata
    except Exception as e:
        return {"error": f"Failed to extract metadata: {str(e)}"}

def save_image(image_file: UploadFile, report_id: str) -> str:
    """Save uploaded image and return URL"""
    try:
        # Create uploads directory if it doesn't exist
        upload_dir = "uploads/reports"
        os.makedirs(upload_dir, exist_ok=True)
        
        # Generate filename
        file_extension = image_file.filename.split('.')[-1] if '.' in image_file.filename else 'jpg'
        filename = f"{report_id}.{file_extension}"
        file_path = os.path.join(upload_dir, filename)
        
        # Save file
        with open(file_path, "wb") as buffer:
            content = image_file.file.read()
            buffer.write(content)
        
        return f"/uploads/reports/{filename}"
    except Exception as e:
        print(f"Error saving image: {e}")
        return None

@router.post("/submit", response_model=ReportResponse)
async def submit_community_report(
    text: str = Form(...),
    lat: float = Form(...),
    lng: float = Form(...),
    location_name: Optional[str] = Form(None),
    category: Optional[str] = Form("general"),
    image: Optional[UploadFile] = File(None)
):
    """Submit a new community report with optional image"""
    try:
        # Generate unique report ID
        report_id = str(uuid.uuid4())
        
        # Analyze text credibility
        credibility_analysis = analyze_text_credibility(text)
        
        # Detect emergency category if not provided
        if category == "general":
            detected_category = detect_emergency_category(text)
            category = detected_category
        
        # Process image if provided
        image_url = None
        image_metadata = None
        if image:
            image_metadata = extract_image_metadata(image)
            image_url = save_image(image, report_id)
        
        # Create report object
        report = {
            "id": report_id,
            "text": text,
            "location": {"lat": lat, "lng": lng},
            "location_name": location_name,
            "category": category,
            "credibility_score": credibility_analysis["score"],
            "credibility_level": credibility_analysis["level"],
            "credibility_reasoning": credibility_analysis["reasoning"],
            "image_url": image_url,
            "image_metadata": image_metadata,
            "timestamp": datetime.utcnow().isoformat(),
            "status": "pending_review" if credibility_analysis["level"] == "low" else "active"
        }
        
        # Store in mock database
        reports_db.append(report)
        
        # Check for emergency alert
        should_alert = (
            credibility_analysis["level"] in ["high", "medium"] and 
            category in ["fire", "flood", "earthquake", "medical"]
        )
        
        if should_alert:
            # In production, trigger emergency alert system
            print(f"🚨 EMERGENCY ALERT: {category.upper()} reported at {lat}, {lng}")
        
        return ReportResponse(
            id=report["id"],
            text=report["text"],
            location=report["location"],
            credibility_score=report["credibility_score"],
            credibility_level=report["credibility_level"],
            category=report["category"],
            timestamp=report["timestamp"],
            image_url=report["image_url"]
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to submit report: {str(e)}")

@router.get("/reports")
async def get_community_reports(
    lat: Optional[float] = None,
    lng: Optional[float] = None,
    radius_km: Optional[float] = 10.0,
    category: Optional[str] = None,
    min_credibility: Optional[float] = 0.5,
    limit: Optional[int] = 100
):
    """Get community reports with optional filtering"""
    try:
        filtered_reports = reports_db.copy()
        
        # Filter by credibility
        if min_credibility:
            filtered_reports = [r for r in filtered_reports if r["credibility_score"] >= min_credibility]
        
        # Filter by category
        if category:
            filtered_reports = [r for r in filtered_reports if r["category"] == category]
        
        # Filter by location (simplified - in production use proper geospatial queries)
        if lat and lng:
            def calculate_distance(lat1, lng1, lat2, lng2):
                # Simplified distance calculation
                return ((lat1 - lat2) ** 2 + (lng1 - lng2) ** 2) ** 0.5
            
            filtered_reports = [
                r for r in filtered_reports 
                if calculate_distance(lat, lng, r["location"]["lat"], r["location"]["lng"]) <= (radius_km * 0.01)
            ]
        
        # Limit results
        filtered_reports = filtered_reports[:limit]
        
        return {
            "reports": filtered_reports,
            "total": len(filtered_reports),
            "filters_applied": {
                "location": f"{lat}, {lng}" if lat and lng else None,
                "radius_km": radius_km if lat and lng else None,
                "category": category,
                "min_credibility": min_credibility
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch reports: {str(e)}")

@router.get("/reports/{report_id}")
async def get_report_details(report_id: str):
    """Get detailed information about a specific report"""
    try:
        report = next((r for r in reports_db if r["id"] == report_id), None)
        if not report:
            raise HTTPException(status_code=404, detail="Report not found")
        
        return report
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch report: {str(e)}")

@router.post("/reports/{report_id}/verify")
async def verify_report(report_id: str, verified: bool = True):
    """Mark a report as verified or unverified (admin function)"""
    try:
        report = next((r for r in reports_db if r["id"] == report_id), None)
        if not report:
            raise HTTPException(status_code=404, detail="Report not found")
        
        report["verified"] = verified
        report["verification_timestamp"] = datetime.utcnow().isoformat()
        
        return {"message": f"Report {'verified' if verified else 'marked as unverified'}", "report_id": report_id}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to verify report: {str(e)}")

@router.get("/stats")
async def get_reporting_stats():
    """Get statistics about community reports"""
    try:
        total_reports = len(reports_db)
        if total_reports == 0:
            return {"message": "No reports available"}
        
        # Calculate statistics
        credibility_stats = {}
        category_stats = {}
        
        for report in reports_db:
            # Credibility stats
            level = report["credibility_level"]
            credibility_stats[level] = credibility_stats.get(level, 0) + 1
            
            # Category stats
            category = report["category"]
            category_stats[category] = category_stats.get(category, 0) + 1
        
        return {
            "total_reports": total_reports,
            "credibility_distribution": credibility_stats,
            "category_distribution": category_stats,
            "last_updated": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate stats: {str(e)}")

@router.get("/heatmap")
async def get_reports_heatmap(category: Optional[str] = None):
    """Get heatmap data for visualization"""
    try:
        filtered_reports = reports_db.copy()
        
        if category:
            filtered_reports = [r for r in filtered_reports if r["category"] == category]
        
        # Only include reports with medium/high credibility for heatmap
        filtered_reports = [r for r in filtered_reports if r["credibility_score"] >= 0.5]
        
        heatmap_data = [
            {
                "lat": report["location"]["lat"],
                "lng": report["location"]["lng"],
                "intensity": report["credibility_score"],
                "category": report["category"]
            }
            for report in filtered_reports
        ]
        
        return {
            "heatmap_points": heatmap_data,
            "total_points": len(heatmap_data),
            "category_filter": category
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate heatmap: {str(e)}")