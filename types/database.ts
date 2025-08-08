export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      disasters: {
        Row: {
          id: string
          type: string
          title: string
          description: string | null
          severity: 'low' | 'medium' | 'high' | 'critical'
          status: 'active' | 'monitoring' | 'resolved' | 'archived'
          location: Json // GeoJSON Point
          latitude: number
          longitude: number
          address: string | null
          country: string | null
          region: string | null
          affected_population: number | null
          casualties: number | null
          damage_estimate: number | null
          source: string | null
          source_url: string | null
          verified: boolean
          confidence_score: number | null
          created_at: string
          updated_at: string
          resolved_at: string | null
          metadata: Json | null
        }
        Insert: {
          id?: string
          type: string
          title: string
          description?: string | null
          severity: 'low' | 'medium' | 'high' | 'critical'
          status?: 'active' | 'monitoring' | 'resolved' | 'archived'
          location: Json
          latitude: number
          longitude: number
          address?: string | null
          country?: string | null
          region?: string | null
          affected_population?: number | null
          casualties?: number | null
          damage_estimate?: number | null
          source?: string | null
          source_url?: string | null
          verified?: boolean
          confidence_score?: number | null
          created_at?: string
          updated_at?: string
          resolved_at?: string | null
          metadata?: Json | null
        }
        Update: {
          id?: string
          type?: string
          title?: string
          description?: string | null
          severity?: 'low' | 'medium' | 'high' | 'critical'
          status?: 'active' | 'monitoring' | 'resolved' | 'archived'
          location?: Json
          latitude?: number
          longitude?: number
          address?: string | null
          country?: string | null
          region?: string | null
          affected_population?: number | null
          casualties?: number | null
          damage_estimate?: number | null
          source?: string | null
          source_url?: string | null
          verified?: boolean
          confidence_score?: number | null
          created_at?: string
          updated_at?: string
          resolved_at?: string | null
          metadata?: Json | null
        }
      }
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          role: 'user' | 'responder' | 'coordinator' | 'admin'
          organization: string | null
          phone: string | null
          location: Json | null
          preferences: Json | null
          verified: boolean
          active: boolean
          last_seen: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          role?: 'user' | 'responder' | 'coordinator' | 'admin'
          organization?: string | null
          phone?: string | null
          location?: Json | null
          preferences?: Json | null
          verified?: boolean
          active?: boolean
          last_seen?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          role?: 'user' | 'responder' | 'coordinator' | 'admin'
          organization?: string | null
          phone?: string | null
          location?: Json | null
          preferences?: Json | null
          verified?: boolean
          active?: boolean
          last_seen?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      community_reports: {
        Row: {
          id: string
          user_id: string | null
          type: string
          title: string
          description: string
          location: Json
          latitude: number
          longitude: number
          address: string | null
          severity: 'low' | 'medium' | 'high' | 'critical'
          status: 'pending' | 'verified' | 'false_alarm' | 'duplicate'
          images: string[] | null
          contact_info: Json | null
          verified_by: string | null
          verified_at: string | null
          upvotes: number
          downvotes: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          type: string
          title: string
          description: string
          location: Json
          latitude: number
          longitude: number
          address?: string | null
          severity: 'low' | 'medium' | 'high' | 'critical'
          status?: 'pending' | 'verified' | 'false_alarm' | 'duplicate'
          images?: string[] | null
          contact_info?: Json | null
          verified_by?: string | null
          verified_at?: string | null
          upvotes?: number
          downvotes?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          type?: string
          title?: string
          description?: string
          location?: Json
          latitude?: number
          longitude?: number
          address?: string | null
          severity?: 'low' | 'medium' | 'high' | 'critical'
          status?: 'pending' | 'verified' | 'false_alarm' | 'duplicate'
          images?: string[] | null
          contact_info?: Json | null
          verified_by?: string | null
          verified_at?: string | null
          upvotes?: number
          downvotes?: number
          created_at?: string
          updated_at?: string
        }
      }
      alerts: {
        Row: {
          id: string
          type: string
          title: string
          message: string
          severity: 'info' | 'warning' | 'critical'
          location: Json | null
          radius_km: number | null
          target_audience: string[] | null
          channels: string[]
          sent_at: string | null
          expires_at: string | null
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          type: string
          title: string
          message: string
          severity: 'info' | 'warning' | 'critical'
          location?: Json | null
          radius_km?: number | null
          target_audience?: string[] | null
          channels: string[]
          sent_at?: string | null
          expires_at?: string | null
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          type?: string
          title?: string
          message?: string
          severity?: 'info' | 'warning' | 'critical'
          location?: Json | null
          radius_km?: number | null
          target_audience?: string[] | null
          channels?: string[]
          sent_at?: string | null
          expires_at?: string | null
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      analytics: {
        Row: {
          id: string
          event_type: string
          event_data: Json
          user_id: string | null
          session_id: string | null
          ip_address: string | null
          user_agent: string | null
          location: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          event_type: string
          event_data: Json
          user_id?: string | null
          session_id?: string | null
          ip_address?: string | null
          user_agent?: string | null
          location?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          event_type?: string
          event_data?: Json
          user_id?: string | null
          session_id?: string | null
          ip_address?: string | null
          user_agent?: string | null
          location?: Json | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_nearby_disasters: {
        Args: {
          lat: number
          lng: number
          radius_km: number
        }
        Returns: {
          id: string
          type: string
          title: string
          severity: string
          latitude: number
          longitude: number
          distance_km: number
          created_at: string
        }[]
      }
      get_disaster_statistics: {
        Args: {
          start_date?: string
          end_date?: string
        }
        Returns: {
          total_disasters: number
          active_disasters: number
          resolved_disasters: number
          critical_disasters: number
          affected_population: number
        }[]
      }
    }
    Enums: {
      disaster_type: 'earthquake' | 'flood' | 'wildfire' | 'hurricane' | 'tornado' | 'tsunami' | 'volcanic' | 'landslide' | 'drought' | 'blizzard' | 'other'
      severity_level: 'low' | 'medium' | 'high' | 'critical'
      user_role: 'user' | 'responder' | 'coordinator' | 'admin'
      alert_type: 'weather' | 'seismic' | 'flood' | 'fire' | 'evacuation' | 'all_clear' | 'other'
    }
  }
}
