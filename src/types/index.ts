// Core types for SentinelX Next.js Backend

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// User and Authentication Types
export interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  organization?: string;
  role: 'user' | 'admin' | 'emergency_responder';
  phone?: string;
  location_lat?: number;
  location_lng?: number;
  avatar_url?: string;
  preferences: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface WeatherData {
  location: {
    lat: number;
    lng: number;
    location_name?: string;
  };
  current: {
    temperature: number;
    humidity: number;
    pressure: number;
    wind_speed: number;
    wind_direction: number;
    visibility: number;
    uv_index: number;
    condition: string;
    icon: string;
  };
  forecast?: Array<{
    date: string;
    temperature_min: number;
    temperature_max: number;
    condition: string;
    precipitation_probability: number;
  }>;
}

export interface NewsArticle {
  title: string;
  description: string;
  content: string;
  url: string;
  source: string;
  author: string;
  published_at: string;
  image_url?: string | null;
  api_source: string;
  disaster_related: boolean;
  credibility_score: number;
  disaster_type?: string;
  urgency_level?: string;
  relevance_score?: number;
  ai_filtered?: boolean;
  ai_reasoning?: string;
}

export interface AuthRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  expires_in: number;
}

// Location Types
export interface Location {
  lat: number;
  lng: number;
  location_name?: string;
}

export interface GeospatialPoint {
  type: 'Point';
  coordinates: [number, number]; // [lng, lat]
}

// Disaster Report Types
export interface DisasterReport {
  id: string;
  user_id?: string;
  title: string;
  description?: string;
  disaster_type: 'flood' | 'fire' | 'earthquake' | 'storm' | 'landslide' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  location_lat: number;
  location_lng: number;
  location_name?: string;
  geom?: GeospatialPoint;
  radius_meters: number;
  status: 'pending' | 'verified' | 'resolved' | 'false_alarm';
  images?: string[];
  verified_by?: string;
  verified_at?: string;
  source: string;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface CreateDisasterReportRequest {
  title: string;
  description?: string;
  disaster_type: DisasterReport['disaster_type'];
  severity?: DisasterReport['severity'];
  location_lat: number;
  location_lng: number;
  location_name?: string;
  radius_meters?: number;
  images?: string[];
  metadata?: Record<string, any>;
}

// Emergency Request Types
export interface EmergencyRequest {
  id: string;
  user_id?: string;
  request_text: string;
  urgency_score: number;
  triage_level: 'low' | 'medium' | 'high' | 'critical';
  resource_required: string[];
  location_lat?: number;
  location_lng?: number;
  location_name?: string;
  contact_info?: Record<string, any>;
  status: 'pending' | 'assigned' | 'in_progress' | 'resolved' | 'cancelled';
  assigned_to?: string;
  response_time_minutes?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface TriageRequest {
  text: string;
  location?: string;
}

export interface TriageResponse {
  urgency_score: number;
  triage_level: string;
  resource_required: string;
  estimated_response_time: string;
}

// Misinformation Types
export interface MisinformationReport {
  id: string;
  user_id?: string;
  text_content: string;
  source_url?: string;
  is_fake?: boolean;
  confidence_score?: number;
  panic_score: number;
  emotions: Record<string, any>;
  flagged_keywords: string[];
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  model_explanation?: string;
  verified_by?: string;
  verified_at?: string;
  status: 'pending' | 'reviewed' | 'confirmed_fake' | 'confirmed_real';
  created_at: string;
  updated_at: string;
}

export interface MisinformationRequest {
  text: string;
}

export interface MisinformationResponse {
  is_fake: boolean;
  confidence: number;
  panic_score: number;
  reasoning: string;
}

// Fact Check Types
export interface FactCheckRequest {
  claim: string;
}

export interface FactCheckResponse {
  is_factual: boolean;
  confidence: number;
  sources: string[];
  explanation: string;
}

// Safe Zone Types
export interface SafeZone {
  id: string;
  name: string;
  description?: string;
  zone_type: 'shelter' | 'hospital' | 'relief_camp' | 'evacuation_point' | 'supply_center';
  location_lat: number;
  location_lng: number;
  geom?: GeospatialPoint;
  address?: string;
  capacity?: number;
  current_occupancy: number;
  amenities: string[];
  contact_info?: Record<string, any>;
  operating_hours?: string;
  accessibility_features: string[];
  active: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

// News Article Types
export interface NewsArticle {
  id: string;
  title: string;
  description?: string;
  content?: string;
  url?: string;
  source?: string;
  author?: string;
  published_at?: string;
  disaster_related: boolean;
  disaster_types: string[];
  location_mentioned: string[];
  sentiment?: 'positive' | 'negative' | 'neutral';
  credibility_score?: number;
  image_url?: string;
  created_at: string;
}

// Network Outage Types
export interface NetworkOutage {
  id: string;
  user_id?: string;
  location_lat: number;
  location_lng: number;
  location_name?: string;
  outage_type?: 'internet' | 'mobile' | 'landline' | 'power';
  severity: 'complete' | 'partial' | 'intermittent';
  speed_test_results?: {
    download_mbps: number;
    upload_mbps: number;
    ping_ms: number;
  };
  provider?: string;
  duration_minutes?: number;
  resolved: boolean;
  created_at: string;
  resolved_at?: string;
}

// Weather Types
export interface WeatherData {
  location: Location;
  current: {
    temperature: number;
    humidity: number;
    pressure: number;
    wind_speed: number;
    wind_direction: number;
    visibility: number;
    uv_index: number;
    condition: string;
    icon: string;
  };
  forecast?: Array<{
    date: string;
    temperature_min: number;
    temperature_max: number;
    condition: string;
    precipitation_probability: number;
  }>;
  alerts?: Array<{
    title: string;
    description: string;
    severity: string;
    start_time: string;
    end_time: string;
  }>;
}

// File Upload Types
export interface FileUploadResponse {
  url: string;
  filename: string;
  size: number;
  mimetype: string;
  metadata?: Record<string, any>;
}

// API Error Types
export interface ApiError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
}
