import { POST } from '@/app/api/misinformation/analyze/route';
import { NextRequest } from 'next/server';

// Mock the misinformation service
jest.mock('@/services/misinformation', () => ({
  MisinformationService: jest.fn().mockImplementation(() => ({
    analyze: jest.fn()
  }))
}));

describe('/api/misinformation/analyze', () => {
  let mockAnalyze: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    const { MisinformationService } = require('@/services/misinformation');
    const mockInstance = new MisinformationService();
    mockAnalyze = mockInstance.analyze;
  });

  it('should analyze text for misinformation successfully', async () => {
    const mockResponse = {
      is_fake: false,
      confidence: 0.85,
      panic_score: 0.2,
      emotional_tone: 'neutral',
      reasoning: 'Content appears legitimate based on language patterns.',
      red_flags: [],
      verification_sources: []
    };

    mockAnalyze.mockResolvedValue(mockResponse);

    const requestBody = {
      text: 'Local authorities have issued a flood warning for the downtown area. Residents are advised to move to higher ground.',
      source: 'news',
      location: 'Downtown Area'
    };

    const request = new NextRequest('http://localhost:3000/api/misinformation/analyze', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toHaveProperty('analysis');
    expect(data.data.analysis.is_fake).toBe(false);
    expect(data.data.analysis.confidence).toBe(0.85);
    expect(mockAnalyze).toHaveBeenCalledWith(requestBody.text);
  });

  it('should detect misinformation with high panic score', async () => {
    const mockResponse = {
      is_fake: true,
      confidence: 0.92,
      panic_score: 0.8,
      emotional_tone: 'fear',
      reasoning: 'Contains multiple misinformation indicators and panic-inducing language.',
      red_flags: ['Excessive use of capital letters', 'Unverified claims', 'Panic-inducing language'],
      verification_sources: []
    };

    mockAnalyze.mockResolvedValue(mockResponse);

    const requestBody = {
      text: 'BREAKING: GOVERNMENT HIDING MASSIVE EARTHQUAKE! EVERYONE MUST EVACUATE NOW OR DIE! SHARE IMMEDIATELY!',
      source: 'social_media'
    };

    const request = new NextRequest('http://localhost:3000/api/misinformation/analyze', {
      method: 'POST',
      body: JSON.stringify(requestBody)
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data.analysis.is_fake).toBe(true);
    expect(data.data.analysis.panic_score).toBeGreaterThan(0.7);
    expect(data.data.analysis.red_flags.length).toBeGreaterThan(0);
  });

  it('should handle missing text parameter', async () => {
    const requestBody = {
      source: 'news'
      // Missing 'text' field
    };

    const request = new NextRequest('http://localhost:3000/api/misinformation/analyze', {
      method: 'POST',
      body: JSON.stringify(requestBody)
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toContain('Validation error');
  });

  it('should handle empty text', async () => {
    const requestBody = {
      text: '',
      source: 'news'
    };

    const request = new NextRequest('http://localhost:3000/api/misinformation/analyze', {
      method: 'POST',
      body: JSON.stringify(requestBody)
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toContain('Validation error');
  });

  it('should handle service errors gracefully', async () => {
    mockAnalyze.mockRejectedValue(new Error('Service unavailable'));

    const requestBody = {
      text: 'Test message for analysis',
      source: 'news'
    };

    const request = new NextRequest('http://localhost:3000/api/misinformation/analyze', {
      method: 'POST',
      body: JSON.stringify(requestBody)
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error).toContain('Failed to analyze content');
  });

  it('should include metadata in response', async () => {
    const mockResponse = {
      is_fake: false,
      confidence: 0.75,
      panic_score: 0.1,
      emotional_tone: 'neutral',
      reasoning: 'Standard analysis',
      red_flags: [],
      verification_sources: []
    };

    mockAnalyze.mockResolvedValue(mockResponse);

    const requestBody = {
      text: 'Weather update: Light rain expected this afternoon.',
      source: 'weather_service',
      location: 'City Center'
    };

    const request = new NextRequest('http://localhost:3000/api/misinformation/analyze', {
      method: 'POST',
      body: JSON.stringify(requestBody)
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data).toHaveProperty('original_text');
    expect(data.data).toHaveProperty('source');
    expect(data.data).toHaveProperty('location');
    expect(data.data).toHaveProperty('analyzed_at');
    expect(data.data.original_text).toBe(requestBody.text);
    expect(data.data.source).toBe(requestBody.source);
    expect(data.data.location).toBe(requestBody.location);
  });

  it('should handle batch analysis', async () => {
    const mockResponse = {
      is_fake: false,
      confidence: 0.8,
      panic_score: 0.15,
      emotional_tone: 'neutral',
      reasoning: 'Batch analysis completed',
      red_flags: [],
      verification_sources: []
    };

    mockAnalyze.mockResolvedValue(mockResponse);

    const requestBody = {
      texts: [
        'First message to analyze',
        'Second message to analyze',
        'Third message to analyze'
      ],
      source: 'social_media'
    };

    const request = new NextRequest('http://localhost:3000/api/misinformation/analyze', {
      method: 'POST',
      body: JSON.stringify(requestBody)
    });

    const response = await POST(request);
    const data = await response.json();

    // Should handle batch analysis or return appropriate error
    expect(response.status).toBeOneOf([200, 400]);
    
    if (response.status === 200) {
      expect(data.data).toHaveProperty('results');
      expect(Array.isArray(data.data.results)).toBe(true);
    }
  });
});
