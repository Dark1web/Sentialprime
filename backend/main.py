from fastapi import FastAPI
from .services.weather_service import WeatherService
from .services.news_service import NewsService
from .services.social_media_service import SocialMediaService

app = FastAPI()

weather_service = WeatherService()
news_service = NewsService()
social_media_service = SocialMediaService()

@app.get("/")
def read_root():
    return {"Hello": "World"}

@app.get("/weather")
def get_weather(lat: float, lon: float):
    return weather_service.get_weather_data(lat, lon)

@app.get("/news")
def get_news(url: str):
    return news_service.get_news_from_url(url)

@app.get("/tweets")
def get_tweets(query: str, limit: int = 100):
    return social_media_service.get_tweets(query, limit)
