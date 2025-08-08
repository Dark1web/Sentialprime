# SentinelX Deployment Guide

## Overview

This guide covers deploying the SentinelX full-stack disaster intelligence platform to production environments. The platform consists of a Next.js application with both frontend and backend API routes, Supabase database, and real-time WebSocket services.

## Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- Domain name (for production)
- SSL certificate (for HTTPS)

## Environment Setup

### 1. Supabase Database Setup

1. **Create Supabase Project**
   ```bash
   # Visit https://supabase.com and create a new project
   # Note down your project URL and API keys
   ```

2. **Run Database Migrations**
   ```sql
   -- Execute the SQL in database/migrations/001_initial_schema.sql
   -- in your Supabase SQL editor
   ```

3. **Configure Row Level Security**
   ```sql
   -- RLS policies are included in the migration
   -- Verify they're applied correctly
   ```

### 2. Environment Variables

Create `.env.local` from `.env.example`:

```bash
cp .env.example .env.local
```

**Required Variables:**
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# External APIs
OPENWEATHERMAP_API_KEY=your_weather_api_key
NEWS_API_KEY=your_news_api_key
HUGGINGFACE_API_TOKEN=your_huggingface_token

# Application
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXT_PUBLIC_API_URL=https://your-domain.com
JWT_SECRET=your-secure-jwt-secret
```

## Deployment Options

### Option 1: Vercel (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy to Vercel**
   ```bash
   # Login to Vercel
   vercel login
   
   # Deploy
   vercel --prod
   ```

3. **Configure Environment Variables**
   ```bash
   # Add environment variables in Vercel dashboard
   # or use CLI
   vercel env add NEXT_PUBLIC_SUPABASE_URL
   vercel env add SUPABASE_SERVICE_ROLE_KEY
   # ... add all required variables
   ```

4. **Custom Domain**
   ```bash
   # Add custom domain in Vercel dashboard
   vercel domains add your-domain.com
   ```

### Option 2: Railway

1. **Install Railway CLI**
   ```bash
   npm install -g @railway/cli
   ```

2. **Deploy to Railway**
   ```bash
   # Login to Railway
   railway login
   
   # Initialize project
   railway init
   
   # Deploy
   railway up
   ```

3. **Configure Environment Variables**
   ```bash
   # Set environment variables
   railway variables set NEXT_PUBLIC_SUPABASE_URL=your_url
   railway variables set SUPABASE_SERVICE_ROLE_KEY=your_key
   ```

### Option 3: Docker Deployment

1. **Create Dockerfile**
   ```dockerfile
   FROM node:18-alpine AS base
   
   # Install dependencies only when needed
   FROM base AS deps
   RUN apk add --no-cache libc6-compat
   WORKDIR /app
   
   COPY package.json package-lock.json* ./
   RUN npm ci --only=production
   
   # Rebuild the source code only when needed
   FROM base AS builder
   WORKDIR /app
   COPY --from=deps /app/node_modules ./node_modules
   COPY . .
   
   RUN npm run build
   
   # Production image, copy all the files and run next
   FROM base AS runner
   WORKDIR /app
   
   ENV NODE_ENV production
   
   RUN addgroup --system --gid 1001 nodejs
   RUN adduser --system --uid 1001 nextjs
   
   COPY --from=builder /app/public ./public
   COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
   COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
   
   USER nextjs
   
   EXPOSE 3000
   
   ENV PORT 3000
   
   CMD ["node", "server.js"]
   ```

2. **Build and Run**
   ```bash
   # Build Docker image
   docker build -t sentinelx .
   
   # Run container
   docker run -p 3000:3000 --env-file .env.local sentinelx
   ```

### Option 4: AWS/DigitalOcean/VPS

1. **Server Setup**
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y
   
   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # Install PM2 for process management
   sudo npm install -g pm2
   ```

2. **Deploy Application**
   ```bash
   # Clone repository
   git clone https://github.com/your-username/sentinelx.git
   cd sentinelx
   
   # Install dependencies
   npm install
   
   # Build application
   npm run build
   
   # Start with PM2
   pm2 start ecosystem.config.js
   pm2 save
   pm2 startup
   ```

3. **Nginx Configuration**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
       }
       
       # WebSocket support
       location /ws {
           proxy_pass http://localhost:8080;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection "upgrade";
           proxy_set_header Host $host;
       }
   }
   ```

4. **SSL Certificate**
   ```bash
   # Install Certbot
   sudo apt install certbot python3-certbot-nginx
   
   # Get SSL certificate
   sudo certbot --nginx -d your-domain.com
   ```

## Production Configuration

### 1. Security Headers

Update `next.config.js`:
```javascript
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains'
          }
        ]
      }
    ]
  }
}
```

### 2. Database Optimization

```sql
-- Create indexes for better performance
CREATE INDEX CONCURRENTLY idx_disasters_location_gist ON disasters USING GIST (location);
CREATE INDEX CONCURRENTLY idx_disasters_created_at_desc ON disasters (created_at DESC);
CREATE INDEX CONCURRENTLY idx_community_reports_status_created ON community_reports (status, created_at DESC);

-- Enable connection pooling
ALTER SYSTEM SET max_connections = 200;
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
```

### 3. Monitoring Setup

1. **Health Checks**
   ```bash
   # Add health check endpoint monitoring
   curl -f http://your-domain.com/api/health || exit 1
   ```

2. **Log Management**
   ```javascript
   // Add structured logging
   import winston from 'winston'
   
   const logger = winston.createLogger({
     level: 'info',
     format: winston.format.json(),
     transports: [
       new winston.transports.File({ filename: 'error.log', level: 'error' }),
       new winston.transports.File({ filename: 'combined.log' })
     ]
   })
   ```

3. **Error Tracking**
   ```bash
   # Install Sentry
   npm install @sentry/nextjs
   ```

### 4. Performance Optimization

1. **Caching Strategy**
   ```javascript
   // Add Redis for caching
   import Redis from 'ioredis'
   
   const redis = new Redis(process.env.REDIS_URL)
   
   // Cache API responses
   const cacheKey = `disasters:${JSON.stringify(params)}`
   const cached = await redis.get(cacheKey)
   if (cached) return JSON.parse(cached)
   ```

2. **CDN Configuration**
   ```javascript
   // Configure CDN for static assets
   const nextConfig = {
     assetPrefix: process.env.CDN_URL,
     images: {
       domains: ['your-cdn-domain.com']
     }
   }
   ```

## Post-Deployment Checklist

### 1. Functionality Testing
- [ ] User authentication works
- [ ] Dashboard loads with real data
- [ ] Maps display correctly
- [ ] Real-time updates function
- [ ] API endpoints respond correctly
- [ ] Emergency access works
- [ ] Mobile responsiveness verified

### 2. Performance Testing
- [ ] Page load times < 3 seconds
- [ ] API response times < 500ms
- [ ] WebSocket connections stable
- [ ] Database queries optimized
- [ ] CDN serving static assets

### 3. Security Testing
- [ ] HTTPS enforced
- [ ] Security headers present
- [ ] Authentication required for protected routes
- [ ] Rate limiting active
- [ ] Input validation working
- [ ] SQL injection protection verified

### 4. Monitoring Setup
- [ ] Health checks configured
- [ ] Error tracking active
- [ ] Performance monitoring enabled
- [ ] Log aggregation working
- [ ] Alerting configured

## Maintenance

### 1. Regular Updates
```bash
# Update dependencies monthly
npm audit
npm update

# Update database schema as needed
# Run new migrations in Supabase
```

### 2. Backup Strategy
```bash
# Database backups (Supabase handles this automatically)
# File uploads backup
aws s3 sync ./public/uploads s3://your-backup-bucket/uploads

# Configuration backup
cp .env.local backups/.env.$(date +%Y%m%d)
```

### 3. Scaling Considerations
- Monitor database performance
- Consider read replicas for high traffic
- Implement horizontal scaling with load balancers
- Use CDN for global content delivery
- Consider microservices architecture for large scale

## Troubleshooting

### Common Issues

1. **Build Failures**
   ```bash
   # Clear Next.js cache
   rm -rf .next
   npm run build
   ```

2. **Database Connection Issues**
   ```bash
   # Check Supabase connection
   curl -H "apikey: YOUR_ANON_KEY" https://your-project.supabase.co/rest/v1/
   ```

3. **Environment Variable Issues**
   ```bash
   # Verify environment variables are loaded
   node -e "console.log(process.env.NEXT_PUBLIC_SUPABASE_URL)"
   ```

### Support Resources
- **Documentation**: https://docs.sentinelx.ai
- **GitHub Issues**: https://github.com/sentinelx/issues
- **Discord Community**: https://discord.gg/sentinelx
- **Email Support**: support@sentinelx.ai
