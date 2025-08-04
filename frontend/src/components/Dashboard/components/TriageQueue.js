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
  Avatar,
  IconButton,
  LinearProgress,
  Tooltip
} from '@mui/material';
import {
  LocalHospital as LocalHospitalIcon,
  LocationOn as LocationOnIcon,
  AccessTime as AccessTimeIcon,
  Phone as PhoneIcon,
  Assignment as AssignmentIcon
} from '@mui/icons-material';

const TriageQueue = () => {
  const triageRequests = [
    {
      id: 1,
      message: "House flooding rapidly, water level rising, trapped on second floor with elderly mother",
      location: "Riverside District, Delhi",
      urgencyScore: 0.95,
      triageLevel: "CRITICAL",
      resourceRequired: ["rescue", "medical"],
      estimatedResponse: "5-10 minutes",
      timestamp: "2 mins ago",
      isMedical: true,
      status: "assigned"
    },
    {
      id: 2,
      message: "Chest pain and difficulty breathing, can't reach hospital due to blocked roads",
      location: "Central Mumbai",
      urgencyScore: 0.88,
      triageLevel: "CRITICAL",
      resourceRequired: ["medical", "transportation"],
      estimatedResponse: "3-8 minutes",
      timestamp: "5 mins ago",
      isMedical: true,
      status: "pending"
    },
    {
      id: 3,
      message: "Family of 6 without food and water for 2 days, children getting weak",
      location: "Suburban Bangalore",
      urgencyScore: 0.72,
      triageLevel: "HIGH",
      resourceRequired: ["food_water", "medical"],
      estimatedResponse: "30-60 minutes",
      timestamp: "8 mins ago",
      isMedical: false,
      status: "pending"
    },
    {
      id: 4,
      message: "Building showing cracks after earthquake, residents evacuating",
      location: "Tech City, Hyderabad",
      urgencyScore: 0.65,
      triageLevel: "HIGH",
      resourceRequired: ["rescue", "shelter"],
      estimatedResponse: "45-90 minutes",
      timestamp: "12 mins ago",
      isMedical: false,
      status: "in_progress"
    },
    {
      id: 5,
      message: "Power outage affecting entire neighborhood, need communication support",
      location: "Residential Area, Chennai",
      urgencyScore: 0.35,
      triageLevel: "MEDIUM",
      resourceRequired: ["communication"],
      estimatedResponse: "2-4 hours",
      timestamp: "18 mins ago",
      isMedical: false,
      status: "pending"
    }
  ];

  const getUrgencyColor = (level) => {
    switch (level) {
      case 'CRITICAL': return 'error';
      case 'HIGH': return 'warning';
      case 'MEDIUM': return 'info';
      case 'LOW': return 'success';
      default: return 'default';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'assigned': return 'success';
      case 'in_progress': return 'warning';
      case 'pending': return 'info';
      default: return 'default';
    }
  };

  const getResourceIcon = (resources) => {
    if (resources.includes('medical')) return <LocalHospitalIcon />;
    if (resources.includes('rescue')) return <AssignmentIcon />;
    return <AssignmentIcon />;
  };

  const queueStats = {
    total: triageRequests.length,
    critical: triageRequests.filter(r => r.triageLevel === 'CRITICAL').length,
    pending: triageRequests.filter(r => r.status === 'pending').length,
    avgResponseTime: '24 minutes'
  };

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Triage Queue
          </Typography>
          <Chip 
            icon={<LocalHospitalIcon />}
            label={`${queueStats.pending} pending`} 
            color="warning" 
            size="small"
          />
        </Box>

        {/* Queue Statistics */}
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <Box sx={{ flex: 1, textAlign: 'center', p: 1, backgroundColor: 'rgba(244, 67, 54, 0.1)', borderRadius: 1 }}>
            <Typography variant="h6" color="error.main" sx={{ fontWeight: 'bold' }}>
              {queueStats.critical}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Critical
            </Typography>
          </Box>
          <Box sx={{ flex: 1, textAlign: 'center', p: 1, backgroundColor: 'rgba(33, 150, 243, 0.1)', borderRadius: 1 }}>
            <Typography variant="h6" color="info.main" sx={{ fontWeight: 'bold' }}>
              {queueStats.pending}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Pending
            </Typography>
          </Box>
          <Box sx={{ flex: 1, textAlign: 'center', p: 1, backgroundColor: 'rgba(76, 175, 80, 0.1)', borderRadius: 1 }}>
            <Typography variant="h6" color="success.main" sx={{ fontWeight: 'bold' }}>
              {queueStats.avgResponseTime}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Avg Response
            </Typography>
          </Box>
        </Box>

        <List dense sx={{ maxHeight: 350, overflowY: 'auto' }}>
          {triageRequests.map((request) => (
            <ListItem 
              key={request.id} 
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
                    <Avatar 
                      sx={{ 
                        width: 28, 
                        height: 28, 
                        backgroundColor: getUrgencyColor(request.triageLevel) + '.main'
                      }}
                    >
                      {getResourceIcon(request.resourceRequired)}
                    </Avatar>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Request #{request.id} • {request.timestamp}
                      </Typography>
                      {request.isMedical && (
                        <Chip 
                          label="Medical Emergency" 
                          size="small" 
                          color="error" 
                          sx={{ ml: 1, height: 16, fontSize: '0.6rem' }}
                        />
                      )}
                    </Box>
                  </Box>
                  <Chip 
                    label={request.triageLevel}
                    size="small"
                    color={getUrgencyColor(request.triageLevel)}
                    sx={{ fontSize: '0.7rem' }}
                  />
                </Box>

                {/* Message */}
                <Typography 
                  variant="body2" 
                  sx={{ mb: 1, color: 'text.primary' }}
                >
                  {request.message.length > 100 ? `${request.message.substring(0, 100)}...` : request.message}
                </Typography>

                {/* Location and Resources */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <LocationOnIcon fontSize="small" color="action" />
                  <Typography variant="caption" color="text.secondary">
                    {request.location}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', gap: 0.5, mb: 1 }}>
                  {request.resourceRequired.map((resource) => (
                    <Chip 
                      key={resource}
                      label={resource.replace('_', ' ')}
                      size="small"
                      variant="outlined"
                      sx={{ height: 20, fontSize: '0.65rem' }}
                    />
                  ))}
                </Box>

                {/* Status and Response Time */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip 
                      label={request.status.replace('_', ' ')}
                      size="small"
                      color={getStatusColor(request.status)}
                      sx={{ height: 18, fontSize: '0.65rem' }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      Urgency: {(request.urgencyScore * 100).toFixed(0)}%
                    </Typography>
                  </Box>
                  
                  <Tooltip title={`Estimated response time: ${request.estimatedResponse}`}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <AccessTimeIcon fontSize="small" color="action" />
                      <Typography variant="caption" color="text.secondary">
                        {request.estimatedResponse}
                      </Typography>
                    </Box>
                  </Tooltip>
                </Box>

                {/* Progress Bar for Critical Items */}
                {request.triageLevel === 'CRITICAL' && request.status !== 'assigned' && (
                  <Box sx={{ mt: 1 }}>
                    <LinearProgress 
                      variant="indeterminate" 
                      color="error"
                      sx={{ height: 3, borderRadius: 1.5 }}
                    />
                    <Typography variant="caption" color="error.main" sx={{ fontSize: '0.6rem' }}>
                      Priority dispatch in progress
                    </Typography>
                  </Box>
                )}
              </Box>
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
};

export default TriageQueue;