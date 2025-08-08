import snscrape.modules.twitter as sntwitter
from mastodon import Mastodon

class SocialMediaService:
    def __init__(self):
        self.mastodon = Mastodon(
            access_token = '1wViHA7jMRsKXqfLRmO9SicnaEsY2GiONn8PCGyIqmNk0yMvx01k9D5eHQHQjbZgVmNUvbOgLYmiuhBdyr8IucJz5DorTEW3jqOd0ICaLGVBHtx1iFu1Tx7YbHOLy4RL',
            api_base_url = 'https://mastodon.social' # or your instance
        )

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

    def get_toots(self, query, limit=40):
        toots = []
        public_toots = self.mastodon.timeline_hashtag(query, limit=limit)
        for toot in public_toots:
            toots.append({
                "date": toot['created_at'],
                "id": toot['id'],
                "content": toot['content'],
                "username": toot['account']['username'],
                "url": toot['url']
            })
        return toots
