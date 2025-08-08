'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  Zap,
  Wifi,
  WifiOff,
  TrendingUp,
  TrendingDown
} from 'lucide-react'
import { useRealtimeData } from '@/hooks/use-realtime-data'

interface RealtimeDemoProps {
  onClose?: () => void
}

export function RealtimeDemo({ onClose }: RealtimeDemoProps) {
  const [demoData, setDemoData] = useState({
    disasters: [],
    alerts: [],
    stats: {
      activeIncidents: 0,
      resolvedToday: 0,
      systemHealth: 0,
      responseTime: '0s',
      usersOnline: 0,
      regionsMonitored: 0
    }
  })

  const [isBroadcasting, setIsBroadcasting] = useState(false)
  const [lastBroadcast, setLastBroadcast] = useState<string | null>(null)

  // Real-time data hook
  const {
    data: realtimeData,
    isConnected,
    error: realtimeError,
    loading: realtimeLoading,
    refresh: refreshRealtime,
    broadcast: broadcastData
  } = useRealtimeData({
    pollingInterval: 10000, // 10 seconds
    useSSE: true,
    channels: ['disasters', 'alerts', 'stats']
  })

  // Update demo data when real-time data changes
  useEffect(() => {
    if (realtimeData.disasters.length > 0) {
      setDemoData(prev => ({
        ...prev,
        disasters: realtimeData.disasters
      }))
    }
    if (realtimeData.alerts.length > 0) {
      setDemoData(prev => ({
        ...prev,
        alerts: realtimeData.alerts
      }))
    }
    if (realtimeData.stats && Object.keys(realtimeData.stats).length > 0) {
      setDemoData(prev => ({
        ...prev,
        stats: { ...prev.stats, ...realtimeData.stats }
      }))
    }
  }, [realtimeData])

  // Demo data generators
  const generateDemoDisaster = () => ({
    id: `demo-disaster-${Date.now()}`,
    type: ['flood', 'wildfire', 'earthquake', 'storm'][Math.floor(Math.random() * 4)],
    title: `Demo ${['Flood', 'Wildfire', 'Earthquake', 'Storm'][Math.floor(Math.random() * 4)]} Alert`,
    description: 'This is a demo disaster event for testing real-time updates',
    severity: ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)],
    latitude: 40.7128 + (Math.random() - 0.5) * 10,
    longitude: -74.0060 + (Math.random() - 0.5) * 10,
    address: 'Demo Location',
    affected_population: Math.floor(Math.random() * 10000),
    source: 'Demo System',
    timestamp: new Date().toISOString()
  })

  const generateDemoAlert = () => ({
    id: `demo-alert-${Date.now()}`,
    message: `Demo alert: ${['High activity detected', 'System warning', 'Emergency notification', 'Test alert'][Math.floor(Math.random() * 4)]}`,
    type: ['info', 'warning', 'critical'][Math.floor(Math.random() * 3)],
    severity: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
    timestamp: new Date().toISOString()
  })

  const generateDemoStats = () => ({
    activeIncidents: Math.floor(Math.random() * 50) + 10,
    resolvedToday: Math.floor(Math.random() * 200) + 100,
    systemHealth: Math.floor(Math.random() * 20) + 80,
    responseTime: `${(Math.random() * 3 + 1).toFixed(1)}s`,
    usersOnline: Math.floor(Math.random() * 2000) + 500,
    regionsMonitored: Math.floor(Math.random() * 50) + 50
  })

  // Broadcast demo data
  const broadcastDemoData = async (channel: string, data: any) => {
    setIsBroadcasting(true)
    try {
      await broadcastData(channel, data)
      setLastBroadcast(new Date().toLocaleTimeString())
    } catch (error) {
      console.error('Broadcast error:', error)
    } finally {
      setIsBroadcasting(false)
    }
  }

  const handleBroadcastDisaster = () => {
    const disaster = generateDemoDisaster()
    broadcastDemoData('disasters', [disaster])
  }

  const handleBroadcastAlert = () => {
    const alert = generateDemoAlert()
    broadcastDemoData('alerts', [alert])
  }

  const handleBroadcastStats = () => {
    const stats = generateDemoStats()
    broadcastDemoData('stats', stats)
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-100 dark:bg-red-900/30'
      case 'high': return 'text-orange-600 bg-orange-100 dark:bg-orange-900/30'
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30'
      case 'low': return 'text-green-600 bg-green-100 dark:bg-green-900/30'
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30'
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-background rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto"
      >
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <Activity className="w-5 h-5 mr-2 text-blue-500" />
                Real-time Data Demo
              </CardTitle>
              <div className="flex items-center space-x-2">
                {isConnected ? (
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    <Wifi className="w-3 h-3 mr-1" />
                    Connected
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-red-600 border-red-600">
                    <WifiOff className="w-3 h-3 mr-1" />
                    Disconnected
                  </Badge>
                )}
                {onClose && (
                  <Button variant="outline" size="sm" onClick={onClose}>
                    Close
                  </Button>
                )}
              </div>
            </div>
            <CardDescription>
              Test real-time data broadcasting and see live updates on your dashboard
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Connection Status */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Connection</p>
                      <p className={`text-lg font-bold ${isConnected ? 'text-green-500' : 'text-red-500'}`}>
                        {isConnected ? 'Live' : 'Offline'}
                      </p>
                    </div>
                    {isConnected ? (
                      <CheckCircle className="w-6 h-6 text-green-500" />
                    ) : (
                      <XCircle className="w-6 h-6 text-red-500" />
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Last Update</p>
                      <p className="text-lg font-bold text-blue-500">
                        {realtimeData.lastUpdated ? 
                          new Date(realtimeData.lastUpdated).toLocaleTimeString() : 
                          'Never'
                        }
                      </p>
                    </div>
                    <Zap className="w-6 h-6 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Data Points</p>
                      <p className="text-lg font-bold text-purple-500">
                        {demoData.disasters.length + demoData.alerts.length}
                      </p>
                    </div>
                    <TrendingUp className="w-6 h-6 text-purple-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Broadcast Controls */}
            <Card>
              <CardHeader>
                <CardTitle>Broadcast Demo Data</CardTitle>
                <CardDescription>
                  Click the buttons below to broadcast test data to your dashboard
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button
                    onClick={handleBroadcastDisaster}
                    disabled={isBroadcasting || !isConnected}
                    className="w-full"
                  >
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Broadcast Disaster
                  </Button>
                  
                  <Button
                    onClick={handleBroadcastAlert}
                    disabled={isBroadcasting || !isConnected}
                    className="w-full"
                    variant="outline"
                  >
                    <Activity className="w-4 h-4 mr-2" />
                    Broadcast Alert
                  </Button>
                  
                  <Button
                    onClick={handleBroadcastStats}
                    disabled={isBroadcasting || !isConnected}
                    className="w-full"
                    variant="outline"
                  >
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Broadcast Stats
                  </Button>
                </div>
                
                {lastBroadcast && (
                  <div className="mt-4 text-sm text-muted-foreground">
                    Last broadcast: {lastBroadcast}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Live Data Display */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Disasters */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <AlertTriangle className="w-4 h-4 mr-2 text-red-500" />
                    Recent Disasters ({demoData.disasters.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-40 overflow-y-auto">
                    {demoData.disasters.length > 0 ? (
                      demoData.disasters.slice(-5).map((disaster: any, index: number) => (
                        <div
                          key={disaster.id || index}
                          className={`p-3 rounded-lg border ${getSeverityColor(disaster.severity)}`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-semibold text-sm">{disaster.title}</p>
                              <p className="text-xs text-muted-foreground">{disaster.type}</p>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {disaster.severity}
                            </Badge>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No disasters broadcasted yet</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Alerts */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="w-4 h-4 mr-2 text-orange-500" />
                    Recent Alerts ({demoData.alerts.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-40 overflow-y-auto">
                    {demoData.alerts.length > 0 ? (
                      demoData.alerts.slice(-5).map((alert: any, index: number) => (
                        <div
                          key={alert.id || index}
                          className="p-3 rounded-lg border bg-muted/50"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm">{alert.message}</p>
                              <p className="text-xs text-muted-foreground">{alert.type}</p>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {alert.severity}
                            </Badge>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No alerts broadcasted yet</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Error Display */}
            {realtimeError && (
              <Card className="border-red-200 bg-red-50 dark:bg-red-900/20">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <XCircle className="w-4 h-4 text-red-500" />
                    <p className="text-sm text-red-600 dark:text-red-400">
                      Connection error: {realtimeError}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Instructions */}
            <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200">
              <CardContent className="p-4">
                <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                  How to Test:
                </h4>
                <ol className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                  <li>1. Open your dashboard at <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">/dashboard</code></li>
                  <li>2. Click the broadcast buttons above</li>
                  <li>3. Watch the dashboard update in real-time</li>
                  <li>4. Check the connection status indicator</li>
                </ol>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
