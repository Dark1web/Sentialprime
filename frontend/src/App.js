import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginPage from './components/Auth/LoginPage';
import Navbar from './components/Layout/Navbar';
import Sidebar from './components/Layout/Sidebar';
import Dashboard from './components/Dashboard/Dashboard';
import MisinformationMonitor from './components/Misinformation/MisinformationMonitor';
import TriageCenter from './components/Triage/TriageCenter';
import NetworkMap from './components/Network/NetworkMap';
import FactCheckCenter from './components/FactCheck/FactCheckCenter';
import NavigationAssistant from './components/Navigation/NavigationAssistant';
import ARSimulation from './components/AR/ARSimulation';
import AnalyticsPage from './components/Analytics/AnalyticsPage';
import LandingPage from './components/Landing/LandingPage';

// Loading component
const LoadingScreen = () => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      bgcolor: 'background.default'
    }}
  >
    <CircularProgress size={48} sx={{ mb: 2 }} />
    <Typography variant="h6" color="text.secondary">
      Loading SentinelX...
    </Typography>
  </Box>
);

// Main App component with authentication
const AppContent = () => {
  const { user, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = React.useState(true);

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Show loading screen while checking authentication
  if (loading) {
    return <LoadingScreen />;
  }

  // Show main app if user is authenticated
  if (user) {
    return (
      <Box sx={{ display: 'flex', height: '100vh' }}>
        <Sidebar open={sidebarOpen} onToggle={handleSidebarToggle} />
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          <Navbar onMenuClick={handleSidebarToggle} />
          <Box
            component="main"
            sx={{
              flexGrow: 1,
              p: 3,
              overflow: 'auto',
              backgroundColor: '#f5f5f5',
            }}
          >
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/misinformation" element={<MisinformationMonitor />} />
              <Route path="/triage" element={<TriageCenter />} />
              <Route path="/network" element={<NetworkMap />} />
              <Route path="/factcheck" element={<FactCheckCenter />} />
              <Route path="/navigation" element={<NavigationAssistant />} />
              <Route path="/ar-simulation" element={<ARSimulation />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Box>
        </Box>
      </Box>
    );
  }

  // Show landing page and login page if user is not authenticated
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

// Root App component with AuthProvider
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;