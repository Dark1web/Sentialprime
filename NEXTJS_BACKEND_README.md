# SentinelX Next.js Backend Migration

This document outlines the migration from the Python FastAPI backend to a Next.js-based backend solution for the SentinelX AI-Powered Disaster Intelligence & Crisis Response System.

## Migration Overview

### What's Been Migrated

✅ **Core Infrastructure**
- Next.js 14 with App Router
- TypeScript configuration
- Middleware for CORS and authentication
- Database integration with Supabase
- Error handling and response utilities

✅ **API Endpoints**
- `/api/` - Root endpoint with system information
- `/api/health` - Health check endpoint
- `/api/misinformation/analyze` - Misinformation detection
- `/api/triage/classify` - Emergency triage classification
- `/api/factcheck` - Fact-checking service
- `/api/network/outages` - Network outage reporting
- `/api/navigation/safezones` - Safe zone locations

✅ **Services**
- Misinformation detection service (rule-based + ML ready)
- Triage classification service
- Fact-checking service
- Database service with Supabase integration

### Architecture Changes

**From Python FastAPI to Next.js:**
- **Framework**: FastAPI → Next.js 14 with App Router
- **Language**: Python → TypeScript
- **API Structure**: FastAPI routers → Next.js API routes
- **Database**: Direct PostgreSQL → Supabase client
- **Middleware**: FastAPI middleware → Next.js middleware
- **Error Handling**: FastAPI exception handlers → Custom response utilities

## Installation & Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account (for database)

### Installation Steps

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Configuration**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

3. **Database Setup**
   - Create a Supabase project
   - Run the SQL schema from `backend/database/supabase_schema.sql`
   - Update environment variables with your Supabase credentials

4. **Start Development Server**
   ```bash
   npm run dev
   ```

The server will start on `http://localhost:9000`.

## API Endpoints

### Core Endpoints

| Endpoint | Method | Description | Status |
|----------|--------|-------------|--------|
| `/api/` | GET | System information | ✅ |
| `/api/health` | GET | Health check | ✅ |

### AI & Analysis Endpoints

| Endpoint | Method | Description | Status |
|----------|--------|-------------|--------|
| `/api/misinformation/analyze` | POST | Analyze text for misinformation | ✅ |
| `/api/triage/classify` | POST | Classify emergency requests | ✅ |
| `/api/factcheck` | POST | Fact-check claims | ✅ |

### Data Endpoints

| Endpoint | Method | Description | Status |
|----------|--------|-------------|--------|
| `/api/network/outages` | GET | Network outage information | ✅ |
| `/api/navigation/safezones` | GET | Safe zone locations | ✅ |

### Pending Migration

| Endpoint | Method | Description | Status |
|----------|--------|-------------|--------|
| `/api/live/news/disaster-feed` | GET | Live disaster news | 🔄 |
| `/api/live/weather/current` | POST | Current weather data | 🔄 |
| `/api/live/satellite/disaster-imagery` | POST | Satellite imagery | 🔄 |
| `/api/community/submit` | POST | Community reports | 🔄 |
| `/api/community/reports` | GET | Get community reports | 🔄 |

## Key Features

### 1. Type Safety
- Full TypeScript implementation
- Zod validation for request/response schemas
- Type-safe database operations

### 2. Error Handling
- Centralized error handling with `withErrorHandling`
- Consistent API response format
- Proper HTTP status codes

### 3. Authentication & Authorization
- JWT token support
- Supabase Auth integration
- Role-based access control middleware

### 4. Database Integration
- Supabase client with Row Level Security
- Generic CRUD operations
- Geospatial query support

### 5. CORS & Security
- Configurable CORS middleware
- Request validation
- Rate limiting ready

## Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Deployment

### Build for Production
```bash
npm run build
npm start
```

### Environment Variables
Ensure all required environment variables are set in production:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- External API keys as needed

## Migration Status

### Completed ✅
- [x] Next.js infrastructure setup
- [x] Core API endpoints (health, misinformation, triage, factcheck)
- [x] Database integration
- [x] Authentication middleware
- [x] Error handling
- [x] Type definitions

### In Progress 🔄
- [ ] Live data endpoints (news, weather, satellite)
- [ ] Community reporting system
- [ ] File upload handling
- [ ] ML model integration
- [ ] Frontend API integration updates

### Pending ⏳
- [ ] Comprehensive testing
- [ ] Performance optimization
- [ ] Deployment configuration
- [ ] Documentation updates

## Frontend Integration

The frontend will need minimal changes as the API structure remains largely the same. The main change is ensuring the proxy configuration points to the new Next.js backend.

### Frontend package.json Update
```json
{
  "proxy": "http://localhost:9000"
}
```

## Performance Considerations

- **Caching**: Implement Redis or in-memory caching for frequently accessed data
- **Database**: Use connection pooling and query optimization
- **API**: Implement rate limiting and request throttling
- **Static Assets**: Use Next.js built-in optimization for images and static files

## Security Considerations

- **Authentication**: Implement proper JWT validation and refresh tokens
- **Authorization**: Use role-based access control
- **Input Validation**: Validate all inputs with Zod schemas
- **CORS**: Configure appropriate CORS policies
- **Rate Limiting**: Implement rate limiting for API endpoints

## Next Steps

1. Complete migration of remaining endpoints
2. Update frontend to use new backend
3. Implement comprehensive testing
4. Set up CI/CD pipeline
5. Deploy to production environment

## Support

For questions or issues with the migration, please refer to:
- Next.js documentation: https://nextjs.org/docs
- Supabase documentation: https://supabase.com/docs
- TypeScript documentation: https://www.typescriptlang.org/docs
