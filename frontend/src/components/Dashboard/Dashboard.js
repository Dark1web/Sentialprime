import React from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  IconButton
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useQuery } from 'react-query';
import AlertsOverview from './components/AlertsOverview';
import MisinformationFeed from './components/MisinformationFeed';
import TriageQueue from './components/TriageQueue';
import NetworkStatus from './components/NetworkStatus';
import SystemMetrics from './components/SystemMetrics';
import RealTimeMap from './components/RealTimeMap';
import TrendChart from './components/TrendChart';
import { fetchDashboardData } from '../../services/api';

const MetricCard = ({ title, value, change, changeType, icon: Icon, color = 'primary' }) => {
  const isPositive = changeType === 'positive';
  const isNegative = changeType === 'negative';
  
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography color="text.secondary" gutterBottom variant="body2">
              {title}
            </Typography>
            <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
              {value}
            </Typography>
            {change && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                {isPositive && <TrendingUpIcon color="success" fontSize="small" />}
                {isNegative && <TrendingDownIcon color="error" fontSize="small" />}
                <Typography 
                  variant="body2" 
                  color={isPositive ? 'success.main' : isNegative ? 'error.main' : 'text.secondary'}
                >
                  {change}
                </Typography>
              </Box>
            )}
          </Box>
          <Box
            sx={{
              backgroundColor: `${color}.main`,
              borderRadius: '50%',
              p: 1.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Icon sx={{ color: 'white', fontSize: 24 }} />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

const Dashboard = () => {
  const { data: dashboardData, isLoading, refetch } = useQuery(
    'dashboard',
    fetchDashboardData,
    {
      refetchInterval: 30000, // Refresh every 30 seconds
      retry: 3
    }
  );

  const handleRefresh = () => {
    refetch();
  };

  // Mock data for demonstration
  const mockData = {
    metrics: {
      totalAlerts: { value: 47, change: '+12%', changeType: 'negative' },
      misinformationDetected: { value: 23, change: '+8%', changeType: 'negative' },
      triageRequests: { value: 156, change: '-5%', changeType: 'positive' },
      networkOutages: { value: 8, change: '-15%', changeType: 'positive' },
      systemHealth: { value: '94%', change: '+2%', changeType: 'positive' }
    },
    alerts: {
      critical: 3,
      high: 12,
      medium: 18,
      low: 14
    }
  };

  const data = dashboardData || mockData;

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
            Disaster Intelligence Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Real-time monitoring and response coordination
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip 
            icon={<CheckCircleIcon />}
            label="All Systems Operational" 
            color="success" 
            size="small"
          />
          <IconButton onClick={handleRefresh} color="primary">
            <RefreshIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Quick Metrics */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <MetricCard
            title="Active Alerts"
            value={data.metrics.totalAlerts.value}
            change={data.metrics.totalAlerts.change}
            changeType={data.metrics.totalAlerts.changeType}
            icon={WarningIcon}
            color="warning"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <MetricCard
            title="Misinformation Flagged"
            value={data.metrics.misinformationDetected.value}
            change={data.metrics.misinformationDetected.change}
            changeType={data.metrics.misinformationDetected.changeType}
            icon={ErrorIcon}
            color="error"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <MetricCard
            title="Triage Requests"
            value={data.metrics.triageRequests.value}
            change={data.metrics.triageRequests.change}
            changeType={data.metrics.triageRequests.changeType}
            icon={CheckCircleIcon}
            color="info"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <MetricCard
            title="Network Outages"
            value={data.metrics.networkOutages.value}
            change={data.metrics.networkOutages.change}
            changeType={data.metrics.networkOutages.changeType}
            icon={TrendingDownIcon}
            color="secondary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <MetricCard
            title="System Health"
            value={data.metrics.systemHealth.value}
            change={data.metrics.systemHealth.change}
            changeType={data.metrics.systemHealth.changeType}
            icon={TrendingUpIcon}
            color="success"
          />
        </Grid>
      </Grid>

      {/* Main Content */}
      <Grid container spacing={3}>
        {/* Left Column */}
        <Grid item xs={12} lg={8}>
          {/* Real-time Map */}
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Real-time Incident Map
                  </Typography>
                  <RealTimeMap />
                </CardContent>
              </Card>
            </Grid>

            {/* Trend Charts */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Misinformation Trends
                  </Typography>
                  <TrendChart type="misinformation" />
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Emergency Requests
                  </Typography>
                  <TrendChart type="emergency" />
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>

        {/* Right Column */}
        <Grid item xs={12} lg={4}>
          <Grid container spacing={3}>
            {/* Alerts Overview */}
            <Grid item xs={12}>
              <AlertsOverview alerts={data.alerts} />
            </Grid>

            {/* Recent Misinformation */}
            <Grid item xs={12}>
              <MisinformationFeed />
            </Grid>

            {/* Triage Queue */}
            <Grid item xs={12}>
              <TriageQueue />
            </Grid>

            {/* Network Status */}
            <Grid item xs={12}>
              <NetworkStatus />
            </Grid>

            {/* System Metrics */}
            <Grid item xs={12}>
              <SystemMetrics />
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      {/* Loading Overlay */}
      {isLoading && (
        <LinearProgress 
          sx={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            right: 0, 
            zIndex: 9999 
          }} 
        />
      )}
    </Box>
  );
};

export default Dashboard;