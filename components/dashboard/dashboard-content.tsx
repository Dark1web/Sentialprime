'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Activity,
  AlertTriangle,
  Shield,
  Users,
  TrendingUp,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Zap,
  Globe,
  Phone,
  Mail,
  RefreshCw,
  Map,
  Home,
  Wifi,
  WifiOff,
  ArrowLeft,
  ArrowRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { DisasterMap } from '@/components/ui/disaster-map'
import { useAuth } from '@/lib/auth'
import { EnhancedDisasterData } from '../../types/enhanced-disaster'
import { MisinformationMonitor } from './misinformation-monitor'
import { useRealtimeData } from '@/hooks/use-realtime-data'
import { FloatingNavigation } from '@/components/ui/floating-navigation'
import Link from 'next/link'

// Mock data for dashboard
const mockStats = {
  activeIncidents: 23,
  resolvedToday: 156,
  systemHealth: 98.7,
  responseTime: '2.3s',
  usersOnline: 1247,
  regionsMonitored: 85
}

const mockIncidents = [
  {
    id: 1,
    type: 'Wildfire',
    location: 'California, USA',
    severity: 'critical',
    time: '2 minutes ago',
    status: 'active'
  },
  {
    id: 2,
    type: 'Flood Warning',
    location: 'Bangladesh',
    severity: 'high',
    time: '15 minutes ago',
    status: 'monitoring'
  },
  {
    id: 3,
    type: 'Earthquake',
    location: 'Japan',
    severity: 'medium',
    time: '1 hour ago',
    status: 'resolved'
  }
]

const mockAlerts = [
  {
    id: 1,
    message: 'High misinformation activity detected in Region 7',
    type: 'warning',
    time: '5 minutes ago'
  },
  {
    id: 2,
    message: 'Emergency triage queue exceeding capacity',
    type: 'critical',
    time: '12 minutes ago'
  },
  {
    id: 3,
    message: 'Satellite imagery analysis completed for wildfire zone',
    type: 'info',
    time: '25 minutes ago'
  }
]

export function DashboardContent() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [disasters, setDisasters] = useState<EnhancedDisasterData[]>([])
  const [stats, setStats] = useState(mockStats)
  const [loading, setLoading] = useState(false)
  const [selectedDisaster, setSelectedDisaster] = useState<EnhancedDisasterData | null>(null)
  const [misinformationAlerts, setMisinformationAlerts] = useState<any[]>([])
  const [aiInsights, setAiInsights] = useState<any[]>([])
  const { user, profile } = useAuth()

  // Real-time data hook
  const {
    data: realtimeData,
    isConnected,
    error: realtimeError,
    loading: realtimeLoading,
    refresh: refreshRealtime
  } = useRealtimeData({
    pollingInterval: 15000, // 15 seconds
    useSSE: true,
    channels: ['disasters', 'alerts', 'stats']
  })

  useEffect(() => {
    fetchDashboardData()
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Update dashboard data when real-time data changes
  useEffect(() => {
    if (realtimeData.disasters.length > 0) {
      setDisasters(realtimeData.disasters)
    }
    if (realtimeData.alerts.length > 0) {
      setMisinformationAlerts(realtimeData.alerts)
    }
    if (realtimeData.stats && Object.keys(realtimeData.stats).length > 0) {
      setStats(prev => ({
        ...prev,
        ...realtimeData.stats
      }))
    }
  }, [realtimeData])

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      // Fetch disasters data
      const disastersResponse = await fetch('/api/database/disasters?limit=50&status=active')
      if (disastersResponse.ok) {
        const disastersData = await disastersResponse.json()
        setDisasters(disastersData.disasters || [])
      }

      // Fetch misinformation alerts
      const alertsResponse = await fetch('/api/misinformation/analyze')
      if (alertsResponse.ok) {
        const alertsData = await alertsResponse.json()
        setMisinformationAlerts(alertsData.alerts || [])
      }

      // Fetch AI insights
      const insightsResponse = await fetch('/api/ai/digital-correlator')
      if (insightsResponse.ok) {
        const insightsData = await insightsResponse.json()
        setAiInsights(insightsData.insights || [])
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDisasterClick = (disaster: any) => {
    setSelectedDisaster(disaster)
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

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical': return <AlertTriangle className="w-4 h-4 text-red-500" />
      case 'warning': return <AlertCircle className="w-4 h-4 text-yellow-500" />
      case 'info': return <CheckCircle className="w-4 h-4 text-blue-500" />
      default: return <AlertCircle className="w-4 h-4 text-gray-500" />
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header is rendered globally in layout */}
      <main className="pt-16">
        {/* Dashboard Header */}
        <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-b border-blue-500/20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between">
              <div>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center mb-4"
                >
                  <Shield className="w-10 h-10 text-blue-500 mr-4" />
                  <div>
                    <h1 className="text-3xl font-bold text-blue-600">
                      Disaster Intelligence Dashboard
                    </h1>
                    <p className="text-muted-foreground">
                      Real-time monitoring and analysis
                    </p>
                  </div>
                </motion.div>
                
                <div className="flex items-center space-x-4">
                  <Badge variant="outline" className="text-sm">
                    <Activity className="w-4 h-4 mr-2" />
                    Live Monitoring
                  </Badge>
                  <div className="text-sm text-muted-foreground">
                    {currentTime.toLocaleString()}
                  </div>
                  {/* Real-time connection status */}
                  <div className="flex items-center space-x-2">
                    {isConnected ? (
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        <Wifi className="w-3 h-3 mr-1" />
                        Live
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-red-600 border-red-600">
                        <WifiOff className="w-3 h-3 mr-1" />
                        Offline
                      </Badge>
                    )}
                    {realtimeError && (
                      <Badge variant="destructive" className="text-xs">
                        Error
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Navigation Section */}
              <div className="flex items-center space-x-3">
                {/* Back to Home */}
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                >
                  <Link href="/">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Home
                  </Link>
                </Button>
                
                {/* Emergency Access */}
                <Button
                  size="sm"
                  className="bg-emergency-red hover:bg-emergency-red/90 text-white"
                  asChild
                >
                  <Link href="/emergency">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Emergency
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Active Incidents</p>
                      <p className="text-2xl font-bold text-red-500">{stats.activeIncidents}</p>
                    </div>
                    <AlertTriangle className="w-8 h-8 text-red-500" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Resolved Today</p>
                      <p className="text-2xl font-bold text-green-500">{stats.resolvedToday}</p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">System Health</p>
                      <p className="text-2xl font-bold text-blue-500">{stats.systemHealth}%</p>
                    </div>
                    <Shield className="w-8 h-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Response Time</p>
                      <p className="text-2xl font-bold text-purple-500">{stats.responseTime}</p>
                    </div>
                    <Zap className="w-8 h-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Users Online</p>
                      <p className="text-2xl font-bold text-orange-500">{stats.usersOnline.toLocaleString()}</p>
                    </div>
                    <Users className="w-8 h-8 text-orange-500" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Regions</p>
                      <p className="text-2xl font-bold text-teal-500">{stats.regionsMonitored}</p>
                    </div>
                    <Globe className="w-8 h-8 text-teal-500" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Real-time Map */}
          <div className="mb-8">
            <Card className="overflow-hidden">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <Map className="w-5 h-5 mr-2 text-blue-500" />
                    Live Disaster Map
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        fetchDashboardData()
                        refreshRealtime()
                      }}
                      disabled={loading || realtimeLoading}
                    >
                      <RefreshCw className={`w-4 h-4 mr-2 ${loading || realtimeLoading ? 'animate-spin' : ''}`} />
                      Refresh
                    </Button>
                    {user && (
                      <Badge variant="outline" className="text-xs">
                        {profile?.role || 'user'}
                      </Badge>
                    )}
                  </div>
                </div>
                <CardDescription>
                  Real-time visualization of active disasters and emergency situations
                  {realtimeData.lastUpdated && (
                    <span className="ml-2 text-xs text-muted-foreground">
                      Last updated: {new Date(realtimeData.lastUpdated).toLocaleTimeString()}
                    </span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="w-full h-[400px] md:h-[500px] relative">
                  <DisasterMap
                    disasters={disasters}
                    height="100%"
                    onDisasterClick={handleDisasterClick}
                    className="w-full h-full absolute inset-0"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Misinformation Monitor */}
          <div className="mb-8">
            <MisinformationMonitor alerts={misinformationAlerts} />
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Incidents */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <AlertTriangle className="w-5 h-5 mr-2 text-red-500" />
                    Recent Incidents
                  </CardTitle>
                  <CardDescription>
                    Latest disaster events and emergency situations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockIncidents.map((incident, index) => (
                      <motion.div
                        key={incident.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`p-4 rounded-lg border ${getSeverityColor(incident.severity)}`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold">{incident.type}</h4>
                            <p className="text-sm text-muted-foreground flex items-center mt-1">
                              <MapPin className="w-4 h-4 mr-1" />
                              {incident.location}
                            </p>
                          </div>
                          <div className="text-right">
                            <Badge variant={incident.severity as any} className="mb-1">
                              {incident.severity}
                            </Badge>
                            <p className="text-xs text-muted-foreground flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              {incident.time}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* System Alerts */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <AlertCircle className="w-5 h-5 mr-2 text-orange-500" />
                    System Alerts
                  </CardTitle>
                  <CardDescription>
                    Important system notifications
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockAlerts.map((alert, index) => (
                      <motion.div
                        key={alert.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-start space-x-3 p-3 rounded-lg bg-muted/50"
                      >
                        {getAlertIcon(alert.type)}
                        <div className="flex-1">
                          <p className="text-sm">{alert.message}</p>
                          <p className="text-xs text-muted-foreground mt-1">{alert.time}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start" variant="outline">
                    <Phone className="w-4 h-4 mr-2" />
                    Emergency Hotline
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Mail className="w-4 h-4 mr-2" />
                    Report Incident
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    View Analytics
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      {/* Floating Navigation */}
      <FloatingNavigation />

      {/* Footer is rendered on landing only; keep page lightweight */}
    </div>
  )
}
