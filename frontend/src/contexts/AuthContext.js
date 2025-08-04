import React, { createContext, useContext, useState, useEffect } from 'react';
import { authHelpers, dbHelpers } from '../config/supabase';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check for existing session
    const initializeAuth = async () => {
      try {
        const session = await authHelpers.getSession();
        if (session?.user) {
          setUser(session.user);
          await loadUserProfile(session.user.id);
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = authHelpers.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user);
          await loadUserProfile(session.user.id);
        } else {
          setUser(null);
          setProfile(null);
        }
        setLoading(false);
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const loadUserProfile = async (userId) => {
    try {
      const { data, error } = await dbHelpers.getUserProfile(userId);
      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        console.error('Error loading profile:', error);
      } else if (data) {
        setProfile(data);
      }
    } catch (err) {
      console.error('Profile loading error:', err);
    }
  };

  const signIn = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await authHelpers.signIn(email, password);
      
      if (error) {
        setError(error.message);
        return { error };
      }
      
      return { data };
    } catch (err) {
      setError(err.message);
      return { error: err };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email, password, userData = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await authHelpers.signUp(email, password, userData);
      
      if (error) {
        setError(error.message);
        return { error };
      }
      
      // Create user profile
      if (data.user) {
        const profileData = {
          id: data.user.id,
          email: data.user.email,
          ...userData,
          created_at: new Date().toISOString()
        };
        
        await dbHelpers.upsertUserProfile(profileData);
      }
      
      return { data };
    } catch (err) {
      setError(err.message);
      return { error: err };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await authHelpers.signOut();
      
      if (error) {
        setError(error.message);
        return { error };
      }
      
      setUser(null);
      setProfile(null);
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { error: err };
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates) => {
    try {
      if (!user) {
        throw new Error('No user logged in');
      }
      
      const updatedProfile = {
        ...profile,
        ...updates,
        updated_at: new Date().toISOString()
      };
      
      const { data, error } = await dbHelpers.upsertUserProfile(updatedProfile);
      
      if (error) {
        setError(error.message);
        return { error };
      }
      
      setProfile(data[0]);
      return { data: data[0] };
    } catch (err) {
      setError(err.message);
      return { error: err };
    }
  };

  const clearError = () => {
    setError(null);
  };

  // Demo login for testing
  const demoLogin = async () => {
    const demoUser = {
      id: 'demo-user-' + Date.now(),
      email: 'demo@sentinelx.com',
      user_metadata: {
        first_name: 'Demo',
        last_name: 'User',
        role: 'admin'
      }
    };
    
    const demoProfile = {
      id: demoUser.id,
      email: demoUser.email,
      first_name: 'Demo',
      last_name: 'User',
      role: 'admin',
      organization: 'SentinelX Demo',
      created_at: new Date().toISOString()
    };
    
    setUser(demoUser);
    setProfile(demoProfile);
    
    return { data: { user: demoUser } };
  };

  const value = {
    user,
    profile,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    updateProfile,
    clearError,
    demoLogin,
    isAuthenticated: !!user,
    isAdmin: profile?.role === 'admin',
    userDisplayName: profile ? 
      `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.email :
      user?.email || 'User'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};