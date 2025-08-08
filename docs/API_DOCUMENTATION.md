# SentinelX API Documentation

## Overview

SentinelX provides a comprehensive REST API for disaster intelligence and crisis response management. The API is built with Next.js and TypeScript, offering real-time data processing, AI-powered analysis, and geospatial capabilities.

**Base URL**: `http://localhost:9000/api` (development)
**Authentication**: Supabase Auth (JWT tokens)
**Data Format**: JSON

## Authentication

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

### Demo Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "demo": true
}
```

## AI/ML Services

### Image Analysis
Analyze disaster-related images using YOLO and computer vision models.

```http
POST /api/ai/analyze-image
Content-Type: application/json

{
  "image_url": "https://example.com/disaster-image.jpg",
  "analysis_type": "disaster_detection",
  "location": {
    "latitude": 40.7128,
    "longitude": -74.0060
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "analysis_type": "disaster_detection",
    "results": {
      "detected_disasters": [
        {
          "type": "flood",
          "confidence": 0.87,
          "bounding_box": { "x": 120, "y": 80, "width": 300, "height": 200 },
          "severity": "high"
        }
      ],
      "overall_confidence": 0.82,
      "risk_assessment": "high"
    }
  }
}
```

## External APIs

### Weather Data
Get comprehensive weather information and alerts.

```http
POST /api/external/weather
Content-Type: application/json

{
  "latitude": 40.7128,
  "longitude": -74.0060,
  "include_alerts": true,
  "include_forecast": true,
  "units": "metric"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "current_weather": {
      "temperature": 22.5,
      "humidity": 65,
      "wind": { "speed": 3.2, "direction": 180 }
    },
    "alerts": {
      "alerts": [
        {
          "title": "Severe Thunderstorm Warning",
          "severity": "moderate",
          "start_time": "2024-01-15T18:00:00Z"
        }
      ]
    }
  }
}
```

## Database Operations

### Disasters

#### Get Disasters
```http
GET /api/database/disasters?limit=20&severity=high&status=active
```

#### Create Disaster
```http
POST /api/database/disasters
Content-Type: application/json

{
  "type": "flood",
  "title": "Flash Flood in Downtown Area",
  "description": "Severe flooding due to heavy rainfall",
  "severity": "high",
  "latitude": 40.7128,
  "longitude": -74.0060,
  "address": "Downtown Manhattan, NY",
  "affected_population": 5000,
  "source": "Emergency Services"
}
```

#### Update Disaster
```http
PUT /api/database/disasters
Content-Type: application/json

{
  "id": "disaster-uuid",
  "status": "resolved",
  "casualties": 2,
  "damage_estimate": 1500000
}
```

#### Delete Disaster
```http
DELETE /api/database/disasters?id=disaster-uuid
```

## Real-time Services

### WebSocket Connection
Connect to real-time updates via WebSocket.

**WebSocket URL**: `ws://localhost:8080`

**Message Format:**
```json
{
  "type": "subscribe",
  "channel": "disasters",
  "filters": {
    "severity": "critical"
  }
}
```

**Supported Channels:**
- `disasters` - Real-time disaster updates
- `community_reports` - Community-submitted reports
- `alerts` - Emergency alerts and notifications
- `analytics` - System analytics events
- `all` - All channels

### Broadcast Data
```http
POST /api/realtime/websocket
Content-Type: application/json

{
  "channel": "disasters",
  "data": {
    "id": "new-disaster-id",
    "type": "earthquake",
    "severity": "critical"
  },
  "event_type": "disaster_created"
}
```

## Community Reports

### Submit Report
```http
POST /api/community/submit
Content-Type: application/json

{
  "type": "flood",
  "title": "Street flooding on Main St",
  "description": "Water level rising rapidly",
  "latitude": 40.7128,
  "longitude": -74.0060,
  "severity": "medium",
  "contact_info": {
    "phone": "+1-555-0123",
    "email": "reporter@example.com"
  }
}
```

### Get Reports
```http
GET /api/community/reports?limit=50&status=verified
```

## Misinformation Analysis

### Analyze Content
```http
POST /api/misinformation/analyze
Content-Type: application/json

{
  "text": "Breaking: Massive earthquake hits downtown, buildings collapsing everywhere!"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "analysis": {
      "is_misinformation": true,
      "confidence": 0.85,
      "panic_score": 0.92,
      "reasoning": "Sensationalized language without credible sources"
    }
  }
}
```

## Emergency Triage

### Classify Request
```http
POST /api/triage/classify
Content-Type: application/json

{
  "text": "My house is flooding and I need immediate evacuation",
  "location": "Downtown Area"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "classification": {
      "priority": "critical",
      "category": "evacuation",
      "estimated_response_time": "5-10 minutes",
      "required_resources": ["rescue_team", "evacuation_vehicle"]
    }
  }
}
```

## System Health

### Health Check
```http
GET /api/health
```

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "operational",
    "timestamp": "2024-01-15T12:00:00Z",
    "services": {
      "database": "healthy",
      "external_apis": "healthy",
      "websocket": "healthy"
    },
    "uptime": 86400
  }
}
```

## Error Handling

All API endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error message",
  "details": ["Detailed error information"],
  "timestamp": "2024-01-15T12:00:00Z"
}
```

**HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Too Many Requests (rate limited)
- `500` - Internal Server Error

## Rate Limiting

API endpoints are rate limited to prevent abuse:
- **Default**: 100 requests per 15 minutes per IP
- **Authenticated users**: 1000 requests per 15 minutes
- **Premium users**: 5000 requests per 15 minutes

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642248000
```

## Data Models

### Disaster
```typescript
interface Disaster {
  id: string
  type: 'earthquake' | 'flood' | 'wildfire' | 'hurricane' | 'tornado' | 'tsunami' | 'volcanic' | 'landslide' | 'drought' | 'blizzard' | 'other'
  title: string
  description?: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  status: 'active' | 'monitoring' | 'resolved' | 'archived'
  latitude: number
  longitude: number
  address?: string
  country?: string
  region?: string
  affected_population?: number
  casualties?: number
  damage_estimate?: number
  source?: string
  source_url?: string
  verified: boolean
  confidence_score?: number
  created_at: string
  updated_at: string
  resolved_at?: string
  metadata?: Record<string, any>
}
```

### User Profile
```typescript
interface UserProfile {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  role: 'user' | 'responder' | 'coordinator' | 'admin'
  organization?: string
  phone?: string
  location?: GeoJSON.Point
  preferences?: Record<string, any>
  verified: boolean
  active: boolean
  last_seen?: string
  created_at: string
  updated_at: string
}
```

## SDKs and Libraries

### JavaScript/TypeScript
```bash
npm install @sentinelx/sdk
```

```typescript
import { SentinelXClient } from '@sentinelx/sdk'

const client = new SentinelXClient({
  apiUrl: 'http://localhost:9000/api',
  apiKey: 'your-api-key'
})

const disasters = await client.disasters.list({
  severity: 'high',
  limit: 10
})
```

### Python
```bash
pip install sentinelx-python
```

```python
from sentinelx import SentinelXClient

client = SentinelXClient(
    api_url='http://localhost:9000/api',
    api_key='your-api-key'
)

disasters = client.disasters.list(severity='high', limit=10)
```

## Support

- **Documentation**: https://docs.sentinelx.ai
- **API Status**: https://status.sentinelx.ai
- **Support Email**: support@sentinelx.ai
- **Emergency Contact**: emergency@sentinelx.ai
