import axios

class WeatherService:
    def __init__(self):
        self.api_key = "66345d96e4e76d9ccda3aa8c292d8e4c"
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
