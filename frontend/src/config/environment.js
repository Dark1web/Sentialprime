// Environment configuration for SentinelX frontend
export const config = {
  // API Configuration
  API_BASE_URL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api',
  
  // Supabase Configuration
  SUPABASE_URL: process.env.REACT_APP_SUPABASE_URL || 'https://your-project-ref.supabase.co',
  SUPABASE_ANON_KEY: process.env.REACT_APP_SUPABASE_ANON_KEY || 'your-anon-key',
  
  // Map Configuration
  MAPBOX_TOKEN: process.env.REACT_APP_MAPBOX_TOKEN || '',
  
  // Feature Flags
  ENABLE_DEMO_MODE: process.env.REACT_APP_ENABLE_DEMO_MODE === 'true' || true,
  ENABLE_REAL_TIME_UPDATES: process.env.REACT_APP_ENABLE_REAL_TIME_UPDATES === 'true' || true,
  
  // Environment
  ENVIRONMENT: process.env.REACT_APP_ENVIRONMENT || 'development',
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
  
  // Map defaults
  DEFAULT_MAP_CENTER: [28.6139, 77.2090], // Delhi coordinates
  DEFAULT_MAP_ZOOM: 10,
  
  // App Configuration
  APP_NAME: 'SentinelX',
  APP_VERSION: '1.0.0',
  
  // Demo users for testing
  DEMO_USERS: [
    {
      email: 'admin@sentinelx.com',
      password: 'admin123',
      role: 'admin',
      name: 'Admin User'
    },
    {
      email: 'demo@sentinelx.com', 
      password: 'demo123',
      role: 'user',
      name: 'Demo User'
    }
  ]
};

export default config;