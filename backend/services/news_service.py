import asyncio
import aiohttp
import feedparser
from typing import List, Dict, Any
from datetime import datetime, timedelta
from config import get_api_key, get_endpoint, DISASTER_KEYWORDS

class NewsService:
    """Service for fetching real news data from multiple sources"""
    
    def __init__(self):
        self.news_api_key = get_api_key("NEWS_API")
        self.gnews_api_key = get_api_key("GNEWS_API")
        self.news_api_url = get_endpoint("NEWS_API")
        self.gnews_api_url = get_endpoint("GNEWS_API")
        self.google_rss_url = get_endpoint("GOOGLE_NEWS_RSS")
    
    async def fetch_disaster_news(self, limit: int = 50) -> List[Dict[str, Any]]:
        """Fetch disaster-related news from multiple sources"""
        try:
            # Fetch from all sources concurrently
            tasks = [
                self._fetch_newsapi_articles(),
                self._fetch_gnews_articles(),
                self._fetch_google_rss_articles()
            ]
            
            results = await asyncio.gather(*tasks, return_exceptions=True)
            
            # Combine all articles
            all_articles = []
            for result in results:
                if isinstance(result, list):
                    all_articles.extend(result)
            
            # Sort by publication date and limit
            all_articles.sort(key=lambda x: x.get('published_at', ''), reverse=True)
            return all_articles[:limit]
            
        except Exception as e:
            print(f"Error fetching news: {e}")
            return []
    
    async def _fetch_newsapi_articles(self) -> List[Dict[str, Any]]:
        """Fetch articles from NewsAPI"""
        try:
            query = " OR ".join(DISASTER_KEYWORDS[:5])  # Limit query length
            url = f"{self.news_api_url}/everything"
            params = {
                'q': query,
                'language': 'en',
                'sortBy': 'publishedAt',
                'pageSize': 20,
                'apiKey': self.news_api_key
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.get(url, params=params) as response:
                    if response.status == 200:
                        data = await response.json()
                        articles = []
                        
                        for article in data.get('articles', []):
                            articles.append({
                                'title': article.get('title', ''),
                                'description': article.get('description', ''),
                                'content': article.get('content', ''),
                                'url': article.get('url', ''),
                                'source': article.get('source', {}).get('name', 'NewsAPI'),
                                'published_at': article.get('publishedAt', ''),
                                'api_source': 'newsapi'
                            })
                        
                        return articles
                    else:
                        print(f"NewsAPI error: {response.status}")
                        return []
                        
        except Exception as e:
            print(f"NewsAPI fetch error: {e}")
            return []
    
    async def _fetch_gnews_articles(self) -> List[Dict[str, Any]]:
        """Fetch articles from GNews"""
        try:
            query = " OR ".join(DISASTER_KEYWORDS[:3])
            url = f"{self.gnews_api_url}/search"
            params = {
                'q': query,
                'lang': 'en',
                'country': 'in',  # Focus on India
                'max': 20,
                'apikey': self.gnews_api_key
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.get(url, params=params) as response:
                    if response.status == 200:
                        data = await response.json()
                        articles = []
                        
                        for article in data.get('articles', []):
                            articles.append({
                                'title': article.get('title', ''),
                                'description': article.get('description', ''),
                                'content': article.get('content', ''),
                                'url': article.get('url', ''),
                                'source': article.get('source', {}).get('name', 'GNews'),
                                'published_at': article.get('publishedAt', ''),
                                'api_source': 'gnews'
                            })
                        
                        return articles
                    else:
                        print(f"GNews error: {response.status}")
                        return []
                        
        except Exception as e:
            print(f"GNews fetch error: {e}")
            return []
    
    async def _fetch_google_rss_articles(self) -> List[Dict[str, Any]]:
        """Fetch articles from Google News RSS"""
        try:
            articles = []
            
            # Fetch RSS for multiple disaster keywords
            for keyword in DISASTER_KEYWORDS[:3]:
                url = f"{self.google_rss_url}?q={keyword}+alert"
                
                async with aiohttp.ClientSession() as session:
                    async with session.get(url) as response:
                        if response.status == 200:
                            rss_content = await response.text()
                            feed = feedparser.parse(rss_content)
                            
                            for entry in feed.entries[:5]:  # Limit per keyword
                                articles.append({
                                    'title': entry.get('title', ''),
                                    'description': entry.get('summary', ''),
                                    'content': entry.get('summary', ''),
                                    'url': entry.get('link', ''),
                                    'source': 'Google News',
                                    'published_at': entry.get('published', ''),
                                    'api_source': 'google_rss'
                                })
            
            return articles
            
        except Exception as e:
            print(f"Google RSS fetch error: {e}")
            return []
    
    async def search_news_by_location(self, location: str, keywords: List[str] = None) -> List[Dict[str, Any]]:
        """Search for location-specific disaster news"""
        try:
            search_keywords = keywords or DISASTER_KEYWORDS[:3]
            query = f"{location} AND ({' OR '.join(search_keywords)})"
            
            url = f"{self.news_api_url}/everything"
            params = {
                'q': query,
                'language': 'en',
                'sortBy': 'publishedAt',
                'pageSize': 15,
                'apiKey': self.news_api_key
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.get(url, params=params) as response:
                    if response.status == 200:
                        data = await response.json()
                        articles = []
                        
                        for article in data.get('articles', []):
                            articles.append({
                                'title': article.get('title', ''),
                                'description': article.get('description', ''),
                                'content': article.get('content', ''),
                                'url': article.get('url', ''),
                                'source': article.get('source', {}).get('name', 'NewsAPI'),
                                'published_at': article.get('publishedAt', ''),
                                'location': location,
                                'api_source': 'newsapi_location'
                            })
                        
                        return articles
                    else:
                        return []
                        
        except Exception as e:
            print(f"Location news search error: {e}")
            return []