import { GET } from '@/app/api/health/route';
import { NextRequest } from 'next/server';

// Mock the database service
jest.mock('@/lib/database', () => ({
  db: {
    healthCheck: jest.fn()
  }
}));

describe('/api/health', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return healthy status when all services are operational', async () => {
    // Mock database health check to return true
    const { db } = require('@/lib/database');
    db.healthCheck.mockResolvedValue(true);

    const request = new NextRequest('http://localhost:3000/api/health');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.status).toBe('healthy');
    expect(data.data.services.database).toBe('operational');
  });

  it('should return degraded status when database is unavailable', async () => {
    // Mock database health check to return false
    const { db } = require('@/lib/database');
    db.healthCheck.mockResolvedValue(false);

    const request = new NextRequest('http://localhost:3000/api/health');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.status).toBe('degraded');
    expect(data.data.services.database).toBe('unavailable');
  });

  it('should handle database connection errors gracefully', async () => {
    // Mock database health check to throw error
    const { db } = require('@/lib/database');
    db.healthCheck.mockRejectedValue(new Error('Connection failed'));

    const request = new NextRequest('http://localhost:3000/api/health');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.status).toBe('degraded');
    expect(data.data.services.database).toBe('unavailable');
  });

  it('should include system information in response', async () => {
    const { db } = require('@/lib/database');
    db.healthCheck.mockResolvedValue(true);

    const request = new NextRequest('http://localhost:3000/api/health');
    const response = await GET(request);
    const data = await response.json();

    expect(data.data).toHaveProperty('timestamp');
    expect(data.data).toHaveProperty('version');
    expect(data.data).toHaveProperty('uptime');
    expect(data.data).toHaveProperty('services');
    expect(typeof data.data.timestamp).toBe('string');
    expect(typeof data.data.uptime).toBe('number');
  });
});
