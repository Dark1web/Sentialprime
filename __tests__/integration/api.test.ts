/**
 * Integration tests for SentinelX Next.js API endpoints
 * These tests verify that the migrated API endpoints work correctly
 */

import { NextRequest } from 'next/server';

// Import API route handlers
import { GET as healthGet } from '@/app/api/health/route';
import { GET as rootGet } from '@/app/api/route';
import { POST as misinformationPost } from '@/app/api/misinformation/analyze/route';
import { POST as triagePost } from '@/app/api/triage/classify/route';
import { GET as newsGet } from '@/app/api/live/news/disaster-feed/route';
import { GET as weatherGet } from '@/app/api/live/weather/current/route';

// Mock external services
jest.mock('@/services/weather');
jest.mock('@/services/news');
jest.mock('@/services/misinformation');
jest.mock('@/services/triage');
jest.mock('@/lib/database');

describe('SentinelX API Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Core API Endpoints', () => {
    it('should return system information from root endpoint', async () => {
      const request = new NextRequest('http://localhost:3000/api');
      const response = await rootGet(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('message');
      expect(data.data).toHaveProperty('version');
      expect(data.data).toHaveProperty('backend');
      expect(data.data).toHaveProperty('endpoints');
      expect(data.data.message).toContain('SentinelX API');
      expect(data.data.backend).toBe('nextjs');
      expect(data.data.version).toBe('2.0.0');
    });

    it('should return health status', async () => {
      const request = new NextRequest('http://localhost:3000/api/health');
      const response = await healthGet(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('status');
      expect(data.data).toHaveProperty('services');
      expect(data.data).toHaveProperty('timestamp');
      expect(['healthy', 'degraded']).toContain(data.data.status);
    });
  });

  describe('AI & Analysis Endpoints', () => {
    it('should analyze misinformation successfully', async () => {
      // Mock the misinformation service
      const { MisinformationService } = require('@/services/misinformation');
      const mockInstance = {
        analyze: jest.fn().mockResolvedValue({
          is_fake: false,
          confidence: 0.85,
          panic_score: 0.2,
          emotional_tone: 'neutral',
          reasoning: 'Content appears legitimate',
          red_flags: [],
          verification_sources: []
        })
      };
      MisinformationService.mockImplementation(() => mockInstance);

      const requestBody = {
        text: 'Local authorities have issued a flood warning for downtown area.',
        source: 'news'
      };

      const request = new NextRequest('http://localhost:3000/api/misinformation/analyze', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await misinformationPost(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('analysis');
      expect(data.data.analysis.is_fake).toBe(false);
      expect(data.data.analysis.confidence).toBe(0.85);
    });

    it('should classify emergency triage request', async () => {
      // Mock the triage service
      const { triageClassifier } = require('@/services/triage');
      triageClassifier.classifyRequest.mockResolvedValue({
        urgency_score: 0.8,
        triage_level: 'high',
        resource_required: ['medical'],
        estimated_response_time: '15-30 minutes',
        keywords_detected: ['chest pain'],
        medical_emergency: true,
        life_threatening: false,
        explanation: 'High priority medical emergency',
        recommended_actions: ['Dispatch medical team'],
        analyzed_at: new Date().toISOString()
      });

      const requestBody = {
        message: 'I am having severe chest pain and need help immediately.',
        location: '123 Main Street',
        contact_info: { phone: '+1-555-0123' }
      };

      const request = new NextRequest('http://localhost:3000/api/triage/classify', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await triagePost(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('classification');
      expect(data.data.classification.triage_level).toBe('high');
      expect(data.data.classification.medical_emergency).toBe(true);
    });
  });

  describe('Live Data Endpoints', () => {
    it('should fetch disaster news feed', async () => {
      // Mock the news service
      const { newsService } = require('@/services/news');
      newsService.fetchDisasterNews = jest.fn().mockResolvedValue([
        {
          title: 'Flood Warning Issued',
          description: 'Heavy rainfall expected',
          url: 'https://example.com/news1',
          source: 'News Agency',
          published_at: new Date().toISOString(),
          api_source: 'newsapi',
          disaster_related: true,
          credibility_score: 0.9
        }
      ]);

      const request = new NextRequest('http://localhost:3000/api/live/news/disaster-feed?limit=10');
      const response = await newsGet(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('articles');
      expect(data.data).toHaveProperty('total');
      expect(data.data).toHaveProperty('sources');
      expect(Array.isArray(data.data.articles)).toBe(true);
      expect(data.data.articles.length).toBeGreaterThan(0);
    });

    it('should fetch current weather data', async () => {
      // Mock the weather service
      const { weatherService } = require('@/services/weather');
      weatherService.getCurrentWeather = jest.fn().mockResolvedValue({
        location: { lat: 28.6139, lng: 77.2090, location_name: 'Delhi' },
        current: {
          temperature: 25,
          humidity: 65,
          pressure: 1013,
          wind_speed: 10,
          wind_direction: 180,
          visibility: 10,
          uv_index: 5,
          condition: 'partly cloudy',
          icon: '02d'
        }
      });
      weatherService.getWeatherAlerts = jest.fn().mockResolvedValue([]);
      weatherService.checkExtremeWeather = jest.fn().mockResolvedValue({
        risk_level: 'LOW',
        conditions: ['Normal weather conditions'],
        recommendations: ['No special precautions needed']
      });

      const requestBody = {
        lat: 28.6139,
        lng: 77.2090,
        location_name: 'Delhi'
      };

      const request = new NextRequest('http://localhost:3000/api/live/weather/current', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await weatherGet(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('weather');
      expect(data.data).toHaveProperty('alerts');
      expect(data.data).toHaveProperty('extreme_weather');
      expect(data.data.weather.current.temperature).toBe(25);
    });
  });

  describe('Error Handling', () => {
    it('should handle validation errors properly', async () => {
      const requestBody = {
        // Missing required 'text' field
        source: 'news'
      };

      const request = new NextRequest('http://localhost:3000/api/misinformation/analyze', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await misinformationPost(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Validation error');
    });

    it('should handle service errors gracefully', async () => {
      // Mock service to throw error
      const { triageClassifier } = require('@/services/triage');
      triageClassifier.classifyRequest.mockRejectedValue(new Error('Service unavailable'));

      const requestBody = {
        message: 'Test emergency message',
        location: 'Test location'
      };

      const request = new NextRequest('http://localhost:3000/api/triage/classify', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await triagePost(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Failed to classify emergency request');
    });

    it('should handle malformed JSON requests', async () => {
      const request = new NextRequest('http://localhost:3000/api/misinformation/analyze', {
        method: 'POST',
        body: 'invalid json',
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await misinformationPost(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });
  });

  describe('CORS Support', () => {
    it('should handle OPTIONS requests for CORS', async () => {
      const request = new NextRequest('http://localhost:3000/api/misinformation/analyze', {
        method: 'OPTIONS'
      });

      // Import OPTIONS handler
      const { OPTIONS } = require('@/app/api/misinformation/analyze/route');
      const response = await OPTIONS(request);

      expect(response.status).toBe(200);
      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
      expect(response.headers.get('Access-Control-Allow-Methods')).toContain('POST');
    });
  });

  describe('Response Format Consistency', () => {
    it('should return consistent response format across endpoints', async () => {
      const request = new NextRequest('http://localhost:3000/api/health');
      const response = await healthGet(request);
      const data = await response.json();

      // All responses should have these fields
      expect(data).toHaveProperty('success');
      expect(data).toHaveProperty('timestamp');
      expect(typeof data.success).toBe('boolean');
      expect(typeof data.timestamp).toBe('string');

      if (data.success) {
        expect(data).toHaveProperty('data');
      } else {
        expect(data).toHaveProperty('error');
      }
    });
  });
});
