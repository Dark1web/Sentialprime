import axios from 'axios';
import { apiService } from '../api';

// Mock axios
jest.mock('axios');
const mockedAxios = axios;

describe('API Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Misinformation API', () => {
    test('analyzes misinformation successfully', async () => {
      const mockResponse = {
        data: {
          is_fake: true,
          panic_score: 0.8,
          confidence: 0.95,
          analysis: 'High panic content detected'
        }
      };

      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      const testText = 'BREAKING: Dam burst in Rajasthan! Massive flooding!';
      const result = await apiService.analyzeMisinformation(testText);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        '/api/misinformation/analyze',
        { text: testText }
      );
      expect(result.is_fake).toBe(true);
      expect(result.panic_score).toBe(0.8);
    });

    test('handles API errors gracefully', async () => {
      mockedAxios.post.mockRejectedValueOnce(new Error('Network error'));

      await expect(
        apiService.analyzeMisinformation('test text')
      ).rejects.toThrow('Network error');
    });
  });

  describe('Triage API', () => {
    test('classifies emergency requests', async () => {
      const mockResponse = {
        data: {
          priority: 'high',
          category: 'flood',
          estimated_response_time: '15 minutes',
          confidence: 0.92
        }
      };

      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      const request = {
        text: 'My house is flooding and I need immediate help',
        location: { lat: 26.9124, lng: 75.7873 }
      };

      const result = await apiService.classifyEmergency(request);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        '/api/triage/classify',
        request
      );
      expect(result.priority).toBe('high');
      expect(result.category).toBe('flood');
    });
  });

  describe('Network Status API', () => {
    test('fetches network outages', async () => {
      const mockResponse = {
        data: {
          outages: [
            {
              location: { lat: 26.9124, lng: 75.7873 },
              severity: 'high',
              affected_users: 1500,
              status: 'active'
            }
          ],
          last_updated: '2025-01-03T10:30:00Z'
        }
      };

      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      const result = await apiService.getNetworkOutages();

      expect(mockedAxios.get).toHaveBeenCalledWith('/api/network/outages');
      expect(result.outages).toHaveLength(1);
      expect(result.outages[0].severity).toBe('high');
    });
  });

  describe('Fact Check API', () => {
    test('fact checks claims', async () => {
      const mockResponse = {
        data: {
          claim: 'Is the heatwave getting worse?',
          verdict: 'partially_true',
          confidence: 0.78,
          sources: ['reliable-weather-source.com'],
          explanation: 'Temperature trends show mixed results...'
        }
      };

      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      const claim = 'Is the heatwave getting worse?';
      const result = await apiService.factCheck(claim);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        '/api/factcheck',
        { claim }
      );
      expect(result.verdict).toBe('partially_true');
      expect(result.sources).toContain('reliable-weather-source.com');
    });
  });

  describe('Navigation API', () => {
    test('fetches safe zones', async () => {
      const mockResponse = {
        data: {
          safe_zones: [
            {
              id: 1,
              name: 'Central Community Center',
              location: { lat: 37.7749, lng: -122.4194 },
              capacity: 500,
              facilities: ['shelter', 'food', 'medical']
            }
          ]
        }
      };

      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      const location = { lat: 37.7749, lng: -122.4194 };
      const result = await apiService.getSafeZones(location);

      expect(mockedAxios.get).toHaveBeenCalledWith(
        '/api/navigation/safezones',
        { params: location }
      );
      expect(result.safe_zones).toHaveLength(1);
      expect(result.safe_zones[0].name).toBe('Central Community Center');
    });
  });

  describe('Live Data API', () => {
    test('fetches disaster news', async () => {
      const mockResponse = {
        data: {
          articles: [
            {
              title: 'Flood Warning Issued',
              summary: 'Heavy rainfall expected...',
              source: 'Weather Service',
              timestamp: '2025-01-03T10:00:00Z',
              severity: 'moderate'
            }
          ]
        }
      };

      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      const result = await apiService.getDisasterNews();

      expect(mockedAxios.get).toHaveBeenCalledWith('/api/live/news/disaster-feed');
      expect(result.articles).toHaveLength(1);
      expect(result.articles[0].title).toBe('Flood Warning Issued');
    });

    test('fetches current weather', async () => {
      const mockResponse = {
        data: {
          location: 'Jaipur, India',
          temperature: 35,
          condition: 'Clear',
          humidity: 45,
          wind_speed: 12,
          alerts: []
        }
      };

      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      const location = { lat: 26.9124, lng: 75.7873 };
      const result = await apiService.getCurrentWeather(location);

      expect(mockedAxios.get).toHaveBeenCalledWith(
        '/api/live/weather/current',
        { params: location }
      );
      expect(result.temperature).toBe(35);
      expect(result.location).toBe('Jaipur, India');
    });
  });
});