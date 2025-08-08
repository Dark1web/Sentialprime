import { NextRequest } from 'next/server';
import { responses, withErrorHandling } from '@/utils/response';
import { db, TABLES } from '@/lib/database';

async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const lat = parseFloat(url.searchParams.get('lat') || '0');
    const lng = parseFloat(url.searchParams.get('lng') || '0');
    const radius = parseFloat(url.searchParams.get('radius') || '10');
    const zoneType = url.searchParams.get('zone_type');
    const limit = parseInt(url.searchParams.get('limit') || '50');

    let safeZones;

    if (lat && lng) {
      // Find nearby safe zones using geospatial query
      safeZones = await db.findNearby(TABLES.SAFE_ZONES, lat, lng, radius, limit);
    } else {
      // Get all safe zones with optional filtering
      const filters: any = { active: true };
      if (zoneType) {
        filters.zone_type = zoneType;
      }

      safeZones = await db.findMany(TABLES.SAFE_ZONES, filters, {
        limit,
        orderBy: 'name',
        ascending: true
      });
    }

    // If no safe zones found in database, return mock data
    if (!safeZones || safeZones.length === 0) {
      safeZones = [
        {
          id: '1',
          name: 'Community Center',
          description: 'Main community center with emergency facilities',
          zone_type: 'shelter',
          location_lat: lat || 28.6139,
          location_lng: lng || 77.2090,
          address: 'Central Community Center, Main Street',
          capacity: 500,
          current_occupancy: 45,
          amenities: ['Medical', 'Food', 'Shelter', 'Communication'],
          contact_info: {
            phone: '+91-11-23456789',
            email: 'emergency@community.gov.in',
            emergency_contact: 'Emergency Coordinator'
          },
          operating_hours: '24/7 during emergencies',
          accessibility_features: ['Wheelchair Access', 'Sign Language Support'],
          active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '2',
          name: 'District General Hospital',
          description: 'Primary medical facility for emergency care',
          zone_type: 'hospital',
          location_lat: (lat || 28.6139) + 0.01,
          location_lng: (lng || 77.2090) + 0.01,
          address: 'District Hospital, Medical District',
          capacity: 200,
          current_occupancy: 120,
          amenities: ['Emergency Care', 'Surgery', 'ICU', 'Ambulance'],
          contact_info: {
            phone: '+91-11-23456790',
            emergency: '102',
            email: 'emergency@hospital.gov.in'
          },
          operating_hours: '24/7',
          accessibility_features: ['Wheelchair Access', 'Emergency Ramps'],
          active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '3',
          name: 'Relief Distribution Center',
          description: 'Food and supply distribution point',
          zone_type: 'supply_center',
          location_lat: (lat || 28.6139) - 0.01,
          location_lng: (lng || 77.2090) - 0.01,
          address: 'Relief Center, Supply District',
          capacity: 1000,
          current_occupancy: 200,
          amenities: ['Food Distribution', 'Water Supply', 'Basic Supplies', 'Information'],
          contact_info: {
            phone: '+91-11-23456791',
            email: 'relief@supplies.gov.in'
          },
          operating_hours: '6:00 AM - 10:00 PM',
          accessibility_features: ['Ground Level Access', 'Multiple Entry Points'],
          active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];

      // Filter mock data if zone_type is specified
      if (zoneType) {
        safeZones = safeZones.filter(zone => zone.zone_type === zoneType);
      }
    }

    // Calculate distances if lat/lng provided
    if (lat && lng) {
      safeZones = safeZones.map((zone: any) => ({
        ...zone,
        distance_km: calculateDistance(lat, lng, zone.location_lat, zone.location_lng),
        estimated_travel_time: estimateTravelTime(
          calculateDistance(lat, lng, zone.location_lat, zone.location_lng)
        )
      }));

      // Sort by distance
      safeZones.sort((a: any, b: any) => (a.distance_km || 0) - (b.distance_km || 0));
    }

    return responses.ok({
      safe_zones: safeZones,
      total: safeZones.length,
      search_criteria: {
        location: lat && lng ? { lat, lng } : null,
        radius_km: lat && lng ? radius : null,
        zone_type: zoneType,
        limit
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Safe zones fetch error:', error);
    return responses.internalServerError('Failed to fetch safe zones');
  }
}

// Helper function to calculate distance between two points
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Helper function to estimate travel time
function estimateTravelTime(distanceKm: number): string {
  // Assume average speed of 30 km/h in emergency conditions
  const timeHours = distanceKm / 30;
  const timeMinutes = Math.round(timeHours * 60);
  
  if (timeMinutes < 60) {
    return `${timeMinutes} minutes`;
  } else {
    const hours = Math.floor(timeMinutes / 60);
    const minutes = timeMinutes % 60;
    return `${hours}h ${minutes}m`;
  }
}

const wrappedGET = withErrorHandling(GET);
export { wrappedGET as GET };
