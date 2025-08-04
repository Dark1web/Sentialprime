import React from 'react';
import { Box, Typography } from '@mui/material';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area 
} from 'recharts';

const TrendChart = ({ type }) => {
  // Mock data for different chart types
  const generateMockData = () => {
    const baseData = [];
    const now = new Date();
    
    for (let i = 23; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 60 * 60 * 1000);
      
      if (type === 'misinformation') {
        baseData.push({
          time: time.getHours() + ':00',
          value: Math.floor(Math.random() * 15) + 5,
          detected: Math.floor(Math.random() * 8) + 2,
          flagged: Math.floor(Math.random() * 5) + 1
        });
      } else if (type === 'emergency') {
        baseData.push({
          time: time.getHours() + ':00',
          value: Math.floor(Math.random() * 25) + 10,
          critical: Math.floor(Math.random() * 5) + 1,
          high: Math.floor(Math.random() * 8) + 3,
          medium: Math.floor(Math.random() * 12) + 6
        });
      }
    }
    
    return baseData.slice(-12); // Show last 12 hours
  };

  const data = generateMockData();

  const renderMisinformationChart = () => (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis 
          dataKey="time" 
          fontSize={12}
          tick={{ fill: '#666' }}
        />
        <YAxis 
          fontSize={12}
          tick={{ fill: '#666' }}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: '#fff', 
            border: '1px solid #ddd',
            borderRadius: 8,
            fontSize: 12
          }}
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke="#f44336"
          fill="rgba(244, 67, 54, 0.1)"
          strokeWidth={2}
          name="Total Posts"
        />
        <Area
          type="monotone"
          dataKey="detected"
          stroke="#ff9800"
          fill="rgba(255, 152, 0, 0.1)"
          strokeWidth={2}
          name="Detected as Fake"
        />
      </AreaChart>
    </ResponsiveContainer>
  );

  const renderEmergencyChart = () => (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis 
          dataKey="time" 
          fontSize={12}
          tick={{ fill: '#666' }}
        />
        <YAxis 
          fontSize={12}
          tick={{ fill: '#666' }}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: '#fff', 
            border: '1px solid #ddd',
            borderRadius: 8,
            fontSize: 12
          }}
        />
        <Line
          type="monotone"
          dataKey="critical"
          stroke="#f44336"
          strokeWidth={3}
          dot={{ fill: '#f44336', strokeWidth: 2, r: 4 }}
          name="Critical"
        />
        <Line
          type="monotone"
          dataKey="high"
          stroke="#ff9800"
          strokeWidth={2}
          dot={{ fill: '#ff9800', strokeWidth: 2, r: 3 }}
          name="High Priority"
        />
        <Line
          type="monotone"
          dataKey="medium"
          stroke="#2196f3"
          strokeWidth={2}
          dot={{ fill: '#2196f3', strokeWidth: 2, r: 3 }}
          name="Medium Priority"
        />
      </LineChart>
    </ResponsiveContainer>
  );

  const getChartSummary = () => {
    if (type === 'misinformation') {
      const totalPosts = data.reduce((sum, item) => sum + item.value, 0);
      const totalDetected = data.reduce((sum, item) => sum + item.detected, 0);
      const detectionRate = ((totalDetected / totalPosts) * 100).toFixed(1);
      
      return (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Detection Rate
            </Typography>
            <Typography variant="h6" color="warning.main" sx={{ fontWeight: 'bold' }}>
              {detectionRate}%
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="caption" color="text.secondary">
              Last 12 Hours
            </Typography>
            <Typography variant="h6" color="error.main" sx={{ fontWeight: 'bold' }}>
              {totalDetected} flagged
            </Typography>
          </Box>
        </Box>
      );
    } else {
      const totalRequests = data.reduce((sum, item) => sum + item.value, 0);
      const totalCritical = data.reduce((sum, item) => sum + item.critical, 0);
      
      return (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Total Requests
            </Typography>
            <Typography variant="h6" color="primary.main" sx={{ fontWeight: 'bold' }}>
              {totalRequests}
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="caption" color="text.secondary">
              Critical Priority
            </Typography>
            <Typography variant="h6" color="error.main" sx={{ fontWeight: 'bold' }}>
              {totalCritical}
            </Typography>
          </Box>
        </Box>
      );
    }
  };

  return (
    <Box>
      {getChartSummary()}
      {type === 'misinformation' ? renderMisinformationChart() : renderEmergencyChart()}
    </Box>
  );
};

export default TrendChart;