import { NextRequest } from 'next/server'

// Store connected clients
const clients = new Set<any>()

// Broadcast function
function broadcast(data: any) {
  clients.forEach(client => {
    if (client.readyState === 1) { // OPEN
      client.write(`data: ${JSON.stringify(data)}\n\n`)
    }
  })
}

// Clean up disconnected clients
function cleanupClients() {
  clients.forEach(client => {
    if (client.readyState === 3) { // CLOSED
      clients.delete(client)
    }
  })
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const channel = searchParams.get('channel') || 'all'

  // Set up SSE headers
  const headers = {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Cache-Control'
  }

  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection message
      controller.enqueue(`data: ${JSON.stringify({
        type: 'connection',
        message: 'Connected to SentinelX real-time updates',
        channel,
        timestamp: new Date().toISOString()
      })}\n\n`)

      // Store the controller for broadcasting
      const client = {
        controller,
        readyState: 1, // OPEN
        write: (data: string) => controller.enqueue(data)
      }
      
      clients.add(client)

      // Clean up on disconnect
      request.signal.addEventListener('abort', () => {
        client.readyState = 3 // CLOSED
        clients.delete(client)
        cleanupClients()
      })

      // Send heartbeat every 30 seconds
      const heartbeat = setInterval(() => {
        if (client.readyState === 1) {
          controller.enqueue(`data: ${JSON.stringify({
            type: 'heartbeat',
            timestamp: new Date().toISOString()
          })}\n\n`)
        } else {
          clearInterval(heartbeat)
        }
      }, 30000)

      // Clean up interval on disconnect
      request.signal.addEventListener('abort', () => {
        clearInterval(heartbeat)
      })
    }
  })

  return new Response(stream, { headers })
}

// POST endpoint to broadcast data
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { channel, data, event_type } = body

    const message = {
      type: 'data',
      channel,
      event_type,
      data,
      timestamp: new Date().toISOString()
    }

    broadcast(message)

    return Response.json({
      success: true,
      message: 'Data broadcasted successfully',
      clients_connected: clients.size
    })

  } catch (error) {
    console.error('SSE broadcast error:', error)
    return Response.json(
      { success: false, error: 'Failed to broadcast data' },
      { status: 500 }
    )
  }
}

// Export broadcast function for use in other parts of the app
export { broadcast }
