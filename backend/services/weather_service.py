import aiohttp
from typing import Dict, Any, Optional
from config import get_api_key, get_endpoint

class WeatherService:
    """Service for OpenWeather API integration"""
    
    def __init__(self):
        self.api_key = get_api_key("OPENWEATHER_API") 
        self.api_url = get_endpoint("OPENWEATHER_API")
    
    async def get_current_weather(self, lat: float, lon: float) -> Dict[str, Any]:
        """Get current weather data for coordinates"""
        try:
            url = f"{self.api_url}/weather"
            params = {
                'lat': lat,
                'lon': lon,
                'appid': self.api_key,
                'units': 'metric'  # Celsius
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.get(url, params=params) as response:
                    if response.status == 200:
                        data = await response.json()
                        
                        return {
                            'temperature': data.get('main', {}).get('temp', 0),
                            'feels_like': data.get('main', {}).get('feels_like', 0),
                            'humidity': data.get('main', {}).get('humidity', 0),
                            'pressure': data.get('main', {}).get('pressure', 0),
                            'description': data.get('weather', [{}])[0].get('description', ''),
                            'wind_speed': data.get('wind', {}).get('speed', 0),
                            'wind_direction': data.get('wind', {}).get('deg', 0),
                            'visibility': data.get('visibility', 0),
                            'location': data.get('name', 'Unknown'),
                            'country': data.get('sys', {}).get('country', ''),
                            'coordinates': {'lat': lat, 'lon': lon}
                        }
                    else:
                        print(f"Weather API error: {response.status}")
                        return self._get_fallback_weather(lat, lon)
                        
        except Exception as e:
            print(f"Weather fetch error: {e}")
            return self._get_fallback_weather(lat, lon)
    
    async def get_weather_by_city(self, city: str, country_code: str = None) -> Dict[str, Any]:
        """Get weather data by city name"""
        try:
            url = f"{self.api_url}/weather"
            query = f"{city},{country_code}" if country_code else city
            params = {
                'q': query,
                'appid': self.api_key,
                'units': 'metric'
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.get(url, params=params) as response:
                    if response.status == 200:
                        data = await response.json()
                        
                        return {
                            'temperature': data.get('main', {}).get('temp', 0),
                            'feels_like': data.get('main', {}).get('feels_like', 0),
                            'humidity': data.get('main', {}).get('humidity', 0),
                            'pressure': data.get('main', {}).get('pressure', 0),
                            'description': data.get('weather', [{}])[0].get('description', ''),
                            'wind_speed': data.get('wind', {}).get('speed', 0),
                            'wind_direction': data.get('wind', {}).get('deg', 0),
                            'visibility': data.get('visibility', 0),
                            'location': data.get('name', city),
                            'country': data.get('sys', {}).get('country', ''),
                            'coordinates': {
                                'lat': data.get('coord', {}).get('lat', 0),
                                'lon': data.get('coord', {}).get('lon', 0)
                            }
                        }
                    else:
                        return self._get_fallback_weather_city(city)
                        
        except Exception as e:
            print(f"Weather city fetch error: {e}")
            return self._get_fallback_weather_city(city)
    
    async def get_weather_alerts(self, lat: float, lon: float) -> Dict[str, Any]:
        """Get weather alerts and warnings"""
        try:
            url = f"{self.api_url}/onecall"
            params = {
                'lat': lat,
                'lon': lon,
                'appid': self.api_key,
                'exclude': 'minutely,hourly,daily',  # Only get current + alerts
                'units': 'metric'
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.get(url, params=params) as response:
                    if response.status == 200:
                        data = await response.json()
                        
                        alerts = data.get('alerts', [])
                        processed_alerts = []
                        
                        for alert in alerts:
                            processed_alerts.append({
                                'event': alert.get('event', ''),
                                'description': alert.get('description', ''),
                                'start': alert.get('start', 0),
                                'end': alert.get('end', 0),
                                'sender_name': alert.get('sender_name', ''),
                                'tags': alert.get('tags', [])
                            })
                        
                        return {
                            'alerts': processed_alerts,
                            'alert_count': len(processed_alerts),
                            'current_weather': {
                                'temperature': data.get('current', {}).get('temp', 0),
                                'humidity': data.get('current', {}).get('humidity', 0),
                                'pressure': data.get('current', {}).get('pressure', 0),
                                'wind_speed': data.get('current', {}).get('wind_speed', 0)
                            }
                        }
                    else:
                        return {'alerts': [], 'alert_count': 0}
                        
        except Exception as e:
            print(f"Weather alerts fetch error: {e}")
            return {'alerts': [], 'alert_count': 0}
    
    async def check_extreme_weather(self, lat: float, lon: float) -> Dict[str, Any]:
        """Check for extreme weather conditions"""
        try:
            weather_data = await self.get_current_weather(lat, lon)
            alerts = await self.get_weather_alerts(lat, lon)
            
            extreme_conditions = []
            risk_level = "LOW"
            
            temp = weather_data.get('temperature', 0)
            humidity = weather_data.get('humidity', 0)
            wind_speed = weather_data.get('wind_speed', 0)
            
            # Check for extreme temperatures
            if temp > 45:
                extreme_conditions.append("Extreme heat warning")
                risk_level = "CRITICAL"
            elif temp > 40:
                extreme_conditions.append("High temperature alert")
                risk_level = "HIGH" if risk_level == "LOW" else risk_level
            elif temp < 0:
                extreme_conditions.append("Freezing temperature alert")
                risk_level = "HIGH" if risk_level == "LOW" else risk_level
            
            # Check for high winds
            if wind_speed > 20:  # m/s
                extreme_conditions.append("High wind warning")
                risk_level = "HIGH" if risk_level in ["LOW", "MEDIUM"] else risk_level
            
            # Check humidity for heat index
            if temp > 35 and humidity > 80:
                extreme_conditions.append("Dangerous heat index")
                risk_level = "CRITICAL"
            
            # Check for weather alerts
            if alerts.get('alert_count', 0) > 0:
                extreme_conditions.append(f"{alerts['alert_count']} official weather alerts")
                risk_level = "HIGH" if risk_level == "LOW" else risk_level
            
            return {
                'risk_level': risk_level,
                'extreme_conditions': extreme_conditions,
                'weather_data': weather_data,
                'alerts': alerts,
                'coordinates': {'lat': lat, 'lon': lon}
            }
            
        except Exception as e:
            print(f"Extreme weather check error: {e}")
            return {
                'risk_level': 'UNKNOWN',
                'extreme_conditions': ['Weather data unavailable'],
                'weather_data': {},
                'alerts': {'alerts': [], 'alert_count': 0}
            }
    
    def _get_fallback_weather(self, lat: float, lon: float) -> Dict[str, Any]:
        """Fallback weather data when API fails"""
        return {
            'temperature': 25,
            'feels_like': 27,
            'humidity': 60,
            'pressure': 1013,
            'description': 'Weather data unavailable',
            'wind_speed': 5,
            'wind_direction': 180,
            'visibility': 10000,
            'location': 'Unknown',
            'country': '',
            'coordinates': {'lat': lat, 'lon': lon},
            'fallback': True
        }
    
    def _get_fallback_weather_city(self, city: str) -> Dict[str, Any]:
        """Fallback weather data for city when API fails"""
        return {
            'temperature': 25,
            'feels_like': 27,
            'humidity': 60,
            'pressure': 1013,
            'description': 'Weather data unavailable',
            'wind_speed': 5,
            'wind_direction': 180,
            'visibility': 10000,
            'location': city,
            'country': '',
            'coordinates': {'lat': 0, 'lon': 0},
            'fallback': True
        }