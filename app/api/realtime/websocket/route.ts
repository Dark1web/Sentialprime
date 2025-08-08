import { NextRequest } from 'next/server'
import { WebSocketServer } from 'ws'
import { supabase } from '@/lib/supabase'

// WebSocket connection manager
class WebSocketManager {
  private static instance: WebSocketManager
  private wss: WebSocketServer | null = null
  private clients: Map<string, any> = new Map()
  private subscriptions: Map<string, any> = new Map()

  static getInstance(): WebSocketManager {
    if (!WebSocketManager.instance) {
      WebSocketManager.instance = new WebSocketManager()
    }
    return WebSocketManager.instance
  }

  initialize() {
    if (this.wss) return

    this.wss = new WebSocketServer({ port: 8080 })
    
    this.wss.on('connection', (ws, request) => {
      const clientId = this.generateClientId()
      this.clients.set(clientId, ws)

      console.log(`WebSocket client connected: ${clientId}`)

      ws.on('message', (message) => {
        try {
          const data = JSON.parse(message.toString())
          this.handleMessage(clientId, data)
        } catch (error) {
          console.error('Invalid WebSocket message:', error)
          ws.send(JSON.stringify({ error: 'Invalid message format' }))
        }
      })

      ws.on('close', () => {
        console.log(`WebSocket client disconnected: ${clientId}`)
        this.clients.delete(clientId)
        this.unsubscribeClient(clientId)
      })

      ws.on('error', (error) => {
        console.error(`WebSocket error for client ${clientId}:`, error)
      })

      // Send welcome message
      ws.send(JSON.stringify({
        type: 'connection',
        clientId,
        message: 'Connected to SentinelX real-time service'
      }))
    })

    // Set up Supabase real-time subscriptions
    this.setupSupabaseSubscriptions()
  }

  private generateClientId(): string {
    return Math.random().toString(36).substring(2, 15)
  }

  private handleMessage(clientId: string, data: any) {
    const ws = this.clients.get(clientId)
    if (!ws) return

    switch (data.type) {
      case 'subscribe':
        this.handleSubscription(clientId, data)
        break
      case 'unsubscribe':
        this.handleUnsubscription(clientId, data)
        break
      case 'ping':
        ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }))
        break
      default:
        ws.send(JSON.stringify({ error: 'Unknown message type' }))
    }
  }

  private handleSubscription(clientId: string, data: any) {
    const { channel, filters } = data
    const subscriptionKey = `${clientId}:${channel}`

    // Store subscription preferences
    this.subscriptions.set(subscriptionKey, {
      clientId,
      channel,
      filters: filters || {}
    })

    const ws = this.clients.get(clientId)
    if (ws) {
      ws.send(JSON.stringify({
        type: 'subscribed',
        channel,
        message: `Subscribed to ${channel}`
      }))
    }
  }

  private handleUnsubscription(clientId: string, data: any) {
    const { channel } = data
    const subscriptionKey = `${clientId}:${channel}`
    
    this.subscriptions.delete(subscriptionKey)

    const ws = this.clients.get(clientId)
    if (ws) {
      ws.send(JSON.stringify({
        type: 'unsubscribed',
        channel,
        message: `Unsubscribed from ${channel}`
      }))
    }
  }

  private unsubscribeClient(clientId: string) {
    // Remove all subscriptions for this client
    for (const [key, subscription] of this.subscriptions.entries()) {
      if (subscription.clientId === clientId) {
        this.subscriptions.delete(key)
      }
    }
  }

  private setupSupabaseSubscriptions() {
    // Subscribe to disasters table changes
    supabase
      .channel('disasters')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'disasters' },
        (payload) => this.broadcastToSubscribers('disasters', payload)
      )
      .subscribe()

    // Subscribe to community reports changes
    supabase
      .channel('community_reports')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'community_reports' },
        (payload) => this.broadcastToSubscribers('community_reports', payload)
      )
      .subscribe()

    // Subscribe to alerts changes
    supabase
      .channel('alerts')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'alerts' },
        (payload) => this.broadcastToSubscribers('alerts', payload)
      )
      .subscribe()
  }

  private broadcastToSubscribers(channel: string, payload: any) {
    for (const [key, subscription] of this.subscriptions.entries()) {
      if (subscription.channel === channel || subscription.channel === 'all') {
        const ws = this.clients.get(subscription.clientId)
        if (ws && ws.readyState === ws.OPEN) {
          // Apply filters if any
          if (this.matchesFilters(payload, subscription.filters)) {
            ws.send(JSON.stringify({
              type: 'data',
              channel,
              event: payload.eventType,
              data: payload.new || payload.old,
              timestamp: new Date().toISOString()
            }))
          }
        }
      }
    }
  }

  private matchesFilters(payload: any, filters: any): boolean {
    if (!filters || Object.keys(filters).length === 0) return true

    const data = payload.new || payload.old
    if (!data) return true

    for (const [key, value] of Object.entries(filters)) {
      if (data[key] !== value) return false
    }

    return true
  }

  broadcast(channel: string, data: any) {
    this.broadcastToSubscribers(channel, {
      eventType: 'broadcast',
      new: data
    })
  }

  getStats() {
    return {
      connectedClients: this.clients.size,
      activeSubscriptions: this.subscriptions.size,
      uptime: process.uptime()
    }
  }
}

// Real-time analytics service
class RealTimeAnalytics {
  private static eventBuffer: any[] = []
  private static readonly BUFFER_SIZE = 1000

  static addEvent(event: any) {
    this.eventBuffer.push({
      ...event,
      timestamp: new Date().toISOString()
    })

    // Keep buffer size manageable
    if (this.eventBuffer.length > this.BUFFER_SIZE) {
      this.eventBuffer = this.eventBuffer.slice(-this.BUFFER_SIZE)
    }

    // Broadcast real-time analytics
    const wsManager = WebSocketManager.getInstance()
    wsManager.broadcast('analytics', event)
  }

  static getRecentEvents(limit: number = 50) {
    return this.eventBuffer.slice(-limit)
  }

  static getEventStats() {
    const now = Date.now()
    const oneHourAgo = now - 3600000
    const oneDayAgo = now - 86400000

    const recentEvents = this.eventBuffer.filter(
      event => new Date(event.timestamp).getTime() > oneHourAgo
    )

    const dailyEvents = this.eventBuffer.filter(
      event => new Date(event.timestamp).getTime() > oneDayAgo
    )

    return {
      total_events: this.eventBuffer.length,
      events_last_hour: recentEvents.length,
      events_last_day: dailyEvents.length,
      event_types: this.getEventTypeCounts(),
      peak_hour: this.getPeakHour()
    }
  }

  private static getEventTypeCounts() {
    const counts: Record<string, number> = {}
    for (const event of this.eventBuffer) {
      counts[event.type] = (counts[event.type] || 0) + 1
    }
    return counts
  }

  private static getPeakHour() {
    const hourCounts: Record<number, number> = {}
    for (const event of this.eventBuffer) {
      const hour = new Date(event.timestamp).getHours()
      hourCounts[hour] = (hourCounts[hour] || 0) + 1
    }

    let peakHour = 0
    let maxCount = 0
    for (const [hour, count] of Object.entries(hourCounts)) {
      if (count > maxCount) {
        maxCount = count
        peakHour = parseInt(hour)
      }
    }

    return { hour: peakHour, count: maxCount }
  }
}

// Initialize WebSocket server
const wsManager = WebSocketManager.getInstance()
wsManager.initialize()

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action')

  switch (action) {
    case 'stats':
      return Response.json({
        success: true,
        data: {
          websocket: wsManager.getStats(),
          analytics: RealTimeAnalytics.getEventStats()
        }
      })

    case 'events':
      const limit = parseInt(searchParams.get('limit') || '50')
      return Response.json({
        success: true,
        data: RealTimeAnalytics.getRecentEvents(limit)
      })

    default:
      return Response.json({
        success: true,
        message: 'SentinelX Real-time WebSocket Service',
        websocket_url: 'ws://localhost:8080',
        endpoints: {
          stats: '/api/realtime/websocket?action=stats',
          events: '/api/realtime/websocket?action=events&limit=50'
        },
        supported_channels: ['disasters', 'community_reports', 'alerts', 'analytics', 'all']
      })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { channel, data, event_type } = body

    if (!channel || !data) {
      return Response.json(
        { success: false, error: 'Channel and data are required' },
        { status: 400 }
      )
    }

    // Broadcast to WebSocket clients
    wsManager.broadcast(channel, data)

    // Add to analytics if it's an analytics event
    if (event_type) {
      RealTimeAnalytics.addEvent({
        type: event_type,
        channel,
        data
      })
    }

    return Response.json({
      success: true,
      message: 'Data broadcasted successfully',
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('WebSocket broadcast error:', error)
    return Response.json(
      { success: false, error: 'Failed to broadcast data' },
      { status: 500 }
    )
  }
}

// Export the analytics service for use in other parts of the application
export { RealTimeAnalytics }
