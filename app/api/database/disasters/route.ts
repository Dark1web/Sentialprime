import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabase, supabaseAdmin } from '@/lib/supabase'

const CreateDisasterSchema = z.object({
  type: z.enum(['earthquake', 'flood', 'wildfire', 'hurricane', 'tornado', 'tsunami', 'volcanic', 'landslide', 'drought', 'blizzard', 'other']),
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  address: z.string().optional(),
  country: z.string().optional(),
  region: z.string().optional(),
  affected_population: z.number().int().min(0).optional(),
  casualties: z.number().int().min(0).optional(),
  damage_estimate: z.number().min(0).optional(),
  source: z.string().optional(),
  source_url: z.string().url().optional(),
  verified: z.boolean().optional().default(false),
  confidence_score: z.number().min(0).max(1).optional(),
  metadata: z.record(z.any()).optional()
})

const UpdateDisasterSchema = CreateDisasterSchema.partial().extend({
  id: z.string().uuid(),
  status: z.enum(['active', 'monitoring', 'resolved', 'archived']).optional()
})

const QueryDisastersSchema = z.object({
  limit: z.number().int().min(1).max(100).optional().default(20),
  offset: z.number().int().min(0).optional().default(0),
  type: z.string().optional(),
  severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  status: z.enum(['active', 'monitoring', 'resolved', 'archived']).optional(),
  country: z.string().optional(),
  region: z.string().optional(),
  verified: z.boolean().optional(),
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  radius_km: z.number().min(0).max(1000).optional().default(50)
})

class DisasterService {
  async createDisaster(data: z.infer<typeof CreateDisasterSchema>) {
    const location = `POINT(${data.longitude} ${data.latitude})`
    
    const { data: disaster, error } = await supabaseAdmin
      .from('disasters')
      .insert({
        ...data,
        location: location as any,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw error
    return disaster
  }

  async updateDisaster(data: z.infer<typeof UpdateDisasterSchema>) {
    const { id, ...updates } = data
    
    if (data.latitude && data.longitude) {
      updates.location = `POINT(${data.longitude} ${data.latitude})` as any
    }

    updates.updated_at = new Date().toISOString()

    if (data.status === 'resolved' && !updates.resolved_at) {
      updates.resolved_at = new Date().toISOString()
    }

    const { data: disaster, error } = await supabaseAdmin
      .from('disasters')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return disaster
  }

  async getDisasters(params: z.infer<typeof QueryDisastersSchema>) {
    let query = supabase
      .from('disasters')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(params.offset, params.offset + params.limit - 1)

    // Apply filters
    if (params.type) {
      query = query.eq('type', params.type)
    }
    if (params.severity) {
      query = query.eq('severity', params.severity)
    }
    if (params.status) {
      query = query.eq('status', params.status)
    }
    if (params.country) {
      query = query.eq('country', params.country)
    }
    if (params.region) {
      query = query.eq('region', params.region)
    }
    if (params.verified !== undefined) {
      query = query.eq('verified', params.verified)
    }
    if (params.start_date) {
      query = query.gte('created_at', params.start_date)
    }
    if (params.end_date) {
      query = query.lte('created_at', params.end_date)
    }

    const { data, error, count } = await query

    if (error) throw error

    // If location-based query, filter by distance
    let filteredData = data
    if (params.latitude && params.longitude) {
      const { data: nearbyData, error: nearbyError } = await supabase.rpc(
        'get_nearby_disasters',
        {
          lat: params.latitude,
          lng: params.longitude,
          radius_km: params.radius_km
        }
      )

      if (nearbyError) throw nearbyError
      
      const nearbyIds = new Set(nearbyData.map((d: any) => d.id))
      filteredData = data?.filter(d => nearbyIds.has(d.id)) || []
    }

    return {
      disasters: filteredData,
      total: count,
      limit: params.limit,
      offset: params.offset
    }
  }

  async getDisasterById(id: string) {
    const { data, error } = await supabase
      .from('disasters')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  }

  async deleteDisaster(id: string) {
    const { error } = await supabaseAdmin
      .from('disasters')
      .delete()
      .eq('id', id)

    if (error) throw error
    return { success: true }
  }

  async getDisasterStatistics(startDate?: string, endDate?: string) {
    const { data, error } = await supabase.rpc('get_disaster_statistics', {
      start_date: startDate || null,
      end_date: endDate || null
    })

    if (error) throw error
    return data[0] || {
      total_disasters: 0,
      active_disasters: 0,
      resolved_disasters: 0,
      critical_disasters: 0,
      affected_population: 0
    }
  }
}

const disasterService = new DisasterService()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const params = Object.fromEntries(searchParams.entries())
    
    // Convert string parameters to appropriate types
    const queryParams = {
      ...params,
      limit: params.limit ? parseInt(params.limit) : 20,
      offset: params.offset ? parseInt(params.offset) : 0,
      latitude: params.latitude ? parseFloat(params.latitude) : undefined,
      longitude: params.longitude ? parseFloat(params.longitude) : undefined,
      radius_km: params.radius_km ? parseFloat(params.radius_km) : 50,
      verified: params.verified ? params.verified === 'true' : undefined
    }

    const validatedParams = QueryDisastersSchema.parse(queryParams)
    const result = await disasterService.getDisasters(validatedParams)

    return NextResponse.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Get disasters error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch disasters' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = CreateDisasterSchema.parse(body)

    const disaster = await disasterService.createDisaster(validatedData)

    return NextResponse.json({
      success: true,
      data: disaster,
      timestamp: new Date().toISOString()
    }, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Create disaster error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create disaster' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = UpdateDisasterSchema.parse(body)

    const disaster = await disasterService.updateDisaster(validatedData)

    return NextResponse.json({
      success: true,
      data: disaster,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Update disaster error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update disaster' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Disaster ID is required' },
        { status: 400 }
      )
    }

    await disasterService.deleteDisaster(id)

    return NextResponse.json({
      success: true,
      message: 'Disaster deleted successfully',
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Delete disaster error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete disaster' },
      { status: 500 }
    )
  }
}
