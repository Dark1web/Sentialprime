// Enhanced disaster data types with AI/ML capabilities
export interface MisinformationFlags {
  has_misinformation: boolean
  confidence_score: number
  flagged_content: string[]
  verification_status: 'verified' | 'partially_verified' | 'under_review' | 'flagged'
  source_credibility: number
}

export interface MLPredictions {
  flood_risk?: {
    probability: number
    confidence: number
    peak_level_hours?: number
  }
  heat_risk?: {
    probability: number
    confidence: number
    heat_index: number
  }
  spread_prediction?: {
    direction: string
    speed_kmh: number
    confidence: number
  }
  aftershock_prediction?: {
    probability: number
    magnitude_range: string
    confidence: number
  }
}

export interface DigitalFootprint {
  utility_disruptions: string[]
  social_media_mentions: number
  news_coverage_score: number
  public_sentiment: 'calm' | 'concerned' | 'alert' | 'panic'
}

export interface VulnerablePopulations {
  elderly_count: number
  children_count: number
  disabled_count: number
  low_income_households: number
}

export interface EnhancedDisasterData {
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
  updated_at?: string
  
  // Enhanced AI/ML fields
  misinformation_flags: MisinformationFlags
  ml_predictions: MLPredictions
  digital_footprint: DigitalFootprint
  vulnerable_populations: VulnerablePopulations
}

// API Response types
export interface MisinformationAnalysisRequest {
  text: string
  source?: string
  timestamp?: string
}

export interface MisinformationAnalysisResponse {
  is_misinformation: boolean
  confidence_score: number
  flagged_elements: string[]
  credibility_score: number
  verification_status: string
}

export interface FloodForecastRequest {
  latitude: number
  longitude: number
  current_conditions: {
    rainfall_mm: number
    river_level_m: number
    soil_saturation: number
  }
}

export interface FloodForecastResponse {
  flood_probability: number
  confidence: number
  peak_time_hours: number
  severity_level: 'low' | 'medium' | 'high' | 'critical'
  recommended_actions: string[]
}

export interface HeatwaveAnalysisRequest {
  latitude: number
  longitude: number
  temperature_celsius: number
  humidity_percent: number
  population_data?: VulnerablePopulations
}

export interface HeatwaveAnalysisResponse {
  heat_index: number
  risk_level: 'low' | 'medium' | 'high' | 'extreme'
  vulnerable_population_risk: {
    elderly_risk: number
    children_risk: number
    outdoor_worker_risk: number
  }
  health_recommendations: string[]
}

// WebSocket message types
export interface WebSocketMessage {
  type: 'disaster_update' | 'misinformation_alert' | 'ml_prediction' | 'system_alert'
  data: any
  timestamp: string
  priority: 'low' | 'medium' | 'high' | 'critical'
}

// Export functionality types
export interface ExportRequest {
  format: 'pdf' | 'csv' | 'json'
  data_type: 'disasters' | 'misinformation' | 'predictions' | 'all'
  date_range?: {
    start: string
    end: string
  }
  filters?: {
    severity?: string[]
    types?: string[]
    regions?: string[]
  }
}
