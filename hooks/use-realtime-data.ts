'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

interface RealtimeData {
  disasters: any[]
  alerts: any[]
  stats: any
  lastUpdated: string
}

interface UseRealtimeDataOptions {
  pollingInterval?: number // in milliseconds
  useSSE?: boolean
  channels?: string[]
}

export function useRealtimeData(options: UseRealtimeDataOptions = {}) {
  const {
    pollingInterval = 30000, // 30 seconds
    useSSE = true,
    channels = ['disasters', 'alerts', 'stats']
  } = options

  const [data, setData] = useState<RealtimeData>({
    disasters: [],
    alerts: [],
    stats: {},
    lastUpdated: new Date().toISOString()
  })
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const eventSourceRef = useRef<EventSource | null>(null)
  const pollingRef = useRef<NodeJS.Timeout | null>(null)

  // Fetch data from API
  const fetchData = useCallback(async () => {
    try {
      setError(null)
      
      // Fetch disasters
      const disastersResponse = await fetch('/api/database/disasters?limit=50&status=active')
      const disastersData = disastersResponse.ok ? await disastersResponse.json() : { disasters: [] }
      
      // Fetch alerts
      const alertsResponse = await fetch('/api/misinformation/analyze')
      const alertsData = alertsResponse.ok ? await alertsResponse.json() : { alerts: [] }
      
      // Fetch stats
      const statsResponse = await fetch('/api/realtime/websocket?action=stats')
      const statsData = statsResponse.ok ? await statsResponse.json() : { data: {} }

      setData({
        disasters: disastersData.disasters || [],
        alerts: alertsData.alerts || [],
        stats: statsData.data || {},
        lastUpdated: new Date().toISOString()
      })
      
      setIsConnected(true)
      setLoading(false)
    } catch (err) {
      console.error('Error fetching real-time data:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch data')
      setIsConnected(false)
    }
  }, [])

  // Set up SSE connection
  const setupSSE = useCallback(() => {
    if (!useSSE) return

    try {
      const channel = channels.join(',')
      const eventSource = new EventSource(`/api/realtime/sse?channel=${channel}`)
      
      eventSource.onopen = () => {
        console.log('SSE connection established')
        setIsConnected(true)
        setError(null)
      }

      eventSource.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data)
          
          switch (message.type) {
            case 'connection':
              console.log('SSE connected:', message.message)
              break
              
            case 'heartbeat':
              // Keep connection alive
              break
              
            case 'data':
              // Update specific data based on channel
              if (message.channel === 'disasters') {
                setData(prev => ({
                  ...prev,
                  disasters: message.data,
                  lastUpdated: message.timestamp
                }))
              } else if (message.channel === 'alerts') {
                setData(prev => ({
                  ...prev,
                  alerts: message.data,
                  lastUpdated: message.timestamp
                }))
              } else if (message.channel === 'stats') {
                setData(prev => ({
                  ...prev,
                  stats: message.data,
                  lastUpdated: message.timestamp
                }))
              }
              break
          }
        } catch (err) {
          console.error('Error parsing SSE message:', err)
        }
      }

      eventSource.onerror = (error) => {
        console.error('SSE connection error:', error)
        setIsConnected(false)
        setError('SSE connection failed')
        
        // Fallback to polling
        setupPolling()
      }

      eventSourceRef.current = eventSource
    } catch (err) {
      console.error('Failed to setup SSE:', err)
      // Fallback to polling
      setupPolling()
    }
  }, [useSSE, channels])

  // Set up polling fallback
  const setupPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current)
    }

    // Initial fetch
    fetchData()

    // Set up polling interval
    pollingRef.current = setInterval(() => {
      fetchData()
    }, pollingInterval)
  }, [fetchData, pollingInterval])

  // Cleanup function
  const cleanup = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }
    
    if (pollingRef.current) {
      clearInterval(pollingRef.current)
      pollingRef.current = null
    }
  }, [])

  // Initialize real-time connection
  useEffect(() => {
    if (useSSE) {
      setupSSE()
    } else {
      setupPolling()
    }

    return cleanup
  }, [useSSE, setupSSE, setupPolling, cleanup])

  // Manual refresh function
  const refresh = useCallback(() => {
    fetchData()
  }, [fetchData])

  // Broadcast data function (for testing)
  const broadcast = useCallback(async (channel: string, data: any) => {
    try {
      await fetch('/api/realtime/sse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          channel,
          data,
          event_type: 'update'
        })
      })
    } catch (err) {
      console.error('Failed to broadcast data:', err)
    }
  }, [])

  return {
    data,
    isConnected,
    error,
    loading,
    refresh,
    broadcast
  }
}
