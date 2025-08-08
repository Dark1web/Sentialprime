# 🚀 SentinelX Modern Frontend

A stunning, modern frontend for the SentinelX AI-powered disaster intelligence system, built with Next.js 14, TypeScript, and Tailwind CSS.

## ✨ Features

### 🎨 **Modern Design System**
- **Crisis-Response Theme**: Professional emergency service color palette (reds, oranges, blues)
- **Dark Mode Support**: 24/7 operations optimized interface
- **Accessibility Compliant**: WCAG 2.1 AA standards for emergency situations
- **Mobile-First Responsive**: Optimized for field use by emergency responders

### 🚀 **Advanced UI Components**
- **Interactive Hero Section**: AI disaster response showcase with 3D globe visualization
- **Live Demo Components**: Real-time misinformation detection, emergency triage, satellite analysis
- **Smooth Animations**: Framer Motion powered transitions and micro-interactions
- **Progressive Web App**: Offline emergency access capabilities

### 🌍 **Interactive Visualizations**
- **3D Globe Visualization**: Real-time disaster monitoring with threat level indicators
- **Satellite Imagery Demo**: Live satellite analysis simulation
- **Emergency Triage Interface**: AI-powered priority classification demo
- **Misinformation Detection**: Real-time social media analysis showcase

### 📱 **PWA Capabilities**
- **Offline Access**: Critical emergency features work without internet
- **Push Notifications**: Real-time disaster alerts
- **App-like Experience**: Install on mobile devices and desktops
- **Emergency Shortcuts**: Quick access to critical functions

## 🏗️ **Architecture**

### **Tech Stack**
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript for type safety
- **Styling**: Tailwind CSS with custom design system
- **Animations**: Framer Motion for smooth interactions
- **Icons**: Lucide React + Heroicons
- **UI Components**: Radix UI primitives
- **State Management**: React hooks + SWR for data fetching
- **PWA**: next-pwa for offline capabilities

### **Project Structure**
```
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout with theme provider
│   ├── page.tsx           # Landing page
│   └── globals.css        # Global styles and design system
├── components/
│   ├── sections/          # Landing page sections
│   │   ├── hero-section.tsx
│   │   ├── features-section.tsx
│   │   ├── demo-section.tsx
│   │   ├── stats-section.tsx
│   │   ├── use-cases-section.tsx
│   │   ├── testimonials-section.tsx
│   │   └── cta-section.tsx
│   ├── demo/              # Interactive demo components
│   │   ├── misinformation-demo.tsx
│   │   ├── triage-demo.tsx
│   │   └── satellite-demo.tsx
│   ├── layout/            # Layout components
│   │   ├── header.tsx
│   │   └── footer.tsx
│   ├── ui/                # Reusable UI components
│   │   ├── button.tsx
│   │   ├── badge.tsx
│   │   ├── tabs.tsx
│   │   ├── progress.tsx
│   │   ├── theme-toggle.tsx
│   │   ├── typewriter-text.tsx
│   │   ├── stats-counter.tsx
│   │   └── globe-visualization.tsx
│   └── providers/         # Context providers
│       └── theme-provider.tsx
├── lib/
│   └── utils.ts           # Utility functions
├── hooks/
│   └── use-toast.ts       # Toast notifications
└── public/                # Static assets
    ├── manifest.json      # PWA manifest
    └── icons/             # App icons
```

## 🚀 **Getting Started**

### **Prerequisites**
- Node.js 18+ 
- npm 8+
- SentinelX Backend running on port 9000

### **Installation**
```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Start development server
npm run dev
```

The frontend will be available at `http://localhost:3000`

### **Environment Configuration**
```env
# Application URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:9000

# Feature Flags
NEXT_PUBLIC_ENABLE_PWA=true
NEXT_PUBLIC_DEFAULT_THEME=system
NEXT_PUBLIC_DEMO_MODE=false

# Contact Information
NEXT_PUBLIC_EMERGENCY_PHONE=+1-555-CRISIS-1
NEXT_PUBLIC_EMERGENCY_EMAIL=emergency@sentinelx.ai
```

## 🎯 **Key Features**

### **Landing Page Sections**

1. **Hero Section**
   - Dynamic typewriter text for emergency types
   - 3D globe visualization with live disaster markers
   - Real-time statistics counters
   - Multiple CTA buttons (Get Started, Demo, Emergency Access)

2. **Live Stats Section**
   - Real-time system status indicators
   - Global monitoring statistics
   - Live activity feed with recent events
   - Operational status badges

3. **Features Section**
   - AI-powered analysis capabilities
   - Satellite intelligence features
   - Emergency triage system
   - Misinformation detection
   - Global monitoring network
   - Community reporting system

4. **Interactive Demo Section**
   - Tabbed interface for different demos
   - Misinformation detection simulation
   - Emergency triage classification
   - Satellite imagery analysis
   - Real-time processing animations

5. **Use Cases Section**
   - Emergency services testimonials
   - Government agency case studies
   - NGO success stories
   - Community impact examples

6. **Testimonials Section**
   - Real user testimonials
   - Organization logos
   - Success metrics
   - Trust indicators

7. **Call-to-Action Section**
   - Multiple engagement options
   - Emergency contact information
   - Trust badges and certifications

### **Interactive Demos**

#### **Misinformation Detection Demo**
- Social media feed simulation
- Real-time AI analysis
- Credibility scoring
- Source verification
- Sentiment analysis

#### **Emergency Triage Demo**
- Incoming emergency reports
- AI-powered prioritization
- Resource allocation
- Response time optimization
- Priority queue visualization

#### **Satellite Analysis Demo**
- Satellite imagery viewer
- AI processing pipeline
- Damage assessment
- Change detection
- Risk evaluation

## 🎨 **Design System**

### **Color Palette**
```css
/* Emergency Service Colors */
--emergency-red: 0 84% 60%;      /* Critical alerts */
--emergency-orange: 25 95% 53%;  /* High priority */
--emergency-blue: 217 91% 60%;   /* Information */
--emergency-green: 142 76% 36%;  /* Operational */

/* Status Colors */
--status-operational: 142 76% 36%;  /* Green - All good */
--status-warning: 45 93% 47%;       /* Yellow - Caution */
--status-critical: 0 84% 60%;       /* Red - Emergency */
--status-unknown: 215 16% 47%;      /* Gray - Unknown */
```

### **Typography**
- **Primary Font**: Inter (clean, professional)
- **Monospace Font**: JetBrains Mono (code/data display)
- **Responsive Scale**: Mobile-first approach

### **Animations**
- **Page Transitions**: Smooth fade and slide effects
- **Loading States**: AI processing themed spinners
- **Micro-interactions**: Hover effects and button animations
- **Emergency Alerts**: Pulsing and attention-grabbing animations

## 📱 **PWA Features**

### **Offline Capabilities**
- Critical emergency information cached
- Offline-first approach for emergency scenarios
- Service worker for background updates
- Cached API responses for essential data

### **Installation**
- Add to home screen on mobile devices
- Desktop app installation
- Emergency shortcuts in app launcher
- Push notification support

## 🔧 **Development**

### **Available Scripts**
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
npm test             # Run tests
npm run test:watch   # Run tests in watch mode
```

### **Code Quality**
- **TypeScript**: Full type safety
- **ESLint**: Code linting and formatting
- **Prettier**: Code formatting
- **Tailwind CSS**: Utility-first styling
- **Component Architecture**: Reusable, composable components

## 🚀 **Deployment**

### **Production Build**
```bash
npm run build
npm start
```

### **Environment Variables**
Ensure all required environment variables are set in production:
- `NEXT_PUBLIC_APP_URL`: Production frontend URL
- `NEXT_PUBLIC_API_URL`: Production backend URL
- `NEXT_PUBLIC_ENABLE_PWA`: Enable PWA features

### **Performance Optimizations**
- **Image Optimization**: Next.js automatic image optimization
- **Code Splitting**: Automatic route-based code splitting
- **Bundle Analysis**: Built-in bundle analyzer
- **Caching**: Aggressive caching for static assets
- **Compression**: Gzip compression enabled

## 🔗 **Integration**

### **Backend Integration**
The frontend seamlessly integrates with the SentinelX Next.js backend:
- **API Routes**: All existing endpoints supported
- **Real-time Data**: Live updates from backend services
- **Authentication**: JWT token support ready
- **File Uploads**: Community reporting with images

### **API Endpoints Used**
- `GET /api/health` - System health status
- `POST /api/misinformation/analyze` - Demo data
- `POST /api/triage/classify` - Demo data  
- `GET /api/live/news/disaster-feed` - Live news
- `GET /api/live/weather/current` - Weather data
- `GET /api/live/satellite/disaster-imagery` - Satellite data

## 🎯 **Next Steps**

1. **Install Dependencies**: `npm install`
2. **Configure Environment**: Copy and edit `.env.local`
3. **Start Development**: `npm run dev`
4. **View Landing Page**: Visit `http://localhost:3000`
5. **Test Interactive Demos**: Click "Start Interactive Demo"
6. **Customize Branding**: Update colors, logos, and content
7. **Deploy to Production**: Build and deploy to your hosting platform

## 🆘 **Emergency Access**

The frontend includes dedicated emergency access features:
- **Emergency Button**: Prominent red emergency access button
- **Quick Actions**: Fast access to critical functions
- **Offline Mode**: Works without internet connection
- **Emergency Contacts**: Built-in emergency contact information

---

**🎉 The SentinelX modern frontend is ready for production use!**

This stunning, professional frontend provides an exceptional user experience for emergency services, government agencies, and communities worldwide using SentinelX for disaster intelligence and crisis response.
