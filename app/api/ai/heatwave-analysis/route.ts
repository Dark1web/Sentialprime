import { NextRequest, NextResponse } from 'next/server'
import { HeatwaveAnalysisRequest, HeatwaveAnalysisResponse } from '@/types/enhanced-disaster'

// Heatwave health analysis service with Heat Index calculations
class HeatwaveAnalysisService {
  // Calculate Heat Index using the National Weather Service formula
  calculateHeatIndex(temperatureF: number, relativeHumidity: number): number {
    // Convert Celsius to Fahrenheit if needed
    const T = temperatureF
    const RH = relativeHumidity
    
    // Simple formula for temperatures below 80°F
    if (T < 80) {
      return T
    }
    
    // Full Heat Index formula for higher temperatures
    const c1 = -42.379
    const c2 = 2.04901523
    const c3 = 10.14333127
    const c4 = -0.22475541
    const c5 = -0.00683783
    const c6 = -0.05481717
    const c7 = 0.00122874
    const c8 = 0.00085282
    const c9 = -0.00000199
    
    let HI = c1 + (c2 * T) + (c3 * RH) + (c4 * T * RH) + 
             (c5 * T * T) + (c6 * RH * RH) + (c7 * T * T * RH) + 
             (c8 * T * RH * RH) + (c9 * T * T * RH * RH)
    
    // Adjustments for low humidity
    if (RH < 13 && T >= 80 && T <= 112) {
      const adjustment = ((13 - RH) / 4) * Math.sqrt((17 - Math.abs(T - 95)) / 17)
      HI -= adjustment
    }
    
    // Adjustments for high humidity
    if (RH > 85 && T >= 80 && T <= 87) {
      const adjustment = ((RH - 85) / 10) * ((87 - T) / 5)
      HI += adjustment
    }
    
    return Math.round(HI)
  }
  
  // Determine risk level based on Heat Index
  getRiskLevel(heatIndex: number): 'low' | 'medium' | 'high' | 'extreme' {
    if (heatIndex < 80) return 'low'
    if (heatIndex < 90) return 'medium'
    if (heatIndex < 105) return 'high'
    return 'extreme'
  }
  
  // Calculate vulnerable population risks
  calculateVulnerablePopulationRisk(
    heatIndex: number,
    populationData?: any
  ) {
    const baseRiskMultipliers = {
      elderly: 1.5,
      children: 1.3,
      outdoorWorkers: 1.8
    }
    
    // Risk increases exponentially with heat index
    const riskFactor = Math.min(1, (heatIndex - 70) / 50)
    
    return {
      elderly_risk: Math.min(1, riskFactor * baseRiskMultipliers.elderly),
      children_risk: Math.min(1, riskFactor * baseRiskMultipliers.children),
      outdoor_worker_risk: Math.min(1, riskFactor * baseRiskMultipliers.outdoorWorkers)
    }
  }
  
  // Generate health recommendations based on risk level
  generateHealthRecommendations(
    riskLevel: string,
    heatIndex: number,
    vulnerableRisks: any
  ): string[] {
    const recommendations: string[] = []
    
    // Base recommendations for all levels
    recommendations.push('Stay hydrated - drink water regularly')
    recommendations.push('Wear light-colored, loose-fitting clothing')
    recommendations.push('Limit outdoor activities during peak hours (10 AM - 4 PM)')
    
    switch (riskLevel) {
      case 'extreme':
        recommendations.unshift('EXTREME DANGER: Avoid all outdoor activities')
        recommendations.push('Seek immediate air conditioning or cooling centers')
        recommendations.push('Check on elderly neighbors and relatives frequently')
        recommendations.push('Never leave children or pets in vehicles')
        recommendations.push('Watch for signs of heat stroke: confusion, nausea, rapid pulse')
        recommendations.push('Call 911 immediately if heat stroke symptoms appear')
        break
        
      case 'high':
        recommendations.unshift('DANGER: Heat exhaustion and heat stroke likely')
        recommendations.push('Stay in air-conditioned areas when possible')
        recommendations.push('Take frequent breaks in shade if working outdoors')
        recommendations.push('Watch for heat exhaustion symptoms: heavy sweating, weakness')
        recommendations.push('Check on vulnerable community members')
        break
        
      case 'medium':
        recommendations.unshift('CAUTION: Heat exhaustion possible with prolonged exposure')
        recommendations.push('Take breaks in shade during outdoor work')
        recommendations.push('Be aware of heat exhaustion symptoms')
        recommendations.push('Extra precautions for elderly and children')
        break
        
      case 'low':
        recommendations.unshift('Minimal risk, but stay aware of heat safety')
        break
    }
    
    // Add vulnerable population specific recommendations
    if (vulnerableRisks.elderly_risk > 0.7) {
      recommendations.push('ELDERLY ALERT: Increased risk of heat-related illness')
      recommendations.push('Ensure elderly have access to cooling and hydration')
    }
    
    if (vulnerableRisks.children_risk > 0.7) {
      recommendations.push('CHILDREN ALERT: Monitor children closely for overheating')
      recommendations.push('Limit children\'s outdoor play time')
    }
    
    if (vulnerableRisks.outdoor_worker_risk > 0.8) {
      recommendations.push('WORKER SAFETY: Mandatory frequent breaks for outdoor workers')
      recommendations.push('Employers should provide cooling areas and extra hydration')
    }
    
    return recommendations
  }
  
  analyze(request: HeatwaveAnalysisRequest): HeatwaveAnalysisResponse {
    const { temperature_celsius, humidity_percent, population_data } = request
    
    // Convert Celsius to Fahrenheit for Heat Index calculation
    const temperatureF = (temperature_celsius * 9/5) + 32
    
    // Calculate Heat Index
    const heatIndex = this.calculateHeatIndex(temperatureF, humidity_percent)
    
    // Determine risk level
    const riskLevel = this.getRiskLevel(heatIndex)
    
    // Calculate vulnerable population risks
    const vulnerableRisks = this.calculateVulnerablePopulationRisk(
      heatIndex,
      population_data
    )
    
    // Generate health recommendations
    const healthRecommendations = this.generateHealthRecommendations(
      riskLevel,
      heatIndex,
      vulnerableRisks
    )
    
    return {
      heat_index: heatIndex,
      risk_level: riskLevel,
      vulnerable_population_risk: vulnerableRisks,
      health_recommendations: healthRecommendations
    }
  }
}

const analysisService = new HeatwaveAnalysisService()

export async function POST(request: NextRequest) {
  try {
    const body: HeatwaveAnalysisRequest = await request.json()
    
    // Validate required fields
    if (
      body.temperature_celsius === undefined ||
      body.humidity_percent === undefined
    ) {
      return NextResponse.json(
        { error: 'Temperature and humidity are required' },
        { status: 400 }
      )
    }
    
    // Validate ranges
    if (body.temperature_celsius < -50 || body.temperature_celsius > 60) {
      return NextResponse.json(
        { error: 'Temperature must be between -50°C and 60°C' },
        { status: 400 }
      )
    }
    
    if (body.humidity_percent < 0 || body.humidity_percent > 100) {
      return NextResponse.json(
        { error: 'Humidity must be between 0% and 100%' },
        { status: 400 }
      )
    }
    
    const analysis = analysisService.analyze(body)
    
    return NextResponse.json(analysis)
  } catch (error) {
    console.error('Heatwave analysis error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze heatwave conditions' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    service: 'Heatwave Health Analysis API',
    version: '1.0.0',
    capabilities: [
      'Heat Index calculation using NWS formula',
      'Risk level assessment (low/medium/high/extreme)',
      'Vulnerable population risk analysis',
      'Health and safety recommendations',
      'Location-specific analysis'
    ],
    heat_index_categories: {
      'low': '< 80°F (< 27°C) - Minimal risk',
      'medium': '80-89°F (27-32°C) - Caution advised',
      'high': '90-104°F (32-40°C) - Heat exhaustion possible',
      'extreme': '≥ 105°F (≥ 41°C) - Heat stroke likely'
    },
    usage: {
      endpoint: '/api/ai/heatwave-analysis',
      method: 'POST',
      body: {
        latitude: 'number (optional)',
        longitude: 'number (optional)',
        temperature_celsius: 'number (required)',
        humidity_percent: 'number (required, 0-100)',
        population_data: 'object (optional)'
      }
    }
  })
}
