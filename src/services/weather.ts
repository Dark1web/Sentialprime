import { config } from '@/lib/config';
import { WeatherData } from '@/types';

export class WeatherService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = config.apis.openWeatherMapKey;
    this.baseUrl = 'https://api.openweathermap.org/data/2.5';
  }

  async getCurrentWeather(lat: number, lng: number): Promise<WeatherData> {
    try {
      if (!this.apiKey) {
        return this.getMockWeatherData(lat, lng);
      }

      const response = await fetch(
        `${this.baseUrl}/weather?lat=${lat}&lon=${lng}&appid=${this.apiKey}&units=metric`
      );

      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`);
      }

      const data = await response.json();
      
      return this.transformWeatherData(data, lat, lng);
    } catch (error) {
      console.error('Weather service error:', error);
      return this.getMockWeatherData(lat, lng);
    }
  }

  async getWeatherForecast(lat: number, lng: number, days: number = 5): Promise<WeatherData> {
    try {
      if (!this.apiKey) {
        return this.getMockWeatherData(lat, lng, true);
      }

      const response = await fetch(
        `${this.baseUrl}/forecast?lat=${lat}&lon=${lng}&appid=${this.apiKey}&units=metric&cnt=${days * 8}` // 8 forecasts per day (3-hour intervals)
      );

      if (!response.ok) {
        throw new Error(`Weather forecast API error: ${response.status}`);
      }

      const data = await response.json();
      
      return this.transformForecastData(data, lat, lng);
    } catch (error) {
      console.error('Weather forecast error:', error);
      return this.getMockWeatherData(lat, lng, true);
    }
  }

  async getWeatherAlerts(lat: number, lng: number): Promise<any[]> {
    try {
      if (!this.apiKey) {
        return this.getMockWeatherAlerts();
      }

      // OpenWeatherMap One Call API for alerts (requires different endpoint)
      const response = await fetch(
        `${this.baseUrl}/onecall?lat=${lat}&lon=${lng}&appid=${this.apiKey}&exclude=minutely,hourly`
      );

      if (!response.ok) {
        return this.getMockWeatherAlerts();
      }

      const data = await response.json();
      return data.alerts || [];
    } catch (error) {
      console.error('Weather alerts error:', error);
      return this.getMockWeatherAlerts();
    }
  }

  async checkExtremeWeather(lat: number, lng: number): Promise<any> {
    try {
      const weather = await this.getCurrentWeather(lat, lng);
      const alerts = await this.getWeatherAlerts(lat, lng);

      const riskLevel = this.calculateRiskLevel(weather, alerts);
      
      return {
        risk_level: riskLevel.level,
        conditions: riskLevel.conditions,
        recommendations: riskLevel.recommendations,
        alerts: alerts.length,
        temperature_risk: weather.current.temperature > 40 || weather.current.temperature < 0,
        wind_risk: weather.current.wind_speed > 50,
        humidity_risk: weather.current.humidity > 90
      };
    } catch (error) {
      console.error('Extreme weather check error:', error);
      return {
        risk_level: 'UNKNOWN',
        conditions: ['Unable to assess weather conditions'],
        recommendations: ['Monitor local weather reports'],
        alerts: 0
      };
    }
  }

  private transformWeatherData(data: any, lat: number, lng: number): WeatherData {
    return {
      location: { lat, lng, location_name: data.name },
      current: {
        temperature: Math.round(data.main.temp),
        humidity: data.main.humidity,
        pressure: data.main.pressure,
        wind_speed: Math.round(data.wind?.speed * 3.6) || 0, // Convert m/s to km/h
        wind_direction: data.wind?.deg || 0,
        visibility: data.visibility ? Math.round(data.visibility / 1000) : 10, // Convert to km
        uv_index: 0, // Not available in current weather API
        condition: data.weather[0]?.description || 'Unknown',
        icon: data.weather[0]?.icon || '01d'
      }
    };
  }

  private transformForecastData(data: any, lat: number, lng: number): WeatherData {
    const current = data.list[0];
    const forecast = data.list.slice(0, 40).filter((_: any, index: number) => index % 8 === 0).map((item: any) => ({
      date: new Date(item.dt * 1000).toISOString().split('T')[0],
      temperature_min: Math.round(item.main.temp_min),
      temperature_max: Math.round(item.main.temp_max),
      condition: item.weather[0]?.description || 'Unknown',
      precipitation_probability: Math.round((item.pop || 0) * 100)
    }));

    return {
      location: { lat, lng, location_name: data.city?.name },
      current: {
        temperature: Math.round(current.main.temp),
        humidity: current.main.humidity,
        pressure: current.main.pressure,
        wind_speed: Math.round(current.wind?.speed * 3.6) || 0,
        wind_direction: current.wind?.deg || 0,
        visibility: 10,
        uv_index: 0,
        condition: current.weather[0]?.description || 'Unknown',
        icon: current.weather[0]?.icon || '01d'
      },
      forecast
    };
  }

  private calculateRiskLevel(weather: WeatherData, alerts: any[]): any {
    let riskScore = 0;
    const conditions: string[] = [];
    const recommendations: string[] = [];

    // Temperature risks
    if (weather.current.temperature > 40) {
      riskScore += 3;
      conditions.push('Extreme heat');
      recommendations.push('Stay indoors, stay hydrated');
    } else if (weather.current.temperature < 0) {
      riskScore += 2;
      conditions.push('Freezing temperatures');
      recommendations.push('Dress warmly, avoid prolonged outdoor exposure');
    }

    // Wind risks
    if (weather.current.wind_speed > 50) {
      riskScore += 3;
      conditions.push('High winds');
      recommendations.push('Avoid outdoor activities, secure loose objects');
    }

    // Humidity risks
    if (weather.current.humidity > 90) {
      riskScore += 1;
      conditions.push('High humidity');
      recommendations.push('Stay cool and hydrated');
    }

    // Alert-based risks
    riskScore += alerts.length * 2;

    let level: string;
    if (riskScore >= 6) level = 'CRITICAL';
    else if (riskScore >= 4) level = 'HIGH';
    else if (riskScore >= 2) level = 'MEDIUM';
    else level = 'LOW';

    if (conditions.length === 0) {
      conditions.push('Normal weather conditions');
      recommendations.push('No special precautions needed');
    }

    return { level, conditions, recommendations };
  }

  private getMockWeatherData(lat: number, lng: number, includeForecast: boolean = false): WeatherData {
    const mockData: WeatherData = {
      location: { lat, lng, location_name: 'Mock Location' },
      current: {
        temperature: 25 + Math.round(Math.random() * 10),
        humidity: 60 + Math.round(Math.random() * 30),
        pressure: 1013 + Math.round(Math.random() * 20 - 10),
        wind_speed: Math.round(Math.random() * 20),
        wind_direction: Math.round(Math.random() * 360),
        visibility: 10,
        uv_index: Math.round(Math.random() * 10),
        condition: 'Partly cloudy',
        icon: '02d'
      }
    };

    if (includeForecast) {
      mockData.forecast = Array.from({ length: 5 }, (_, i) => ({
        date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        temperature_min: 20 + Math.round(Math.random() * 5),
        temperature_max: 30 + Math.round(Math.random() * 10),
        condition: ['Sunny', 'Partly cloudy', 'Cloudy', 'Light rain'][Math.floor(Math.random() * 4)],
        precipitation_probability: Math.round(Math.random() * 100)
      }));
    }

    return mockData;
  }

  private getMockWeatherAlerts(): any[] {
    return [
      {
        title: 'Heat Wave Warning',
        description: 'High temperatures expected for the next 3 days',
        severity: 'MODERATE',
        start_time: new Date().toISOString(),
        end_time: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];
  }
}

export const weatherService = new WeatherService();
