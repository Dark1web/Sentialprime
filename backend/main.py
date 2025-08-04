from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
from contextlib import asynccontextmanager

# Import routers
from routers import misinformation, triage, network, factcheck, navigation, live_data, advanced_features

# Global state for ML models
ml_models = {}

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Load ML models on startup
    print("Loading ML models...")
    from ml_models.misinformation_detector import MisinformationDetector
    from ml_models.triage_classifier import TriageClassifier
    from ml_models.factcheck_engine import FactCheckEngine
    from services.gemini_service import initialize_gemini_service
    
    ml_models["misinformation"] = MisinformationDetector()
    ml_models["triage"] = TriageClassifier()
    ml_models["factcheck"] = FactCheckEngine()
    
    # Initialize Gemini AI service
    gemini_api_key = "AIzaSyA6kNDO-hhfwmyOVrNaQ6sJ2WMinpul-D8"
    initialize_gemini_service(gemini_api_key)
    print("Gemini AI service initialized!")
    
    print("ML models loaded successfully!")
    yield
    # Cleanup
    ml_models.clear()

# Create FastAPI app with lifespan
app = FastAPI(
    title="SentinelX API",
    description="AI-Powered Disaster Intelligence & Crisis Response System",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(misinformation.router, prefix="/api/misinformation", tags=["misinformation"])
app.include_router(triage.router, prefix="/api/triage", tags=["triage"])
app.include_router(network.router, prefix="/api/network", tags=["network"])
app.include_router(factcheck.router, prefix="/api/factcheck", tags=["factcheck"])
app.include_router(navigation.router, prefix="/api/navigation", tags=["navigation"])
app.include_router(live_data.router, prefix="/api/live", tags=["live-data"])
app.include_router(advanced_features.router, prefix="/api/advanced", tags=["advanced-features"])

@app.get("/")
async def root():
    return {
        "message": "SentinelX API - AI-Powered Disaster Intelligence & Crisis Response System",
        "version": "1.0.0",
        "endpoints": {
            "misinformation": "/api/misinformation/analyze",
            "triage": "/api/triage/classify",
            "network": "/api/network/outages",
            "factcheck": "/api/factcheck",
            "navigation": "/api/navigation/safezones",
            "live_news": "/api/live/news/disaster-feed",
            "live_weather": "/api/live/weather/current",
            "satellite_imagery": "/api/live/satellite/disaster-imagery",
            "satellite_flood": "/api/live/satellite/flood-analysis",
            "satellite_fire": "/api/live/satellite/fire-detection",
            "satellite_vegetation": "/api/live/satellite/vegetation-health",
            "disaster_intelligence": "/api/live/combined/disaster-intelligence",
            "health_check": "/api/live/health-check"
        }
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "models_loaded": len(ml_models),
        "available_models": list(ml_models.keys())
    }

# Make ml_models available to routers
app.state.ml_models = ml_models

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)