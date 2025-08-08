import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://demo.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'demo_anon_key'

// Check if we're in demo mode
const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true' ||
                   supabaseUrl.includes('demo') ||
                   supabaseAnonKey.includes('demo')

if (!isDemoMode && (!supabaseUrl || !supabaseAnonKey)) {
  throw new Error('Missing Supabase environment variables')
}

// Mock Supabase client for demo mode
const createMockClient = (): any => {
  // Create a proper mock query builder that returns mock data
  const createMockQuery = () => {
    const mockQuery: any = {
      eq: () => mockQuery,
      neq: () => mockQuery,
      gt: () => mockQuery,
      gte: () => mockQuery,
      lt: () => mockQuery,
      lte: () => mockQuery,
      like: () => mockQuery,
      ilike: () => mockQuery,
      is: () => mockQuery,
      in: () => mockQuery,
      contains: () => mockQuery,
      containedBy: () => mockQuery,
      rangeGt: () => mockQuery,
      rangeGte: () => mockQuery,
      rangeLt: () => mockQuery,
      rangeLte: () => mockQuery,
      rangeAdjacent: () => mockQuery,
      overlaps: () => mockQuery,
      textSearch: () => mockQuery,
      match: () => mockQuery,
      not: () => mockQuery,
      or: () => mockQuery,
      filter: () => mockQuery,
      single: () => Promise.resolve({ data: null, error: null }),
      maybeSingle: () => Promise.resolve({ data: null, error: null }),
      limit: () => mockQuery,
      range: () => mockQuery,
      order: () => mockQuery,
      select: () => mockQuery,
      then: (resolve: any) => resolve({
        data: [
          {
            id: '1',
            type: 'Wildfire',
            title: 'California Wildfire',
            description: 'Large wildfire spreading rapidly',
            severity: 'critical',
            status: 'active',
            latitude: 34.0522,
            longitude: -118.2437,
            address: 'Los Angeles, CA',
            affected_population: 50000,
            casualties: 5,
            created_at: new Date().toISOString(),
            // Enhanced AI/ML fields
            misinformation_flags: {
              has_misinformation: true,
              confidence_score: 0.85,
              flagged_content: ['Exaggerated casualty reports', 'Unverified evacuation claims'],
              verification_status: 'partially_verified',
              source_credibility: 0.72
            },
            ml_predictions: {
              flood_risk: { probability: 0.15, confidence: 0.88 },
              heat_risk: { probability: 0.92, confidence: 0.94, heat_index: 115 },
              spread_prediction: { direction: 'northeast', speed_kmh: 12, confidence: 0.89 }
            },
            digital_footprint: {
              utility_disruptions: ['power_outage_zone_7', 'water_pressure_low'],
              social_media_mentions: 1247,
              news_coverage_score: 0.91,
              public_sentiment: 'concerned'
            },
            vulnerable_populations: {
              elderly_count: 3200,
              children_count: 8500,
              disabled_count: 1100,
              low_income_households: 12000
            }
          },
          {
            id: '2',
            type: 'Earthquake',
            title: 'San Francisco Earthquake',
            description: 'Moderate earthquake detected',
            severity: 'high',
            status: 'active',
            latitude: 37.7749,
            longitude: -122.4194,
            address: 'San Francisco, CA',
            affected_population: 25000,
            casualties: 0,
            created_at: new Date().toISOString(),
            // Enhanced AI/ML fields
            misinformation_flags: {
              has_misinformation: false,
              confidence_score: 0.95,
              flagged_content: [],
              verification_status: 'verified',
              source_credibility: 0.96
            },
            ml_predictions: {
              flood_risk: { probability: 0.08, confidence: 0.82 },
              heat_risk: { probability: 0.23, confidence: 0.76, heat_index: 78 },
              aftershock_prediction: { probability: 0.67, magnitude_range: '3.2-4.8', confidence: 0.84 }
            },
            digital_footprint: {
              utility_disruptions: ['gas_leak_detected_mission_district'],
              social_media_mentions: 892,
              news_coverage_score: 0.88,
              public_sentiment: 'alert'
            },
            vulnerable_populations: {
              elderly_count: 2100,
              children_count: 5200,
              disabled_count: 800,
              low_income_households: 7500
            }
          },
          {
            id: '3',
            type: 'Flash Flood',
            title: 'Houston Flash Flood Warning',
            description: 'Rapid water level rise detected in downtown area',
            severity: 'critical',
            status: 'active',
            latitude: 29.7604,
            longitude: -95.3698,
            address: 'Houston, TX',
            affected_population: 75000,
            casualties: 2,
            created_at: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
            // Enhanced AI/ML fields
            misinformation_flags: {
              has_misinformation: true,
              confidence_score: 0.78,
              flagged_content: ['False dam breach reports', 'Incorrect evacuation routes'],
              verification_status: 'under_review',
              source_credibility: 0.65
            },
            ml_predictions: {
              flood_risk: { probability: 0.96, confidence: 0.93, peak_level_hours: 2.5 },
              heat_risk: { probability: 0.45, confidence: 0.71, heat_index: 89 },
              spread_prediction: { direction: 'southeast', speed_kmh: 8, confidence: 0.91 }
            },
            digital_footprint: {
              utility_disruptions: ['power_grid_failure_downtown', 'cellular_tower_down'],
              social_media_mentions: 2156,
              news_coverage_score: 0.94,
              public_sentiment: 'panic'
            },
            vulnerable_populations: {
              elderly_count: 4800,
              children_count: 12000,
              disabled_count: 1600,
              low_income_households: 18500
            }
          }
        ],
        error: null,
        count: 3
      })
    }
    return mockQuery
  }

  return {
    auth: {
      signInWithPassword: () => Promise.resolve({ data: { user: null, session: null }, error: { message: 'Demo mode - authentication disabled' } }),
      signUp: () => Promise.resolve({ data: { user: null, session: null }, error: { message: 'Demo mode - authentication disabled' } }),
      signOut: () => Promise.resolve({ error: null }),
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
    },
    from: (table: string) => ({
      select: (columns?: string, options?: any) => createMockQuery(),
      insert: (values: any) => ({ select: () => createMockQuery() }),
      update: (values: any) => ({ eq: () => ({ select: () => createMockQuery() }) }),
      delete: () => ({ eq: () => Promise.resolve({ error: null }) })
    }),
    rpc: () => Promise.resolve({ data: [], error: null }),
    channel: () => ({
      on: () => ({ subscribe: () => {} })
    })
  }
}

// Client-side Supabase client
export const supabase = isDemoMode ? createMockClient() : createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})

// Server-side Supabase client with service role key
export const supabaseAdmin = isDemoMode ? createMockClient() : createClient<Database>(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'demo_service_key',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

// Database connection utility
export async function testDatabaseConnection() {
  try {
    const { data, error } = await supabase
      .from('disasters')
      .select('count')
      .limit(1)
    
    if (error) throw error
    return { success: true, message: 'Database connection successful' }
  } catch (error) {
    console.error('Database connection failed:', error)
    return { success: false, message: 'Database connection failed', error }
  }
}

// Real-time subscription helper
export function subscribeToTable<T = any>(
  table: string,
  callback: (payload: any) => void,
  filter?: string
) {
  const subscription = supabase
    .channel(`public:${table}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: table,
        filter: filter
      },
      callback
    )
    .subscribe()

  return subscription
}

// Geospatial query helper
export async function queryNearbyDisasters(
  latitude: number,
  longitude: number,
  radiusKm: number = 50
) {
  const { data, error } = await supabase.rpc('get_nearby_disasters', {
    lat: latitude,
    lng: longitude,
    radius_km: radiusKm
  })

  if (error) throw error
  return data
}

// Batch insert helper
export async function batchInsert<T>(
  table: string,
  records: T[],
  chunkSize: number = 1000
) {
  const results = []
  
  for (let i = 0; i < records.length; i += chunkSize) {
    const chunk = records.slice(i, i + chunkSize)
    const { data, error } = await supabase
      .from(table)
      .insert(chunk)
      .select()
    
    if (error) throw error
    results.push(...(data || []))
  }
  
  return results
}
