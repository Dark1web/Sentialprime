import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  List,
  ListItem,
  ListItemText,
  LinearProgress,
  IconButton
} from '@mui/material';
import {
  NetworkCheck as NetworkCheckIcon,
  SignalWifiOff as SignalWifiOffIcon,
  SignalWifi4Bar as SignalWifi4BarIcon,
  SignalWifi2Bar as SignalWifi2BarIcon,
  Refresh as RefreshIcon,
  Warning as WarningIcon
} from '@mui/icons-material';

const NetworkStatus = () => {
  const networkRegions = [
    {
      id: 1,
      name: "Delhi Central",
      connectivityScore: 0.85,
      status: "degraded",
      affectedUsers: 15420,
      avgSpeed: 24.5,
      outages: 3,
      lastUpdate: "5 mins ago"
    },
    {
      id: 2,
      name: "Mumbai Suburban",
      connectivityScore: 0.12,
      status: "offline",
      affectedUsers: 89300,
      avgSpeed: 0.8,
      outages: 12,
      lastUpdate: "2 mins ago"
    },
    {
      id: 3,
      name: "Bangalore Tech Hub",
      connectivityScore: 0.95,
      status: "online",
      affectedUsers: 0,
      avgSpeed: 78.2,
      outages: 0,
      lastUpdate: "1 min ago"
    },
    {
      id: 4,
      name: "Chennai Industrial",
      connectivityScore: 0.68,
      status: "degraded",
      affectedUsers: 8750,
      avgSpeed: 18.3,
      outages: 2,
      lastUpdate: "8 mins ago"
    },
    {
      id: 5,
      name: "Kolkata Metro",
      connectivityScore: 0.42,
      status: "poor",
      affectedUsers: 23100,
      avgSpeed: 8.7,
      outages: 5,
      lastUpdate: "3 mins ago"
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return 'success';
      case 'degraded': return 'warning';
      case 'poor': return 'warning';
      case 'offline': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status, score) => {
    switch (status) {
      case 'online': return <SignalWifi4BarIcon color="success" />;
      case 'degraded': return <SignalWifi2BarIcon color="warning" />;
      case 'poor': return <SignalWifi2BarIcon color="warning" />;
      case 'offline': return <SignalWifiOffIcon color="error" />;
      default: return <NetworkCheckIcon />;
    }
  };

  const getConnectivityLevel = (score) => {
    if (score >= 0.8) return 'Excellent';
    if (score >= 0.6) return 'Good';
    if (score >= 0.4) return 'Fair';
    if (score >= 0.2) return 'Poor';
    return 'No Signal';
  };

  const overallStats = {
    totalRegions: networkRegions.length,
    healthyRegions: networkRegions.filter(r => r.status === 'online').length,
    affectedUsers: networkRegions.reduce((sum, r) => sum + r.affectedUsers, 0),
    activeOutages: networkRegions.reduce((sum, r) => sum + r.outages, 0)
  };

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Network Status
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip 
              icon={<WarningIcon />}
              label={`${overallStats.activeOutages} outages`} 
              color="error" 
              size="small"
            />
            <IconButton size="small">
              <RefreshIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>

        {/* Overall Statistics */}
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, mb: 2 }}>
          <Box sx={{ textAlign: 'center', p: 1, backgroundColor: 'rgba(76, 175, 80, 0.1)', borderRadius: 1 }}>
            <Typography variant="h6" color="success.main" sx={{ fontWeight: 'bold' }}>
              {overallStats.healthyRegions}/{overallStats.totalRegions}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Healthy Regions
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center', p: 1, backgroundColor: 'rgba(244, 67, 54, 0.1)', borderRadius: 1 }}>
            <Typography variant="h6" color="error.main" sx={{ fontWeight: 'bold' }}>
              {(overallStats.affectedUsers / 1000).toFixed(0)}K
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Affected Users
            </Typography>
          </Box>
        </Box>

        <List dense sx={{ maxHeight: 320, overflowY: 'auto' }}>
          {networkRegions.map((region) => (
            <ListItem 
              key={region.id} 
              sx={{ 
                px: 0, 
                py: 1,
                borderBottom: '1px solid #f0f0f0',
                '&:last-child': { borderBottom: 'none' }
              }}
            >
              <Box sx={{ width: '100%' }}>
                {/* Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {getStatusIcon(region.status, region.connectivityScore)}
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {region.name}
                    </Typography>
                  </Box>
                  <Chip 
                    label={region.status.toUpperCase()}
                    size="small"
                    color={getStatusColor(region.status)}
                    sx={{ fontSize: '0.7rem', height: 20 }}
                  />
                </Box>

                {/* Connectivity Score */}
                <Box sx={{ mb: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                    <Typography variant="caption" color="text.secondary">
                      Connectivity: {getConnectivityLevel(region.connectivityScore)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {(region.connectivityScore * 100).toFixed(0)}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={region.connectivityScore * 100}
                    color={getStatusColor(region.status)}
                    sx={{ height: 6, borderRadius: 3 }}
                  />
                </Box>

                {/* Metrics */}
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 1 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Avg Speed
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {region.avgSpeed} Mbps
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Outages
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ fontWeight: 500 }}
                      color={region.outages > 0 ? 'error.main' : 'success.main'}
                    >
                      {region.outages}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Affected
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {region.affectedUsers > 0 ? `${(region.affectedUsers / 1000).toFixed(0)}K` : '0'}
                    </Typography>
                  </Box>
                </Box>

                {/* Last Update */}
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                  Updated {region.lastUpdate}
                </Typography>
              </Box>
            </ListItem>
          ))}
        </List>

        {/* Summary Alert */}
        {overallStats.activeOutages > 5 && (
          <Box sx={{ 
            mt: 2, 
            p: 2, 
            backgroundColor: 'rgba(244, 67, 54, 0.05)', 
            borderRadius: 2,
            borderLeft: '4px solid',
            borderLeftColor: 'error.main'
          }}>
            <Typography variant="caption" color="error.main" sx={{ fontWeight: 'bold' }}>
              ⚠️ Multiple network outages detected
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.5 }}>
              {overallStats.activeOutages} active outages affecting {(overallStats.affectedUsers / 1000).toFixed(0)}K users. 
              Priority restoration in progress.
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default NetworkStatus;