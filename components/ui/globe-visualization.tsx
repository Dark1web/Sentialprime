'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

// Mock disaster data points for visualization
const mockDisasterData = [
  { lat: 37.7749, lng: -122.4194, type: 'earthquake', severity: 'high', name: 'San Francisco' },
  { lat: 35.6762, lng: 139.6503, type: 'tsunami', severity: 'critical', name: 'Tokyo' },
  { lat: -33.8688, lng: 151.2093, type: 'wildfire', severity: 'medium', name: 'Sydney' },
  { lat: 51.5074, lng: -0.1278, type: 'flood', severity: 'low', name: 'London' },
  { lat: 40.7128, lng: -74.0060, type: 'storm', severity: 'medium', name: 'New York' },
  { lat: -23.5505, lng: -46.6333, type: 'landslide', severity: 'high', name: 'São Paulo' },
  { lat: 19.4326, lng: -99.1332, type: 'earthquake', severity: 'medium', name: 'Mexico City' },
  { lat: 55.7558, lng: 37.6176, type: 'blizzard', severity: 'low', name: 'Moscow' },
]

const severityColors = {
  low: '#10b981', // green
  medium: '#f59e0b', // yellow
  high: '#f97316', // orange
  critical: '#ef4444', // red
}

export function GlobeVisualization() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [animationFrame, setAnimationFrame] = useState(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * window.devicePixelRatio
      canvas.height = rect.height * window.devicePixelRatio
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
      canvas.style.width = rect.width + 'px'
      canvas.style.height = rect.height + 'px'
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    const animate = () => {
      const rect = canvas.getBoundingClientRect()

      // Ensure valid dimensions
      if (rect.width <= 0 || rect.height <= 0) {
        requestAnimationFrame(animate)
        return
      }

      const centerX = rect.width / 2
      const centerY = rect.height / 2
      const radius = Math.min(centerX, centerY) * 0.8

      // Ensure valid radius
      if (radius <= 0) {
        requestAnimationFrame(animate)
        return
      }

      // Clear canvas
      ctx.clearRect(0, 0, rect.width, rect.height)

      // Draw globe outline
      ctx.beginPath()
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI)
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.3)' // blue-500 with opacity
      ctx.lineWidth = 2
      ctx.stroke()

      // Draw grid lines
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.1)'
      ctx.lineWidth = 1

      // Longitude lines
      for (let i = 0; i < 12; i++) {
        const angle = (i * Math.PI) / 6
        const radiusX = Math.abs(radius * Math.cos(angle))
        if (radiusX > 0 && radius > 0) {
          ctx.beginPath()
          ctx.ellipse(centerX, centerY, radiusX, radius, 0, 0, 2 * Math.PI)
          ctx.stroke()
        }
      }

      // Latitude lines
      for (let i = 1; i < 6; i++) {
        const y = (radius * i) / 3
        const sqrtValue = Math.sqrt(Math.max(0, 1 - (y / radius) ** 2))
        const radiusX = radius * sqrtValue
        const radiusY = radius / 8

        if (radiusX > 0 && radiusY > 0 && !isNaN(radiusX) && !isNaN(radiusY)) {
          ctx.beginPath()
          ctx.ellipse(centerX, centerY - y, radiusX, radiusY, 0, 0, 2 * Math.PI)
          ctx.stroke()
          ctx.beginPath()
          ctx.ellipse(centerX, centerY + y, radiusX, radiusY, 0, 0, 2 * Math.PI)
          ctx.stroke()
        }
      }

      // Draw disaster points
      mockDisasterData.forEach((disaster, index) => {
        // Convert lat/lng to canvas coordinates (simplified projection)
        const x = centerX + (disaster.lng / 180) * radius * 0.8
        const y = centerY - (disaster.lat / 90) * radius * 0.8

        // Pulsing effect
        const pulseScale = 1 + 0.3 * Math.sin((animationFrame + index * 30) * 0.05)
        const baseSize = disaster.severity === 'critical' ? 8 : disaster.severity === 'high' ? 6 : 4

        // Ensure valid coordinates and sizes
        if (isNaN(x) || isNaN(y) || baseSize <= 0 || pulseScale <= 0) return

        // Draw outer glow
        const outerRadius = baseSize * pulseScale * 2
        if (outerRadius > 0) {
          const gradient = ctx.createRadialGradient(x, y, 0, x, y, outerRadius)
          gradient.addColorStop(0, severityColors[disaster.severity] + '80')
          gradient.addColorStop(1, severityColors[disaster.severity] + '00')

          ctx.fillStyle = gradient
          ctx.beginPath()
          ctx.arc(x, y, outerRadius, 0, 2 * Math.PI)
          ctx.fill()
        }

        // Draw main point
        const mainRadius = baseSize * pulseScale
        if (mainRadius > 0) {
          ctx.fillStyle = severityColors[disaster.severity]
          ctx.beginPath()
          ctx.arc(x, y, mainRadius, 0, 2 * Math.PI)
          ctx.fill()
        }

        // Draw inner highlight
        const highlightRadius = baseSize * 0.3
        if (highlightRadius > 0) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
          ctx.beginPath()
          ctx.arc(x - baseSize * 0.3, y - baseSize * 0.3, highlightRadius, 0, 2 * Math.PI)
          ctx.fill()
        }
      })

      setAnimationFrame(prev => prev + 1)
      requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
    }
  }, [animationFrame])

  return (
    <div className="relative w-full h-full">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ background: 'transparent' }}
      />
      
      {/* Legend */}
      <div className="absolute bottom-4 right-4 bg-background/80 backdrop-blur-sm rounded-lg p-3 border border-border/50">
        <div className="text-xs font-medium mb-2">Threat Levels</div>
        <div className="space-y-1">
          {Object.entries(severityColors).map(([severity, color]) => (
            <div key={severity} className="flex items-center space-x-2">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: color }}
              />
              <span className="text-xs capitalize">{severity}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Active Monitoring Indicator */}
      <motion.div
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute top-4 left-4 bg-background/80 backdrop-blur-sm rounded-lg p-3 border border-border/50"
      >
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-xs font-medium">Live Monitoring</span>
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          {mockDisasterData.length} Active Events
        </div>
      </motion.div>
    </div>
  )
}
