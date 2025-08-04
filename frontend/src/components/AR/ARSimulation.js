import React, { useState, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Tabs,
  Tab,
  TextField,
  Slider,
  Chip,
  Alert,
  Paper
} from '@mui/material';
import {
  CameraAlt as CameraIcon,
  WaterDrop as WaterDropIcon,
  WbSunny as WbSunnyIcon,
  LocationOn as LocationOnIcon,
  ViewInAr as ViewInArIcon
} from '@mui/icons-material';

const ARSimulation = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [cameraActive, setCameraActive] = useState(false);
  const [floodLevel, setFloodLevel] = useState(2);
  const [temperature, setTemperature] = useState(45);
  const [location, setLocation] = useState('');
  const videoRef = useRef(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      setCameraActive(false);
    }
  };

  const TabPanel = ({ children, value, index }) => (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );

  const floodSimulationData = {
    1: { level: "Ankle Deep", risk: "Low", color: "#2196f3", description: "Minor flooding, passable with caution" },
    2: { level: "Knee Deep", risk: "Medium", color: "#ff9800", description: "Difficult to walk, vehicles may stall" },
    3: { level: "Waist Deep", risk: "High", color: "#f44336", description: "Dangerous for pedestrians, evacuation recommended" },
    4: { level: "Chest Deep", risk: "Critical", color: "#d32f2f", description: "Life-threatening, immediate evacuation required" }
  };

  const heatwaveData = {
    normal: { temp: "< 40°C", risk: "Normal", color: "#4caf50" },
    caution: { temp: "40-42°C", risk: "Caution", color: "#ff9800" },
    danger: { temp: "43-45°C", risk: "Danger", color: "#f44336" },
    extreme: { temp: "> 45°C", risk: "Extreme", color: "#d32f2f" }
  };

  const getHeatLevel = (temp) => {
    if (temp < 40) return heatwaveData.normal;
    if (temp <= 42) return heatwaveData.caution;
    if (temp <= 45) return heatwaveData.danger;
    return heatwaveData.extreme;
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
        🥽 AR Disaster Simulation
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Visualize disaster scenarios using augmented reality
      </Typography>

      <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} sx={{ mb: 3 }}>
        <Tab label="Flood Simulation" icon={<WaterDropIcon />} />
        <Tab label="Heatwave Overlay" icon={<WbSunnyIcon />} />
        <Tab label="Street Scanner" icon={<CameraIcon />} />
      </Tabs>

      <TabPanel value={activeTab} index={0}>
        <Grid container spacing={3}>
          {/* Camera/AR View */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                  🌊 Flood Level Simulation
                </Typography>
                
                <Box 
                  sx={{ 
                    position: 'relative',
                    height: 400,
                    backgroundColor: '#f5f5f5',
                    borderRadius: 2,
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {cameraActive ? (
                    <video
                      ref={videoRef}
                      autoPlay
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <Box sx={{ textAlign: 'center', color: 'text.secondary' }}>
                      <ViewInArIcon sx={{ fontSize: 60, mb: 2 }} />
                      <Typography variant="h6">AR Camera View</Typography>
                      <Typography variant="body2">
                        Enable camera to see flood simulation overlay
                      </Typography>
                    </Box>
                  )}
                  
                  {/* Flood Overlay */}
                  {cameraActive && (
                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: `${floodLevel * 25}%`,
                        backgroundColor: floodSimulationData[floodLevel].color,
                        opacity: 0.6,
                        transition: 'all 0.3s ease'
                      }}
                    />
                  )}
                  
                  {/* AR Info Overlay */}
                  {cameraActive && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 16,
                        left: 16,
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        color: 'white',
                        p: 2,
                        borderRadius: 2
                      }}
                    >
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        Flood Level: {floodSimulationData[floodLevel].level}
                      </Typography>
                      <Typography variant="caption">
                        Risk: {floodSimulationData[floodLevel].risk}
                      </Typography>
                    </Box>
                  )}
                </Box>

                <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                  <Button 
                    variant={cameraActive ? "outlined" : "contained"}
                    onClick={cameraActive ? stopCamera : startCamera}
                    startIcon={<CameraIcon />}
                  >
                    {cameraActive ? 'Stop Camera' : 'Start AR Camera'}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Controls */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Simulation Controls
                </Typography>
                
                <TextField
                  fullWidth
                  label="Street Address"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Enter street address"
                  sx={{ mb: 3 }}
                  InputProps={{
                    startAdornment: <LocationOnIcon color="primary" sx={{ mr: 1 }} />
                  }}
                />
                
                <Typography gutterBottom>
                  Flood Water Level
                </Typography>
                <Slider
                  value={floodLevel}
                  onChange={(e, newValue) => setFloodLevel(newValue)}
                  min={1}
                  max={4}
                  step={1}
                  marks={[
                    { value: 1, label: 'Ankle' },
                    { value: 2, label: 'Knee' },
                    { value: 3, label: 'Waist' },
                    { value: 4, label: 'Chest' }
                  ]}
                  sx={{ mb: 3 }}
                />
                
                <Box sx={{ mb: 2 }}>
                  <Chip 
                    label={`${floodSimulationData[floodLevel].level} - ${floodSimulationData[floodLevel].risk} Risk`}
                    sx={{ 
                      backgroundColor: floodSimulationData[floodLevel].color,
                      color: 'white',
                      fontWeight: 'bold'
                    }}
                  />
                </Box>
                
                <Typography variant="body2" color="text.secondary">
                  {floodSimulationData[floodLevel].description}
                </Typography>

                <Alert severity="info" sx={{ mt: 2 }}>
                  🎯 Point camera at street level for best simulation results
                </Alert>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={activeTab} index={1}>
        <Grid container spacing={3}>
          {/* Heatwave Visualization */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                  🌡️ Heatwave Impact Overlay
                </Typography>
                
                <Box 
                  sx={{ 
                    position: 'relative',
                    height: 400,
                    backgroundColor: '#f5f5f5',
                    borderRadius: 2,
                    overflow: 'hidden',
                    background: `linear-gradient(45deg, ${getHeatLevel(temperature).color}20, ${getHeatLevel(temperature).color}10)`
                  }}
                >
                  {/* Heatwave Visualization */}
                  <Box sx={{ 
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column'
                  }}>
                    <WbSunnyIcon 
                      sx={{ 
                        fontSize: 120, 
                        color: getHeatLevel(temperature).color,
                        animation: 'pulse 2s infinite'
                      }} 
                    />
                    <Typography variant="h3" sx={{ fontWeight: 'bold', mt: 2 }}>
                      {temperature}°C
                    </Typography>
                    <Typography variant="h6" color={getHeatLevel(temperature).color}>
                      {getHeatLevel(temperature).risk} Level
                    </Typography>
                  </Box>

                  {/* Temperature zones overlay */}
                  <Paper 
                    sx={{ 
                      position: 'absolute',
                      top: 16,
                      right: 16,
                      p: 2,
                      backgroundColor: 'rgba(255,255,255,0.9)'
                    }}
                  >
                    <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
                      Heat Zones
                    </Typography>
                    {Object.entries(heatwaveData).map(([key, data]) => (
                      <Box key={key} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            backgroundColor: data.color,
                            borderRadius: '50%'
                          }}
                        />
                        <Typography variant="caption">
                          {data.temp} - {data.risk}
                        </Typography>
                      </Box>
                    ))}
                  </Paper>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Temperature Controls */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Temperature Controls
                </Typography>
                
                <Typography gutterBottom>
                  Current Temperature: {temperature}°C
                </Typography>
                <Slider
                  value={temperature}
                  onChange={(e, newValue) => setTemperature(newValue)}
                  min={35}
                  max={50}
                  step={1}
                  marks={[
                    { value: 35, label: '35°' },
                    { value: 40, label: '40°' },
                    { value: 45, label: '45°' },
                    { value: 50, label: '50°' }
                  ]}
                  sx={{ mb: 3 }}
                />

                <Alert severity={getHeatLevel(temperature).risk === 'Normal' ? 'success' : 'warning'} sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    {getHeatLevel(temperature).risk} Heat Level
                  </Typography>
                  <Typography variant="body2">
                    {temperature >= 45 ? 'Extreme heat! Stay indoors and hydrate frequently.' :
                     temperature >= 43 ? 'Dangerous heat. Avoid outdoor activities.' :
                     temperature >= 40 ? 'Hot conditions. Take precautions when outside.' :
                     'Normal temperature range.'}
                  </Typography>
                </Alert>

                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Safety Recommendations:
                </Typography>
                <Box component="ul" sx={{ pl: 2, mt: 1 }}>
                  <Typography component="li" variant="body2">Stay hydrated</Typography>
                  <Typography component="li" variant="body2">Wear light clothing</Typography>
                  <Typography component="li" variant="body2">Avoid peak sun hours</Typography>
                  <Typography component="li" variant="body2">Use cooling centers</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={activeTab} index={2}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              📱 Street Scanner (Mobile AR)
            </Typography>
            
            <Typography variant="body1" sx={{ mb: 3 }}>
              Use your mobile device to scan streets and get real-time disaster risk assessment.
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                  <ViewInArIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Point & Scan
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Point your camera at any street or area to get instant risk analysis
                  </Typography>
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                  <LocationOnIcon sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Safe Zone Detection
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Automatically identify safe zones and evacuation routes
                  </Typography>
                </Paper>
              </Grid>
            </Grid>

            <Alert severity="info" sx={{ mt: 3 }}>
              💡 <strong>Mobile AR Features:</strong> This feature works best on mobile devices with AR capabilities. 
              Open this page on your smartphone for the full AR experience.
            </Alert>
          </CardContent>
        </Card>
      </TabPanel>
    </Box>
  );
};

export default ARSimulation;