'use client'

import React from 'react'
import dynamic from 'next/dynamic'

// Create a dynamic component that only loads on client side
const DynamicMapComponent = dynamic(() => import('./disaster-map-client'), { 
  ssr: false,
  loading: () => (
    <div className="bg-muted rounded-lg flex items-center justify-center" style={{ height: '400px' }}>
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
        <p className="text-sm text-muted-foreground">Loading map...</p>
      </div>
    </div>
  )
})

interface DisasterData {
  id: string
  type: string
  title: string
  description?: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  status: string
  latitude: number
  longitude: number
  address?: string
  affected_population?: number
  casualties?: number
  created_at: string
}

interface DisasterMapProps {
  disasters: DisasterData[]
  center?: [number, number]
  zoom?: number
  height?: string
  onDisasterClick?: (disaster: DisasterData) => void
  showHeatmap?: boolean
  showClusters?: boolean
  className?: string
}

export function DisasterMap({
  disasters,
  center = [39.8283, -98.5795], // Center of USA
  zoom = 4,
  height = '400px',
  onDisasterClick,
  showHeatmap = false,
  showClusters = false,
  className = ''
}: DisasterMapProps) {
  return (
    <div className={`disaster-map-wrapper map-container ${className}`} style={{ height }}>
      <DynamicMapComponent
        disasters={disasters}
        center={center}
        zoom={zoom}
        height="100%"
        onDisasterClick={onDisasterClick}
        showHeatmap={showHeatmap}
        showClusters={showClusters}
        className="w-full h-full"
      />
    </div>
  )
}
