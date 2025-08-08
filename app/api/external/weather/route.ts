import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const WeatherRequestSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  include_alerts: z.boolean().optional().default(true),
  include_forecast: z.boolean().optional().default(false),
  units: z.enum(['metric', 'imperial']).optional().default('metric')
})

class WeatherService {
  private readonly apiKey = process.env.OPENWEATHER_API_KEY || 'demo_key'
  private readonly baseUrl = 'https://api.openweathermap.org/data/2.5'

  async getCurrentWeather(lat: number, lon: number, units: string = 'metric') {
    try {
      // In production, make actual API call
      // const response = await fetch(`${this.baseUrl}/weather?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=${units}`)
      
      // Mock weather data for demo
      return {
        location: {
          latitude: lat,
          longitude: lon,
          name: 'Demo Location',
          country: 'US',
          timezone: 'America/New_York'
        },
        current: {
          temperature: 22.5,
          feels_like: 24.1,
          humidity: 65,
          pressure: 1013.2,
          visibility: 10000,
          uv_index: 6,
          wind: {
            speed: 3.2,
            direction: 180,
            gust: 5.1
          },
          weather: {
            main: 'Clear',
            description: 'clear sky',
            icon: '01d'
          },
          clouds: 15,
          timestamp: new Date().toISOString()
        },
        air_quality: {
          aqi: 2,
          pm2_5: 12.3,
          pm10: 18.7,
          o3: 45.2,
          no2: 23.1,
          so2: 5.8,
          co: 0.3
        }
      }
    } catch (error) {
      console.error('Weather API error:', error)
      throw new Error('Failed to fetch weather data')
    }
  }

  async getWeatherAlerts(lat: number, lon: number) {
    try {
      // Mock weather alerts
      return {
        alerts: [
          {
            id: 'alert_001',
            title: 'Severe Thunderstorm Warning',
            description: 'Severe thunderstorms with damaging winds and large hail possible',
            severity: 'moderate',
            urgency: 'immediate',
            certainty: 'likely',
            areas: ['Downtown Area', 'Suburban Districts'],
            start_time: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
            end_time: new Date(Date.now() + 10800000).toISOString(), // 3 hours from now
            instructions: [
              'Move to an interior room on the lowest floor',
              'Avoid windows and doors',
              'Stay away from electrical equipment'
            ],
            source: 'National Weather Service'
          },
          {
            id: 'alert_002',
            title: 'Flash Flood Watch',
            description: 'Flash flooding possible due to heavy rainfall',
            severity: 'minor',
            urgency: 'future',
            certainty: 'possible',
            areas: ['Low-lying Areas', 'Creek Valleys'],
            start_time: new Date(Date.now() + 7200000).toISOString(), // 2 hours from now
            end_time: new Date(Date.now() + 21600000).toISOString(), // 6 hours from now
            instructions: [
              'Avoid driving through flooded roads',
              'Stay informed about weather conditions',
              'Have emergency supplies ready'
            ],
            source: 'National Weather Service'
          }
        ],
        last_updated: new Date().toISOString()
      }
    } catch (error) {
      console.error('Weather alerts error:', error)
      throw new Error('Failed to fetch weather alerts')
    }
  }

  async getWeatherForecast(lat: number, lon: number, days: number = 5) {
    try {
      // Mock forecast data
      const forecast = []
      for (let i = 0; i < days; i++) {
        const date = new Date()
        date.setDate(date.getDate() + i)
        
        forecast.push({
          date: date.toISOString().split('T')[0],
          temperature: {
            min: 15 + Math.random() * 10,
            max: 25 + Math.random() * 10
          },
          weather: {
            main: ['Clear', 'Clouds', 'Rain', 'Thunderstorm'][Math.floor(Math.random() * 4)],
            description: 'Partly cloudy',
            icon: '02d'
          },
          precipitation: {
            probability: Math.random() * 100,
            amount: Math.random() * 10
          },
          wind: {
            speed: 2 + Math.random() * 8,
            direction: Math.random() * 360
          },
          humidity: 50 + Math.random() * 40
        })
      }

      return {
        location: { latitude: lat, longitude: lon },
        forecast,
        last_updated: new Date().toISOString()
      }
    } catch (error) {
      console.error('Weather forecast error:', error)
      throw new Error('Failed to fetch weather forecast')
    }
  }

  async getExtremeWeatherAnalysis(lat: number, lon: number) {
    return {
      risk_assessment: {
        flood_risk: 'moderate',
        wind_risk: 'low',
        temperature_risk: 'low',
        precipitation_risk: 'high'
      },
      historical_data: {
        max_temperature_record: 42.3,
        min_temperature_record: -15.7,
        max_precipitation_24h: 89.2,
        strongest_wind_gust: 156.4
      },
      climate_trends: {
        temperature_trend: '+0.8°C over 30 years',
        precipitation_trend: '+12% over 30 years',
        extreme_events_frequency: '+23% over 20 years'
      },
      recommendations: [
        'Monitor weather conditions closely',
        'Prepare for potential flooding',
        'Ensure emergency supplies are available'
      ]
    }
  }
}

const weatherService = new WeatherService()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = WeatherRequestSchema.parse(body)

    const results: any = {
      location: {
        latitude: validatedData.latitude,
        longitude: validatedData.longitude
      }
    }

    // Get current weather
    results.current_weather = await weatherService.getCurrentWeather(
      validatedData.latitude,
      validatedData.longitude,
      validatedData.units
    )

    // Get weather alerts if requested
    if (validatedData.include_alerts) {
      results.alerts = await weatherService.getWeatherAlerts(
        validatedData.latitude,
        validatedData.longitude
      )
    }

    // Get forecast if requested
    if (validatedData.include_forecast) {
      results.forecast = await weatherService.getWeatherForecast(
        validatedData.latitude,
        validatedData.longitude
      )
    }

    // Get extreme weather analysis
    results.extreme_weather = await weatherService.getExtremeWeatherAnalysis(
      validatedData.latitude,
      validatedData.longitude
    )

    return NextResponse.json({
      success: true,
      data: results,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Weather service error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch weather data' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const lat = searchParams.get('lat')
  const lon = searchParams.get('lon')

  if (!lat || !lon) {
    return NextResponse.json(
      { success: false, error: 'Latitude and longitude are required' },
      { status: 400 }
    )
  }

  try {
    const weather = await weatherService.getCurrentWeather(
      parseFloat(lat),
      parseFloat(lon)
    )

    return NextResponse.json({
      success: true,
      data: weather,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Weather GET error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch weather data' },
      { status: 500 }
    )
  }
}
