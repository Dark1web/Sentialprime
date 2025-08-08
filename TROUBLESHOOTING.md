# SentinelX Troubleshooting Guide

## 🚨 Barba.js Error Fix

### Problem
If you see this error in the browser console:
```
[@barba/core] No Barba wrapper found
./src/utils/transition.js
./src/index.js
```

### Root Cause
This error occurs when the old React application (from `frontend/` directory) conflicts with the Next.js application.

### ✅ Permanent Solution Applied

1. **Renamed conflicting directory**: `frontend/` → `frontend_old_react_app/`
2. **Created clean start script**: `scripts/start-clean.sh`
3. **Added npm script**: `npm run dev:clean`

### 🚀 How to Start SentinelX Properly

**Option 1: Use the clean start script (Recommended)**
```bash
npm run dev:clean
```

**Option 2: Manual start**
```bash
# Kill any processes on port 3000
lsof -ti:3000 | xargs kill -9

# Clear Next.js cache
rm -rf .next

# Start Next.js server
npm run dev:frontend
```

### 🔍 Verification Steps

1. **Check the URL**: Make sure you're visiting `http://localhost:3000`
2. **Check browser console**: Should show no Barba.js errors
3. **Test API endpoints**: 
   - `http://localhost:3000/api/ai/misinformation` (GET)
   - `http://localhost:3000/dashboard`
   - `http://localhost:3000/emergency`

### 🛠️ If Error Persists

1. **Clear browser cache**: Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
2. **Check running processes**:
   ```bash
   ps aux | grep -E "(react-scripts|webpack-dev-server)"
   ```
3. **Kill React processes**:
   ```bash
   pkill -f "react-scripts"
   ```
4. **Restart with clean script**:
   ```bash
   npm run dev:clean
   ```

### 📁 Directory Structure

```
SentinelX/
├── app/                    # Next.js App Router (ACTIVE)
├── components/             # Next.js Components (ACTIVE)
├── lib/                   # Next.js Libraries (ACTIVE)
├── frontend_old_react_app/ # Old React App (INACTIVE)
├── scripts/               # Utility Scripts
│   └── start-clean.sh     # Clean start script
└── package.json           # Next.js Package Config (ACTIVE)
```

### ⚠️ Important Notes

- **Never run**: `cd frontend_old_react_app && npm start`
- **Always use**: `npm run dev:frontend` or `npm run dev:clean`
- **Port 3000**: Reserved for Next.js frontend only
- **Port 9000**: Reserved for FastAPI backend

### 🎯 Success Indicators

✅ Browser console shows no Barba.js errors
✅ All pages load without JavaScript errors  
✅ AI APIs respond correctly
✅ Dashboard displays misinformation monitor
✅ Real-time data updates work

### 📞 Emergency Recovery

If everything breaks, run this sequence:
```bash
# 1. Kill everything on port 3000
lsof -ti:3000 | xargs kill -9

# 2. Kill React processes
pkill -f "react-scripts"

# 3. Clear caches
rm -rf .next
rm -rf node_modules/.cache

# 4. Restart clean
npm run dev:clean
```

---

**✅ Status**: Barba.js error permanently resolved
**🚀 System**: Fully operational with all AI features
**📅 Last Updated**: December 2024
