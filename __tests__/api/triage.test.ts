import { POST } from '@/app/api/triage/classify/route';
import { NextRequest } from 'next/server';

// Mock the triage service
jest.mock('@/services/triage', () => ({
  triageClassifier: {
    classifyRequest: jest.fn()
  }
}));

describe('/api/triage/classify', () => {
  let mockClassifyRequest: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    const { triageClassifier } = require('@/services/triage');
    mockClassifyRequest = triageClassifier.classifyRequest;
  });

  it('should classify emergency request successfully', async () => {
    const mockResponse = {
      urgency_score: 0.8,
      triage_level: 'high',
      resource_required: ['medical', 'ambulance'],
      estimated_response_time: '15-30 minutes',
      keywords_detected: ['chest pain', 'difficulty breathing'],
      medical_emergency: true,
      life_threatening: false,
      explanation: 'High priority medical emergency requiring immediate attention.',
      recommended_actions: ['Dispatch medical team', 'Prepare for transport'],
      analyzed_at: new Date().toISOString()
    };

    mockClassifyRequest.mockResolvedValue(mockResponse);

    const requestBody = {
      message: 'I am having severe chest pain and difficulty breathing. Please send help immediately.',
      location: '123 Main Street, Downtown',
      contact_info: {
        phone: '+1-555-0123',
        name: 'John Doe'
      }
    };

    const request = new NextRequest('http://localhost:3000/api/triage/classify', {
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
    expect(data.data).toHaveProperty('classification');
    expect(data.data.classification.triage_level).toBe('high');
    expect(data.data.classification.medical_emergency).toBe(true);
    expect(mockClassifyRequest).toHaveBeenCalledWith(
      requestBody.message,
      requestBody.location,
      undefined
    );
  });

  it('should classify critical life-threatening emergency', async () => {
    const mockResponse = {
      urgency_score: 1.0,
      triage_level: 'critical',
      resource_required: ['medical', 'ambulance', 'hospital'],
      estimated_response_time: 'immediate',
      keywords_detected: ['not breathing', 'unconscious', 'cardiac arrest'],
      medical_emergency: true,
      life_threatening: true,
      explanation: 'Critical life-threatening emergency requiring immediate response.',
      recommended_actions: ['Dispatch emergency services immediately', 'Alert receiving hospital', 'Prepare for critical care'],
      analyzed_at: new Date().toISOString()
    };

    mockClassifyRequest.mockResolvedValue(mockResponse);

    const requestBody = {
      message: 'Person is not breathing and unconscious. Possible cardiac arrest. Need immediate help!',
      location: 'Central Park, near the fountain',
      contact_info: {
        phone: '+1-555-0456'
      }
    };

    const request = new NextRequest('http://localhost:3000/api/triage/classify', {
      method: 'POST',
      body: JSON.stringify(requestBody)
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data.classification.triage_level).toBe('critical');
    expect(data.data.classification.life_threatening).toBe(true);
    expect(data.data.classification.estimated_response_time).toBe('immediate');
  });

  it('should classify low priority request', async () => {
    const mockResponse = {
      urgency_score: 0.3,
      triage_level: 'low',
      resource_required: ['medical'],
      estimated_response_time: '1-4 hours',
      keywords_detected: ['minor cut', 'bandage'],
      medical_emergency: false,
      life_threatening: false,
      explanation: 'Low priority request for minor medical attention.',
      recommended_actions: ['Add to response queue', 'Provide first aid guidance'],
      analyzed_at: new Date().toISOString()
    };

    mockClassifyRequest.mockResolvedValue(mockResponse);

    const requestBody = {
      message: 'I have a small cut on my finger and need a bandage. Not urgent.',
      location: 'Home',
      contact_info: {
        phone: '+1-555-0789'
      }
    };

    const request = new NextRequest('http://localhost:3000/api/triage/classify', {
      method: 'POST',
      body: JSON.stringify(requestBody)
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data.classification.triage_level).toBe('low');
    expect(data.data.classification.life_threatening).toBe(false);
    expect(data.data.classification.urgency_score).toBeLessThan(0.5);
  });

  it('should handle missing message parameter', async () => {
    const requestBody = {
      location: '123 Main Street'
      // Missing 'message' field
    };

    const request = new NextRequest('http://localhost:3000/api/triage/classify', {
      method: 'POST',
      body: JSON.stringify(requestBody)
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toContain('Validation error');
  });

  it('should handle empty message', async () => {
    const requestBody = {
      message: '',
      location: '123 Main Street'
    };

    const request = new NextRequest('http://localhost:3000/api/triage/classify', {
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
    mockClassifyRequest.mockRejectedValue(new Error('Classification service unavailable'));

    const requestBody = {
      message: 'Need help with medical emergency',
      location: 'Hospital parking lot'
    };

    const request = new NextRequest('http://localhost:3000/api/triage/classify', {
      method: 'POST',
      body: JSON.stringify(requestBody)
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error).toContain('Failed to classify emergency request');
  });

  it('should include request metadata in response', async () => {
    const mockResponse = {
      urgency_score: 0.6,
      triage_level: 'medium',
      resource_required: ['medical'],
      estimated_response_time: '30-60 minutes',
      keywords_detected: ['injured', 'help'],
      medical_emergency: true,
      life_threatening: false,
      explanation: 'Medium priority medical request.',
      recommended_actions: ['Schedule urgent response'],
      analyzed_at: new Date().toISOString()
    };

    mockClassifyRequest.mockResolvedValue(mockResponse);

    const requestBody = {
      message: 'I am injured and need medical help',
      location: 'Shopping mall, second floor',
      contact_info: {
        phone: '+1-555-0321',
        name: 'Jane Smith'
      },
      additional_info: 'Near the food court'
    };

    const request = new NextRequest('http://localhost:3000/api/triage/classify', {
      method: 'POST',
      body: JSON.stringify(requestBody)
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data).toHaveProperty('original_message');
    expect(data.data).toHaveProperty('location');
    expect(data.data).toHaveProperty('contact_info');
    expect(data.data).toHaveProperty('classified_at');
    expect(data.data.original_message).toBe(requestBody.message);
    expect(data.data.location).toBe(requestBody.location);
    expect(data.data.contact_info).toEqual(requestBody.contact_info);
  });

  it('should handle non-medical emergencies', async () => {
    const mockResponse = {
      urgency_score: 0.7,
      triage_level: 'high',
      resource_required: ['fire', 'evacuation'],
      estimated_response_time: '10-15 minutes',
      keywords_detected: ['fire', 'smoke', 'building'],
      medical_emergency: false,
      life_threatening: true,
      explanation: 'Fire emergency requiring immediate evacuation and fire department response.',
      recommended_actions: ['Alert fire department', 'Initiate evacuation procedures'],
      analyzed_at: new Date().toISOString()
    };

    mockClassifyRequest.mockResolvedValue(mockResponse);

    const requestBody = {
      message: 'There is a fire in the building with heavy smoke. People need to evacuate immediately.',
      location: 'Office building, 5th floor'
    };

    const request = new NextRequest('http://localhost:3000/api/triage/classify', {
      method: 'POST',
      body: JSON.stringify(requestBody)
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data.classification.medical_emergency).toBe(false);
    expect(data.data.classification.life_threatening).toBe(true);
    expect(data.data.classification.resource_required).toContain('fire');
  });
});
