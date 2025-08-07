import React, { useState, useEffect } from 'react';
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
  Tooltip
} from '@mui/material';
import {
  Warning as WarningIcon,
  TrendingUp as TrendingUpIcon,
  Share as ShareIcon,
  MoreVert as MoreVertIcon
} from '@mui/icons-material';

const MisinformationFeed = ({ misinformationFeed }) => {
  const [newsData, setNewsData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (misinformationFeed && misinformationFeed.articles) {
      const aiEnhancedPosts = misinformationFeed.articles.slice(0, 4).map((article, index) => ({
        id: index + 1,
        text: article.title || article.description || 'No description available',
        panicScore: article.ai_analysis?.misinformation_risk === 'high' ? 0.8 : 
                    article.ai_analysis?.misinformation_risk === 'medium' ? 0.5 : 0.2,
        confidence: (article.ai_analysis?.credibility_score || 70) / 100,
        isFlaged: article.ai_analysis?.misinformation_risk === 'high',
        source: article.source || 'AI News',
        timestamp: new Date().toLocaleTimeString(),
        shareCount: Math.floor(Math.random() * 1000),
        aiEnhanced: true,
        disasterType: article.ai_analysis?.disaster_type || 'general'
      }));
      setNewsData(aiEnhancedPosts);
    }
    setLoading(false);
  }, [misinformationFeed]);

  const misinformationPosts = newsData.length > 0 ? newsData : [
    {
      id: 1,
      text: "BREAKING: Dam burst in Rajasthan! Immediate evacuation required! Share this urgent message!",
      panicScore: 0.92,
      confidence: 0.87,
      isFlaged: true,
      source: "Twitter",
      timestamp: "3 mins ago",
      shareCount: 1247,
      aiEnhanced: false
    },
    {
      id: 2,
      text: "Confirmed: Heatwave temperatures reaching 55°C in Delhi. Government hiding real numbers.",
      panicScore: 0.68,
      confidence: 0.74,
      isFlaged: true,
      source: "WhatsApp",
      timestamp: "8 mins ago",
      shareCount: 892,
      aiEnhanced: false
    },
    {
      id: 3,
      text: "False alarm about earthquake in Mumbai. No seismic activity detected by official sources.",
      panicScore: 0.15,
      confidence: 0.91,
      isFlaged: false,
      source: "News",
      timestamp: "15 mins ago",
      shareCount: 234,
      aiEnhanced: false
    },
    {
      id: 4,
      text: "Unverified reports of building collapse in Bangalore. Waiting for official confirmation.",
      panicScore: 0.54,
      confidence: 0.42,
      isFlaged: true,
      source: "Telegram",
      timestamp: "22 mins ago",
      shareCount: 567,
      aiEnhanced: false
    }
  ];

  const getPanicColor = (score) => {
    if (score >= 0.8) return 'error';
    if (score >= 0.6) return 'warning';
    if (score >= 0.3) return 'info';
    return 'success';
  };

  const getPanicLabel = (score) => {
    if (score >= 0.8) return 'CRITICAL';
    if (score >= 0.6) return 'HIGH';
    if (score >= 0.3) return 'MEDIUM';
    return 'LOW';
  };

  const getSourceIcon = (source) => {
    const sourceColors = {
      'Twitter': '#1da1f2',
      'WhatsApp': '#25d366',
      'News': '#ff6b35',
      'Telegram': '#0088cc'
    };
    
    return (
      <Avatar 
        sx={{ 
          width: 24, 
          height: 24, 
          backgroundColor: sourceColors[source] || '#757575',
          fontSize: '0.7rem'
        }}
      >
        {source[0]}
      </Avatar>
    );
  };

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Misinformation Feed
          </Typography>
          <Chip 
            icon={<WarningIcon />}
            label="12 flagged today" 
            color="warning" 
            size="small"
          />
        </Box>

        <List dense sx={{ maxHeight: 400, overflowY: 'auto' }}>
          {misinformationPosts.map((post) => (
            <ListItem 
              key={post.id} 
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
                    {getSourceIcon(post.source)}
                    <Typography variant="caption" color="text.secondary">
                      {post.source} • {post.timestamp}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Chip 
                      label={getPanicLabel(post.panicScore)}
                      size="small"
                      color={getPanicColor(post.panicScore)}
                      sx={{ height: 20, fontSize: '0.65rem' }}
                    />
                    <IconButton size="small">
                      <MoreVertIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>

                {/* Content */}
                <Typography 
                  variant="body2" 
                  sx={{ 
                    mb: 1, 
                    color: post.isFlaged ? 'error.main' : 'text.primary',
                    fontStyle: post.isFlaged ? 'italic' : 'normal'
                  }}
                >
                  {post.text.length > 120 ? `${post.text.substring(0, 120)}...` : post.text}
                </Typography>

                {/* Metrics */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      Panic: {(post.panicScore * 100).toFixed(0)}%
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Confidence: {(post.confidence * 100).toFixed(0)}%
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <ShareIcon fontSize="small" color="action" />
                    <Typography variant="caption" color="text.secondary">
                      {post.shareCount.toLocaleString()}
                    </Typography>
                    {post.shareCount > 1000 && (
                      <Tooltip title="Viral spread detected">
                        <TrendingUpIcon fontSize="small" color="warning" />
                      </Tooltip>
                    )}
                  </Box>
                </Box>
              </Box>
            </ListItem>
          ))}
        </List>

        {/* Summary */}
        <Box sx={{ 
          mt: 2, 
          p: 2, 
          backgroundColor: 'rgba(244, 67, 54, 0.05)', 
          borderRadius: 2,
          borderLeft: '4px solid',
          borderLeftColor: 'error.main'
        }}>
          <Typography variant="caption" color="error.main" sx={{ fontWeight: 'bold' }}>
            ⚠️ High-risk misinformation detected
          </Typography>
          <Typography variant="body2" sx={{ mt: 0.5 }}>
            3 posts with panic scores above 80% identified in the last hour. Monitoring viral spread patterns.
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default MisinformationFeed;