import { NextResponse } from 'next/server';
import { ApiResponse, PaginatedResponse, ApiError } from '@/types';
import { setCorsHeaders } from '@/middleware/cors';

export function createApiResponse<T>(
  data: T,
  message?: string,
  status: number = 200
): NextResponse {
  const response: ApiResponse<T> = {
    success: true,
    data,
    message,
    timestamp: new Date().toISOString(),
  };

  const nextResponse = NextResponse.json(response, { status });
  return setCorsHeaders(nextResponse);
}

export function createPaginatedResponse<T>(
  data: T[],
  pagination: {
    page: number;
    limit: number;
    total: number;
  },
  message?: string,
  status: number = 200
): NextResponse {
  const response: PaginatedResponse<T> = {
    success: true,
    data,
    message,
    timestamp: new Date().toISOString(),
    pagination: {
      ...pagination,
      totalPages: Math.ceil(pagination.total / pagination.limit),
    },
  };

  const nextResponse = NextResponse.json(response, { status });
  return setCorsHeaders(nextResponse);
}

export function createErrorResponse(
  error: string | ApiError,
  status: number = 500
): NextResponse {
  const errorResponse: ApiResponse = {
    success: false,
    error: typeof error === 'string' ? error : error.message,
    timestamp: new Date().toISOString(),
  };

  const nextResponse = NextResponse.json(errorResponse, { status });
  return setCorsHeaders(nextResponse);
}

export function createValidationErrorResponse(
  errors: Record<string, string[]>,
  message: string = 'Validation failed'
): NextResponse {
  const errorResponse: ApiResponse = {
    success: false,
    error: message,
    data: errors,
    timestamp: new Date().toISOString(),
  };

  const nextResponse = NextResponse.json(errorResponse, { status: 400 });
  return setCorsHeaders(nextResponse);
}

// Common HTTP status responses
export const responses = {
  ok: <T>(data: T, message?: string) => createApiResponse(data, message, 200),
  created: <T>(data: T, message?: string) => createApiResponse(data, message, 201),
  noContent: () => new NextResponse(null, { status: 204 }),
  
  badRequest: (error: string = 'Bad request') => createErrorResponse(error, 400),
  unauthorized: (error: string = 'Unauthorized') => createErrorResponse(error, 401),
  forbidden: (error: string = 'Forbidden') => createErrorResponse(error, 403),
  notFound: (error: string = 'Not found') => createErrorResponse(error, 404),
  conflict: (error: string = 'Conflict') => createErrorResponse(error, 409),
  
  internalServerError: (error: string = 'Internal server error') => createErrorResponse(error, 500),
  notImplemented: (error: string = 'Not implemented') => createErrorResponse(error, 501),
  serviceUnavailable: (error: string = 'Service unavailable') => createErrorResponse(error, 503),
};

// Error handling wrapper for API routes
export function withErrorHandling(
  handler: (request: any) => Promise<NextResponse>
) {
  return async (request: any): Promise<NextResponse> => {
    try {
      return await handler(request);
    } catch (error) {
      console.error('API Error:', error);
      
      if (error instanceof Error) {
        // Handle known error types
        if (error.message.includes('validation')) {
          return responses.badRequest(error.message);
        }
        if (error.message.includes('not found')) {
          return responses.notFound(error.message);
        }
        if (error.message.includes('unauthorized')) {
          return responses.unauthorized(error.message);
        }
        if (error.message.includes('forbidden')) {
          return responses.forbidden(error.message);
        }
        
        return responses.internalServerError(error.message);
      }
      
      return responses.internalServerError('An unexpected error occurred');
    }
  };
}

// Rate limiting helper
export function createRateLimitResponse(): NextResponse {
  const errorResponse: ApiResponse = {
    success: false,
    error: 'Too many requests. Please try again later.',
    timestamp: new Date().toISOString(),
  };

  const nextResponse = NextResponse.json(errorResponse, { status: 429 });
  return setCorsHeaders(nextResponse);
}
