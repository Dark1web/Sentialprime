import { NextRequest } from 'next/server';
import { responses, withErrorHandling } from '@/utils/response';
import { db, TABLES } from '@/lib/database';
import { verifyToken } from '@/middleware/auth';
import { z } from 'zod';

const CommunityReportSchema = z.object({
  title: z.string().min(5).max(200),
  description: z.string().min(10).max(2000),
  disaster_type: z.enum(['flood', 'fire', 'earthquake', 'storm', 'landslide', 'other']),
  severity: z.enum(['low', 'medium', 'high', 'critical']).optional().default('medium'),
  location_lat: z.number().min(-90).max(90),
  location_lng: z.number().min(-180).max(180),
  location_name: z.string().optional(),
  radius_meters: z.number().min(10).max(50000).optional().default(1000),
  images: z.array(z.string().url()).optional().default([]),
  contact_info: z.object({
    phone: z.string().optional(),
    email: z.string().email().optional(),
    name: z.string().optional()
  }).optional(),
  is_anonymous: z.boolean().optional().default(false),
  additional_details: z.record(z.any()).optional()
});

async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body
    const validatedData = CommunityReportSchema.parse(body);
    
    // Get user from token (optional for anonymous reports)
    const authHeader = request.headers.get('authorization');
    let user = null;
    
    if (authHeader && !validatedData.is_anonymous) {
      const token = authHeader.replace('Bearer ', '');
      user = await verifyToken(token);
    }
    
    // Prepare report data
    const reportData = {
      user_id: user?.id || null,
      title: validatedData.title,
      description: validatedData.description,
      disaster_type: validatedData.disaster_type,
      severity: validatedData.severity,
      location_lat: validatedData.location_lat,
      location_lng: validatedData.location_lng,
      location_name: validatedData.location_name,
      radius_meters: validatedData.radius_meters,
      images: validatedData.images,
      contact_info: validatedData.contact_info,
      is_anonymous: validatedData.is_anonymous,
      additional_details: validatedData.additional_details,
      status: 'pending',
      verification_status: 'unverified',
      created_at: new Date().toISOString()
    };
    
    // Create the disaster report
    const report = await db.create(TABLES.DISASTER_REPORTS, reportData);
    
    // Log the submission for analytics
    console.log(`New community report submitted: ${report.id} - ${validatedData.disaster_type} in ${validatedData.location_name || 'Unknown location'}`);
    
    return responses.created({
      report: {
        id: report.id,
        title: report.title,
        disaster_type: report.disaster_type,
        severity: report.severity,
        location: {
          lat: report.location_lat,
          lng: report.location_lng,
          name: report.location_name
        },
        status: report.status,
        created_at: report.created_at
      },
      message: 'Community report submitted successfully',
      next_steps: [
        'Your report is being reviewed by our team',
        'You will receive updates on the verification status',
        'Emergency services will be notified if immediate action is required'
      ]
    });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return responses.badRequest(`Validation error: ${error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')}`);
    }
    
    console.error('Community report submission error:', error);
    return responses.internalServerError('Failed to submit community report');
  }
}

// Handle OPTIONS for CORS
async function OPTIONS(request: NextRequest) {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

const wrappedPOST = withErrorHandling(POST);
export { wrappedPOST as POST, OPTIONS };
