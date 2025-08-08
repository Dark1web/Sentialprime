import { NextRequest, NextResponse } from 'next/server';
import { config } from '@/lib/config';

export function corsMiddleware(request: NextRequest) {
  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  // Create response with CORS headers
  const response = NextResponse.next();
  
  // Get origin from request
  const origin = request.headers.get('origin');
  
  // Check if origin is allowed
  const allowedOrigins = config.cors.origin;
  const isAllowedOrigin = allowedOrigins.includes('*') || 
    (origin && allowedOrigins.includes(origin));

  if (isAllowedOrigin) {
    response.headers.set('Access-Control-Allow-Origin', origin || '*');
  }

  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  
  if (config.cors.credentials) {
    response.headers.set('Access-Control-Allow-Credentials', 'true');
  }

  return response;
}

export function setCorsHeaders(response: NextResponse, origin?: string) {
  const allowedOrigins = config.cors.origin;
  const isAllowedOrigin = allowedOrigins.includes('*') || 
    (origin && allowedOrigins.includes(origin));

  if (isAllowedOrigin) {
    response.headers.set('Access-Control-Allow-Origin', origin || '*');
  }

  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  
  if (config.cors.credentials) {
    response.headers.set('Access-Control-Allow-Credentials', 'true');
  }

  return response;
}
