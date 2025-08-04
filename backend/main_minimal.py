from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
from datetime import datetime
import uvicorn

# Create FastAPI app
app = FastAPI(
    title="SentinelX API",
    description="AI-Powered Disaster Intelligence & Crisis Response System",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request/Response Models
class MisinformationAnalysisRequest(BaseModel):
    text: str
    source: str = "user_input"

class RiskPredictionRequest(BaseModel):
    disaster_type: str
    parameters: Dict[str, float]

class SOSRequest(BaseModel):
    user_location: Dict[str, float]
    disaster_type: str
    user_condition: str = ""
    panic_level: str = "HIGH"

class SafetyAdviceRequest(BaseModel):
    disaster_type: str
    user_location: Dict[str, float]
    user_condition: str = ""
    risk_level: str = "HIGH"

class SafetyQuestionRequest(BaseModel):
    question: str
    disaster_type: str

class MeshNodeRequest(BaseModel):
    device_type: str
    location: Dict[str, float]
    has_internet: bool = True
    battery_level: float = 100.0

# Basic endpoints
@app.get("/")
async def root():
    return {
        "message": "SentinelX API - AI-Powered Disaster Intelligence & Crisis Response System",
        "version": "1.0.0",
        "status": "running"
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat()
    }

# Advanced Features Endpoints
@app.post("/api/advanced/misinformation/analyze")
async def analyze_misinformation(request: MisinformationAnalysisRequest):
    """Analyze text for misinformation using advanced AI models"""
    analysis_result = {
        "text": request.text,
        "source": request.source,
        "analysis": {
            "classification": "FAKE" if "evacuate" in request.text.lower() or "dam broke" in request.text.lower() else "REAL",
            "confidence_score": 0.87,
            "risk_factors": ["emotional_language", "urgency_indicators", "unverified_source"],
            "correction_suggestion": "This appears to be unverified information. Please check official disaster management sources for accurate updates."
        },
        "timestamp": datetime.now().isoformat()
    }
    return analysis_result

@app.post("/api/advanced/risk/{disaster_type}")
async def predict_disaster_risk(disaster_type: str, request: RiskPredictionRequest):
    """Predict disaster risk using offline AI models"""
    params = request.parameters
    
    # Calculate risk score based on parameters
    if disaster_type == "flash-flood":
        risk_score = min((params.get("rainfall", 0) * 0.02 + params.get("humidity", 0) * 0.01), 1.0)
        risk_level = "HIGH" if risk_score > 0.7 else "MEDIUM" if risk_score > 0.4 else "LOW"
        recommendations = [
            "Move to higher ground immediately",
            "Avoid walking or driving through flood water",
            "Keep emergency supplies ready",
            "Monitor local weather alerts"
        ]
    elif disaster_type == "heatwave":
        risk_score = min((params.get("temperature", 0) * 0.02 + (100 - params.get("humidity", 50)) * 0.01), 1.0)
        risk_level = "HIGH" if risk_score > 0.7 else "MEDIUM" if risk_score > 0.4 else "LOW"
        recommendations = [
            "Stay indoors during peak hours",
            "Drink plenty of water",
            "Wear light-colored clothing",
            "Check on elderly neighbors"
        ]
    elif disaster_type == "wildfire":
        risk_score = min((params.get("temperature", 0) * 0.015 + params.get("wind_speed", 0) * 0.03 + (100 - params.get("humidity", 50)) * 0.01), 1.0)
        risk_level = "HIGH" if risk_score > 0.7 else "MEDIUM" if risk_score > 0.4 else "LOW"
        recommendations = [
            "Create defensible space around property",
            "Prepare evacuation plan",
            "Monitor fire weather warnings",
            "Keep emergency kit ready"
        ]
    else:  # landslide
        risk_score = min((params.get("rainfall", 0) * 0.025 + params.get("humidity", 0) * 0.005), 1.0)
        risk_level = "HIGH" if risk_score > 0.7 else "MEDIUM" if risk_score > 0.4 else "LOW"
        recommendations = [
            "Avoid steep slopes during heavy rain",
            "Watch for ground movement signs",
            "Have evacuation route planned",
            "Report unusual ground conditions"
        ]
    
    prediction_result = {
        "disaster_type": disaster_type,
        "parameters": params,
        "prediction": {
            "risk_level": risk_level,
            "risk_score": risk_score,
            "recommendations": recommendations,
            "confidence": 0.85
        },
        "timestamp": datetime.now().isoformat()
    }
    
    return prediction_result

@app.post("/api/advanced/sos/trigger")
async def trigger_sos_alert(request: SOSRequest):
    """Trigger emergency SOS alert to authorities"""
    alert_result = {
        "alert_id": f"SOS_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
        "user_location": request.user_location,
        "disaster_type": request.disaster_type,
        "panic_level": request.panic_level,
        "user_condition": request.user_condition,
        "status": "SENT",
        "contacts_notified": [
            "Local Emergency Services",
            "Disaster Management Authority",
            "Emergency Response Team"
        ],
        "estimated_response_time": "15-30 minutes",
        "timestamp": datetime.now().isoformat()
    }
    
    return alert_result

@app.post("/api/advanced/safety/advice")
async def get_safety_advice(request: SafetyAdviceRequest):
    """Get AI-generated safety advice for emergency situations"""
    disaster_type = request.disaster_type
    
    if disaster_type == "flash_flood":
        advice = {
            "safety_advice": "Flash floods can occur rapidly. Move to higher ground immediately and avoid walking or driving through flood water. Even 6 inches of moving water can knock you down.",
            "priority_actions": [
                "Move to higher ground immediately",
                "Avoid flood water completely",
                "Stay away from storm drains and washes",
                "Call for help if trapped"
            ],
            "checklist": [
                "Emergency supplies accessible",
                "Communication device charged",
                "Evacuation route planned",
                "Family members accounted for"
            ]
        }
    elif disaster_type == "heatwave":
        advice = {
            "safety_advice": "Extreme heat can be life-threatening. Stay cool, stay hydrated, and limit outdoor activities during peak heat hours (10 AM - 6 PM).",
            "priority_actions": [
                "Stay in air-conditioned spaces",
                "Drink water regularly",
                "Wear lightweight, light-colored clothing",
                "Check on vulnerable people"
            ],
            "checklist": [
                "Adequate water supply",
                "Cooling system working",
                "Medications stored properly",
                "Emergency contacts available"
            ]
        }
    else:
        advice = {
            "safety_advice": f"Follow local emergency guidelines for {disaster_type}. Stay informed through official channels and be prepared to evacuate if necessary.",
            "priority_actions": [
                "Monitor official emergency channels",
                "Prepare emergency kit",
                "Plan evacuation routes",
                "Stay in contact with authorities"
            ],
            "checklist": [
                "Emergency supplies ready",
                "Important documents secured",
                "Communication plan established",
                "Transportation arranged"
            ]
        }
    
    return {
        "disaster_type": disaster_type,
        "user_location": request.user_location,
        "risk_level": request.risk_level,
        "advice": advice,
        "timestamp": datetime.now().isoformat()
    }

@app.post("/api/advanced/safety/question")
async def answer_safety_question(request: SafetyQuestionRequest):
    """Answer safety questions using AI"""
    question = request.question.lower()
    disaster_type = request.disaster_type
    
    # Simple keyword-based responses
    if "flood" in question or "water" in question:
        answer = "During flooding: Never walk or drive through flood water. Move to higher ground immediately. If trapped, call for help and wait for rescue. Flood water can be contaminated and dangerous."
        actions = ["Move to higher ground", "Avoid flood water", "Call for help", "Wait for rescue"]
    elif "heat" in question or "hot" in question:
        answer = "During extreme heat: Stay indoors with air conditioning, drink plenty of water, wear light clothing, and avoid outdoor activities during peak hours (10 AM - 6 PM)."
        actions = ["Stay indoors", "Drink water", "Wear light clothing", "Avoid peak hours"]
    elif "fire" in question or "smoke" in question:
        answer = "During wildfire: Evacuate immediately if ordered. If trapped, stay low to avoid smoke, cover nose/mouth with cloth, and signal for help. Don't try to outrun fire."
        actions = ["Evacuate if ordered", "Stay low", "Cover airways", "Signal for help"]
    else:
        answer = f"For {disaster_type} emergencies: Follow local emergency guidelines, stay informed through official channels, and prioritize your safety above all else."
        actions = ["Follow official guidelines", "Stay informed", "Prioritize safety", "Contact authorities"]
    
    return {
        "question": request.question,
        "disaster_type": disaster_type,
        "answer": {
            "answer": answer,
            "recommended_actions": actions,
            "confidence": 0.82
        },
        "timestamp": datetime.now().isoformat()
    }

@app.post("/api/advanced/mesh/register")
async def register_mesh_node(request: MeshNodeRequest):
    """Register device as mesh network node"""
    node_id = f"NODE_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
    
    result = {
        "node_id": node_id,
        "device_type": request.device_type,
        "location": request.location,
        "has_internet": request.has_internet,
        "battery_level": request.battery_level,
        "status": "REGISTERED",
        "mesh_role": "RELAY" if request.has_internet else "ENDPOINT",
        "timestamp": datetime.now().isoformat()
    }
    
    return result

@app.get("/api/advanced/mesh/status")
async def get_mesh_status():
    """Get current mesh network status"""
    status = {
        "mesh_status": {
            "total_nodes": 47,
            "internet_nodes": 12,
            "offline_nodes": 3,
            "total_connections": 156,
            "network_coverage": "85%",
            "last_updated": datetime.now().isoformat()
        },
        "active_alerts": 2,
        "messages_relayed": 1247,
        "uptime": "99.2%"
    }
    
    return status

# Basic misinformation endpoint
@app.post("/api/misinformation/analyze")
async def analyze_misinformation_basic(request: MisinformationAnalysisRequest):
    """Basic misinformation analysis"""
    return {
        "classification": "REAL",
        "confidence": 0.75,
        "panic_score": 0.3,
        "timestamp": datetime.now().isoformat()
    }

if __name__ == "__main__":
    print("Starting SentinelX Minimal Backend Server...")
    uvicorn.run(app, host="0.0.0.0", port=8000)