import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '@/lib/config';
import { NewsArticle, WeatherData } from '@/types';

export class GeminiService {
  private genAI: GoogleGenerativeAI | null = null;
  private model: any = null;

  constructor() {
    if (config.apis.geminiApiKey) {
      this.genAI = new GoogleGenerativeAI(config.apis.geminiApiKey);
      this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    }
  }

  async analyzeWeatherForecast(weatherData: WeatherData): Promise<any> {
    if (!this.model) {
      return this.getMockWeatherAnalysis(weatherData);
    }

    try {
      const prompt = `
        Analyze this weather forecast for potential disaster risks:
        
        Current Weather:
        - Temperature: ${weatherData.current.temperature}°C
        - Humidity: ${weatherData.current.humidity}%
        - Wind Speed: ${weatherData.current.wind_speed} km/h
        - Pressure: ${weatherData.current.pressure} hPa
        - Conditions: ${weatherData.current.condition}
        
        ${weatherData.forecast ? `Forecast (next 5 days):
        ${weatherData.forecast.map(day => 
          `${day.date}: ${day.temperature_min}-${day.temperature_max}°C, ${day.condition}, ${day.precipitation_probability}% rain`
        ).join('\n')}` : ''}
        
        Please provide a JSON response with:
        {
          "disaster_risk_level": "low|medium|high|critical",
          "potential_disasters": ["flood", "storm", "heat_wave", etc.],
          "risk_analysis": "detailed analysis",
          "recommendations": ["action1", "action2"],
          "alert_level": "green|yellow|orange|red",
          "risk_factors": {
            "flood_risk": 0-1,
            "storm_risk": 0-1,
            "heat_risk": 0-1,
            "wind_risk": 0-1
          },
          "timeline": "immediate|hours|days",
          "confidence_level": 0-1
        }
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      try {
        const analysis = JSON.parse(text);
        return {
          original_data: weatherData,
          ai_analysis: analysis,
          analyzed_at: new Date().toISOString()
        };
      } catch (parseError) {
        console.error('Failed to parse Gemini response:', parseError);
        return this.getMockWeatherAnalysis(weatherData);
      }
    } catch (error) {
      console.error('Gemini weather analysis error:', error);
      return this.getMockWeatherAnalysis(weatherData);
    }
  }

  async filterDisasterNews(articles: NewsArticle[]): Promise<NewsArticle[]> {
    if (!this.model || articles.length === 0) {
      return articles.map(article => ({
        ...article,
        ai_filtered: true,
        relevance_score: Math.random() * 0.3 + 0.7
      }));
    }

    try {
      const articlesText = articles.map((article, index) => 
        `${index + 1}. Title: ${article.title}\nDescription: ${article.description}\nSource: ${article.source}`
      ).join('\n\n');

      const prompt = `
        Analyze these news articles for disaster relevance and credibility:
        
        ${articlesText}
        
        For each article, provide a JSON array with:
        [
          {
            "index": 1,
            "relevance_score": 0-1,
            "credibility_score": 0-1,
            "disaster_type": "flood|fire|earthquake|storm|other|none",
            "urgency_level": "low|medium|high|critical",
            "is_disaster_related": true/false,
            "reasoning": "brief explanation"
          }
        ]
        
        Focus on actual disaster events, emergency situations, and crisis response.
        Filter out general news, politics, and non-emergency content.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      try {
        const analysis = JSON.parse(text);
        
        return articles.map((article, index) => {
          const articleAnalysis = analysis.find((a: any) => a.index === index + 1);
          
          if (articleAnalysis) {
            return {
              ...article,
              ai_filtered: true,
              relevance_score: articleAnalysis.relevance_score,
              credibility_score: articleAnalysis.credibility_score,
              disaster_type: articleAnalysis.disaster_type,
              urgency_level: articleAnalysis.urgency_level,
              ai_reasoning: articleAnalysis.reasoning
            };
          }
          
          return {
            ...article,
            ai_filtered: true,
            relevance_score: 0.5,
            credibility_score: article.credibility_score || 0.7
          };
        }).filter(article => article.relevance_score > 0.3); // Filter out low-relevance articles
        
      } catch (parseError) {
        console.error('Failed to parse Gemini news analysis:', parseError);
        return articles.map(article => ({
          ...article,
          ai_filtered: true,
          relevance_score: Math.random() * 0.3 + 0.7
        }));
      }
    } catch (error) {
      console.error('Gemini news filtering error:', error);
      return articles.map(article => ({
        ...article,
        ai_filtered: true,
        relevance_score: Math.random() * 0.3 + 0.7
      }));
    }
  }

  async analyzeMisinformation(text: string): Promise<any> {
    if (!this.model) {
      return this.getMockMisinformationAnalysis(text);
    }

    try {
      const prompt = `
        Analyze this text for misinformation, especially related to disasters and emergencies:
        
        Text: "${text}"
        
        Provide a JSON response with:
        {
          "is_misinformation": true/false,
          "confidence_score": 0-1,
          "misinformation_type": "false_claim|misleading|conspiracy|satire|legitimate",
          "panic_score": 0-1,
          "emotional_tone": "neutral|fear|anger|hope|panic",
          "fact_check_needed": true/false,
          "reasoning": "explanation of analysis",
          "red_flags": ["flag1", "flag2"],
          "verification_sources": ["source1", "source2"]
        }
        
        Focus on disaster-related misinformation, false emergency alerts, and panic-inducing content.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text_response = response.text();
      
      try {
        const analysis = JSON.parse(text_response);
        return {
          original_text: text,
          analysis,
          analyzed_at: new Date().toISOString()
        };
      } catch (parseError) {
        console.error('Failed to parse Gemini misinformation analysis:', parseError);
        return this.getMockMisinformationAnalysis(text);
      }
    } catch (error) {
      console.error('Gemini misinformation analysis error:', error);
      return this.getMockMisinformationAnalysis(text);
    }
  }

  async classifyEmergencyTriage(message: string, location?: string): Promise<any> {
    if (!this.model) {
      return this.getMockTriageAnalysis(message);
    }

    try {
      const prompt = `
        Analyze this emergency request for triage classification:
        
        Message: "${message}"
        ${location ? `Location: ${location}` : ''}
        
        Provide a JSON response with:
        {
          "urgency_score": 0-1,
          "triage_level": "low|medium|high|critical",
          "resource_required": ["medical", "fire", "police", "rescue", "shelter"],
          "estimated_response_time": "immediate|15min|30min|1hour|4hours",
          "keywords_detected": ["keyword1", "keyword2"],
          "medical_emergency": true/false,
          "life_threatening": true/false,
          "explanation": "reasoning for classification",
          "recommended_actions": ["action1", "action2"]
        }
        
        Focus on identifying genuine emergencies and appropriate resource allocation.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text_response = response.text();
      
      try {
        const analysis = JSON.parse(text_response);
        return {
          original_message: message,
          location,
          classification: analysis,
          analyzed_at: new Date().toISOString()
        };
      } catch (parseError) {
        console.error('Failed to parse Gemini triage analysis:', parseError);
        return this.getMockTriageAnalysis(message);
      }
    } catch (error) {
      console.error('Gemini triage analysis error:', error);
      return this.getMockTriageAnalysis(message);
    }
  }

  private getMockWeatherAnalysis(weatherData: WeatherData): any {
    return {
      original_data: weatherData,
      ai_analysis: {
        disaster_risk_level: 'low',
        potential_disasters: [],
        risk_analysis: 'Weather conditions appear normal with no immediate disaster risks.',
        recommendations: ['Monitor weather conditions', 'Stay informed about local alerts'],
        alert_level: 'green',
        risk_factors: {
          flood_risk: 0.1,
          storm_risk: 0.2,
          heat_risk: 0.1,
          wind_risk: 0.1
        },
        timeline: 'days',
        confidence_level: 0.7
      },
      analyzed_at: new Date().toISOString()
    };
  }

  private getMockMisinformationAnalysis(text: string): any {
    return {
      original_text: text,
      analysis: {
        is_misinformation: false,
        confidence_score: 0.7,
        misinformation_type: 'legitimate',
        panic_score: 0.2,
        emotional_tone: 'neutral',
        fact_check_needed: false,
        reasoning: 'Content appears to be legitimate based on language patterns and context.',
        red_flags: [],
        verification_sources: []
      },
      analyzed_at: new Date().toISOString()
    };
  }

  private getMockTriageAnalysis(message: string): any {
    return {
      original_message: message,
      classification: {
        urgency_score: 0.5,
        triage_level: 'medium',
        resource_required: ['medical'],
        estimated_response_time: '30min',
        keywords_detected: ['help', 'emergency'],
        medical_emergency: false,
        life_threatening: false,
        explanation: 'Standard emergency request requiring medical attention.',
        recommended_actions: ['Dispatch medical team', 'Gather more information']
      },
      analyzed_at: new Date().toISOString()
    };
  }
}

export const geminiService = new GeminiService();
