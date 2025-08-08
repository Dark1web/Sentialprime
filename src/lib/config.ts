// Environment configuration for SentinelX Next.js Backend
export const config = {
  // Server Configuration
  port: process.env.PORT || 9000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Database Configuration
  database: {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  },
  
  // External API Keys
  apis: {
    openWeatherMapKey: process.env.OPENWEATHERMAP_API_KEY || '',
    newsApiKey: process.env.NEWS_API_KEY || '',
    geminiApiKey: process.env.GEMINI_API_KEY || '',
    huggingFaceToken: process.env.HUGGINGFACE_API_TOKEN || '',
    sentinelHubClientId: process.env.SENTINEL_HUB_CLIENT_ID || '',
    sentinelHubClientSecret: process.env.SENTINEL_HUB_CLIENT_SECRET || '',
    mapboxToken: process.env.MAPBOX_ACCESS_TOKEN || '',
  },
  
  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  
  // File Upload Configuration
  upload: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    uploadDir: process.env.UPLOAD_DIR || './public/uploads',
  },
  
  // Rate Limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
  },
  
  // CORS Configuration
  cors: {
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'http://localhost:3001',
    ],
    credentials: true,
  },
  
  // Logging Configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'combined',
  },
  
  // ML Model Configuration
  models: {
    huggingFaceModels: {
      misinformationDetection: 'distilbert-base-uncased-finetuned-sst-2-english',
      triageClassification: 'microsoft/DialoGPT-medium',
      sentimentAnalysis: 'cardiffnlp/twitter-roberta-base-sentiment-latest',
    },
    confidenceThreshold: 0.7,
  },
  
  // Cache Configuration
  cache: {
    ttl: 300, // 5 minutes default TTL
    newsCache: 600, // 10 minutes for news
    weatherCache: 300, // 5 minutes for weather
    satelliteCache: 3600, // 1 hour for satellite data
  },
  
  // Feature Flags
  features: {
    enableRealTimeUpdates: process.env.ENABLE_REALTIME === 'true',
    enableMLModels: process.env.ENABLE_ML_MODELS !== 'false',
    enableFileUploads: process.env.ENABLE_FILE_UPLOADS !== 'false',
    enableCaching: process.env.ENABLE_CACHING !== 'false',
  },
};

// Validate required environment variables
export function validateConfig() {
  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  ];
  
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

export default config;
