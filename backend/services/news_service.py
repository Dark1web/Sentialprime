from newspaper import Article
import feedparser
import requests
from bs4 import BeautifulSoup

class NewsService:
    def __init__(self):
        pass

    def get_news_from_url(self, url):
        try:
            article = Article(url)
            article.download()
            article.parse()
            return {
                "title": article.title,
                "text": article.text,
                "authors": article.authors,
                "publish_date": article.publish_date,
                "top_image": article.top_image,
                "movies": article.movies,
            }
        except Exception as e:
            print(f"Error fetching news from url: {e}")
            return None

    def fetch_rss_feed(self, url):
        feed = feedparser.parse(url)
        news_items = []

        for entry in feed.entries:
            news_items.append({
                'title': entry.title,
                'link': entry.link,
                'published': entry.published,
                'summary': entry.summary
            })

        return news_items

    def scrape_disaster_news(self, url):
        r = requests.get(url)
        soup = BeautifulSoup(r.text, 'html.parser')

        headlines = []
        for article in soup.find_all('h2'):
            headlines.append(article.text.strip())

        return headlines
