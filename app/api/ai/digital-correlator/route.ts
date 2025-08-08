import { NextRequest, NextResponse } from 'next/server'

// Digital footprint correlation service
class DigitalFootprintCorrelator {
  // Mock utility disruption data
  private utilityDisruptions = {
    power_outages: [
      { id: 'po_001', location: [34.0522, -118.2437], affected_customers: 15000, cause: 'wildfire', timestamp: new Date() },
      { id: 'po_002', location: [29.7604, -95.3698], affected_customers: 8500, cause: 'flooding', timestamp: new Date() },
      { id: 'po_003', location: [37.7749, -122.4194], affected_customers: 3200, cause: 'earthquake', timestamp: new Date() }
    ],
    water_disruptions: [
      { id: 'wd_001', location: [29.7604, -95.3698], type: 'pressure_drop', severity: 'moderate', cause: 'flooding' },
      { id: 'wd_002', location: [34.0522, -118.2437], type: 'contamination_risk', severity: 'high', cause: 'wildfire' }
    ],
    communication_outages: [
      { id: 'co_001', location: [29.7604, -95.3698], type: 'cellular_tower', affected_area_km: 15, cause: 'flooding' },
      { id: 'co_002', location: [37.7749, -122.4194], type: 'fiber_cut', affected_services: ['internet', 'phone'], cause: 'earthquake' }
    ]
  }

  // Mock social media monitoring data
  private socialMediaData = {
    trending_topics: [
      { keyword: 'california wildfire', mentions: 15420, sentiment: 'concerned', credibility: 0.78 },
      { keyword: 'houston flooding', mentions: 8930, sentiment: 'panic', credibility: 0.65 },
      { keyword: 'sf earthquake', mentions: 12100, sentiment: 'alert', credibility: 0.89 }
    ],
    misinformation_alerts: [
      { content: 'Dam breach imminent in Houston', flagged_count: 156, verification: 'false' },
      { content: 'Nuclear plant damaged in SF quake', flagged_count: 89, verification: 'unverified' }
    ]
  }

  // Calculate distance between two coordinates
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371 // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }

  // Find utility disruptions near disaster location
  private findNearbyUtilityDisruptions(latitude: number, longitude: number, radiusKm: number = 50) {
    const nearbyDisruptions: any[] = []

    // Check power outages
    this.utilityDisruptions.power_outages.forEach(outage => {
      const distance = this.calculateDistance(latitude, longitude, outage.location[0], outage.location[1])
      if (distance <= radiusKm) {
        nearbyDisruptions.push({
          type: 'power_outage',
          id: outage.id,
          distance_km: Math.round(distance * 10) / 10,
          affected_customers: outage.affected_customers,
          cause: outage.cause,
          correlation_strength: Math.max(0, 1 - (distance / radiusKm))
        })
      }
    })

    // Check water disruptions
    this.utilityDisruptions.water_disruptions.forEach(disruption => {
      const distance = this.calculateDistance(latitude, longitude, disruption.location[0], disruption.location[1])
      if (distance <= radiusKm) {
        nearbyDisruptions.push({
          type: 'water_disruption',
          id: disruption.id,
          distance_km: Math.round(distance * 10) / 10,
          disruption_type: disruption.type,
          severity: disruption.severity,
          cause: disruption.cause,
          correlation_strength: Math.max(0, 1 - (distance / radiusKm))
        })
      }
    })

    // Check communication outages
    this.utilityDisruptions.communication_outages.forEach(outage => {
      const distance = this.calculateDistance(latitude, longitude, outage.location[0], outage.location[1])
      if (distance <= radiusKm) {
        nearbyDisruptions.push({
          type: 'communication_outage',
          id: outage.id,
          distance_km: Math.round(distance * 10) / 10,
          outage_type: outage.type,
          affected_area_km: outage.affected_area_km,
          cause: outage.cause,
          correlation_strength: Math.max(0, 1 - (distance / radiusKm))
        })
      }
    })

    return nearbyDisruptions.sort((a, b) => b.correlation_strength - a.correlation_strength)
  }

  // Analyze social media patterns
  private analyzeSocialMediaPatterns(disasterType: string, location: string) {
    const relevantTopics = this.socialMediaData.trending_topics.filter(topic => 
      topic.keyword.toLowerCase().includes(disasterType.toLowerCase()) ||
      topic.keyword.toLowerCase().includes(location.toLowerCase())
    )

    const relevantMisinformation = this.socialMediaData.misinformation_alerts.filter(alert =>
      alert.content.toLowerCase().includes(disasterType.toLowerCase()) ||
      alert.content.toLowerCase().includes(location.toLowerCase())
    )

    return {
      trending_topics: relevantTopics,
      misinformation_alerts: relevantMisinformation,
      overall_sentiment: relevantTopics.length > 0 ? relevantTopics[0].sentiment : 'neutral',
      credibility_score: relevantTopics.length > 0 ? 
        relevantTopics.reduce((sum, topic) => sum + topic.credibility, 0) / relevantTopics.length : 0.5
    }
  }

  // Generate correlation insights
  private generateCorrelationInsights(
    utilityDisruptions: any[],
    socialMediaAnalysis: any,
    disasterType: string
  ) {
    const insights: string[] = []

    // Utility correlation insights
    if (utilityDisruptions.length > 0) {
      const highCorrelationDisruptions = utilityDisruptions.filter(d => d.correlation_strength > 0.7)
      if (highCorrelationDisruptions.length > 0) {
        insights.push(`Strong correlation detected: ${highCorrelationDisruptions.length} utility disruptions within disaster impact zone`)
      }

      const powerOutages = utilityDisruptions.filter(d => d.type === 'power_outage')
      if (powerOutages.length > 0) {
        const totalAffected = powerOutages.reduce((sum, outage) => sum + outage.affected_customers, 0)
        insights.push(`Power infrastructure impact: ${totalAffected.toLocaleString()} customers affected`)
      }
    }

    // Social media correlation insights
    if (socialMediaAnalysis.trending_topics.length > 0) {
      const totalMentions = socialMediaAnalysis.trending_topics.reduce((sum: number, topic: any) => sum + topic.mentions, 0)
      insights.push(`Social media activity: ${totalMentions.toLocaleString()} mentions detected`)
      
      if (socialMediaAnalysis.credibility_score < 0.6) {
        insights.push(`WARNING: Low credibility score (${Math.round(socialMediaAnalysis.credibility_score * 100)}%) - potential misinformation spread`)
      }
    }

    // Misinformation correlation
    if (socialMediaAnalysis.misinformation_alerts.length > 0) {
      insights.push(`Misinformation detected: ${socialMediaAnalysis.misinformation_alerts.length} false claims being circulated`)
    }

    // Disaster-specific correlations
    switch (disasterType.toLowerCase()) {
      case 'wildfire':
        if (utilityDisruptions.some(d => d.cause === 'wildfire')) {
          insights.push('Wildfire-utility correlation confirmed: Fire directly causing infrastructure damage')
        }
        break
      case 'flood':
      case 'flooding':
        if (utilityDisruptions.some(d => d.type === 'water_disruption')) {
          insights.push('Flood-water system correlation: Water infrastructure compromised')
        }
        break
      case 'earthquake':
        if (utilityDisruptions.some(d => d.type === 'communication_outage')) {
          insights.push('Earthquake-communication correlation: Seismic activity affecting communication networks')
        }
        break
    }

    return insights
  }

  correlate(disasterData: any) {
    const { latitude, longitude, type: disasterType, address } = disasterData

    // Find nearby utility disruptions
    const utilityDisruptions = this.findNearbyUtilityDisruptions(latitude, longitude)

    // Analyze social media patterns
    const socialMediaAnalysis = this.analyzeSocialMediaPatterns(disasterType, address || '')

    // Generate correlation insights
    const insights = this.generateCorrelationInsights(
      utilityDisruptions,
      socialMediaAnalysis,
      disasterType
    )

    // Calculate overall correlation score
    const utilityCorrelationScore = utilityDisruptions.length > 0 ? 
      utilityDisruptions.reduce((sum, d) => sum + d.correlation_strength, 0) / utilityDisruptions.length : 0

    const socialCorrelationScore = socialMediaAnalysis.credibility_score

    const overallCorrelationScore = (utilityCorrelationScore + socialCorrelationScore) / 2

    return {
      correlation_score: Math.round(overallCorrelationScore * 100) / 100,
      utility_disruptions: utilityDisruptions,
      social_media_analysis: socialMediaAnalysis,
      correlation_insights: insights,
      timestamp: new Date().toISOString(),
      analysis_confidence: Math.min(0.95, 0.6 + (utilityDisruptions.length * 0.1) + (socialMediaAnalysis.trending_topics.length * 0.05))
    }
  }
}

const correlator = new DigitalFootprintCorrelator()

export async function POST(request: NextRequest) {
  try {
    const disasterData = await request.json()
    
    if (!disasterData.latitude || !disasterData.longitude || !disasterData.type) {
      return NextResponse.json(
        { error: 'Latitude, longitude, and disaster type are required' },
        { status: 400 }
      )
    }

    const correlation = correlator.correlate(disasterData)
    
    return NextResponse.json(correlation)
  } catch (error) {
    console.error('Digital correlation error:', error)
    return NextResponse.json(
      { error: 'Failed to correlate digital footprint' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    service: 'Digital Footprint Correlator API',
    version: '1.0.0',
    capabilities: [
      'Utility disruption correlation',
      'Social media pattern analysis',
      'Misinformation detection and tracking',
      'Cross-reference disaster events with digital indicators',
      'Correlation strength assessment'
    ],
    data_sources: [
      'Power grid monitoring systems',
      'Water utility networks',
      'Communication infrastructure',
      'Social media platforms',
      'News and media outlets'
    ],
    usage: {
      endpoint: '/api/ai/digital-correlator',
      method: 'POST',
      body: {
        latitude: 'number (required)',
        longitude: 'number (required)',
        type: 'string (required)',
        address: 'string (optional)',
        radius_km: 'number (optional, default: 50)'
      }
    }
  })
}
