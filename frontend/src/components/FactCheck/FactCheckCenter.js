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
  FactCheck as FactCheckIcon,
  Search as SearchIcon
} from '@mui/icons-material';

const FactCheckCenter = () => {
  const [claim, setClaim] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFactCheck = async () => {
    if (!claim.trim()) return;
    
    setLoading(true);
    try {
      // Mock fact-check for demo
      const isLikelyFalse = claim.toLowerCase().includes('breaking') || 
                          claim.toLowerCase().includes('secret') ||
                          claim.toLowerCase().includes('hidden');
      
      const mockResult = {
        verdict: isLikelyFalse ? 'False' : Math.random() > 0.5 ? 'True' : 'Partially True',
        confidence: 0.75 + Math.random() * 0.2,
        model_explanation: `Analysis based on ${isLikelyFalse ? 'suspicious language patterns and lack of credible sources' : 'reliable sources and factual content'}`,
        risk_assessment: isLikelyFalse ? 'HIGH' : 'LOW',
        related_articles: [
          {
            title: "Official weather report from IMD",
            source: "imd.gov.in",
            supports_claim: !isLikelyFalse,
            reliability_score: 0.95
          },
          {
            title: "News coverage verification",
            source: "ptinews.com",
            supports_claim: !isLikelyFalse,
            reliability_score: 0.88
          }
        ],
        verification_sources: ["imd.gov.in", "ndma.gov.in", "ptinews.com"]
      };
      
      setResult(mockResult);
    } catch (error) {
      console.error('Fact-check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const getVerdictColor = (verdict) => {
    switch (verdict) {
      case 'True': return 'success';
      case 'False': return 'error';
      case 'Partially True': return 'warning';
      case 'Unverified': return 'info';
      default: return 'default';
    }
  };

  const sampleClaims = [
    "Dam burst in Rajasthan causing massive flooding - share immediately!",
    "According to IMD, heavy rainfall warning issued for northern states",
    "Secret government weather modification program causing extreme heat"
  ];

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
        ✅ Fact-Check Center
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        AI-powered verification of disaster-related claims and news
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Verify Claim
              </Typography>
              
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Disaster-related Claim"
                value={claim}
                onChange={(e) => setClaim(e.target.value)}
                placeholder="Enter the claim you want to fact-check..."
                sx={{ mb: 2 }}
              />
              
              <Button 
                fullWidth 
                variant="contained" 
                onClick={handleFactCheck}
                disabled={loading || !claim.trim()}
                startIcon={loading ? <CircularProgress size={20} /> : <FactCheckIcon />}
              >
                {loading ? 'Verifying...' : 'Fact-Check Claim'}
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Verification Result
              </Typography>
              
              {result ? (
                <Box>
                  <Alert 
                    severity={getVerdictColor(result.verdict)} 
                    sx={{ mb: 2 }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      Verdict: {result.verdict}
                    </Typography>
                    <Typography variant="body2">
                      Confidence: {(result.confidence * 100).toFixed(0)}%
                    </Typography>
                  </Alert>

                  <Paper sx={{ p: 2, mb: 2, backgroundColor: 'rgba(0,0,0,0.02)' }}>
                    <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
                      Analysis:
                    </Typography>
                    
                    <Chip 
                      label={`Risk: ${result.risk_assessment}`}
                      color={result.risk_assessment === 'HIGH' ? 'error' : 'success'}
                      sx={{ mb: 2 }}
                    />

                    <Typography variant="body2" sx={{ mb: 2 }}>
                      {result.model_explanation}
                    </Typography>

                    <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
                      Verification Sources:
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 0.5, mb: 2, flexWrap: 'wrap' }}>
                      {result.verification_sources.map((source, index) => (
                        <Chip key={index} label={source} size="small" variant="outlined" />
                      ))}
                    </Box>
                  </Paper>

                  <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Related Articles:
                  </Typography>
                  <List dense>
                    {result.related_articles.map((article, index) => (
                      <ListItem key={index} sx={{ px: 0 }}>
                        <ListItemText
                          primary={article.title}
                          secondary={
                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                              <Typography variant="caption">
                                {article.source}
                              </Typography>
                              <Chip 
                                label={article.supports_claim ? 'Supports' : 'Contradicts'}
                                color={article.supports_claim ? 'success' : 'error'}
                                size="small"
                                sx={{ height: 16, fontSize: '0.6rem' }}
                              />
                              <Typography variant="caption">
                                Reliability: {(article.reliability_score * 100).toFixed(0)}%
                              </Typography>
                            </Box>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              ) : (
                <Typography color="text.secondary">
                  Enter a claim above to see fact-check results
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Sample claims */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
            📝 Sample Claims for Testing
          </Typography>
          <Grid container spacing={2}>
            {sampleClaims.map((sampleClaim, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Paper 
                  sx={{ p: 2, cursor: 'pointer', height: '100%' }} 
                  onClick={() => setClaim(sampleClaim)}
                >
                  <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                    Sample Claim {index + 1}
                  </Typography>
                  <Typography variant="body2">
                    "{sampleClaim}"
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

export default FactCheckCenter;