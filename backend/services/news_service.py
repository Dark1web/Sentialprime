from newspaper import Article

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
