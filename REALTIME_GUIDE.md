# Real-Time Data Implementation Guide

## 🚀 **Free Real-Time Solutions for Your Dashboard**

Your SentinelX project already has excellent real-time infrastructure! Here's how to maximize it:

## ✅ **Current Real-Time Infrastructure**

### 1. **Server-Sent Events (SSE) - FREE**
- **Location**: `/app/api/realtime/sse/route.ts`
- **Features**: 
  - Browser-native support
  - Automatic reconnection
  - Fallback to polling
  - Channel-based broadcasting

### 2. **WebSocket Server - FREE**
- **Location**: `/app/api/realtime/websocket/route.ts`
- **Features**:
  - Custom WebSocket server on port 8080
  - Supabase real-time subscriptions
  - Channel filtering
  - Analytics tracking

### 3. **Real-Time Hook - FREE**
- **Location**: `hooks/use-realtime-data.ts`
- **Features**:
  - Automatic connection management
  - Error handling
  - Polling fallback
  - Data synchronization

### 4. **Supabase Real-Time - FREE**
- **Free Tier**: 50,000 real-time connections
- **Features**:
  - Database change subscriptions
  - Automatic real-time updates
  - Row-level security

## 🎯 **Implementation Options**

### **Option 1: Enhance Current Setup (Recommended)**

Your current setup is production-ready! Here's how to use it:

#### **1. Start the Backend**
```bash
npm run dev
# Server runs on http://localhost:9000
```

#### **2. Test Real-Time Data**
```bash
# Run the test script
node scripts/test-realtime.js
```

#### **3. View Dashboard**
```bash
# Open dashboard
http://localhost:3000/dashboard
```

### **Option 2: Alternative Free Services**

#### **Firebase Realtime Database - FREE**
```bash
npm install firebase
```

**Free Tier Benefits:**
- 1GB storage
- 10GB/month transfer
- 100 concurrent connections
- Offline support

#### **Pusher Channels - FREE**
```bash
npm install pusher pusher-js
```

**Free Tier Benefits:**
- 200,000 messages/day
- 100 concurrent connections
- Public/private channels
- Easy integration

## 🔧 **How to Use Your Current Real-Time System**

### **1. Dashboard Integration**
Your dashboard now automatically receives real-time updates:

```typescript
// In your dashboard component
const {
  data: realtimeData,
  isConnected,
  error: realtimeError,
  loading: realtimeLoading,
  refresh: refreshRealtime
} = useRealtimeData({
  pollingInterval: 15000, // 15 seconds
  useSSE: true,
  channels: ['disasters', 'alerts', 'stats']
})
```

### **2. Broadcasting Data**
Send real-time updates to all connected clients:

```typescript
// Broadcast disaster data
await fetch('/api/realtime/sse', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    channel: 'disasters',
    data: newDisasterData,
    event_type: 'disaster_created'
  })
})

// Broadcast via WebSocket
await fetch('/api/realtime/websocket', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    channel: 'alerts',
    data: newAlertData,
    event_type: 'alert_created'
  })
})
```

### **3. Database Real-Time Subscriptions**
Supabase automatically broadcasts database changes:

```typescript
// Subscribe to disasters table changes
supabase
  .channel('disasters')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'disasters' },
    (payload) => {
      // Handle real-time updates
      console.log('Disaster updated:', payload)
    }
  )
  .subscribe()
```

## 📊 **Real-Time Features Available**

### **1. Live Dashboard Updates**
- ✅ Real-time disaster markers on map
- ✅ Live statistics counters
- ✅ Instant alert notifications
- ✅ Connection status indicator
- ✅ Last update timestamp

### **2. Data Channels**
- **`disasters`** - Real-time disaster events
- **`alerts`** - Emergency notifications
- **`stats`** - System statistics
- **`analytics`** - Usage analytics
- **`all`** - All channels

### **3. Connection Management**
- ✅ Automatic reconnection
- ✅ Fallback to polling
- ✅ Error handling
- ✅ Connection status display
- ✅ Graceful degradation

## 🧪 **Testing Real-Time Features**

### **1. Run the Demo**
```bash
# Start the backend
npm run dev

# In another terminal, run the test script
node scripts/test-realtime.js
```

### **2. Manual Testing**
```bash
# Test SSE broadcasting
curl -X POST http://localhost:9000/api/realtime/sse \
  -H "Content-Type: application/json" \
  -d '{
    "channel": "disasters",
    "data": [{"id": "test", "type": "flood", "severity": "critical"}],
    "event_type": "test"
  }'

# Test WebSocket broadcasting
curl -X POST http://localhost:9000/api/realtime/websocket \
  -H "Content-Type: application/json" \
  -d '{
    "channel": "alerts",
    "data": [{"id": "test", "message": "Test alert"}],
    "event_type": "test"
  }'
```

### **3. View Real-Time Stats**
```bash
# Get connection statistics
curl http://localhost:9000/api/realtime/websocket?action=stats

# Get recent events
curl http://localhost:9000/api/realtime/websocket?action=events&limit=10
```

## 🚀 **Production Deployment**

### **1. Environment Variables**
```env
# Supabase (for real-time database)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-key

# WebSocket (optional)
WEBSOCKET_PORT=8080
WEBSOCKET_HOST=localhost
```

### **2. Deployment Options**

#### **Vercel (Recommended)**
```bash
npm install -g vercel
vercel --prod
```

#### **Railway**
```bash
npm install -g @railway/cli
railway login
railway up
```

#### **Render**
```bash
# Connect your GitHub repo
# Render will auto-deploy
```

## 📈 **Performance Optimization**

### **1. Connection Limits**
- **SSE**: Unlimited connections (browser limit)
- **WebSocket**: 1000+ concurrent connections
- **Supabase**: 50,000 free connections

### **2. Data Optimization**
```typescript
// Optimize data payload
const optimizedData = {
  id: disaster.id,
  type: disaster.type,
  severity: disaster.severity,
  coordinates: [disaster.latitude, disaster.longitude],
  timestamp: disaster.timestamp
}
```

### **3. Caching Strategy**
```typescript
// Cache frequently accessed data
const cache = new Map()

// Use cached data when available
if (cache.has(key)) {
  return cache.get(key)
}
```

## 🔒 **Security Considerations**

### **1. Authentication**
```typescript
// Protect real-time endpoints
export async function GET(request: NextRequest) {
  const token = request.headers.get('authorization')
  if (!isValidToken(token)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  // ... rest of the code
}
```

### **2. Rate Limiting**
```typescript
// Implement rate limiting
const rateLimit = new Map()

function checkRateLimit(clientId: string): boolean {
  const now = Date.now()
  const clientRequests = rateLimit.get(clientId) || []
  const recentRequests = clientRequests.filter(time => now - time < 60000)
  
  if (recentRequests.length > 100) return false
  
  recentRequests.push(now)
  rateLimit.set(clientId, recentRequests)
  return true
}
```

## 🎯 **Next Steps**

### **1. Immediate Actions**
1. ✅ Start your backend: `npm run dev`
2. ✅ Test real-time features: `node scripts/test-realtime.js`
3. ✅ View dashboard: `http://localhost:3000/dashboard`
4. ✅ Monitor connection status

### **2. Advanced Features**
- [ ] Add real-time user presence
- [ ] Implement real-time chat
- [ ] Add real-time notifications
- [ ] Create real-time analytics dashboard

### **3. Scaling Considerations**
- [ ] Implement Redis for session management
- [ ] Add load balancing for WebSocket servers
- [ ] Set up monitoring and alerting
- [ ] Implement data compression

## 💡 **Pro Tips**

1. **Use SSE for one-way updates** (server to client)
2. **Use WebSocket for bidirectional communication**
3. **Implement graceful fallbacks** for offline scenarios
4. **Monitor connection quality** and adjust polling intervals
5. **Cache frequently accessed data** to reduce API calls

Your real-time infrastructure is already excellent! The combination of SSE, WebSocket, and Supabase provides a robust, scalable solution that's completely free to use.
