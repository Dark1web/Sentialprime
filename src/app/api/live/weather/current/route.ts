import { NextRequest } from 'next/server';
import { responses, withErrorHandling } from '@/utils/response';
import { weatherService } from '@/services/weather';
import { z } from 'zod';

const WeatherRequestSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  location_name: z.string().optional(),
});

async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body
    const validatedData = WeatherRequestSchema.parse(body);
    
    // Get current weather data
    const weatherData = await weatherService.getCurrentWeather(
      validatedData.lat,
      validatedData.lng
    );
    
    // Get weather alerts
    const alerts = await weatherService.getWeatherAlerts(
      validatedData.lat,
      validatedData.lng
    );
    
    // Check for extreme weather conditions
    const extremeWeather = await weatherService.checkExtremeWeather(
      validatedData.lat,
      validatedData.lng
    );
    
    return responses.ok({
      weather: weatherData,
      alerts,
      extreme_weather: extremeWeather,
      coordinates: {
        lat: validatedData.lat,
        lng: validatedData.lng
      },
      location_name: validatedData.location_name,
      last_updated: new Date().toISOString(),
      ai_analyzed: false // TODO: Implement AI analysis
    });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return responses.badRequest(`Validation error: ${error.errors.map(e => e.message).join(', ')}`);
    }
    
    console.error('Weather API error:', error);
    return responses.internalServerError('Failed to fetch weather data');
  }
}

// Handle OPTIONS for CORS
async function OPTIONS(request: NextRequest) {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

const wrappedPOST = withErrorHandling(POST);
export { wrappedPOST as POST, OPTIONS };
