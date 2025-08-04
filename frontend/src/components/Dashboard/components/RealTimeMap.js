import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Chip, 
  IconButton, 
  Menu, 
  MenuItem,
  Card,
  CardContent,
  Grid,
  Alert
} from '@mui/material';
import { 
  MoreVert as MoreVertIcon,
  Warning as WarningIcon,
  LocalFireDepartment as FireIcon,
  Water as WaterIcon,
  LocationOn as LocationIcon
} from '@mui/icons-material';
import LeafletMap from '../../Maps/LeafletMap';

const RealTimeMap = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [liveData, setLiveData] = useState({
    incidents: [],
    safeZones: [],
    loading: false
  });
  
  // Mock incident data with real coordinates
  const incidents = [
    {
      id: 1,
      type: 'flood',
      title: 'Flood Alert - Yamuna River',
      lat: 28.6139,
      lng: 77.2090,
      severity: 'high',
      time: '10 mins ago',
      description: 'Rising water levels detected',
      risk_level: 'HIGH',
      data: {
        'Water Level': '8.2m',
        'Risk Zone': '2km radius',
        'Affected Population': '~15,000'
      }
    },
    {
      id: 2,
      type: 'fire',
      title: 'Fire Incident - Industrial Zone',
      lat: 28.6500,
      lng: 77.2500,
      severity: 'critical',
      time: '25 mins ago',
      description: 'Active fire detected via satellite',
      risk_level: 'CRITICAL',
      data: {
        'Fire Intensity': 'High',
        'Burn Area': '0.8 sq km',
        'Wind Speed': '15 km/h'
      }
    },
    {
      id: 3,
      type: 'earthquake',
      title: 'Seismic Activity - NCR Region',
      lat: 28.5355,
      lng: 77.3910,
      severity: 'medium',
      time: '1 hour ago',
      description: 'Minor earthquake detected',
      risk_level: 'MEDIUM',
      data: {
        'Magnitude': '3.2',
        'Depth': '10 km',
        'Intensity': 'III (Weak)'
      }
    }
  ];

  // Mock safe zones
  const safeZones = [
    {
      id: 1,
      name: 'Central Community Center',
      lat: 28.6300,
      lng: 77.2200,
      type: 'shelter',
      capacity: 500,
      available: 320,
      radius: 800
    },
    {
      id: 2,
      name: 'District Hospital',
      lat: 28.6000,
      lng: 77.2300,
      type: 'medical',
      capacity: 200,
      available: 180,
      radius: 500
    },
    {
      id: 3,
      name: 'Emergency Relief Camp',
      lat: 28.6700,
      lng: 77.2100,
      type: 'relief',
      capacity: 1000,
      available: 750,
      radius: 1200
    }
  ];

  // Simulate live data updates
  useEffect(() => {
    const updateLiveData = () => {
      setLiveData(prev => ({
        ...prev,
        incidents: incidents.map(incident => ({
          ...incident,
          time: `${Math.floor(Math.random() * 60)} mins ago`
        }))
      }));
    };

    updateLiveData();
    const interval = setInterval(updateLiveData, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleMarkerClick = (marker) => {
    setSelectedIncident(marker);
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const getIncidentIcon = (type) => {
    switch (type) {
      case 'flood': return <WaterIcon />;
      case 'fire': return <FireIcon />;
      case 'earthquake': return <WarningIcon />;
      default: return <LocationIcon />;
    }
  };

  return (
    <Box sx={{ height: 450 }}>
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 2,
        p: 2
      }}>
        <Box>
          <Typography variant="h6" fontWeight="bold">
            Real-Time Disaster Map
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Live incidents and safe zones
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip 
            icon={<LocationIcon />}
            label={`${incidents.length} Active Incidents`}
            color="error"
            size="small"
          />
          <IconButton onClick={handleMenuOpen}>
            <MoreVertIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Map */}
      <LeafletMap
        center={[28.6139, 77.2090]}
        zoom={12}
        height="350px"
        markers={incidents}
        disasters={incidents.map(incident => ({
          ...incident,
          radius: incident.severity === 'critical' ? 2000 : 
                  incident.severity === 'high' ? 1500 : 1000
        }))}
        safeZones={safeZones}
        onMarkerClick={handleMarkerClick}
        showUserLocation={true}
        interactive={true}
        showControls={true}
      />

      {/* Incident Summary Cards */}
      <Box sx={{ mt: 2 }}>
        <Grid container spacing={1}>
          {incidents.slice(0, 3).map((incident) => (
            <Grid item xs={4} key={incident.id}>
              <Card 
                sx={{ 
                  cursor: 'pointer',
                  '&:hover': { boxShadow: 2 },
                  border: selectedIncident?.id === incident.id ? 2 : 0,
                  borderColor: 'primary.main'
                }}
                onClick={() => setSelectedIncident(incident)}
              >
                <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                    {getIncidentIcon(incident.type)}
                    <Typography variant="caption" fontWeight="bold" sx={{ ml: 0.5 }}>
                      {incident.type.toUpperCase()}
                    </Typography>
                  </Box>
                  <Typography variant="caption" display="block" gutterBottom>
                    {incident.title}
                  </Typography>
                  <Chip 
                    label={incident.severity}
                    color={getSeverityColor(incident.severity)}
                    size="small"
                    sx={{ fontSize: '0.6rem', height: 16 }}
                  />
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                    {incident.time}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Selected Incident Details */}
      {selectedIncident && (
        <Box sx={{ mt: 2 }}>
          <Alert 
            severity={
              selectedIncident.risk_level === 'CRITICAL' ? 'error' :
              selectedIncident.risk_level === 'HIGH' ? 'warning' : 'info'
            }
            onClose={() => setSelectedIncident(null)}
          >
            <Typography variant="subtitle2" fontWeight="bold">
              {selectedIncident.title}
            </Typography>
            <Typography variant="body2">
              {selectedIncident.description}
            </Typography>
            {selectedIncident.data && (
              <Box sx={{ mt: 1 }}>
                {Object.entries(selectedIncident.data).map(([key, value]) => (
                  <Typography key={key} variant="caption" display="block">
                    <strong>{key}:</strong> {value}
                  </Typography>
                ))}
              </Box>
            )}
          </Alert>
        </Box>
      )}

      {/* Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleMenuClose}>
          <Typography variant="body2">Refresh Map</Typography>
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <Typography variant="body2">Filter Incidents</Typography>
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <Typography variant="body2">Export Data</Typography>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default RealTimeMap;