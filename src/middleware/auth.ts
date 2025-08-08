import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import { supabase } from '@/lib/database';
import { config } from '@/lib/config';
import { User } from '@/types';

export interface AuthenticatedRequest extends NextRequest {
  user?: User;
}

export async function verifyToken(token: string): Promise<User | null> {
  try {
    // First try to verify with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (user && !error) {
      // Get user profile from database
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (profile) {
        return profile as User;
      }
    }

    // Fallback to JWT verification
    const decoded = jwt.verify(token, config.jwt.secret) as any;
    
    if (decoded && decoded.userId) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', decoded.userId)
        .single();
      
      return profile as User;
    }

    return null;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

export function extractToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  // Also check for token in cookies
  const tokenCookie = request.cookies.get('auth-token');
  if (tokenCookie) {
    return tokenCookie.value;
  }
  
  return null;
}

export async function authenticateRequest(request: NextRequest): Promise<User | null> {
  const token = extractToken(request);
  
  if (!token) {
    return null;
  }
  
  return await verifyToken(token);
}

export function requireAuth(handler: (request: AuthenticatedRequest) => Promise<Response>) {
  return async (request: NextRequest) => {
    const user = await authenticateRequest(request);
    
    if (!user) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Authentication required',
          timestamp: new Date().toISOString(),
        }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
    
    // Add user to request object
    (request as AuthenticatedRequest).user = user;
    
    return handler(request as AuthenticatedRequest);
  };
}

export function requireRole(roles: string[]) {
  return function(handler: (request: AuthenticatedRequest) => Promise<Response>) {
    return async (request: NextRequest) => {
      const user = await authenticateRequest(request);
      
      if (!user) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Authentication required',
            timestamp: new Date().toISOString(),
          }),
          {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }
      
      if (!roles.includes(user.role)) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Insufficient permissions',
            timestamp: new Date().toISOString(),
          }),
          {
            status: 403,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }
      
      // Add user to request object
      (request as AuthenticatedRequest).user = user;
      
      return handler(request as AuthenticatedRequest);
    };
  };
}

export async function optionalAuth(request: NextRequest): Promise<User | null> {
  try {
    return await authenticateRequest(request);
  } catch {
    return null;
  }
}
