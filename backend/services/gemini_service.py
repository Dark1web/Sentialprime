import google.generativeai as genai
import requests
import json
from datetime import datetime, timedelta
from typing import List, Dict, Any
import logging

logger = logging.getLogger(__name__)

class GeminiAIService:
    def __init__(self, api_key: str):
        """Initialize Gemini AI service with API key"""
        self.api_key = api_key
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('gemini-pro')
        
    async def filter_disaster_news(self, news_articles: List[Dict]) -> List[Dict]:
        """Filter and validate news articles for disaster relevance using Gemini AI"""
        try:
            filtered_articles = []
            
            for article in news_articles:
                prompt = f"""
                Analyze this news article for disaster relevance and credibility:
                
                Title: {article.get('title', '')}
                Content: {article.get('description', '')}
                Source: {article.get('source', '')}
                
                Please provide a JSON response with:
                {{
                    "is_disaster_related": true/false,
                    "disaster_type": "flood/fire/earthquake/storm/cyclone/other",
                    "severity_level": "low/medium/high/critical",
                    "credibility_score": 0-100,
                    "location_mentioned": "extracted location or null",
                    "summary": "brief summary of the disaster event",
                    "key_points": ["key point 1", "key point 2"],
                    "misinformation_risk": "low/medium/high"
                }}
                """
                
                try:
                    response = self.model.generate_content(prompt)
                    analysis = json.loads(response.text)
                    
                    if analysis.get('is_disaster_related') and analysis.get('credibility_score', 0) > 60:
                        article['ai_analysis'] = analysis
                        filtered_articles.append(article)
                        
                except Exception as e:
                    logger.warning(f"Failed to analyze article: {e}")
                    continue
                    
            return filtered_articles
            
        except Exception as e:
            logger.error(f"Error filtering news with Gemini AI: {e}")
            return news_articles  # Return original if AI fails
    
    async def analyze_weather_forecast(self, weather_data: Dict) -> Dict:
        """Analyze weather data for disaster risk using Gemini AI"""
        try:
            prompt = f"""
            Analyze this weather forecast for potential disaster risks:
            
            Current Weather:
            - Temperature: {weather_data.get('temperature', 'N/A')}°C
            - Humidity: {weather_data.get('humidity', 'N/A')}%
            - Wind Speed: {weather_data.get('wind_speed', 'N/A')} km/h
            - Precipitation: {weather_data.get('precipitation', 'N/A')} mm
            - Pressure: {weather_data.get('pressure', 'N/A')} hPa
            - Conditions: {weather_data.get('conditions', 'N/A')}
            
            Forecast (next 5 days):
            {json.dumps(weather_data.get('forecast', []), indent=2)}
            
            Please provide a JSON response with:
            {{
                "disaster_risk_level": "low/medium/high/critical",
                "potential_disasters": ["flood", "storm", "heatwave"],
                "risk_analysis": "detailed analysis of weather patterns",
                "recommendations": ["recommendation 1", "recommendation 2"],
                "alert_level": "green/yellow/orange/red",
                "risk_factors": {{
                    "flood_risk": 0-100,
                    "storm_risk": 0-100,
                    "heat_risk": 0-100,
                    "wind_risk": 0-100
                }},
                "timeline": "when risks are highest",
                "confidence_level": 0-100
            }}
            """
            
            response = self.model.generate_content(prompt)
            analysis = json.loads(response.text)
            
            return {
                'original_data': weather_data,
                'ai_analysis': analysis,
                'analyzed_at': datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error analyzing weather with Gemini AI: {e}")
            return {
                'original_data': weather_data,
                'ai_analysis': {
                    'disaster_risk_level': 'low',
                    'potential_disasters': [],
                    'risk_analysis': 'Analysis unavailable',
                    'recommendations': ['Monitor weather conditions'],
                    'alert_level': 'green',
                    'risk_factors': {
                        'flood_risk': 0,
                        'storm_risk': 0,
                        'heat_risk': 0,
                        'wind_risk': 0
                    },
                    'timeline': 'unknown',
                    'confidence_level': 0
                },
                'analyzed_at': datetime.now().isoformat()
            }
    
    async def enhance_navigation_recommendations(self, route_data: Dict, current_conditions: Dict) -> Dict:
        """Enhance navigation recommendations using real-time conditions and AI analysis"""
        try:
            prompt = f"""
            Analyze this route and current conditions to provide safety recommendations:
            
            Route Information:
            - Start: {route_data.get('start_location', 'N/A')}
            - End: {route_data.get('end_location', 'N/A')}
            - Distance: {route_data.get('distance', 'N/A')}
            - Estimated Time: {route_data.get('duration', 'N/A')}
            
            Current Conditions:
            - Weather: {current_conditions.get('weather', {})}
            - Traffic: {current_conditions.get('traffic', 'N/A')}
            - Disaster Alerts: {current_conditions.get('active_alerts', [])}
            - Time of Day: {datetime.now().strftime('%H:%M')}
            
            Please provide a JSON response with:
            {{
                "safety_score": 0-100,
                "route_recommendations": ["recommendation 1", "recommendation 2"],
                "hazard_warnings": ["warning 1", "warning 2"],
                "alternative_routes": ["route option 1", "route option 2"],
                "optimal_departure_time": "recommended time",
                "safety_equipment": ["item 1", "item 2"],
                "emergency_contacts": ["contact 1", "contact 2"],
                "checkpoints": ["checkpoint 1", "checkpoint 2"]
            }}
            """
            
            response = self.model.generate_content(prompt)
            analysis = json.loads(response.text)
            
            return {
                'route_data': route_data,
                'enhanced_recommendations': analysis,
                'analysis_timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error enhancing navigation with Gemini AI: {e}")
            return route_data

# Create global instance
gemini_service = None

def initialize_gemini_service(api_key: str):
    """Initialize the global Gemini AI service"""
    global gemini_service
    try:
        gemini_service = GeminiAIService(api_key)
        logger.info("Gemini AI service initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize Gemini AI service: {e}")

def get_gemini_service() -> GeminiAIService:
    """Get the global Gemini AI service instance"""
    if gemini_service is None:
        raise RuntimeError("Gemini AI service not initialized")
    return gemini_service