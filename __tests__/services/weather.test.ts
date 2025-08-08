import { WeatherService } from '@/services/weather';

// Mock fetch globally
global.fetch = jest.fn();

describe('WeatherService', () => {
  let weatherService: WeatherService;
  const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

  beforeEach(() => {
    weatherService = new WeatherService();
    jest.clearAllMocks();
  });

  describe('getCurrentWeather', () => {
    it('should fetch current weather data successfully', async () => {
      const mockWeatherData = {
        main: {
          temp: 25.5,
          humidity: 65,
          pressure: 1013
        },
        wind: {
          speed: 3.5,
          deg: 180
        },
        weather: [{
          description: 'partly cloudy',
          icon: '02d'
        }],
        visibility: 10000,
        name: 'Test City'
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockWeatherData
      } as Response);

      const result = await weatherService.getCurrentWeather(28.6139, 77.2090);

      expect(result).toHaveProperty('location');
      expect(result).toHaveProperty('current');
      expect(result.location.lat).toBe(28.6139);
      expect(result.location.lng).toBe(77.2090);
      expect(result.current.temperature).toBe(26); // Rounded
      expect(result.current.humidity).toBe(65);
      expect(result.current.condition).toBe('partly cloudy');
    });

    it('should return mock data when API key is not configured', async () => {
      // Create service without API key
      const serviceWithoutKey = new (class extends WeatherService {
        constructor() {
          super();
          (this as any).apiKey = '';
        }
      })();

      const result = await serviceWithoutKey.getCurrentWeather(28.6139, 77.2090);

      expect(result).toHaveProperty('location');
      expect(result).toHaveProperty('current');
      expect(result.location.lat).toBe(28.6139);
      expect(result.location.lng).toBe(77.2090);
      expect(result.current.temperature).toBeGreaterThan(0);
    });

    it('should handle API errors gracefully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401
      } as Response);

      const result = await weatherService.getCurrentWeather(28.6139, 77.2090);

      // Should return mock data on error
      expect(result).toHaveProperty('location');
      expect(result).toHaveProperty('current');
      expect(result.location.lat).toBe(28.6139);
      expect(result.location.lng).toBe(77.2090);
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await weatherService.getCurrentWeather(28.6139, 77.2090);

      // Should return mock data on network error
      expect(result).toHaveProperty('location');
      expect(result).toHaveProperty('current');
    });
  });

  describe('getWeatherForecast', () => {
    it('should fetch weather forecast successfully', async () => {
      const mockForecastData = {
        city: {
          name: 'Test City'
        },
        list: [
          {
            dt: Date.now() / 1000,
            main: {
              temp: 25,
              temp_min: 20,
              temp_max: 30,
              humidity: 60,
              pressure: 1015
            },
            weather: [{
              description: 'sunny',
              icon: '01d'
            }],
            wind: {
              speed: 2.5,
              deg: 90
            },
            pop: 0.1
          }
        ]
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockForecastData
      } as Response);

      const result = await weatherService.getWeatherForecast(28.6139, 77.2090, 5);

      expect(result).toHaveProperty('location');
      expect(result).toHaveProperty('current');
      expect(result).toHaveProperty('forecast');
      expect(Array.isArray(result.forecast)).toBe(true);
      expect(result.forecast!.length).toBeGreaterThan(0);
    });

    it('should return mock forecast when API fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500
      } as Response);

      const result = await weatherService.getWeatherForecast(28.6139, 77.2090);

      expect(result).toHaveProperty('forecast');
      expect(Array.isArray(result.forecast)).toBe(true);
      expect(result.forecast!.length).toBe(5); // Default 5-day forecast
    });
  });

  describe('getWeatherAlerts', () => {
    it('should fetch weather alerts successfully', async () => {
      const mockAlertsData = {
        alerts: [
          {
            title: 'Heat Wave Warning',
            description: 'High temperatures expected',
            severity: 'MODERATE',
            start_time: new Date().toISOString(),
            end_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
          }
        ]
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockAlertsData
      } as Response);

      const result = await weatherService.getWeatherAlerts(28.6139, 77.2090);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('title');
      expect(result[0]).toHaveProperty('description');
    });

    it('should return empty array when no alerts', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ alerts: [] })
      } as Response);

      const result = await weatherService.getWeatherAlerts(28.6139, 77.2090);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
    });

    it('should return mock alerts on API failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404
      } as Response);

      const result = await weatherService.getWeatherAlerts(28.6139, 77.2090);

      expect(Array.isArray(result)).toBe(true);
      // Should return mock alerts
    });
  });

  describe('checkExtremeWeather', () => {
    it('should assess extreme weather conditions', async () => {
      // Mock getCurrentWeather and getWeatherAlerts
      const mockWeatherData = {
        location: { lat: 28.6139, lng: 77.2090 },
        current: {
          temperature: 45, // Extreme heat
          humidity: 95,    // High humidity
          pressure: 1013,
          wind_speed: 60,  // High wind
          wind_direction: 180,
          visibility: 10,
          uv_index: 0,
          condition: 'extreme heat',
          icon: '01d'
        }
      };

      const mockAlerts = [
        {
          title: 'Extreme Heat Warning',
          severity: 'HIGH'
        }
      ];

      // Mock the methods
      jest.spyOn(weatherService, 'getCurrentWeather').mockResolvedValue(mockWeatherData);
      jest.spyOn(weatherService, 'getWeatherAlerts').mockResolvedValue(mockAlerts);

      const result = await weatherService.checkExtremeWeather(28.6139, 77.2090);

      expect(result).toHaveProperty('risk_level');
      expect(result).toHaveProperty('conditions');
      expect(result).toHaveProperty('recommendations');
      expect(result.risk_level).toBe('CRITICAL'); // Should be critical due to extreme conditions
      expect(result.temperature_risk).toBe(true);
      expect(result.wind_risk).toBe(true);
      expect(result.humidity_risk).toBe(true);
    });

    it('should return low risk for normal conditions', async () => {
      const mockWeatherData = {
        location: { lat: 28.6139, lng: 77.2090 },
        current: {
          temperature: 25,  // Normal temperature
          humidity: 60,     // Normal humidity
          pressure: 1013,
          wind_speed: 10,   // Normal wind
          wind_direction: 180,
          visibility: 10,
          uv_index: 0,
          condition: 'partly cloudy',
          icon: '02d'
        }
      };

      jest.spyOn(weatherService, 'getCurrentWeather').mockResolvedValue(mockWeatherData);
      jest.spyOn(weatherService, 'getWeatherAlerts').mockResolvedValue([]);

      const result = await weatherService.checkExtremeWeather(28.6139, 77.2090);

      expect(result.risk_level).toBe('LOW');
      expect(result.temperature_risk).toBe(false);
      expect(result.wind_risk).toBe(false);
      expect(result.humidity_risk).toBe(false);
    });

    it('should handle service errors gracefully', async () => {
      jest.spyOn(weatherService, 'getCurrentWeather').mockRejectedValue(new Error('Service error'));
      jest.spyOn(weatherService, 'getWeatherAlerts').mockRejectedValue(new Error('Service error'));

      const result = await weatherService.checkExtremeWeather(28.6139, 77.2090);

      expect(result).toHaveProperty('risk_level');
      expect(result.risk_level).toBe('UNKNOWN');
      expect(result.conditions).toContain('Unable to assess weather conditions');
    });
  });
});
