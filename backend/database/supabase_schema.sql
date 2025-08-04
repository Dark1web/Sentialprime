-- SentinelX Database Schema for Supabase
-- Run these commands in your Supabase SQL editor

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  organization TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'emergency_responder')),
  phone TEXT,
  location_lat DECIMAL,
  location_lng DECIMAL,
  avatar_url TEXT,
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Disaster reports table
CREATE TABLE IF NOT EXISTS public.disaster_reports (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  disaster_type TEXT NOT NULL CHECK (disaster_type IN ('flood', 'fire', 'earthquake', 'storm', 'landslide', 'other')),
  severity TEXT DEFAULT 'low' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  location_lat DECIMAL NOT NULL,
  location_lng DECIMAL NOT NULL,
  location_name TEXT,
  geom GEOMETRY(POINT, 4326),
  radius_meters INTEGER DEFAULT 1000,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'resolved', 'false_alarm')),
  images TEXT[], -- URLs to images
  verified_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  verified_at TIMESTAMPTZ,
  source TEXT DEFAULT 'user_report', -- user_report, satellite, sensor, news
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Emergency requests table
CREATE TABLE IF NOT EXISTS public.emergency_requests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  request_text TEXT NOT NULL,
  urgency_score DECIMAL DEFAULT 0 CHECK (urgency_score >= 0 AND urgency_score <= 1),
  triage_level TEXT DEFAULT 'low' CHECK (triage_level IN ('low', 'medium', 'high', 'critical')),
  resource_required TEXT[],
  location_lat DECIMAL,
  location_lng DECIMAL,
  location_name TEXT,
  contact_info JSONB,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'assigned', 'in_progress', 'resolved', 'cancelled')),
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  response_time_minutes INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Misinformation reports table
CREATE TABLE IF NOT EXISTS public.misinformation_reports (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  text_content TEXT NOT NULL,
  source_url TEXT,
  is_fake BOOLEAN,
  confidence_score DECIMAL CHECK (confidence_score >= 0 AND confidence_score <= 1),
  panic_score DECIMAL DEFAULT 0 CHECK (panic_score >= 0 AND panic_score <= 1),
  emotions JSONB DEFAULT '{}',
  flagged_keywords TEXT[],
  risk_level TEXT DEFAULT 'low' CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  model_explanation TEXT,
  verified_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  verified_at TIMESTAMPTZ,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'confirmed_fake', 'confirmed_real')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Safe zones table
CREATE TABLE IF NOT EXISTS public.safe_zones (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  zone_type TEXT NOT NULL CHECK (zone_type IN ('shelter', 'hospital', 'relief_camp', 'evacuation_point', 'supply_center')),
  location_lat DECIMAL NOT NULL,
  location_lng DECIMAL NOT NULL,
  geom GEOMETRY(POINT, 4326),
  address TEXT,
  capacity INTEGER,
  current_occupancy INTEGER DEFAULT 0,
  amenities TEXT[],
  contact_info JSONB,
  operating_hours TEXT,
  accessibility_features TEXT[],
  active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- News articles cache table
CREATE TABLE IF NOT EXISTS public.news_articles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  content TEXT,
  url TEXT UNIQUE,
  source TEXT,
  author TEXT,
  published_at TIMESTAMPTZ,
  disaster_related BOOLEAN DEFAULT FALSE,
  disaster_types TEXT[],
  location_mentioned TEXT[],
  sentiment TEXT CHECK (sentiment IN ('positive', 'negative', 'neutral')),
  credibility_score DECIMAL CHECK (credibility_score >= 0 AND credibility_score <= 1),
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Network outage reports table
CREATE TABLE IF NOT EXISTS public.network_outages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  location_lat DECIMAL NOT NULL,
  location_lng DECIMAL NOT NULL,
  location_name TEXT,
  outage_type TEXT CHECK (outage_type IN ('internet', 'mobile', 'landline', 'power')),
  severity TEXT DEFAULT 'partial' CHECK (severity IN ('complete', 'partial', 'intermittent')),
  speed_test_results JSONB, -- {download_mbps, upload_mbps, ping_ms}
  provider TEXT,
  duration_minutes INTEGER,
  resolved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

-- Create spatial indexes
CREATE INDEX IF NOT EXISTS idx_disaster_reports_geom ON public.disaster_reports USING GIST (geom);
CREATE INDEX IF NOT EXISTS idx_safe_zones_geom ON public.safe_zones USING GIST (geom);

-- Create other indexes for performance
CREATE INDEX IF NOT EXISTS idx_disaster_reports_type ON public.disaster_reports (disaster_type);
CREATE INDEX IF NOT EXISTS idx_disaster_reports_severity ON public.disaster_reports (severity);
CREATE INDEX IF NOT EXISTS idx_disaster_reports_created_at ON public.disaster_reports (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_emergency_requests_status ON public.emergency_requests (status);
CREATE INDEX IF NOT EXISTS idx_emergency_requests_triage ON public.emergency_requests (triage_level);
CREATE INDEX IF NOT EXISTS idx_news_articles_published ON public.news_articles (published_at DESC);

-- Functions to automatically update geom columns
CREATE OR REPLACE FUNCTION update_disaster_reports_geom()
RETURNS TRIGGER AS $$
BEGIN
  NEW.geom = ST_SetSRID(ST_MakePoint(NEW.location_lng, NEW.location_lat), 4326);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_safe_zones_geom()
RETURNS TRIGGER AS $$
BEGIN
  NEW.geom = ST_SetSRID(ST_MakePoint(NEW.location_lng, NEW.location_lat), 4326);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER trigger_disaster_reports_geom
  BEFORE INSERT OR UPDATE ON public.disaster_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_disaster_reports_geom();

CREATE TRIGGER trigger_safe_zones_geom
  BEFORE INSERT OR UPDATE ON public.safe_zones
  FOR EACH ROW
  EXECUTE FUNCTION update_safe_zones_geom();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers to all tables
CREATE TRIGGER trigger_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_disaster_reports_updated_at
  BEFORE UPDATE ON public.disaster_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_emergency_requests_updated_at
  BEFORE UPDATE ON public.emergency_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_safe_zones_updated_at
  BEFORE UPDATE ON public.safe_zones
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.disaster_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.misinformation_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.safe_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.network_outages ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Disaster reports policies (public read, authenticated write)
CREATE POLICY "Anyone can view disaster reports" ON public.disaster_reports
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create disaster reports" ON public.disaster_reports
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own reports" ON public.disaster_reports
  FOR UPDATE USING (auth.uid() = user_id);

-- Emergency requests policies
CREATE POLICY "Users can view their own emergency requests" ON public.emergency_requests
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Emergency responders can view all requests" ON public.emergency_requests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'emergency_responder'
    )
  );

CREATE POLICY "Authenticated users can create emergency requests" ON public.emergency_requests
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Safe zones policies (public read, admin write)
CREATE POLICY "Anyone can view safe zones" ON public.safe_zones
  FOR SELECT USING (active = true);

CREATE POLICY "Admins can manage safe zones" ON public.safe_zones
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- News articles policies (public read)
CREATE POLICY "Anyone can view news articles" ON public.news_articles
  FOR SELECT USING (true);

-- Sample data
INSERT INTO public.safe_zones (name, description, zone_type, location_lat, location_lng, address, capacity, amenities, contact_info, active)
VALUES 
  ('Central Community Center', 'Main emergency shelter with full facilities', 'shelter', 28.6300, 77.2200, 'Central Delhi', 500, ARRAY['food', 'water', 'medical', 'power'], '{"phone": "+91-11-23456789", "email": "shelter@delhi.gov.in"}', true),
  ('District General Hospital', 'Primary medical facility for emergency care', 'hospital', 28.6000, 77.2300, 'South Delhi', 200, ARRAY['medical', 'emergency_care', 'ambulance'], '{"phone": "+91-11-23456790", "emergency": "102"}', true),
  ('Relief Distribution Center', 'Food and supply distribution point', 'supply_center', 28.6700, 77.2100, 'North Delhi', 1000, ARRAY['food', 'water', 'supplies'], '{"phone": "+91-11-23456791"}', true)
ON CONFLICT DO NOTHING;

-- Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;