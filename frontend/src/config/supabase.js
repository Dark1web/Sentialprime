import { createClient } from '@supabase/supabase-js'

// Replace these with your actual Supabase project URL and anon key
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://your-project-ref.supabase.co'
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'your-anon-key'

// Demo mode flag - set to true when no real Supabase config
const isDemoMode = supabaseUrl === 'https://your-project-ref.supabase.co' || supabaseAnonKey === 'your-anon-key'

export const supabase = isDemoMode ? null : createClient(supabaseUrl, supabaseAnonKey)

// Database table schemas
export const tables = {
  // User profiles table
  profiles: 'profiles',
  
  // Disaster reports table
  disaster_reports: 'disaster_reports',
  
  // Emergency requests table  
  emergency_requests: 'emergency_requests',
  
  // Misinformation reports table
  misinformation_reports: 'misinformation_reports',
  
  // Safe zones table
  safe_zones: 'safe_zones',
  
  // News articles cache table
  news_articles: 'news_articles'
}

// Demo database implementation
const demoDb = {
  profiles: new Map(),
  disaster_reports: [],
  emergency_requests: [],
  misinformation_reports: [],
  safe_zones: [
    {
      id: 1,
      name: 'Central Community Center',
      latitude: 37.7749,
      longitude: -122.4194,
      capacity: 500,
      active: true,
      facilities: ['shelter', 'food', 'medical']
    },
    {
      id: 2,
      name: 'Emergency Relief Station',
      latitude: 37.7849,
      longitude: -122.4094,
      capacity: 300,
      active: true,
      facilities: ['shelter', 'communication']
    }
  ],
  news_articles: []
};

const demoDbHelpers = {
  async createDisasterReport(reportData) {
    await new Promise(resolve => setTimeout(resolve, 200));
    const report = {
      id: Date.now(),
      ...reportData,
      created_at: new Date().toISOString(),
      status: 'pending'
    };
    demoDb.disaster_reports.push(report);
    return { data: [report], error: null };
  },

  async getUserProfile(userId) {
    await new Promise(resolve => setTimeout(resolve, 200));
    const profile = demoDb.profiles.get(userId);
    if (!profile) {
      return { data: null, error: { message: 'Profile not found' } };
    }
    return { data: profile, error: null };
  },

  async upsertUserProfile(profile) {
    await new Promise(resolve => setTimeout(resolve, 200));
    demoDb.profiles.set(profile.id, profile);
    return { data: [profile], error: null };
  },

  async getRecentDisasterReports(limit = 50) {
    await new Promise(resolve => setTimeout(resolve, 200));
    const reports = [...demoDb.disaster_reports]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, limit);
    return { data: reports, error: null };
  },

  async submitEmergencyRequest(requestData) {
    await new Promise(resolve => setTimeout(resolve, 200));
    const request = {
      id: Date.now(),
      ...requestData,
      created_at: new Date().toISOString(),
      status: 'pending'
    };
    demoDb.emergency_requests.push(request);
    return { data: [request], error: null };
  },

  async getSafeZonesNearLocation(lat, lng, radiusKm = 10) {
    await new Promise(resolve => setTimeout(resolve, 200));
    return { data: demoDb.safe_zones.filter(zone => zone.active), error: null };
  }
};

// Helper functions for common database operations
export const dbHelpers = isDemoMode ? demoDbHelpers : {
  // Insert a new disaster report
  async createDisasterReport(reportData) {
    const { data, error } = await supabase
      .from(tables.disaster_reports)
      .insert([{
        ...reportData,
        created_at: new Date().toISOString(),
        status: 'pending'
      }])
      .select()
    
    return { data, error }
  },

  // Get user profile
  async getUserProfile(userId) {
    const { data, error } = await supabase
      .from(tables.profiles)
      .select('*')
      .eq('id', userId)
      .single()
    
    return { data, error }
  },

  // Create or update user profile
  async upsertUserProfile(profile) {
    const { data, error } = await supabase
      .from(tables.profiles)
      .upsert(profile)
      .select()
    
    return { data, error }
  },

  // Get recent disaster reports
  async getRecentDisasterReports(limit = 50) {
    const { data, error } = await supabase
      .from(tables.disaster_reports)
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)
    
    return { data, error }
  },

  // Submit emergency request
  async submitEmergencyRequest(requestData) {
    const { data, error } = await supabase
      .from(tables.emergency_requests)
      .insert([{
        ...requestData,
        created_at: new Date().toISOString(),
        status: 'pending'
      }])
      .select()
    
    return { data, error }
  },

  // Get safe zones near location
  async getSafeZonesNearLocation(lat, lng, radiusKm = 10) {
    // For now, return all safe zones
    // In production, you'd use PostGIS for location queries
    const { data, error } = await supabase
      .from(tables.safe_zones)
      .select('*')
      .eq('active', true)
    
    return { data, error }
  }
}

// Demo users for testing
const demoUsers = [
  {
    id: 'demo-user-1',
    email: 'demo@sentinelx.com',
    password: 'demo123',
    user_metadata: {
      first_name: 'Demo',
      last_name: 'User',
      organization: 'SentinelX Demo'
    }
  },
  {
    id: 'admin-user-1',
    email: 'admin@sentinelx.com',
    password: 'admin123',
    user_metadata: {
      first_name: 'Admin',
      last_name: 'User',
      organization: 'SentinelX',
      role: 'admin'
    }
  }
];

// Demo authentication implementation
const demoAuth = {
  currentUser: null,
  listeners: [],
  
  async signUp(email, password, userData = {}) {
    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Check if user already exists
    const existingUser = demoUsers.find(u => u.email === email);
    if (existingUser) {
      return { data: null, error: { message: 'User already exists' } };
    }
    
    // Create new demo user
    const newUser = {
      id: `demo-user-${Date.now()}`,
      email,
      user_metadata: userData
    };
    
    demoUsers.push({ ...newUser, password });
    this.currentUser = newUser;
    
    // Store in localStorage for persistence
    localStorage.setItem('sentinelx_demo_user', JSON.stringify(newUser));
    
    // Trigger auth state change
    this.triggerAuthStateChange('SIGNED_IN', { user: newUser, access_token: 'demo_token' });
    
    return { 
      data: { 
        user: newUser,
        session: { user: newUser, access_token: 'demo_token' }
      }, 
      error: null 
    };
  },

  async signIn(email, password) {
    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const user = demoUsers.find(u => u.email === email && u.password === password);
    if (!user) {
      return { data: null, error: { message: 'Invalid email or password' } };
    }
    
    const { password: _, ...userWithoutPassword } = user;
    this.currentUser = userWithoutPassword;
    
    // Store in localStorage for persistence
    localStorage.setItem('sentinelx_demo_user', JSON.stringify(userWithoutPassword));
    
    // Trigger auth state change
    const session = { user: userWithoutPassword, access_token: 'demo_token' };
    this.triggerAuthStateChange('SIGNED_IN', session);
    
    return { 
      data: { 
        user: userWithoutPassword,
        session
      }, 
      error: null 
    };
  },

  async signOut() {
    this.currentUser = null;
    localStorage.removeItem('sentinelx_demo_user');
    
    // Trigger auth state change
    this.triggerAuthStateChange('SIGNED_OUT', null);
    
    return { error: null };
  },

  async getSession() {
    const storedUser = localStorage.getItem('sentinelx_demo_user');
    if (storedUser) {
      this.currentUser = JSON.parse(storedUser);
      return { user: this.currentUser, access_token: 'demo_token' };
    }
    return null;
  },

  triggerAuthStateChange(event, session) {
    // Trigger all registered listeners
    this.listeners.forEach(callback => {
      setTimeout(() => callback(event, session), 0);
    });
  },

  onAuthStateChange(callback) {
    // Store the callback
    this.listeners.push(callback);
    
    // Return a mock subscription with unsubscribe function
    return { 
      data: { 
        subscription: {
          unsubscribe: () => {
            const index = this.listeners.indexOf(callback);
            if (index > -1) {
              this.listeners.splice(index, 1);
            }
          }
        }
      }
    };
  },

  async resetPassword(email) {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { data: { message: 'Password reset email sent (demo mode)' }, error: null };
  }
};

// Authentication helpers
export const authHelpers = isDemoMode ? demoAuth : {
  // Sign up with email and password
  async signUp(email, password, userData = {}) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    })
    
    return { data, error }
  },

  // Sign in with email and password
  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    return { data, error }
  },

  // Sign out
  async signOut() {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  // Get current session
  async getSession() {
    const { data: { session } } = await supabase.auth.getSession()
    return session
  },

  // Listen to auth changes
  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback)
  },

  // Reset password
  async resetPassword(email) {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    })
    
    return { data, error }
  }
}