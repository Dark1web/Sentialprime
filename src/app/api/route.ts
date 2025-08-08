import { NextRequest } from 'next/server';
import { responses, withErrorHandling } from '@/utils/response';
import { db } from '@/lib/database';

async function GET(request: NextRequest) {
  const isHealthy = await db.healthCheck();
  
  return responses.ok({
    message: "SentinelX API - AI-Powered Disaster Intelligence & Crisis Response System",
    version: "2.0.0",
    status: isHealthy ? "operational" : "degraded",
    backend: "nextjs",
    port: 9000,
    endpoints: {
      misinformation: "/api/misinformation/analyze",
      triage: "/api/triage/classify",
      network: "/api/network/outages",
      factcheck: "/api/factcheck",
      navigation: "/api/navigation/safezones",
      live_news: "/api/live/news/disaster-feed",
      live_weather: "/api/live/weather/current",
      satellite_imagery: "/api/live/satellite/disaster-imagery",
      disaster_intelligence: "/api/live/combined/disaster-intelligence",
      community_reports: "/api/community/submit",
      community_map: "/api/community/reports",
      health_check: "/api/health"
    }
  });
}

const wrappedGET = withErrorHandling(GET);
export { wrappedGET as GET };
