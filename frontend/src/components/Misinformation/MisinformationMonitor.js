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
  CircularProgress
} from '@mui/material';
import {
  Security as SecurityIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { analyzeMisinformation } from '../../services/api';

const MisinformationMonitor = () => {
  const [postText, setPostText] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!postText.trim()) return;
    
    setLoading(true);
    try {
      // Mock analysis for demo
      const mockAnalysis = {
        post_text: postText,
        is_fake: postText.toLowerCase().includes('breaking') || postText.toLowerCase().includes('urgent'),
        panic_score: Math.random() * 0.4 + (postText.toLowerCase().includes('emergency') ? 0.6 : 0),
        confidence: 0.75 + Math.random() * 0.2,
        emotion_breakdown: {
          fear: Math.random() * 0.5,
          anger: Math.random() * 0.3,
          surprise: Math.random() * 0.4,
          neutral: Math.random() * 0.3
        },
        model_explanation: "Analysis based on language patterns and urgency indicators",
        risk_level: "MEDIUM",
        flagged_keywords: ["breaking", "urgent", "emergency"].filter(k => postText.toLowerCase().includes(k))
      };
      
      setAnalysis(mockAnalysis);
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPanicColor = (score) => {
    if (score >= 0.8) return 'error';
    if (score >= 0.6) return 'warning';
    if (score >= 0.3) return 'info';
    return 'success';
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
        🛡️ Misinformation Monitor
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        AI-powered detection of fake news and panic-inducing content
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Analyze Content
              </Typography>
              
              <TextField
                fullWidth
                multiline
                rows={6}
                label="Social Media Post / News Content"
                value={postText}
                onChange={(e) => setPostText(e.target.value)}
                placeholder="Paste the content you want to analyze for misinformation..."
                sx={{ mb: 2 }}
              />
              
              <Button 
                fullWidth 
                variant="contained" 
                onClick={handleAnalyze}
                disabled={loading || !postText.trim()}
                startIcon={loading ? <CircularProgress size={20} /> : <SecurityIcon />}
              >
                {loading ? 'Analyzing...' : 'Analyze Content'}
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Analysis Results
              </Typography>
              
              {analysis ? (
                <Box>
                  <Alert 
                    severity={analysis.is_fake ? 'error' : 'success'} 
                    sx={{ mb: 2 }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      {analysis.is_fake ? '⚠️ Potential Misinformation Detected' : '✅ Content Appears Legitimate'}
                    </Typography>
                  </Alert>

                  <Paper sx={{ p: 2, mb: 2, backgroundColor: 'rgba(0,0,0,0.02)' }}>
                    <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
                      Key Metrics:
                    </Typography>
                    
                    <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                      <Chip 
                        label={`Panic Score: ${(analysis.panic_score * 100).toFixed(0)}%`}
                        color={getPanicColor(analysis.panic_score)}
                      />
                      <Chip 
                        label={`Confidence: ${(analysis.confidence * 100).toFixed(0)}%`}
                        color="info"
                      />
                      <Chip 
                        label={`Risk: ${analysis.risk_level}`}
                        color="warning"
                      />
                    </Box>

                    <Typography variant="body2">
                      {analysis.model_explanation}
                    </Typography>

                    {analysis.flagged_keywords.length > 0 && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="caption" color="text.secondary">
                          Flagged Keywords:
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5, flexWrap: 'wrap' }}>
                          {analysis.flagged_keywords.map((keyword, index) => (
                            <Chip key={index} label={keyword} size="small" color="warning" />
                          ))}
                        </Box>
                      </Box>
                    )}
                  </Paper>

                  <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Emotion Analysis:
                  </Typography>
                  {Object.entries(analysis.emotion_breakdown).map(([emotion, score]) => (
                    <Box key={emotion} sx={{ mb: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                          {emotion}
                        </Typography>
                        <Typography variant="body2">
                          {(score * 100).toFixed(0)}%
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Typography color="text.secondary">
                  Enter content above to see analysis results
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Sample content for testing */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
            📝 Sample Content for Testing
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2, cursor: 'pointer' }} onClick={() => setPostText("BREAKING: Dam burst in Rajasthan! Massive flooding! Share immediately before it's too late!")}>
                <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'error.main' }}>
                  High-Risk Example
                </Typography>
                <Typography variant="caption">
                  "BREAKING: Dam burst in Rajasthan! Massive flooding! Share immediately..."
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2, cursor: 'pointer' }} onClick={() => setPostText("Weather alert: Heavy rainfall expected in northern regions. Stay safe and follow official advisories.")}>
                <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'warning.main' }}>
                  Medium-Risk Example
                </Typography>
                <Typography variant="caption">
                  "Weather alert: Heavy rainfall expected in northern regions..."
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2, cursor: 'pointer' }} onClick={() => setPostText("According to the India Meteorological Department, normal weather conditions are expected this week with temperatures around 28-32°C.")}>
                <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                  Low-Risk Example
                </Typography>
                <Typography variant="caption">
                  "According to the India Meteorological Department, normal weather..."
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default MisinformationMonitor;