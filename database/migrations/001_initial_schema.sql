-- Enable PostGIS extension for geospatial data
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE disaster_type AS ENUM (
  'earthquake', 'flood', 'wildfire', 'hurricane', 'tornado', 
  'tsunami', 'volcanic', 'landslide', 'drought', 'blizzard', 'other'
);

CREATE TYPE severity_level AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE user_role AS ENUM ('user', 'responder', 'coordinator', 'admin');
CREATE TYPE alert_type AS ENUM ('weather', 'seismic', 'flood', 'fire', 'evacuation', 'all_clear', 'other');

-- Users table (extends Supabase auth.users)
CREATE TABLE users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role user_role DEFAULT 'user',
  organization TEXT,
  phone TEXT,
  location GEOGRAPHY(POINT, 4326),
  preferences JSONB DEFAULT '{}',
  verified BOOLEAN DEFAULT FALSE,
  active BOOLEAN DEFAULT TRUE,
  last_seen TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Disasters table
CREATE TABLE disasters (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  type disaster_type NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  severity severity_level NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'monitoring', 'resolved', 'archived')),
  location GEOGRAPHY(POINT, 4326) NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  address TEXT,
  country TEXT,
  region TEXT,
  affected_population INTEGER,
  casualties INTEGER,
  damage_estimate DECIMAL(15, 2),
  source TEXT,
  source_url TEXT,
  verified BOOLEAN DEFAULT FALSE,
  confidence_score DECIMAL(3, 2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'
);

-- Community reports table
CREATE TABLE community_reports (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  location GEOGRAPHY(POINT, 4326) NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  address TEXT,
  severity severity_level NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'false_alarm', 'duplicate')),
  images TEXT[],
  contact_info JSONB,
  verified_by UUID REFERENCES users(id) ON DELETE SET NULL,
  verified_at TIMESTAMPTZ,
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Alerts table
CREATE TABLE alerts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  type alert_type NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  severity severity_level NOT NULL,
  location GEOGRAPHY(POINT, 4326),
  radius_km DECIMAL(8, 2),
  target_audience TEXT[],
  channels TEXT[] NOT NULL,
  sent_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_by UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Analytics table
CREATE TABLE analytics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_type TEXT NOT NULL,
  event_data JSONB NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  session_id TEXT,
  ip_address INET,
  user_agent TEXT,
  location GEOGRAPHY(POINT, 4326),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_disasters_location ON disasters USING GIST (location);
CREATE INDEX idx_disasters_type ON disasters (type);
CREATE INDEX idx_disasters_severity ON disasters (severity);
CREATE INDEX idx_disasters_status ON disasters (status);
CREATE INDEX idx_disasters_created_at ON disasters (created_at);

CREATE INDEX idx_community_reports_location ON community_reports USING GIST (location);
CREATE INDEX idx_community_reports_status ON community_reports (status);
CREATE INDEX idx_community_reports_user_id ON community_reports (user_id);

CREATE INDEX idx_alerts_location ON alerts USING GIST (location);
CREATE INDEX idx_alerts_type ON alerts (type);
CREATE INDEX idx_alerts_created_at ON alerts (created_at);

CREATE INDEX idx_analytics_event_type ON analytics (event_type);
CREATE INDEX idx_analytics_created_at ON analytics (created_at);
CREATE INDEX idx_analytics_user_id ON analytics (user_id);

-- Create functions
CREATE OR REPLACE FUNCTION get_nearby_disasters(lat DECIMAL, lng DECIMAL, radius_km DECIMAL)
RETURNS TABLE (
  id UUID,
  type disaster_type,
  title TEXT,
  severity severity_level,
  latitude DECIMAL,
  longitude DECIMAL,
  distance_km DECIMAL,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    d.id,
    d.type,
    d.title,
    d.severity,
    d.latitude,
    d.longitude,
    ST_Distance(d.location, ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography) / 1000 AS distance_km,
    d.created_at
  FROM disasters d
  WHERE ST_DWithin(d.location, ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography, radius_km * 1000)
    AND d.status IN ('active', 'monitoring')
  ORDER BY distance_km ASC;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_disaster_statistics(start_date TIMESTAMPTZ DEFAULT NULL, end_date TIMESTAMPTZ DEFAULT NULL)
RETURNS TABLE (
  total_disasters BIGINT,
  active_disasters BIGINT,
  resolved_disasters BIGINT,
  critical_disasters BIGINT,
  affected_population BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) AS total_disasters,
    COUNT(*) FILTER (WHERE status IN ('active', 'monitoring')) AS active_disasters,
    COUNT(*) FILTER (WHERE status = 'resolved') AS resolved_disasters,
    COUNT(*) FILTER (WHERE severity = 'critical') AS critical_disasters,
    COALESCE(SUM(affected_population), 0) AS affected_population
  FROM disasters
  WHERE (start_date IS NULL OR created_at >= start_date)
    AND (end_date IS NULL OR created_at <= end_date);
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_disasters_updated_at BEFORE UPDATE ON disasters
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_community_reports_updated_at BEFORE UPDATE ON community_reports
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_alerts_updated_at BEFORE UPDATE ON alerts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE disasters ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Anyone can view disasters" ON disasters
  FOR SELECT USING (true);

CREATE POLICY "Verified users can insert disasters" ON disasters
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND verified = true)
  );

CREATE POLICY "Anyone can view community reports" ON community_reports
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert community reports" ON community_reports
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own reports" ON community_reports
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view alerts" ON alerts
  FOR SELECT USING (true);

CREATE POLICY "Coordinators can manage alerts" ON alerts
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('coordinator', 'admin'))
  );
