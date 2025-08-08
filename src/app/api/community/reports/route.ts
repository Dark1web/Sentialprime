import { NextRequest } from 'next/server';
import { responses, withErrorHandling } from '@/utils/response';
import { db } from '@/lib/database';
import { z } from 'zod';

const CommunityReportsQuerySchema = z.object({
  disaster_type: z.enum(['flood', 'fire', 'earthquake', 'storm', 'landslide', 'other']).optional(),
  severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  status: z.enum(['pending', 'verified', 'resolved', 'false_alarm']).optional(),
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
  radius_km: z.number().min(1).max(100).optional().default(50),
  limit: z.number().min(1).max(100).optional().default(50),
  offset: z.number().min(0).optional().default(0),
  include_anonymous: z.boolean().optional().default(true),
  verified_only: z.boolean().optional().default(false)
});

async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const queryData = {
      disaster_type: searchParams.get('disaster_type') || undefined,
      severity: searchParams.get('severity') || undefined,
      status: searchParams.get('status') || undefined,
      lat: searchParams.get('lat') ? parseFloat(searchParams.get('lat')!) : undefined,
      lng: searchParams.get('lng') ? parseFloat(searchParams.get('lng')!) : undefined,
      radius_km: parseInt(searchParams.get('radius_km') || '50'),
      limit: parseInt(searchParams.get('limit') || '50'),
      offset: parseInt(searchParams.get('offset') || '0'),
      include_anonymous: searchParams.get('include_anonymous') !== 'false',
      verified_only: searchParams.get('verified_only') === 'true'
    };
    
    // Validate query parameters
    const validatedData = CommunityReportsQuerySchema.parse(queryData);
    
    // Build filters for database query
    const filters: any = {};
    
    if (validatedData.disaster_type) {
      filters.disaster_type = validatedData.disaster_type;
    }
    if (validatedData.severity) {
      filters.severity = validatedData.severity;
    }
    if (validatedData.status) {
      filters.status = validatedData.status;
    }
    if (validatedData.verified_only) {
      filters.status = 'verified';
    }
    
    // Handle location-based filtering
    let reports;
    if (validatedData.lat && validatedData.lng) {
      // Get reports within radius
      filters.location_bounds = {
        north: validatedData.lat + (validatedData.radius_km / 111.32), // Rough conversion
        south: validatedData.lat - (validatedData.radius_km / 111.32),
        east: validatedData.lng + (validatedData.radius_km / (111.32 * Math.cos(validatedData.lat * Math.PI / 180))),
        west: validatedData.lng - (validatedData.radius_km / (111.32 * Math.cos(validatedData.lat * Math.PI / 180)))
      };
    }
    
    filters.limit = validatedData.limit;
    filters.offset = validatedData.offset;
    
    // Fetch reports from database
    reports = await db.getDisasterReports(filters);
    
    // Filter out anonymous reports if not requested
    if (!validatedData.include_anonymous) {
      reports = reports.filter(report => !report.is_anonymous);
    }
    
    // Transform reports for public API
    const transformedReports = reports.map(report => ({
      id: report.id,
      title: report.title,
      description: report.description,
      disaster_type: report.disaster_type,
      severity: report.severity,
      location: {
        lat: report.location_lat,
        lng: report.location_lng,
        name: report.location_name,
        radius_meters: report.radius_meters
      },
      status: report.status,
      verification_status: report.verification_status,
      images: report.images || [],
      created_at: report.created_at,
      updated_at: report.updated_at,
      // Include user info only for non-anonymous reports
      reporter: report.is_anonymous ? null : {
        name: report.profiles ? `${report.profiles.first_name || ''} ${report.profiles.last_name || ''}`.trim() : 'Unknown',
        organization: report.profiles?.organization || null
      },
      is_anonymous: report.is_anonymous,
      contact_available: !report.is_anonymous && report.contact_info ? true : false
    }));
    
    // Calculate statistics
    const stats = {
      total_reports: transformedReports.length,
      by_disaster_type: {},
      by_severity: {},
      by_status: {},
      verified_count: transformedReports.filter(r => r.status === 'verified').length,
      pending_count: transformedReports.filter(r => r.status === 'pending').length
    };
    
    // Calculate breakdown statistics
    transformedReports.forEach(report => {
      // By disaster type
      stats.by_disaster_type[report.disaster_type] = 
        (stats.by_disaster_type[report.disaster_type] || 0) + 1;
      
      // By severity
      stats.by_severity[report.severity] = 
        (stats.by_severity[report.severity] || 0) + 1;
      
      // By status
      stats.by_status[report.status] = 
        (stats.by_status[report.status] || 0) + 1;
    });
    
    return responses.ok({
      reports: transformedReports,
      statistics: stats,
      query_params: validatedData,
      location_filter: validatedData.lat && validatedData.lng ? {
        center: { lat: validatedData.lat, lng: validatedData.lng },
        radius_km: validatedData.radius_km
      } : null,
      last_updated: new Date().toISOString()
    });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return responses.badRequest(`Validation error: ${error.errors.map(e => e.message).join(', ')}`);
    }
    
    console.error('Community reports API error:', error);
    return responses.internalServerError('Failed to fetch community reports');
  }
}

// Handle POST for more complex queries
async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body
    const validatedData = CommunityReportsQuerySchema.parse(body);
    
    // Same logic as GET but with POST body data
    const filters: any = {};
    
    if (validatedData.disaster_type) {
      filters.disaster_type = validatedData.disaster_type;
    }
    if (validatedData.severity) {
      filters.severity = validatedData.severity;
    }
    if (validatedData.status) {
      filters.status = validatedData.status;
    }
    if (validatedData.verified_only) {
      filters.status = 'verified';
    }
    
    if (validatedData.lat && validatedData.lng) {
      filters.location_bounds = {
        north: validatedData.lat + (validatedData.radius_km / 111.32),
        south: validatedData.lat - (validatedData.radius_km / 111.32),
        east: validatedData.lng + (validatedData.radius_km / (111.32 * Math.cos(validatedData.lat * Math.PI / 180))),
        west: validatedData.lng - (validatedData.radius_km / (111.32 * Math.cos(validatedData.lat * Math.PI / 180)))
      };
    }
    
    filters.limit = validatedData.limit;
    filters.offset = validatedData.offset;
    
    const reports = await db.getDisasterReports(filters);
    
    if (!validatedData.include_anonymous) {
      reports.filter(report => !report.is_anonymous);
    }
    
    const transformedReports = reports.map(report => ({
      id: report.id,
      title: report.title,
      description: report.description,
      disaster_type: report.disaster_type,
      severity: report.severity,
      location: {
        lat: report.location_lat,
        lng: report.location_lng,
        name: report.location_name,
        radius_meters: report.radius_meters
      },
      status: report.status,
      verification_status: report.verification_status,
      images: report.images || [],
      created_at: report.created_at,
      updated_at: report.updated_at,
      reporter: report.is_anonymous ? null : {
        name: report.profiles ? `${report.profiles.first_name || ''} ${report.profiles.last_name || ''}`.trim() : 'Unknown',
        organization: report.profiles?.organization || null
      },
      is_anonymous: report.is_anonymous,
      contact_available: !report.is_anonymous && report.contact_info ? true : false
    }));
    
    const stats = {
      total_reports: transformedReports.length,
      verified_count: transformedReports.filter(r => r.status === 'verified').length,
      pending_count: transformedReports.filter(r => r.status === 'pending').length
    };
    
    return responses.ok({
      reports: transformedReports,
      statistics: stats,
      query_params: validatedData,
      last_updated: new Date().toISOString()
    });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return responses.badRequest(`Validation error: ${error.errors.map(e => e.message).join(', ')}`);
    }
    
    console.error('Community reports POST API error:', error);
    return responses.internalServerError('Failed to fetch community reports');
  }
}

// Handle OPTIONS for CORS
async function OPTIONS(request: NextRequest) {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

const wrappedGET = withErrorHandling(GET);
const wrappedPOST = withErrorHandling(POST);

export { wrappedGET as GET, wrappedPOST as POST, OPTIONS };
