import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  TextField,
  Alert,
  Paper,
  LinearProgress,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  NetworkCheck as NetworkCheckIcon,
  Speed as SpeedIcon,
  LocationOn as LocationOnIcon,
  Refresh as RefreshIcon,
  MyLocation as MyLocationIcon,
  SignalWifiOff as SignalWifiOffIcon,
  SignalWifi4Bar as Signal4BarIcon,
  SignalWifi2Bar as SignalWifi2BarIcon
} from '@mui/icons-material';
import LeafletMap from '../Maps/LeafletMap';

const NetworkMap = () => {
  const [speedTestData, setSpeedTestData] = useState({
    download: '',
    upload: '',
    location: ''
  });
  const [testResult, setTestResult] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [liveData, setLiveData] = useState({
    lastUpdated: new Date(),
    totalReports: 0
  });

  // Network outage data with real coordinates
  const networkOutages = [
    {
      id: 1,
      region: "Delhi Central",
      lat: 28.6139,
      lng: 77.2090,
      status: "degraded",
      connectivity_score: 0.85,
      affected_users: 15000,
      speed_avg: 25,
      provider: "Multiple ISPs",
      type: "internet",
      severity: "partial",
      last_updated: "10 mins ago"
    },
    {
      id: 2,
      region: "Mumbai Suburban",
      lat: 19.0760,
      lng: 72.8777,
      status: "offline",
      connectivity_score: 0.12,
      affected_users: 89000,
      speed_avg: 2,
      provider: "Local Cable",
      type: "internet",
      severity: "complete",
      last_updated: "25 mins ago"
    },
    {
      id: 3,
      region: "Bangalore Tech",
      lat: 12.9716,
      lng: 77.5946,
      status: "online",
      connectivity_score: 0.95,
      affected_users: 0,
      speed_avg: 78,
      provider: "Fiber Networks",
      type: "internet",
      severity: "none",
      last_updated: "5 mins ago"
    },
    {
      id: 4,
      region: "Chennai IT Corridor",
      lat: 12.8362,
      lng: 80.2130,
      status: "degraded",
      connectivity_score: 0.65,
      affected_users: 32000,
      speed_avg: 18,
      provider: "Telecom Mix",
      type: "mobile",
      severity: "partial",
      last_updated: "15 mins ago"
    },
    {
      id: 5,
      region: "Pune University Area",
      lat: 18.5196,
      lng: 73.8553,
      status: "online",
      connectivity_score: 0.88,
      affected_users: 0,
      speed_avg: 55,
      provider: "Private ISP",
      type: "internet",
      severity: "none",
      last_updated: "8 mins ago"
    }
  ];

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          console.warn('Error getting user location:', error);
        }
      );
    }
  }, []);

  // Update live data periodically
  useEffect(() => {
    const updateLiveData = () => {
      setLiveData({
        lastUpdated: new Date(),
        totalReports: networkOutages.length + Math.floor(Math.random() * 10)
      });
    };

    updateLiveData();
    const interval = setInterval(updateLiveData, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const handleSpeedTest = async () => {
    setSubmitting(true);
    
    // Simulate speed test submission
    setTimeout(() => {
      const result = {
        download_speed: parseFloat(speedTestData.download) || (Math.random() * 50 + 5),
        upload_speed: parseFloat(speedTestData.upload) || (Math.random() * 20 + 2),
        ping: Math.floor(Math.random() * 50 + 10),
        connectivity_score: Math.random(),
        zone_classification: getZoneClassification(parseFloat(speedTestData.download) || (Math.random() * 50 + 5)),
        timestamp: new Date(),
        location: speedTestData.location || 'Current Location'
      };
      setTestResult(result);
      setSubmitting(false);
    }, 2000);
  };

  const getZoneClassification = (speed) => {
    if (speed >= 50) return 'good';
    if (speed >= 10) return 'fair';
    return 'poor';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return 'success';
      case 'degraded': return 'warning';
      case 'offline': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'online': return <Signal4BarIcon />;
      case 'degraded': return <SignalWifi2BarIcon />;
      case 'offline': return <SignalWifiOffIcon />;
      default: return <NetworkCheckIcon />;
    }
  };

  const getConnectivityColor = (score) => {
    if (score >= 0.8) return '#4CAF50'; // Green
    if (score >= 0.5) return '#FF9800'; // Orange
    return '#F44336'; // Red
  };

  // Prepare map markers
  const mapMarkers = networkOutages.map(outage => ({
    id: outage.id,
    lat: outage.lat,
    lng: outage.lng,
    title: outage.region,
    type: outage.status === 'offline' ? 'danger_zone' : 
          outage.status === 'degraded' ? 'danger_zone' : 'safe_zone',
    description: `${outage.status.toUpperCase()} - ${outage.affected_users.toLocaleString()} users affected`,
    risk_level: outage.status === 'offline' ? 'CRITICAL' :
                outage.status === 'degraded' ? 'HIGH' : 'LOW',
    data: {
      'Connectivity Score': `${Math.round(outage.connectivity_score * 100)}%`,
      'Average Speed': `${outage.speed_avg} Mbps`,
      'Affected Users': outage.affected_users.toLocaleString(),
      'Provider': outage.provider,
      'Last Updated': outage.last_updated
    }
  }));

  // Prepare disaster zones for map
  const outageZones = networkOutages
    .filter(outage => outage.status !== 'online')
    .map(outage => ({
      id: outage.id,
      lat: outage.lat,
      lng: outage.lng,
      type: 'network_outage',
      severity: outage.severity,
      radius: outage.status === 'offline' ? 5000 : 3000,
      last_updated: outage.last_updated
    }));

  const handleMapLocationSelect = (latlng) => {
    setSpeedTestData({
      ...speedTestData,
      location: `${latlng.lat.toFixed(4)}, ${latlng.lng.toFixed(4)}`
    });
  };

  const getMyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = `${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`;
          setSpeedTestData({
            ...speedTestData,
            location
          });
          setUserLocation([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <NetworkCheckIcon sx={{ fontSize: 32 }} />
        Network Outage Map
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Real-time network connectivity monitoring and crowd-sourced reporting
      </Typography>

      <Grid container spacing={3}>
        {/* Interactive Network Map */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight="bold">
                  Connectivity Heatmap
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip 
                    icon={<NetworkCheckIcon />}
                    label={`${liveData.totalReports} Reports`}
                    color="primary"
                    size="small"
                  />
                  <Tooltip title="Refresh Data">
                    <IconButton size="small">
                      <RefreshIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>

              {/* Leaflet Map */}
              <LeafletMap
                center={[20.5937, 78.9629]} // Center of India
                zoom={5}
                height="400px"
                markers={mapMarkers}
                disasters={outageZones}
                onLocationSelect={handleMapLocationSelect}
                showUserLocation={true}
                interactive={true}
                showControls={true}
              />

              {/* Map Legend */}
              <Box sx={{ display: 'flex', gap: 1, mt: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Chip 
                  icon={<Signal4BarIcon />}
                  label="Good (>50 Mbps)" 
                  sx={{ bgcolor: '#4CAF50', color: 'white' }}
                  size="small" 
                />
                <Chip 
                  icon={<SignalWifi2BarIcon />}
                  label="Fair (10-50 Mbps)" 
                  sx={{ bgcolor: '#FF9800', color: 'white' }}
                  size="small" 
                />
                <Chip 
                  icon={<SignalWifiOffIcon />}
                  label="Poor (<10 Mbps)" 
                  sx={{ bgcolor: '#F44336', color: 'white' }}
                  size="small" 
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Speed Test Submission */}
        <Grid item xs={12} lg={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                <SpeedIcon />
                Submit Speed Test
              </Typography>
              
              <TextField
                fullWidth
                label="Download Speed (Mbps)"
                value={speedTestData.download}
                onChange={(e) => setSpeedTestData({...speedTestData, download: e.target.value})}
                type="number"
                sx={{ mb: 2 }}
                disabled={submitting}
              />
              
              <TextField
                fullWidth
                label="Upload Speed (Mbps)"
                value={speedTestData.upload}
                onChange={(e) => setSpeedTestData({...speedTestData, upload: e.target.value})}
                type="number"
                sx={{ mb: 2 }}
                disabled={submitting}
              />
              
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <TextField
                  fullWidth
                  label="Location"
                  value={speedTestData.location}
                  onChange={(e) => setSpeedTestData({...speedTestData, location: e.target.value})}
                  placeholder="Click map or use GPS"
                  disabled={submitting}
                />
                <Tooltip title="Use My Location">
                  <IconButton onClick={getMyLocation} disabled={submitting}>
                    <MyLocationIcon />
                  </IconButton>
                </Tooltip>
              </Box>
              
              {submitting && (
                <Box sx={{ mb: 2 }}>
                  <LinearProgress />
                  <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
                    Submitting speed test...
                  </Typography>
                </Box>
              )}
              
              <Button
                fullWidth
                variant="contained"
                onClick={handleSpeedTest}
                disabled={submitting}
                startIcon={<SpeedIcon />}
                sx={{ mb: 2 }}
              >
                Submit Speed Test
              </Button>

              {testResult && (
                <Alert severity="success" sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" fontWeight="bold">
                    Speed Test Submitted!
                  </Typography>
                  <Typography variant="body2">
                    <strong>Download:</strong> {testResult.download_speed.toFixed(1)} Mbps<br/>
                    <strong>Upload:</strong> {testResult.upload_speed.toFixed(1)} Mbps<br/>
                    <strong>Ping:</strong> {testResult.ping} ms<br/>
                    <strong>Zone:</strong> {testResult.zone_classification.toUpperCase()}
                  </Typography>
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Network Status Overview */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Current Network Status
              </Typography>
              
              <Grid container spacing={2}>
                {networkOutages.map((outage) => (
                  <Grid item xs={12} sm={6} md={4} key={outage.id}>
                    <Paper 
                      elevation={2} 
                      sx={{ 
                        p: 2, 
                        borderLeft: `4px solid ${getConnectivityColor(outage.connectivity_score)}`,
                        '&:hover': { elevation: 4 }
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {outage.region}
                        </Typography>
                        {getStatusIcon(outage.status)}
                      </Box>
                      
                      <Box sx={{ mb: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          Connectivity Score: <strong>{Math.round(outage.connectivity_score * 100)}%</strong>
                        </Typography>
                        <LinearProgress 
                          variant="determinate" 
                          value={outage.connectivity_score * 100}
                          sx={{ 
                            mt: 0.5,
                            '& .MuiLinearProgress-bar': {
                              backgroundColor: getConnectivityColor(outage.connectivity_score)
                            }
                          }}
                        />
                      </Box>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Chip 
                          label={outage.status.toUpperCase()}
                          color={getStatusColor(outage.status)}
                          size="small"
                        />
                        <Typography variant="caption" color="text.secondary">
                          {outage.affected_users.toLocaleString()} users
                        </Typography>
                      </Box>
                      
                      <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                        Avg Speed: {outage.speed_avg} Mbps • {outage.last_updated}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Live Statistics */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2, bgcolor: 'primary.main', color: 'white' }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={3}>
                <Typography variant="h4" fontWeight="bold">
                  {liveData.totalReports}
                </Typography>
                <Typography variant="body2">
                  Total Reports
                </Typography>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Typography variant="h4" fontWeight="bold">
                  {networkOutages.filter(o => o.status === 'offline').length}
                </Typography>
                <Typography variant="body2">
                  Critical Outages
                </Typography>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Typography variant="h4" fontWeight="bold">
                  {networkOutages.reduce((sum, o) => sum + o.affected_users, 0).toLocaleString()}
                </Typography>
                <Typography variant="body2">
                  Users Affected
                </Typography>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Typography variant="body2">
                  <strong>Last Updated:</strong><br/>
                  {liveData.lastUpdated.toLocaleTimeString()}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default NetworkMap;