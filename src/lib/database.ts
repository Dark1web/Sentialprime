import { createClient } from '@supabase/supabase-js';
import { config } from './config';

// Create Supabase client for public operations (lazy initialization)
export function getSupabaseClient() {
  if (!config.database.supabaseUrl || !config.database.supabaseAnonKey) {
    return null;
  }
  return createClient(config.database.supabaseUrl, config.database.supabaseAnonKey);
}

// Create Supabase client with service role for admin operations (lazy initialization)
export function getSupabaseAdminClient() {
  if (!config.database.supabaseUrl || !config.database.supabaseServiceKey) {
    return null;
  }
  return createClient(config.database.supabaseUrl, config.database.supabaseServiceKey);
}

// Database table names
export const TABLES = {
  PROFILES: 'profiles',
  DISASTER_REPORTS: 'disaster_reports',
  EMERGENCY_REQUESTS: 'emergency_requests',
  MISINFORMATION_REPORTS: 'misinformation_reports',
  SAFE_ZONES: 'safe_zones',
  NEWS_ARTICLES: 'news_articles',
  NETWORK_OUTAGES: 'network_outages',
} as const;

// Database helper functions
export class DatabaseService {
  private getClient() {
    const client = getSupabaseClient();
    if (!client) {
      throw new Error('Database connection not configured. Please set SUPABASE environment variables.');
    }
    return client;
  }

  private getAdminClient() {
    const client = getSupabaseAdminClient();
    if (!client) {
      throw new Error('Admin database connection not configured. Please set SUPABASE environment variables.');
    }
    return client;
  }

  // Generic CRUD operations
  async create<T>(table: string, data: Partial<T>): Promise<T> {
    const client = this.getClient();
    const { data: result, error } = await client
      .from(table)
      .insert(data)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create record in ${table}: ${error.message}`);
    }

    return result;
  }

  async findById<T>(table: string, id: string): Promise<T | null> {
    const client = this.getClient();
    const { data, error } = await client
      .from(table)
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to find record in ${table}: ${error.message}`);
    }

    return data;
  }

  async findMany<T>(
    table: string,
    filters: Record<string, any> = {},
    options: {
      limit?: number;
      offset?: number;
      orderBy?: string;
      ascending?: boolean;
    } = {}
  ): Promise<T[]> {
    const client = this.getClient();
    let query = client.from(table).select('*');

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        query = query.eq(key, value);
      }
    });

    // Apply ordering
    if (options.orderBy) {
      query = query.order(options.orderBy, { ascending: options.ascending ?? true });
    }

    // Apply pagination
    if (options.limit) {
      query = query.limit(options.limit);
    }
    if (options.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch records from ${table}: ${error.message}`);
    }

    return data || [];
  }

  async update<T>(table: string, id: string, data: Partial<T>): Promise<T> {
    const client = this.getClient();
    const { data: result, error } = await client
      .from(table)
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update record in ${table}: ${error.message}`);
    }

    return result;
  }

  async delete(table: string, id: string): Promise<void> {
    const client = this.getClient();
    const { error } = await client
      .from(table)
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete record from ${table}: ${error.message}`);
    }
  }

  // Geospatial queries
  async findNearby<T>(
    table: string,
    lat: number,
    lng: number,
    radiusKm: number = 10,
    limit: number = 50
  ): Promise<T[]> {
    const client = this.getClient();
    const { data, error } = await client
      .rpc('find_nearby_points', {
        table_name: table,
        lat,
        lng,
        radius_km: radiusKm,
        limit_count: limit
      });

    if (error) {
      throw new Error(`Failed to find nearby records: ${error.message}`);
    }

    return data || [];
  }

  // Admin operations
  async adminCreate<T>(table: string, data: Partial<T>): Promise<T> {
    const adminClient = this.getAdminClient();
    const { data: result, error } = await adminClient
      .from(table)
      .insert(data)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create record in ${table}: ${error.message}`);
    }

    return result;
  }

  async adminUpdate<T>(table: string, id: string, data: Partial<T>): Promise<T> {
    const adminClient = this.getAdminClient();
    const { data: result, error } = await adminClient
      .from(table)
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update record in ${table}: ${error.message}`);
    }

    return result;
  }

  // SentinelX specific methods
  async getDisasterReports(filters: {
    disaster_type?: string;
    severity?: string;
    status?: string;
    location_bounds?: { north: number; south: number; east: number; west: number };
    limit?: number;
    offset?: number;
  } = {}) {
    const client = this.getClient();
    let query = client
      .from(TABLES.DISASTER_REPORTS)
      .select(`
        *,
        profiles:user_id (
          first_name,
          last_name,
          organization
        )
      `);

    // Apply filters
    if (filters.disaster_type) {
      query = query.eq('disaster_type', filters.disaster_type);
    }
    if (filters.severity) {
      query = query.eq('severity', filters.severity);
    }
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    if (filters.location_bounds) {
      const { north, south, east, west } = filters.location_bounds;
      query = query
        .gte('location_lat', south)
        .lte('location_lat', north)
        .gte('location_lng', west)
        .lte('location_lng', east);
    }

    // Pagination
    if (filters.limit) {
      query = query.limit(filters.limit);
    }
    if (filters.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 50) - 1);
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;
    if (error) {
      throw new Error(`Failed to fetch disaster reports: ${error.message}`);
    }
    return data || [];
  }

  async getEmergencyRequests(filters: {
    status?: string;
    triage_level?: string;
    assigned_to?: string;
    limit?: number;
  } = {}) {
    const client = this.getClient();
    let query = client
      .from(TABLES.EMERGENCY_REQUESTS)
      .select(`
        *,
        profiles:user_id (
          first_name,
          last_name,
          phone,
          organization
        ),
        assigned_profiles:assigned_to (
          first_name,
          last_name,
          organization
        )
      `);

    // Apply filters
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    if (filters.triage_level) {
      query = query.eq('triage_level', filters.triage_level);
    }
    if (filters.assigned_to) {
      query = query.eq('assigned_to', filters.assigned_to);
    }

    if (filters.limit) {
      query = query.limit(filters.limit);
    }
    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;
    if (error) {
      throw new Error(`Failed to fetch emergency requests: ${error.message}`);
    }
    return data || [];
  }

  async getSafeZones(lat: number, lng: number, radius: number = 10) {
    try {
      const client = this.getClient();
      // Try using PostGIS function first
      const { data, error } = await client
        .rpc('get_nearby_safe_zones', {
          user_lat: lat,
          user_lng: lng,
          radius_km: radius
        });

      if (error) {
        // Fallback to simple filtering
        return this.getSafeZonesFallback(lat, lng, radius);
      }
      return data || [];
    } catch (error) {
      return this.getSafeZonesFallback(lat, lng, radius);
    }
  }

  private async getSafeZonesFallback(lat: number, lng: number, radius: number) {
    const client = this.getClient();
    const { data, error } = await client
      .from(TABLES.SAFE_ZONES)
      .select('*')
      .eq('is_active', true);

    if (error) {
      throw new Error(`Failed to fetch safe zones: ${error.message}`);
    }

    // Simple distance filtering
    return (data || []).filter(zone => {
      const distance = this.calculateDistance(
        lat, lng,
        zone.location_lat, zone.location_lng
      );
      return distance <= radius;
    });
  }

  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);
    const a =
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      const client = getSupabaseClient();
      if (!client) {
        return false;
      }
      const { data, error } = await client
        .from('profiles')
        .select('count')
        .limit(1);

      return !error;
    } catch {
      return false;
    }
  }
}

export const db = new DatabaseService();
