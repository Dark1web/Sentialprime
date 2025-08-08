import { NextRequest, NextResponse } from 'next/server';
import { corsMiddleware } from './src/middleware/cors';

export function middleware(request: NextRequest) {
  // Apply CORS middleware to all API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    return corsMiddleware(request);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/api/:path*',
  ],
};
