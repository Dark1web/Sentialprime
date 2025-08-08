from fastapi import FastAPI
from .services.weather_service import WeatherService
from .services.news_service import NewsService
from .services.social_media_service import SocialMediaService
from .services.sentinel_hub_service import SentinelHubService
from .services.geocoding_service import GeocodingService
from .services.huggingface_service import HuggingFaceService
from .services.yolo_service import YoloService

app = FastAPI()

weather_service = WeatherService()
news_service = NewsService()
social_media_service = SocialMediaService()
sentinel_hub_service = SentinelHubService()
geocoding_service = GeocodingService()
huggingface_service = HuggingFaceService()
yolo_service = YoloService()

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

@app.get("/toots")
def get_toots(query: str, limit: int = 40):
    return social_media_service.get_toots(query, limit)

@app.get("/satellite-image")
async def get_satellite_image(lat: float, lon: float, disaster_type: str):
    return await sentinel_hub_service.get_disaster_imagery(lat, lon, disaster_type)

@app.get("/geocode")
def geocode(address: str):
    return geocoding_service.geocode(address)

@app.get("/reverse-geocode")
def reverse_geocode(lat: float, lon: float):
    return geocoding_service.reverse_geocode(lat, lon)

@app.get("/rss-feed")
def get_rss_feed(url: str):
    return news_service.fetch_rss_feed(url)

@app.get("/scrape-news")
def scrape_news(url: str):
    return news_service.scrape_disaster_news(url)

@app.post("/classify-disaster-tweet")
def classify_disaster_tweet(text: str):
    return huggingface_service.classify_disaster_tweet(text)

@app.post("/detect-misinformation")
def detect_misinformation(text: str):
    return huggingface_service.detect_misinformation(text)

@app.post("/predict-image")
def predict_image(image_url: str):
    return yolo_service.predict_from_url(image_url)
