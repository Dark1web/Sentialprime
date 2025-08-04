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
  ListItemIcon,
  LinearProgress
} from '@mui/material';
import {
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';

const AlertsOverview = ({ alerts }) => {
  const alertTypes = [
    { 
      key: 'critical', 
      label: 'Critical', 
      color: 'error', 
      icon: ErrorIcon,
      count: alerts?.critical || 0 
    },
    { 
      key: 'high', 
      label: 'High', 
      color: 'warning', 
      icon: WarningIcon,
      count: alerts?.high || 0 
    },
    { 
      key: 'medium', 
      label: 'Medium', 
      color: 'info', 
      icon: InfoIcon,
      count: alerts?.medium || 0 
    },
    { 
      key: 'low', 
      label: 'Low', 
      color: 'success', 
      icon: CheckCircleIcon,
      count: alerts?.low || 0 
    }
  ];

  const totalAlerts = alertTypes.reduce((sum, type) => sum + type.count, 0);

  const recentAlerts = [
    {
      id: 1,
      title: 'Flood Warning - Riverside District',
      severity: 'critical',
      time: '2 mins ago',
      location: 'Riverside, Delhi'
    },
    {
      id: 2,
      title: 'Misinformation Detected - Dam Burst',
      severity: 'high',
      time: '5 mins ago',
      location: 'Social Media'
    },
    {
      id: 3,
      title: 'Network Outage - Tech Park',
      severity: 'medium',
      time: '12 mins ago',
      location: 'Bangalore'
    },
    {
      id: 4,
      title: 'Emergency Shelter Request',
      severity: 'high',
      time: '18 mins ago',
      location: 'Mumbai Suburban'
    }
  ];

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
          Alerts Overview
        </Typography>

        {/* Alert Type Summary */}
        <Box sx={{ mb: 3 }}>
          {alertTypes.map((type) => {
            const percentage = totalAlerts > 0 ? (type.count / totalAlerts) * 100 : 0;
            
            return (
              <Box key={type.key} sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <type.icon color={type.color} fontSize="small" />
                    <Typography variant="body2">{type.label}</Typography>
                  </Box>
                  <Typography variant="body2" fontWeight="bold">
                    {type.count}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={percentage}
                  color={type.color}
                  sx={{ height: 6, borderRadius: 3 }}
                />
              </Box>
            );
          })}
        </Box>

        {/* Recent Alerts */}
        <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold', mt: 2 }}>
          Recent Alerts
        </Typography>
        <List dense>
          {recentAlerts.map((alert) => (
            <ListItem key={alert.id} sx={{ px: 0, py: 0.5 }}>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500, flex: 1 }}>
                      {alert.title}
                    </Typography>
                    <Chip 
                      label={alert.severity} 
                      size="small" 
                      color={getSeverityColor(alert.severity)}
                      sx={{ minWidth: 60, fontSize: '0.7rem' }}
                    />
                  </Box>
                }
                secondary={
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="caption" color="text.secondary">
                      {alert.location}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {alert.time}
                    </Typography>
                  </Box>
                }
              />
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
};

export default AlertsOverview;