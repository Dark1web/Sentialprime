// Environment variables for testing
process.env.NODE_ENV = 'test'
process.env.NEXT_PUBLIC_APP_ENV = 'test'

// Database configuration
process.env.SUPABASE_URL = 'https://test.supabase.co'
process.env.SUPABASE_ANON_KEY = 'test-anon-key'
process.env.SUPABASE_SERVICE_KEY = 'test-service-key'

// API Keys (use test/mock values)
process.env.OPENWEATHERMAP_API_KEY = 'test-weather-key'
process.env.NEWS_API_KEY = 'test-news-key'
process.env.GNEWS_API_KEY = 'test-gnews-key'
process.env.HUGGINGFACE_API_KEY = 'test-hf-key'
process.env.GEMINI_API_KEY = 'test-gemini-key'
process.env.SENTINEL_HUB_CLIENT_ID = 'test-sentinel-client'
process.env.SENTINEL_HUB_CLIENT_SECRET = 'test-sentinel-secret'

// JWT Configuration
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only'
process.env.JWT_EXPIRES_IN = '24h'

// App Configuration
process.env.NEXT_PUBLIC_APP_NAME = 'SentinelX'
process.env.NEXT_PUBLIC_APP_VERSION = '2.0.0'
process.env.NEXT_PUBLIC_API_BASE_URL = 'http://localhost:3000/api'

// Feature Flags
process.env.ENABLE_ML_MODELS = 'false'
process.env.ENABLE_REAL_TIME_UPDATES = 'false'
process.env.ENABLE_DEMO_MODE = 'true'

// Logging
process.env.LOG_LEVEL = 'error' // Reduce logging in tests
