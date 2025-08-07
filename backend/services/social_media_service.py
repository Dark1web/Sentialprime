import snscrape.modules.twitter as sntwitter

class SocialMediaService:
    def __init__(self):
        pass

    def get_tweets(self, query, limit=100):
        tweets = []
        for i, tweet in enumerate(sntwitter.TwitterSearchScraper(query).get_items()):
            if i >= limit:
                break
            tweets.append(
                {
                    "date": tweet.date,
                    "id": tweet.id,
                    "content": tweet.content,
                    "username": tweet.user.username,
                    "url": tweet.url,
                }
            )
        return tweets
