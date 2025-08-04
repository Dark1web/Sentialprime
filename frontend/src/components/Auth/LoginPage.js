import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Alert,
  Divider,
  Link,
  Tabs,
  Tab,
  CircularProgress,
  IconButton,
  InputAdornment
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Login as LoginIcon,
  PersonAdd as PersonAddIcon,
  Security as SecurityIcon,
  Email as EmailIcon,
  AccountCircle as GoogleIcon,
  Phone as AppleIcon
} from '@mui/icons-material';
import { authHelpers } from '../../config/supabase';

const LoginPage = ({ onLogin = () => {} }) => {
  const [activeTab, setActiveTab] = useState(0); // 0 = Login, 1 = Register
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Form states
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    organization: '',
    role: 'user'
  });

  // Check if user is already logged in
  useEffect(() => {
    const checkSession = async () => {
      const session = await authHelpers.getSession();
      if (session) {
        onLogin(session.user);
      }
    };
    checkSession();
  }, [onLogin]);

  const handleInputChange = (field) => (event) => {
    setFormData({
      ...formData,
      [field]: event.target.value
    });
    setError('');
    setSuccess('');
  };

  const handleLogin = async () => {
    if (!formData.email || !formData.password) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { data, error } = await authHelpers.signIn(formData.email, formData.password);
      
      if (error) {
        setError(error.message);
      } else if (data.user) {
        setSuccess('Login successful!');
        onLogin(data.user);
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!formData.email || !formData.password || !formData.firstName) {
      setError('Please fill in all required fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const userData = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        organization: formData.organization,
        role: formData.role
      };

      const { data, error } = await authHelpers.signUp(formData.email, formData.password, userData);
      
      if (error) {
        setError(error.message);
      } else {
        setSuccess('Registration successful! Please check your email to verify your account.');
        setActiveTab(0); // Switch to login tab
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    setError('');
    
    try {
      const { data, error } = await authHelpers.signIn('demo@sentinelx.com', 'demo123');
      
      if (error) {
        setError(error.message);
      } else if (data.user) {
        setSuccess('Demo login successful!');
        onLogin(data.user);
      }
    } catch (err) {
      setError('Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    
    // For demo purposes, simulate Google login
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const googleUser = {
        id: 'google-user-' + Date.now(),
        email: 'user@gmail.com',
        user_metadata: {
          first_name: 'Google',
          last_name: 'User',
          provider: 'google',
          avatar_url: 'https://ui-avatars.com/api/?name=Google+User&background=4285f4&color=fff'
        }
      };
      
      // Store in localStorage for demo
      localStorage.setItem('sentinelx_demo_user', JSON.stringify(googleUser));
      
      setSuccess('Google login successful!');
      onLogin(googleUser);
    } catch (err) {
      setError('Google login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleAppleLogin = async () => {
    setLoading(true);
    setError('');
    
    // For demo purposes, simulate Apple login
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const appleUser = {
        id: 'apple-user-' + Date.now(),
        email: 'user@icloud.com',
        user_metadata: {
          first_name: 'Apple',
          last_name: 'User',
          provider: 'apple',
          avatar_url: 'https://ui-avatars.com/api/?name=Apple+User&background=000&color=fff'
        }
      };
      
      // Store in localStorage for demo
      localStorage.setItem('sentinelx_demo_user', JSON.stringify(appleUser));
      
      setSuccess('Apple ID login successful!');
      onLogin(appleUser);
    } catch (err) {
      setError('Apple ID login failed');
    } finally {
      setLoading(false);
    }
  };

  const TabPanel = ({ children, value, index }) => (
    <div hidden={value !== index}>
      {value === index && children}
    </div>
  );

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 2
      }}
    >
      <Card sx={{ maxWidth: 500, width: '100%', borderRadius: 3, boxShadow: 3 }}>
        <CardContent sx={{ p: 4 }}>
          {/* Header */}
          <Box textAlign="center" mb={3}>
            <SecurityIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
            <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
              SentinelX
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              AI-Powered Disaster Intelligence System
            </Typography>
          </Box>

          {/* Alerts */}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}
          
          {success && (
            <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
              {success}
            </Alert>
          )}

          {/* Tabs */}
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
            centered
            sx={{ mb: 3 }}
          >
            <Tab label="Login" icon={<LoginIcon />} />
            <Tab label="Register" icon={<PersonAddIcon />} />
          </Tabs>

          {/* Login Tab */}
          <TabPanel value={activeTab} index={0}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange('email')}
                  disabled={loading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleInputChange('password')}
                  disabled={loading}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword(!showPassword)}>
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  onClick={handleLogin}
                  disabled={loading}
                  sx={{ mt: 1, mb: 2 }}
                >
                  {loading ? <CircularProgress size={24} /> : 'Login'}
                </Button>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Register Tab */}
          <TabPanel value={activeTab} index={1}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="First Name *"
                  value={formData.firstName}
                  onChange={handleInputChange('firstName')}
                  disabled={loading}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  value={formData.lastName}
                  onChange={handleInputChange('lastName')}
                  disabled={loading}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email *"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange('email')}
                  disabled={loading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Organization"
                  value={formData.organization}
                  onChange={handleInputChange('organization')}
                  disabled={loading}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Password *"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleInputChange('password')}
                  disabled={loading}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword(!showPassword)}>
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Confirm Password *"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleInputChange('confirmPassword')}
                  disabled={loading}
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  onClick={handleRegister}
                  disabled={loading}
                  sx={{ mt: 1, mb: 2 }}
                >
                  {loading ? <CircularProgress size={24} /> : 'Register'}
                </Button>
              </Grid>
            </Grid>
          </TabPanel>

          {/* OAuth Login Options */}
          <Divider sx={{ my: 2 }}>
            <Typography variant="body2" color="text.secondary">
              or
            </Typography>
          </Divider>
          
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={6}>
              <Button
                fullWidth
                variant="outlined"
                size="large"
                onClick={handleGoogleLogin}
                disabled={loading}
                startIcon={<GoogleIcon />}
                sx={{ 
                  borderColor: '#4285f4',
                  color: '#4285f4',
                  '&:hover': {
                    borderColor: '#3367d6',
                    backgroundColor: 'rgba(66, 133, 244, 0.04)'
                  }
                }}
              >
                Google
              </Button>
            </Grid>
            <Grid item xs={6}>
              <Button
                fullWidth
                variant="outlined"
                size="large"
                onClick={handleAppleLogin}
                disabled={loading}
                startIcon={<AppleIcon />}
                sx={{ 
                  borderColor: '#000',
                  color: '#000',
                  '&:hover': {
                    borderColor: '#333',
                    backgroundColor: 'rgba(0, 0, 0, 0.04)'
                  }
                }}
              >
                Apple ID
              </Button>
            </Grid>
          </Grid>
          
          <Button
            fullWidth
            variant="outlined"
            size="large"
            onClick={handleDemoLogin}
            disabled={loading}
            sx={{ mb: 2 }}
          >
            {loading ? <CircularProgress size={24} /> : 'Demo Login'}
          </Button>

          {/* Demo Instructions */}
          <Alert severity="info" sx={{ mt: 2, textAlign: 'left' }}>
            <Typography variant="body2" fontWeight="bold" gutterBottom>
              Demo Login Options:
            </Typography>
            <Typography variant="body2" component="div">
              • <strong>Demo Login:</strong> demo@sentinelx.com / demo123<br/>
              • <strong>Admin Login:</strong> admin@sentinelx.com / admin123<br/>
              • <strong>Google/Apple:</strong> Simulated OAuth login<br/>
              • <strong>Register:</strong> Create new demo account
            </Typography>
          </Alert>

          {/* Footer */}
          <Box textAlign="center" mt={2}>
            <Typography variant="body2" color="text.secondary">
              {activeTab === 0 ? (
                <>
                  Don't have an account?{' '}
                  <Link
                    component="button"
                    onClick={() => setActiveTab(1)}
                    sx={{ textDecoration: 'none' }}
                  >
                    Register here
                  </Link>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <Link
                    component="button"
                    onClick={() => setActiveTab(0)}
                    sx={{ textDecoration: 'none' }}
                  >
                    Login here
                  </Link>
                </>
              )}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default LoginPage;