import axios
from ..config import GOOGLE_API_KEY

class WeatherService:
    def __init__(self):
        self.api_key = GOOGLE_API_KEY
        self.base_url = "https://api.openweathermap.org/data/2.5/weather"

    def get_weather_data(self, lat, lon):
        try:
            response = axios.get(
                self.base_url,
                params={"lat": lat, "lon": lon, "appid": self.api_key},
            )
            return response.json()
        except Exception as e:
            print(f"Error fetching weather data: {e}")
            return None
