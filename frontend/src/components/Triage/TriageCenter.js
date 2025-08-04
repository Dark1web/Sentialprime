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
  Paper,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import {
  LocalHospital as LocalHospitalIcon,
  Send as SendIcon
} from '@mui/icons-material';

const TriageCenter = () => {
  const [message, setMessage] = useState('');
  const [location, setLocation] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleClassify = async () => {
    if (!message.trim()) return;
    
    setLoading(true);
    try {
      // Mock classification for demo
      const urgencyScore = Math.random() * 0.3 + (
        message.toLowerCase().includes('emergency') || 
        message.toLowerCase().includes('urgent') || 
        message.toLowerCase().includes('help') ? 0.7 : 0.2
      );
      
      const triageLevel = urgencyScore >= 0.8 ? 'CRITICAL' : 
                         urgencyScore >= 0.6 ? 'HIGH' : 
                         urgencyScore >= 0.3 ? 'MEDIUM' : 'LOW';
      
      const mockResult = {
        urgency_score: urgencyScore,
        triage_level: triageLevel,
        resource_required: message.toLowerCase().includes('medical') ? ['medical', 'rescue'] : 
                          message.toLowerCase().includes('food') ? ['food_water'] :
                          message.toLowerCase().includes('shelter') ? ['shelter'] : ['rescue'],
        estimated_response_time: triageLevel === 'CRITICAL' ? '5-10 minutes' :
                                triageLevel === 'HIGH' ? '30-60 minutes' :
                                triageLevel === 'MEDIUM' ? '2-4 hours' : '4-24 hours',
        keywords_detected: ['help', 'emergency', 'urgent'].filter(k => message.toLowerCase().includes(k)),
        location_parsed: location || 'Location not specified',
        medical_emergency: message.toLowerCase().includes('medical') || message.toLowerCase().includes('doctor'),
        explanation: `Classified as ${triageLevel} priority based on urgency indicators and resource requirements.`
      };
      
      setResult(mockResult);
    } catch (error) {
      console.error('Classification failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUrgencyColor = (level) => {
    switch (level) {
      case 'CRITICAL': return 'error';
      case 'HIGH': return 'warning';
      case 'MEDIUM': return 'info';
      case 'LOW': return 'success';
      default: return 'default';
    }
  };

  const sampleRequests = [
    {
      title: "Medical Emergency",
      text: "Elderly person having chest pain, need ambulance urgently, can't reach hospital",
      location: "Downtown area"
    },
    {
      title: "Rescue Operation",
      text: "Family trapped on rooftop due to flooding, water level rising rapidly",
      location: "Riverside district"
    },
    {
      title: "Supply Request",
      text: "Family of 4 without food and water for 2 days, children getting weak",
      location: "Suburban area"
    }
  ];

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
        🏥 Auto-Triage Center
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        AI-powered emergency request classification and priority assignment
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Submit Emergency Request
              </Typography>
              
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Emergency Message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe your emergency situation in detail..."
                sx={{ mb: 2 }}
              />
              
              <TextField
                fullWidth
                label="Location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Your current location"
                sx={{ mb: 2 }}
              />
              
              <Button 
                fullWidth 
                variant="contained" 
                onClick={handleClassify}
                disabled={loading || !message.trim()}
                startIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
              >
                {loading ? 'Classifying...' : 'Submit for Triage'}
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Triage Classification
              </Typography>
              
              {result ? (
                <Box>
                  <Alert 
                    severity={getUrgencyColor(result.triage_level)} 
                    sx={{ mb: 2 }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      {result.triage_level} PRIORITY - {result.estimated_response_time}
                    </Typography>
                  </Alert>

                  <Paper sx={{ p: 2, mb: 2, backgroundColor: 'rgba(0,0,0,0.02)' }}>
                    <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
                      Classification Details:
                    </Typography>
                    
                    <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                      <Chip 
                        label={`Urgency: ${(result.urgency_score * 100).toFixed(0)}%`}
                        color={getUrgencyColor(result.triage_level)}
                      />
                      {result.medical_emergency && (
                        <Chip 
                          label="Medical Emergency"
                          color="error"
                          icon={<LocalHospitalIcon />}
                        />
                      )}
                    </Box>

                    <Typography variant="body2" sx={{ mb: 2 }}>
                      {result.explanation}
                    </Typography>

                    <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
                      Required Resources:
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 0.5, mb: 2, flexWrap: 'wrap' }}>
                      {result.resource_required.map((resource, index) => (
                        <Chip 
                          key={index} 
                          label={resource.replace('_', ' ')} 
                          size="small" 
                          variant="outlined" 
                        />
                      ))}
                    </Box>

                    <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
                      Location:
                    </Typography>
                    <Typography variant="body2">
                      {result.location_parsed}
                    </Typography>
                  </Paper>

                  {result.keywords_detected.length > 0 && (
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Key Indicators:
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5, flexWrap: 'wrap' }}>
                        {result.keywords_detected.map((keyword, index) => (
                          <Chip key={index} label={keyword} size="small" color="info" />
                        ))}
                      </Box>
                    </Box>
                  )}
                </Box>
              ) : (
                <Typography color="text.secondary">
                  Submit an emergency request to see triage classification
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Sample requests */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
            📝 Sample Emergency Requests
          </Typography>
          <Grid container spacing={2}>
            {sampleRequests.map((sample, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Paper 
                  sx={{ p: 2, cursor: 'pointer', height: '100%' }} 
                  onClick={() => {
                    setMessage(sample.text);
                    setLocation(sample.location);
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {sample.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                    Location: {sample.location}
                  </Typography>
                  <Typography variant="body2">
                    "{sample.text}"
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default TriageCenter;