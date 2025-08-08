import { config } from '@/lib/config';
import { NewsArticle } from '@/types';

export class NewsService {
  private newsApiKey: string;
  private gnewsApiKey: string;

  constructor() {
    this.newsApiKey = config.apis.newsApiKey;
    this.gnewsApiKey = config.apis.gnewsApiKey;
  }

  async fetchDisasterNews(limit: number = 50): Promise<NewsArticle[]> {
    try {
      const articles: NewsArticle[] = [];
      
      // Try NewsAPI first
      if (this.newsApiKey) {
        const newsApiArticles = await this.fetchFromNewsAPI(limit);
        articles.push(...newsApiArticles);
      }
      
      // Try GNews if we need more articles
      if (articles.length < limit && this.gnewsApiKey) {
        const gnewsArticles = await this.fetchFromGNews(limit - articles.length);
        articles.push(...gnewsArticles);
      }
      
      // If no API keys or APIs fail, return mock data
      if (articles.length === 0) {
        return this.getMockDisasterNews(limit);
      }
      
      // Remove duplicates and sort by date
      const uniqueArticles = this.removeDuplicates(articles);
      return uniqueArticles.slice(0, limit);
      
    } catch (error) {
      console.error('News service error:', error);
      return this.getMockDisasterNews(limit);
    }
  }

  async searchNewsByLocation(location: string, keywords: string[] = [], limit: number = 10): Promise<NewsArticle[]> {
    try {
      const searchQuery = this.buildLocationSearchQuery(location, keywords);
      
      if (this.newsApiKey) {
        return await this.searchNewsAPI(searchQuery, limit);
      } else if (this.gnewsApiKey) {
        return await this.searchGNews(searchQuery, limit);
      } else {
        return this.getMockLocationNews(location, limit);
      }
    } catch (error) {
      console.error('Location news search error:', error);
      return this.getMockLocationNews(location, limit);
    }
  }

  async fetchRSSFeed(url: string): Promise<NewsArticle[]> {
    try {
      // For RSS feeds, we'll use a simple fetch and parse
      const response = await fetch(url);
      const xmlText = await response.text();
      
      // Basic RSS parsing (in production, use a proper XML parser)
      const articles = this.parseRSSFeed(xmlText);
      return articles;
    } catch (error) {
      console.error('RSS feed error:', error);
      return [];
    }
  }

  private async fetchFromNewsAPI(limit: number): Promise<NewsArticle[]> {
    const disasterKeywords = [
      'disaster', 'earthquake', 'flood', 'hurricane', 'wildfire', 'tsunami',
      'emergency', 'evacuation', 'storm', 'cyclone', 'landslide', 'drought'
    ];
    
    const query = disasterKeywords.join(' OR ');
    
    const response = await fetch(
      `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&sortBy=publishedAt&pageSize=${limit}&apiKey=${this.newsApiKey}`
    );
    
    if (!response.ok) {
      throw new Error(`NewsAPI error: ${response.status}`);
    }
    
    const data = await response.json();
    
    return data.articles.map((article: any) => this.transformNewsAPIArticle(article));
  }

  private async fetchFromGNews(limit: number): Promise<NewsArticle[]> {
    const query = 'disaster OR emergency OR earthquake OR flood OR hurricane';
    
    const response = await fetch(
      `https://gnews.io/api/v4/search?q=${encodeURIComponent(query)}&lang=en&country=us&max=${limit}&apikey=${this.gnewsApiKey}`
    );
    
    if (!response.ok) {
      throw new Error(`GNews error: ${response.status}`);
    }
    
    const data = await response.json();
    
    return data.articles.map((article: any) => this.transformGNewsArticle(article));
  }

  private async searchNewsAPI(query: string, limit: number): Promise<NewsArticle[]> {
    const response = await fetch(
      `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&sortBy=publishedAt&pageSize=${limit}&apiKey=${this.newsApiKey}`
    );
    
    if (!response.ok) {
      throw new Error(`NewsAPI search error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.articles.map((article: any) => this.transformNewsAPIArticle(article));
  }

  private async searchGNews(query: string, limit: number): Promise<NewsArticle[]> {
    const response = await fetch(
      `https://gnews.io/api/v4/search?q=${encodeURIComponent(query)}&lang=en&max=${limit}&apikey=${this.gnewsApiKey}`
    );
    
    if (!response.ok) {
      throw new Error(`GNews search error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.articles.map((article: any) => this.transformGNewsArticle(article));
  }

  private transformNewsAPIArticle(article: any): NewsArticle {
    return {
      title: article.title || 'Untitled',
      description: article.description || '',
      content: article.content || '',
      url: article.url || '',
      source: article.source?.name || 'Unknown',
      author: article.author || 'Unknown',
      published_at: article.publishedAt || new Date().toISOString(),
      image_url: article.urlToImage || null,
      api_source: 'newsapi',
      disaster_related: true,
      credibility_score: 0.8 // Default score for NewsAPI
    };
  }

  private transformGNewsArticle(article: any): NewsArticle {
    return {
      title: article.title || 'Untitled',
      description: article.description || '',
      content: article.content || '',
      url: article.url || '',
      source: article.source?.name || 'Unknown',
      author: 'Unknown',
      published_at: article.publishedAt || new Date().toISOString(),
      image_url: article.image || null,
      api_source: 'gnews',
      disaster_related: true,
      credibility_score: 0.75 // Default score for GNews
    };
  }

  private buildLocationSearchQuery(location: string, keywords: string[]): string {
    const disasterKeywords = keywords.length > 0 ? keywords : [
      'disaster', 'emergency', 'weather', 'alert', 'warning'
    ];
    
    return `${location} AND (${disasterKeywords.join(' OR ')})`;
  }

  private parseRSSFeed(xmlText: string): NewsArticle[] {
    // Basic RSS parsing - in production, use a proper XML parser like 'fast-xml-parser'
    const articles: NewsArticle[] = [];
    
    try {
      // This is a simplified parser - replace with proper XML parsing
      const itemMatches = xmlText.match(/<item[^>]*>[\s\S]*?<\/item>/gi) || [];
      
      itemMatches.forEach(item => {
        const title = this.extractXMLContent(item, 'title');
        const description = this.extractXMLContent(item, 'description');
        const link = this.extractXMLContent(item, 'link');
        const pubDate = this.extractXMLContent(item, 'pubDate');
        
        if (title && link) {
          articles.push({
            title,
            description: description || '',
            content: '',
            url: link,
            source: 'RSS Feed',
            author: 'Unknown',
            published_at: pubDate || new Date().toISOString(),
            image_url: null,
            api_source: 'rss',
            disaster_related: true,
            credibility_score: 0.6
          });
        }
      });
    } catch (error) {
      console.error('RSS parsing error:', error);
    }
    
    return articles;
  }

  private extractXMLContent(xml: string, tag: string): string {
    const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i');
    const match = xml.match(regex);
    return match ? match[1].trim() : '';
  }

  private removeDuplicates(articles: NewsArticle[]): NewsArticle[] {
    const seen = new Set<string>();
    return articles.filter(article => {
      const key = article.url || article.title;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  private getMockDisasterNews(limit: number): NewsArticle[] {
    const mockArticles: NewsArticle[] = [
      {
        title: 'Heavy Rainfall Causes Flooding in Mumbai',
        description: 'Mumbai experiences severe flooding due to heavy monsoon rains affecting thousands of residents.',
        content: 'Detailed content about Mumbai flooding...',
        url: 'https://example.com/mumbai-flood',
        source: 'Mock News Network',
        author: 'Weather Reporter',
        published_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        image_url: null,
        api_source: 'mock',
        disaster_related: true,
        credibility_score: 0.9
      },
      {
        title: 'Earthquake Alert: 5.2 Magnitude Tremor Hits Delhi',
        description: 'Mild earthquake felt across Delhi NCR region, no major damage reported.',
        content: 'Detailed content about Delhi earthquake...',
        url: 'https://example.com/delhi-earthquake',
        source: 'Mock Seismic Center',
        author: 'Seismology Expert',
        published_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        image_url: null,
        api_source: 'mock',
        disaster_related: true,
        credibility_score: 0.95
      },
      {
        title: 'Wildfire Warning Issued for California',
        description: 'High winds and dry conditions create extreme fire risk across multiple counties.',
        content: 'Detailed content about California wildfire warning...',
        url: 'https://example.com/california-fire-warning',
        source: 'Mock Fire Department',
        author: 'Fire Chief',
        published_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        image_url: null,
        api_source: 'mock',
        disaster_related: true,
        credibility_score: 0.85
      }
    ];
    
    return mockArticles.slice(0, limit);
  }

  private getMockLocationNews(location: string, limit: number): NewsArticle[] {
    return [
      {
        title: `Weather Alert for ${location}`,
        description: `Current weather conditions and alerts for ${location} area.`,
        content: `Detailed weather information for ${location}...`,
        url: `https://example.com/weather-${location.toLowerCase()}`,
        source: 'Mock Weather Service',
        author: 'Weather Team',
        published_at: new Date().toISOString(),
        image_url: null,
        api_source: 'mock',
        disaster_related: true,
        credibility_score: 0.8
      }
    ].slice(0, limit);
  }
}

export const newsService = new NewsService();
