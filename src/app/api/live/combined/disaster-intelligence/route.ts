import { NextRequest } from 'next/server';
import { responses, withErrorHandling } from '@/utils/response';
import { weatherService } from '@/services/weather';
import { newsService } from '@/services/news';
import { z } from 'zod';

const DisasterIntelligenceRequestSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  location_name: z.string().optional(),
  radius_km: z.number().min(1).max(100).optional().default(50),
  include_forecast: z.boolean().optional().default(true),
  include_satellite: z.boolean().optional().default(true),
  news_limit: z.number().min(1).max(50).optional().default(20)
});

async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const queryData = {
      lat: parseFloat(searchParams.get('lat') || '0'),
      lng: parseFloat(searchParams.get('lng') || '0'),
      location_name: searchParams.get('location_name') || undefined,
      radius_km: parseInt(searchParams.get('radius_km') || '50'),
      include_forecast: searchParams.get('include_forecast') !== 'false',
      include_satellite: searchParams.get('include_satellite') !== 'false',
      news_limit: parseInt(searchParams.get('news_limit') || '20')
    };
    
    // Validate query parameters
    const validatedData = DisasterIntelligenceRequestSchema.parse(queryData);
    
    // Fetch data from multiple sources concurrently
    const [
      currentWeather,
      weatherAlerts,
      extremeWeather,
      generalNews,
      locationNews
    ] = await Promise.allSettled([
      weatherService.getCurrentWeather(validatedData.lat, validatedData.lng),
      weatherService.getWeatherAlerts(validatedData.lat, validatedData.lng),
      weatherService.checkExtremeWeather(validatedData.lat, validatedData.lng),
      newsService.fetchDisasterNews(validatedData.news_limit),
      validatedData.location_name 
        ? newsService.searchNewsByLocation(validatedData.location_name, [], 10)
        : Promise.resolve([])
    ]);
    
    // Process results and handle any failures gracefully
    const weatherData = currentWeather.status === 'fulfilled' ? currentWeather.value : null;
    const alerts = weatherAlerts.status === 'fulfilled' ? weatherAlerts.value : [];
    const extreme = extremeWeather.status === 'fulfilled' ? extremeWeather.value : null;
    const news = generalNews.status === 'fulfilled' ? generalNews.value : [];
    const localNews = locationNews.status === 'fulfilled' ? locationNews.value : [];
    
    // Calculate overall risk assessment
    const riskAssessment = calculateOverallRisk(weatherData, alerts, extreme, news);
    
    // Combine and deduplicate news
    const allNews = [...news, ...localNews];
    const uniqueNews = removeDuplicateNews(allNews).slice(0, validatedData.news_limit);
    
    // Get forecast if requested
    let forecast = null;
    if (validatedData.include_forecast) {
      try {
        forecast = await weatherService.getWeatherForecast(validatedData.lat, validatedData.lng);
      } catch (error) {
        console.error('Forecast fetch failed:', error);
      }
    }
    
    // TODO: Add satellite imagery data when service is implemented
    let satelliteData = null;
    if (validatedData.include_satellite) {
      satelliteData = {
        flood_risk: {
          risk_level: 'low',
          confidence: 0.7,
          last_updated: new Date().toISOString()
        },
        fire_risk: {
          risk_level: 'medium',
          confidence: 0.8,
          last_updated: new Date().toISOString()
        }
      };
    }
    
    return responses.ok({
      location: {
        lat: validatedData.lat,
        lng: validatedData.lng,
        name: validatedData.location_name,
        radius_km: validatedData.radius_km
      },
      weather: {
        current: weatherData,
        forecast: forecast?.forecast || null,
        alerts,
        extreme_conditions: extreme
      },
      news: {
        articles: uniqueNews,
        total: uniqueNews.length,
        sources: [...new Set(uniqueNews.map(article => article.source))]
      },
      satellite: satelliteData,
      risk_assessment: riskAssessment,
      last_updated: new Date().toISOString(),
      data_sources: {
        weather: currentWeather.status === 'fulfilled' ? 'live' : 'unavailable',
        news: generalNews.status === 'fulfilled' ? 'live' : 'unavailable',
        satellite: 'mock' // Will be 'live' when implemented
      }
    });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return responses.badRequest(`Validation error: ${error.errors.map(e => e.message).join(', ')}`);
    }
    
    console.error('Disaster intelligence API error:', error);
    return responses.internalServerError('Failed to fetch disaster intelligence data');
  }
}

// Handle POST for more complex queries
async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body
    const validatedData = DisasterIntelligenceRequestSchema.parse(body);
    
    // Same logic as GET but with POST body data
    const [
      currentWeather,
      weatherAlerts,
      extremeWeather,
      generalNews,
      locationNews
    ] = await Promise.allSettled([
      weatherService.getCurrentWeather(validatedData.lat, validatedData.lng),
      weatherService.getWeatherAlerts(validatedData.lat, validatedData.lng),
      weatherService.checkExtremeWeather(validatedData.lat, validatedData.lng),
      newsService.fetchDisasterNews(validatedData.news_limit),
      validatedData.location_name 
        ? newsService.searchNewsByLocation(validatedData.location_name, [], 10)
        : Promise.resolve([])
    ]);
    
    const weatherData = currentWeather.status === 'fulfilled' ? currentWeather.value : null;
    const alerts = weatherAlerts.status === 'fulfilled' ? weatherAlerts.value : [];
    const extreme = extremeWeather.status === 'fulfilled' ? extremeWeather.value : null;
    const news = generalNews.status === 'fulfilled' ? generalNews.value : [];
    const localNews = locationNews.status === 'fulfilled' ? locationNews.value : [];
    
    const riskAssessment = calculateOverallRisk(weatherData, alerts, extreme, news);
    const allNews = [...news, ...localNews];
    const uniqueNews = removeDuplicateNews(allNews).slice(0, validatedData.news_limit);
    
    let forecast = null;
    if (validatedData.include_forecast) {
      try {
        forecast = await weatherService.getWeatherForecast(validatedData.lat, validatedData.lng);
      } catch (error) {
        console.error('Forecast fetch failed:', error);
      }
    }
    
    let satelliteData = null;
    if (validatedData.include_satellite) {
      satelliteData = {
        flood_risk: { risk_level: 'low', confidence: 0.7, last_updated: new Date().toISOString() },
        fire_risk: { risk_level: 'medium', confidence: 0.8, last_updated: new Date().toISOString() }
      };
    }
    
    return responses.ok({
      location: {
        lat: validatedData.lat,
        lng: validatedData.lng,
        name: validatedData.location_name,
        radius_km: validatedData.radius_km
      },
      weather: {
        current: weatherData,
        forecast: forecast?.forecast || null,
        alerts,
        extreme_conditions: extreme
      },
      news: {
        articles: uniqueNews,
        total: uniqueNews.length,
        sources: [...new Set(uniqueNews.map(article => article.source))]
      },
      satellite: satelliteData,
      risk_assessment: riskAssessment,
      last_updated: new Date().toISOString(),
      data_sources: {
        weather: currentWeather.status === 'fulfilled' ? 'live' : 'unavailable',
        news: generalNews.status === 'fulfilled' ? 'live' : 'unavailable',
        satellite: 'mock'
      }
    });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return responses.badRequest(`Validation error: ${error.errors.map(e => e.message).join(', ')}`);
    }
    
    console.error('Disaster intelligence POST API error:', error);
    return responses.internalServerError('Failed to fetch disaster intelligence data');
  }
}

function calculateOverallRisk(weatherData: any, alerts: any[], extreme: any, news: any[]): any {
  let riskScore = 0;
  const riskFactors: string[] = [];
  
  // Weather-based risk
  if (extreme?.risk_level === 'CRITICAL') riskScore += 4;
  else if (extreme?.risk_level === 'HIGH') riskScore += 3;
  else if (extreme?.risk_level === 'MEDIUM') riskScore += 2;
  else if (extreme?.risk_level === 'LOW') riskScore += 1;
  
  // Alert-based risk
  riskScore += alerts.length;
  if (alerts.length > 0) {
    riskFactors.push(`${alerts.length} weather alert(s)`);
  }
  
  // News-based risk (check for high-severity disaster keywords)
  const highSeverityKeywords = ['emergency', 'evacuation', 'critical', 'severe', 'major disaster'];
  const newsRisk = news.filter(article => 
    highSeverityKeywords.some(keyword => 
      article.title.toLowerCase().includes(keyword) || 
      article.description.toLowerCase().includes(keyword)
    )
  ).length;
  
  riskScore += newsRisk;
  if (newsRisk > 0) {
    riskFactors.push(`${newsRisk} high-severity news report(s)`);
  }
  
  // Determine overall risk level
  let overallRisk: string;
  if (riskScore >= 8) overallRisk = 'CRITICAL';
  else if (riskScore >= 5) overallRisk = 'HIGH';
  else if (riskScore >= 3) overallRisk = 'MEDIUM';
  else overallRisk = 'LOW';
  
  return {
    overall_risk: overallRisk,
    risk_score: riskScore,
    risk_factors: riskFactors,
    recommendations: generateRecommendations(overallRisk, extreme),
    confidence: Math.min(0.9, 0.5 + (riskScore * 0.1))
  };
}

function generateRecommendations(riskLevel: string, extreme: any): string[] {
  const recommendations: string[] = [];
  
  switch (riskLevel) {
    case 'CRITICAL':
      recommendations.push('Consider immediate evacuation if advised by authorities');
      recommendations.push('Monitor emergency broadcasts continuously');
      recommendations.push('Ensure emergency supplies are ready');
      break;
    case 'HIGH':
      recommendations.push('Stay alert and monitor weather conditions');
      recommendations.push('Prepare emergency kit and evacuation plan');
      recommendations.push('Avoid unnecessary travel');
      break;
    case 'MEDIUM':
      recommendations.push('Stay informed about weather conditions');
      recommendations.push('Check emergency supplies');
      break;
    default:
      recommendations.push('Continue normal activities');
      recommendations.push('Stay informed about local conditions');
  }
  
  // Add specific recommendations from weather analysis
  if (extreme?.recommendations) {
    recommendations.push(...extreme.recommendations);
  }
  
  return [...new Set(recommendations)]; // Remove duplicates
}

function removeDuplicateNews(articles: any[]): any[] {
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

// Handle OPTIONS for CORS
async function OPTIONS(request: NextRequest) {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

const wrappedGET = withErrorHandling(GET);
const wrappedPOST = withErrorHandling(POST);

export { wrappedGET as GET, wrappedPOST as POST, OPTIONS };
