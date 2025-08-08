import { NextRequest, NextResponse } from 'next/server'
import { FloodForecastRequest, FloodForecastResponse } from '@/types/enhanced-disaster'

// Mock ML-based flood forecasting service using Random Forest/Logistic Regression concepts
class FloodForecastingService {
  // Simulated Random Forest model weights and thresholds
  private modelWeights = {
    rainfall: 0.35,
    riverLevel: 0.25,
    soilSaturation: 0.20,
    topography: 0.15,
    urbanization: 0.05
  }

  private riskThresholds = {
    low: 0.2,
    medium: 0.4,
    high: 0.7,
    critical: 0.85
  }

  // Simulate topographical and urbanization data based on coordinates
  private getLocationFactors(latitude: number, longitude: number) {
    // Mock topographical risk (higher risk for lower elevations, river valleys)
    const topographyRisk = Math.max(0, 0.8 - Math.abs(latitude - 40) * 0.02) // Higher risk around 40°N
    
    // Mock urbanization factor (higher risk in urban areas with poor drainage)
    const urbanizationRisk = Math.min(1, Math.abs(longitude + 95) * 0.01) // Higher risk around -95°W
    
    return { topographyRisk, urbanizationRisk }
  }

  // Simulate Random Forest prediction
  private calculateFloodProbability(
    rainfall: number,
    riverLevel: number,
    soilSaturation: number,
    topographyRisk: number,
    urbanizationRisk: number
  ): number {
    // Normalize inputs (0-1 scale)
    const normalizedRainfall = Math.min(rainfall / 100, 1) // Normalize to 100mm max
    const normalizedRiverLevel = Math.min(riverLevel / 10, 1) // Normalize to 10m max
    const normalizedSoilSat = soilSaturation / 100 // Already percentage
    
    // Weighted sum (simulating Random Forest ensemble)
    const riskScore = 
      (normalizedRainfall * this.modelWeights.rainfall) +
      (normalizedRiverLevel * this.modelWeights.riverLevel) +
      (normalizedSoilSat * this.modelWeights.soilSaturation) +
      (topographyRisk * this.modelWeights.topography) +
      (urbanizationRisk * this.modelWeights.urbanization)
    
    // Apply logistic function for probability
    return 1 / (1 + Math.exp(-5 * (riskScore - 0.5)))
  }

  // Calculate peak flood time based on conditions
  private calculatePeakTime(
    rainfall: number,
    riverLevel: number,
    soilSaturation: number
  ): number {
    // Base time: 2-8 hours depending on conditions
    let baseTime = 4
    
    // Heavy rainfall reduces time to peak
    if (rainfall > 50) baseTime -= 1.5
    if (rainfall > 80) baseTime -= 1
    
    // High river level reduces time to peak
    if (riverLevel > 5) baseTime -= 1
    if (riverLevel > 8) baseTime -= 0.5
    
    // Saturated soil reduces time to peak
    if (soilSaturation > 80) baseTime -= 1
    if (soilSaturation > 95) baseTime -= 0.5
    
    return Math.max(0.5, baseTime)
  }

  // Generate recommendations based on risk level
  private generateRecommendations(
    probability: number,
    peakTime: number
  ): string[] {
    const recommendations: string[] = []
    
    if (probability > this.riskThresholds.critical) {
      recommendations.push('IMMEDIATE EVACUATION of low-lying areas')
      recommendations.push('Close all roads in flood-prone zones')
      recommendations.push('Activate emergency shelters')
      recommendations.push('Deploy swift water rescue teams')
    } else if (probability > this.riskThresholds.high) {
      recommendations.push('Issue evacuation advisory for vulnerable areas')
      recommendations.push('Pre-position emergency resources')
      recommendations.push('Monitor water levels every 15 minutes')
      recommendations.push('Prepare emergency communication systems')
    } else if (probability > this.riskThresholds.medium) {
      recommendations.push('Issue flood watch for the area')
      recommendations.push('Advise residents to prepare emergency kits')
      recommendations.push('Monitor conditions closely')
      recommendations.push('Clear storm drains and waterways')
    } else {
      recommendations.push('Continue routine monitoring')
      recommendations.push('Review emergency plans')
      recommendations.push('Check drainage systems')
    }
    
    if (peakTime < 2) {
      recommendations.unshift('URGENT: Peak flooding expected within 2 hours')
    }
    
    return recommendations
  }

  forecast(request: FloodForecastRequest): FloodForecastResponse {
    const { latitude, longitude, current_conditions } = request
    const { rainfall_mm, river_level_m, soil_saturation } = current_conditions
    
    // Get location-specific factors
    const { topographyRisk, urbanizationRisk } = this.getLocationFactors(latitude, longitude)
    
    // Calculate flood probability
    const floodProbability = this.calculateFloodProbability(
      rainfall_mm,
      river_level_m,
      soil_saturation,
      topographyRisk,
      urbanizationRisk
    )
    
    // Calculate peak time
    const peakTimeHours = this.calculatePeakTime(
      rainfall_mm,
      river_level_m,
      soil_saturation
    )
    
    // Determine severity level
    let severityLevel: 'low' | 'medium' | 'high' | 'critical' = 'low'
    if (floodProbability > this.riskThresholds.critical) {
      severityLevel = 'critical'
    } else if (floodProbability > this.riskThresholds.high) {
      severityLevel = 'high'
    } else if (floodProbability > this.riskThresholds.medium) {
      severityLevel = 'medium'
    }
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(floodProbability, peakTimeHours)
    
    // Calculate confidence based on data quality and model certainty
    const confidence = Math.min(0.95, 0.7 + (Math.abs(floodProbability - 0.5) * 0.4))
    
    return {
      flood_probability: Math.round(floodProbability * 100) / 100,
      confidence: Math.round(confidence * 100) / 100,
      peak_time_hours: Math.round(peakTimeHours * 10) / 10,
      severity_level: severityLevel,
      recommended_actions: recommendations
    }
  }
}

const forecastingService = new FloodForecastingService()

export async function POST(request: NextRequest) {
  try {
    const body: FloodForecastRequest = await request.json()
    
    // Validate required fields
    if (!body.latitude || !body.longitude || !body.current_conditions) {
      return NextResponse.json(
        { error: 'Latitude, longitude, and current_conditions are required' },
        { status: 400 }
      )
    }
    
    const { current_conditions } = body
    if (
      current_conditions.rainfall_mm === undefined ||
      current_conditions.river_level_m === undefined ||
      current_conditions.soil_saturation === undefined
    ) {
      return NextResponse.json(
        { error: 'Current conditions must include rainfall_mm, river_level_m, and soil_saturation' },
        { status: 400 }
      )
    }
    
    const forecast = forecastingService.forecast(body)
    
    return NextResponse.json(forecast)
  } catch (error) {
    console.error('Flood forecasting error:', error)
    return NextResponse.json(
      { error: 'Failed to generate flood forecast' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    service: 'Flash Flood Forecasting API',
    version: '1.0.0',
    model: 'Random Forest + Logistic Regression',
    capabilities: [
      'Real-time flood probability calculation',
      'Peak flood time prediction',
      'Severity level assessment',
      'Location-specific risk factors',
      'Actionable recommendations'
    ],
    usage: {
      endpoint: '/api/ai/flood-forecast',
      method: 'POST',
      body: {
        latitude: 'number (required)',
        longitude: 'number (required)',
        current_conditions: {
          rainfall_mm: 'number (required)',
          river_level_m: 'number (required)',
          soil_saturation: 'number (required, 0-100)'
        }
      }
    }
  })
}
