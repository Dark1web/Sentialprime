import { NextRequest } from 'next/server';
import { responses, withErrorHandling } from '@/utils/response';

async function GET(request: NextRequest) {
  // Mock network outages data - in production this would come from real network monitoring
  const outages = [
    {
      id: '1',
      location: 'Mumbai Central',
      location_lat: 19.0176,
      location_lng: 72.8562,
      severity: 'HIGH',
      outage_type: 'internet',
      affected_users: 15000,
      estimated_repair: '2 hours',
      provider: 'Airtel',
      duration_minutes: 45,
      resolved: false,
      created_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      speed_test_results: {
        download_mbps: 0.5,
        upload_mbps: 0.1,
        ping_ms: 500
      }
    },
    {
      id: '2',
      location: 'Delhi NCR',
      location_lat: 28.6139,
      location_lng: 77.2090,
      severity: 'MEDIUM',
      outage_type: 'mobile',
      affected_users: 5000,
      estimated_repair: '30 minutes',
      provider: 'Jio',
      duration_minutes: 20,
      resolved: false,
      created_at: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
      speed_test_results: {
        download_mbps: 2.1,
        upload_mbps: 0.8,
        ping_ms: 200
      }
    },
    {
      id: '3',
      location: 'Bangalore Tech Park',
      location_lat: 12.9716,
      location_lng: 77.5946,
      severity: 'LOW',
      outage_type: 'internet',
      affected_users: 1200,
      estimated_repair: '15 minutes',
      provider: 'BSNL',
      duration_minutes: 10,
      resolved: true,
      created_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      resolved_at: new Date(Date.now() - 50 * 60 * 1000).toISOString(),
      speed_test_results: {
        download_mbps: 8.5,
        upload_mbps: 2.1,
        ping_ms: 45
      }
    }
  ];

  // Filter by query parameters
  const url = new URL(request.url);
  const severity = url.searchParams.get('severity');
  const resolved = url.searchParams.get('resolved');
  const provider = url.searchParams.get('provider');

  let filteredOutages = outages;

  if (severity) {
    filteredOutages = filteredOutages.filter(outage => 
      outage.severity.toLowerCase() === severity.toLowerCase()
    );
  }

  if (resolved !== null) {
    const isResolved = resolved === 'true';
    filteredOutages = filteredOutages.filter(outage => outage.resolved === isResolved);
  }

  if (provider) {
    filteredOutages = filteredOutages.filter(outage => 
      outage.provider.toLowerCase().includes(provider.toLowerCase())
    );
  }

  return responses.ok({
    outages: filteredOutages,
    total: filteredOutages.length,
    summary: {
      total_outages: outages.length,
      active_outages: outages.filter(o => !o.resolved).length,
      resolved_outages: outages.filter(o => o.resolved).length,
      high_severity: outages.filter(o => o.severity === 'HIGH').length,
      affected_users_total: outages.reduce((sum, o) => sum + o.affected_users, 0)
    },
    timestamp: new Date().toISOString()
  });
}

const wrappedGET = withErrorHandling(GET);
export { wrappedGET as GET };
