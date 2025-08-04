import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Tabs,
  Tab,
  Alert,
  Divider
} from '@mui/material';
import {
  LocationOn as LocationOnIcon,
  Navigation as NavigationIcon,
  LocalHospital as LocalHospitalIcon,
  Security as SecurityIcon,
  Download as DownloadIcon,
  CloudOff as OfflineIcon,
  Route as RouteIcon,
  Map as MapIcon
} from '@mui/icons-material';
import LeafletMap from '../Maps/LeafletMap';

const TabPanel = ({ children, value, index }) => (
  <div hidden={value !== index}>
    {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
  </div>
);

const NavigationAssistant = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [currentLocation, setCurrentLocation] = useState('');
  const [destination, setDestination] = useState('');
  const [route, setRoute] = useState(null);

  // Mock safe zones data
  const safeZones = [
    {
      id: 1,
      name: "City Community Center",
      type: "shelter",
      distance: 0.8,
      capacity: 500,
      available: 266,
      amenities: ["Food", "Water", "Medical Aid", "Power"]
    },
    {
      id: 2,
      name: "District General Hospital",
      type: "hospital",
      distance: 1.2,
      capacity: 200,
      available: 44,
      amenities: ["Emergency Care", "Surgery", "Blood Bank"]
    },
    {
      id: 3,
      name: "Safe Haven Building",
      type: "safe_building",
      distance: 0.5,
      capacity: 150,
      available: 127,
      amenities: ["Elevated Floors", "Emergency Supplies"]
    }
  ];

  // Mock offline map regions
  const offlineRegions = [
    {
      id: 1,
      name: "Delhi Central District",
      size: "45.2 MB",
      coverage: "Central Delhi with major landmarks",
      downloaded: true
    },
    {
      id: 2,
      name: "Mumbai Suburban Areas",
      size: "38.7 MB",
      coverage: "Suburban Mumbai with safe zones",
      downloaded: false
    },
    {
      id: 3,
      name: "Bangalore Tech Hub",
      size: "52.1 MB",
      coverage: "Tech corridors and emergency routes",
      downloaded: false
    }
  ];

  // Emergency procedures
  const emergencyProcedures = {
    flood: [
      "Move to higher ground immediately",
      "Avoid walking through flood water",
      "Stay away from electrical lines",
      "Signal for help from highest point"
    ],
    fire: [
      "Evacuate using stairs, not elevators",
      "Stay low to avoid smoke",
      "Feel doors before opening",
      "Meet at assembly point"
    ],
    earthquake: [
      "Drop, Cover, and Hold On",
      "Stay away from windows",
      "Move away from buildings if outdoors",
      "Be prepared for aftershocks"
    ]
  };

  const handleFindRoute = () => {
    // Mock route calculation
    setRoute({
      distance: "1.2 km",
      duration: "15 minutes",
      safetyScore: 85,
      avoidedZones: ["Flooded Area", "Construction Zone"],
      waypoints: [
        "Start from current location",
        "Head north on Main Street",
        "Turn right at Safe Junction",
        "Arrive at City Community Center"
      ]
    });
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
        📍 Navigation Assistant
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Find safe routes and zones during disasters - works offline
      </Typography>

      <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} sx={{ mb: 3 }}>
        <Tab label="Route Planning" icon={<RouteIcon />} />
        <Tab label="Safe Zones" icon={<SecurityIcon />} />
        <Tab label="Offline Maps" icon={<OfflineIcon />} />
        <Tab label="Emergency Guide" icon={<LocalHospitalIcon />} />
      </Tabs>

      <TabPanel value={activeTab} index={0}>
        <Grid container spacing={3}>
          {/* Route Planning */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Plan Safe Route
                </Typography>
                
                <TextField
                  fullWidth
                  label="Current Location"
                  value={currentLocation}
                  onChange={(e) => setCurrentLocation(e.target.value)}
                  placeholder="Enter your current location"
                  sx={{ mb: 2 }}
                  InputProps={{
                    startAdornment: <LocationOnIcon color="primary" sx={{ mr: 1 }} />
                  }}
                />
                
                <TextField
                  fullWidth
                  label="Destination Type"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="Shelter, Hospital, Safe Zone"
                  sx={{ mb: 2 }}
                  InputProps={{
                    startAdornment: <NavigationIcon color="primary" sx={{ mr: 1 }} />
                  }}
                />
                
                <Button 
                  fullWidth 
                  variant="contained" 
                  onClick={handleFindRoute}
                  sx={{ mb: 2 }}
                >
                  Find Safe Route
                </Button>

                <Alert severity="info">
                  Routes automatically avoid danger zones and prioritize safety
                </Alert>
              </CardContent>
            </Card>
          </Grid>

          {/* Route Results */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Route Information
                </Typography>
                
                {route ? (
                  <Box>
                    <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                      <Chip label={route.distance} color="primary" />
                      <Chip label={route.duration} color="info" />
                      <Chip label={`${route.safetyScore}% Safe`} color="success" />
                    </Box>
                    
                    <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
                      Directions:
                    </Typography>
                    <List dense>
                      {route.waypoints.map((point, index) => (
                        <ListItem key={index} sx={{ py: 0.5 }}>
                          <ListItemIcon sx={{ minWidth: 30 }}>
                            <Typography variant="body2" color="primary" sx={{ fontWeight: 'bold' }}>
                              {index + 1}
                            </Typography>
                          </ListItemIcon>
                          <ListItemText primary={point} />
                        </ListItem>
                      ))}
                    </List>
                    
                    <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold', mt: 2 }}>
                      Avoiding:
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {route.avoidedZones.map((zone, index) => (
                        <Chip key={index} label={zone} color="warning" size="small" />
                      ))}
                    </Box>
                  </Box>
                ) : (
                  <Typography color="text.secondary">
                    Enter locations to calculate safe route
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={activeTab} index={1}>
        <Grid container spacing={3}>
          {/* Safe Zones Map */}
          <Grid item xs={12} lg={8}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <MapIcon />
                    Safe Zones Map
                  </Typography>
                  <Chip 
                    icon={<SecurityIcon />}
                    label={`${safeZones.length} Safe Zones`}
                    color="success"
                    size="small"
                  />
                </Box>

                <LeafletMap
                  center={[28.6139, 77.2090]}
                  zoom={12}
                  height="400px"
                  markers={safeZones.map(zone => ({
                    id: zone.id,
                    lat: 28.6139 + (Math.random() - 0.5) * 0.1,
                    lng: 77.2090 + (Math.random() - 0.5) * 0.1,
                    title: zone.name,
                    type: 'safe_zone',
                    description: `${zone.type} - ${zone.available}/${zone.capacity} available`,
                    risk_level: 'LOW',
                    data: {
                      'Type': zone.type,
                      'Distance': `${zone.distance} km`,
                      'Capacity': `${zone.available}/${zone.capacity}`,
                      'Amenities': zone.amenities.join(', ')
                    }
                  }))}
                  safeZones={safeZones.map(zone => ({
                    id: zone.id,
                    lat: 28.6139 + (Math.random() - 0.5) * 0.1,
                    lng: 77.2090 + (Math.random() - 0.5) * 0.1,
                    name: zone.name,
                    type: zone.type,
                    capacity: zone.capacity,
                    available: zone.available,
                    radius: 800
                  }))}
                  showUserLocation={true}
                  interactive={true}
                  showControls={true}
                />
              </CardContent>
            </Card>
          </Grid>

          {/* Safe Zones List */}
          <Grid item xs={12} lg={4}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Safe Zones List
            </Typography>
            
            {safeZones.map((zone) => (
              <Card key={zone.id} sx={{ mb: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      {zone.name}
                    </Typography>
                    <Chip 
                      label={zone.type} 
                      color={zone.type === 'hospital' ? 'error' : 'primary'} 
                      size="small"
                    />
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Distance: {zone.distance} km
                    </Typography>
                    <Typography variant="body2" color={zone.available > 50 ? 'success.main' : 'warning.main'}>
                      {zone.available}/{zone.capacity} available
                    </Typography>
                  </Box>
                  
                  <Typography variant="subtitle2" gutterBottom>
                    Amenities:
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 2 }}>
                    {zone.amenities.map((amenity, index) => (
                      <Chip key={index} label={amenity} size="small" variant="outlined" />
                    ))}
                  </Box>
                  
                  <Button variant="outlined" fullWidth>
                    Get Directions
                  </Button>
                </CardContent>
              </Card>
            ))}
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={activeTab} index={2}>
        <Grid container spacing={3}>
          {offlineRegions.map((region) => (
            <Grid item xs={12} md={6} key={region.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      {region.name}
                    </Typography>
                    <Chip 
                      label={region.downloaded ? 'Downloaded' : 'Available'} 
                      color={region.downloaded ? 'success' : 'default'}
                      size="small"
                    />
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Size: {region.size}
                  </Typography>
                  
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    {region.coverage}
                  </Typography>
                  
                  <Button 
                    variant={region.downloaded ? "outlined" : "contained"}
                    fullWidth
                    startIcon={region.downloaded ? <OfflineIcon /> : <DownloadIcon />}
                    disabled={region.downloaded}
                  >
                    {region.downloaded ? 'Available Offline' : 'Download'}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
        
        <Alert severity="warning" sx={{ mt: 3 }}>
          💡 Download maps before disasters strike. Offline maps work without internet connection.
        </Alert>
      </TabPanel>

      <TabPanel value={activeTab} index={3}>
        <Grid container spacing={3}>
          {Object.entries(emergencyProcedures).map(([type, procedures]) => (
            <Grid item xs={12} md={4} key={type}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', textTransform: 'capitalize' }}>
                    {type} Emergency
                  </Typography>
                  
                  <List dense>
                    {procedures.map((procedure, index) => (
                      <ListItem key={index} sx={{ py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 30 }}>
                          <Typography variant="body2" color="primary" sx={{ fontWeight: 'bold' }}>
                            {index + 1}
                          </Typography>
                        </ListItemIcon>
                        <ListItemText 
                          primary={procedure}
                          primaryTypographyProps={{ variant: 'body2' }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
        
        <Card sx={{ mt: 3, backgroundColor: 'rgba(244, 67, 54, 0.05)' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              🚨 Emergency Contacts (India)
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6} md={3}>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>National Emergency</Typography>
                <Typography variant="h6" color="error.main">112</Typography>
              </Grid>
              <Grid item xs={6} md={3}>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Fire</Typography>
                <Typography variant="h6" color="error.main">101</Typography>
              </Grid>
              <Grid item xs={6} md={3}>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Police</Typography>
                <Typography variant="h6" color="error.main">100</Typography>
              </Grid>
              <Grid item xs={6} md={3}>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Medical</Typography>
                <Typography variant="h6" color="error.main">108</Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </TabPanel>
    </Box>
  );
};

export default NavigationAssistant;