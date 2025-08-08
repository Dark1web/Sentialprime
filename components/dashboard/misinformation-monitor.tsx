'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { AlertTriangle, Shield, Eye, TrendingUp, MessageSquare, CheckCircle, XCircle, Clock } from 'lucide-react'

interface MisinformationAlert {
  id: string
  title: string
  flagged_content: string[]
  confidence: number
  verification_status: 'verified' | 'partially_verified' | 'under_review' | 'flagged'
  timestamp?: string
  source?: string
}

interface MisinformationMonitorProps {
  alerts: MisinformationAlert[]
  className?: string
}

export function MisinformationMonitor({ alerts, className = '' }: MisinformationMonitorProps) {
  const [selectedAlert, setSelectedAlert] = useState<MisinformationAlert | null>(null)
  const [filter, setFilter] = useState<'all' | 'flagged' | 'under_review'>('all')

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'flagged':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'under_review':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'partially_verified':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />
      default:
        return <Eye className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return 'bg-green-500/10 text-green-500 border-green-500/20'
      case 'flagged':
        return 'bg-red-500/10 text-red-500 border-red-500/20'
      case 'under_review':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
      case 'partially_verified':
        return 'bg-orange-500/10 text-orange-500 border-orange-500/20'
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20'
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-red-500'
    if (confidence >= 0.6) return 'text-orange-500'
    if (confidence >= 0.4) return 'text-yellow-500'
    return 'text-green-500'
  }

  const filteredAlerts = alerts.filter(alert => {
    if (filter === 'all') return true
    if (filter === 'flagged') return alert.verification_status === 'flagged'
    if (filter === 'under_review') return alert.verification_status === 'under_review'
    return true
  })

  const stats = {
    total: alerts.length,
    flagged: alerts.filter(a => a.verification_status === 'flagged').length,
    underReview: alerts.filter(a => a.verification_status === 'under_review').length,
    verified: alerts.filter(a => a.verification_status === 'verified').length
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with Stats */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-blue-500" />
          <h2 className="text-xl font-semibold">Misinformation Monitor</h2>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span>{stats.flagged} Flagged</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
            <span>{stats.underReview} Under Review</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>{stats.verified} Verified</span>
          </div>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-2">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('all')}
        >
          All ({stats.total})
        </Button>
        <Button
          variant={filter === 'flagged' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('flagged')}
        >
          Flagged ({stats.flagged})
        </Button>
        <Button
          variant={filter === 'under_review' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('under_review')}
        >
          Under Review ({stats.underReview})
        </Button>
      </div>

      {/* Alerts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Alerts List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Alerts</CardTitle>
            <CardDescription>
              Misinformation detection results from social media and news sources
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <div className="space-y-3">
                {filteredAlerts.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No alerts found for the selected filter</p>
                  </div>
                ) : (
                  filteredAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors hover:bg-muted/50 ${
                        selectedAlert?.id === alert.id ? 'bg-muted border-primary' : ''
                      }`}
                      onClick={() => setSelectedAlert(alert)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-sm line-clamp-2">{alert.title}</h4>
                        {getStatusIcon(alert.verification_status)}
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Badge className={`text-xs ${getStatusColor(alert.verification_status)}`}>
                          {alert.verification_status.replace('_', ' ')}
                        </Badge>
                        <span className={`text-xs font-medium ${getConfidenceColor(alert.confidence)}`}>
                          {Math.round(alert.confidence * 100)}% confidence
                        </span>
                      </div>
                      
                      {alert.flagged_content.length > 0 && (
                        <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                          {alert.flagged_content[0]}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Alert Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Alert Details</CardTitle>
            <CardDescription>
              Detailed analysis of selected misinformation alert
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedAlert ? (
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">{selectedAlert.title}</h4>
                  <div className="flex items-center gap-2 mb-3">
                    {getStatusIcon(selectedAlert.verification_status)}
                    <Badge className={`${getStatusColor(selectedAlert.verification_status)}`}>
                      {selectedAlert.verification_status.replace('_', ' ')}
                    </Badge>
                    <span className={`text-sm font-medium ${getConfidenceColor(selectedAlert.confidence)}`}>
                      {Math.round(selectedAlert.confidence * 100)}% confidence
                    </span>
                  </div>
                </div>

                <div>
                  <h5 className="font-medium text-sm mb-2">Flagged Content:</h5>
                  <div className="space-y-2">
                    {selectedAlert.flagged_content.length > 0 ? (
                      selectedAlert.flagged_content.map((content, index) => (
                        <div key={index} className="p-2 bg-red-500/10 border border-red-500/20 rounded text-sm">
                          <AlertTriangle className="h-4 w-4 text-red-500 inline mr-2" />
                          {content}
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No specific content flagged</p>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4 mr-2" />
                      View Source
                    </Button>
                    <Button size="sm" variant="outline">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Track Spread
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Shield className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Select an alert to view details</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
