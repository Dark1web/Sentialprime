import os
from typing import Dict, Any

# API Configuration
API_KEYS = {
    "NEWS_API": "77bc81dfd0564f93a3fe8f7f32f6c1fa",
    "GNEWS_API": "2764ac6fca05b28399e688c5322b7d9b", 
    "HUGGINGFACE_API": "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",
    "OPENWEATHER_API": "your_openweather_api_key_here",  # User needs to add their key
    "SENTINEL_HUB_API": "PLAK9b59e81ed56a4f3d8a1493c11be2145c"
}

# API Endpoints
API_ENDPOINTS = {
    "NEWS_API": "https://newsapi.org/v2",
    "GNEWS_API": "https://gnews.io/api/v4", 
    "GOOGLE_NEWS_RSS": "https://news.google.com/rss/search",
    "OPENWEATHER_API": "https://api.openweathermap.org/data/2.5",
    "HUGGINGFACE_API": "https://router.huggingface.co/hf-inference/models",
    "SENTINEL_HUB_API": "https://services.sentinel-hub.com/api/v1"
}

# HuggingFace Models
HUGGINGFACE_MODELS = {
    "MISINFORMATION": "google-bert/bert-base-uncased",
    "EMOTION": "j-hartmann/emotion-english-distilroberta-base"
}

# News search keywords for disaster monitoring
DISASTER_KEYWORDS = [
    "flood", "flooding", "dam burst", "hurricane", "cyclone", "earthquake", 
    "tsunami", "landslide", "wildfire", "heatwave", "emergency", "evacuation",
    "disaster", "alert", "warning", "rescue", "emergency response"
]

def get_api_key(service: str) -> str:
    """Get API key for a service"""
    return API_KEYS.get(service, "")

def get_endpoint(service: str) -> str:
    """Get API endpoint for a service"""
    return API_ENDPOINTS.get(service, "")

def get_model(model_type: str) -> str:
    """Get HuggingFace model name"""
    return HUGGINGFACE_MODELS.get(model_type, "")