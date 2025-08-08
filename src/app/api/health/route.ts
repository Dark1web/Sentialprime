import { NextRequest } from 'next/server';
import { responses, withErrorHandling } from '@/utils/response';
import { db } from '@/lib/database';
import { config } from '@/lib/config';

async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  // Check database connectivity
  const isDatabaseHealthy = await db.healthCheck();
  
  // Check external services (simplified)
  const servicesStatus = {
    database: isDatabaseHealthy ? 'operational' : 'down',
    ml_models: config.features.enableMLModels ? 'operational' : 'disabled',
    file_uploads: config.features.enableFileUploads ? 'operational' : 'disabled',
    caching: config.features.enableCaching ? 'operational' : 'disabled',
    realtime: config.features.enableRealTimeUpdates ? 'operational' : 'disabled',
  };
  
  const responseTime = Date.now() - startTime;
  const overallStatus = isDatabaseHealthy ? 'healthy' : 'unhealthy';
  
  const healthData = {
    status: overallStatus,
    response_time_ms: responseTime,
    services: servicesStatus,
    version: '2.0.0',
    backend: 'nextjs',
    environment: config.nodeEnv,
    uptime: process.uptime(),
    memory_usage: process.memoryUsage(),
    timestamp: new Date().toISOString(),
  };
  
  const statusCode = overallStatus === 'healthy' ? 200 : 503;
  
  return responses.ok(healthData);
}

const wrappedGET = withErrorHandling(GET);
export { wrappedGET as GET };
