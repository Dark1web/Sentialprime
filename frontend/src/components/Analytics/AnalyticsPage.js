import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Paper,
  Chip,
  Button,
  IconButton,
  Divider,
  Alert,
  LinearProgress,
  CircularProgress,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import {
  Analytics as AnalyticsIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Assessment as AssessmentIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
  Timeline as TimelineIcon,
  Map as MapIcon
} from '@mui/icons-material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar, Doughnut, Pie } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const AnalyticsPage = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [timeRange, setTimeRange] = useState('24h');
  const [liveData, setLiveData] = useState({
    lastUpdated: new Date(),
    totalIncidents: 247,
    resolvedIncidents: 189,
    activeAlerts: 12,
    systemUptime: 99.8
  });

  // Update live data periodically
  useEffect(() => {
    const updateData = () => {
      setLiveData(prev => ({
        ...prev,
        lastUpdated: new Date(),
        totalIncidents: prev.totalIncidents + Math.floor(Math.random() * 3),
        resolvedIncidents: prev.resolvedIncidents + Math.floor(Math.random() * 2),
        activeAlerts: Math.max(0, prev.activeAlerts + (Math.random() > 0.7 ? 1 : -1))
      }));
    };

    const interval = setInterval(updateData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  // Chart data
  const disasterTrendData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Flood Incidents',
        data: [12, 19, 8, 5, 2, 3, 15, 22, 18, 25, 20, 14],
        borderColor: 'rgb(33, 150, 243)',
        backgroundColor: 'rgba(33, 150, 243, 0.1)',
        tension: 0.4,
        fill: true
      },
      {
        label: 'Fire Incidents',
        data: [8, 12, 15, 18, 25, 20, 12, 8, 6, 4, 7, 9],
        borderColor: 'rgb(244, 67, 54)',
        backgroundColor: 'rgba(244, 67, 54, 0.1)',
        tension: 0.4,
        fill: true
      },
      {
        label: 'Earthquake',
        data: [2, 1, 0, 1, 0, 2, 1, 0, 1, 1, 0, 1],
        borderColor: 'rgb(158, 158, 158)',
        backgroundColor: 'rgba(158, 158, 158, 0.1)',
        tension: 0.4,
        fill: true
      }
    ]
  };

  const responseTimeData = {
    labels: ['Emergency Services', 'Medical Response', 'Fire Department', 'Police', 'Rescue Teams'],
    datasets: [
      {
        label: 'Average Response Time (minutes)',
        data: [8.5, 12.2, 6.8, 9.5, 15.3],
        backgroundColor: [
          'rgba(76, 175, 80, 0.8)',
          'rgba(255, 152, 0, 0.8)',
          'rgba(244, 67, 54, 0.8)',
          'rgba(33, 150, 243, 0.8)',
          'rgba(156, 39, 176, 0.8)'
        ],
        borderColor: [
          'rgb(76, 175, 80)',
          'rgb(255, 152, 0)',
          'rgb(244, 67, 54)',
          'rgb(33, 150, 243)',
          'rgb(156, 39, 176)'
        ],
        borderWidth: 2
      }
    ]
  };

  const incidentTypeData = {
    labels: ['Floods', 'Fires', 'Network Outages', 'Medical Emergency', 'Earthquakes', 'Other'],
    datasets: [
      {
        data: [35, 25, 20, 12, 5, 3],
        backgroundColor: [
          '#2196F3',
          '#F44336',
          '#FF9800',
          '#4CAF50',
          '#9C27B0',
          '#607D8B'
        ],
        borderColor: '#fff',
        borderWidth: 2
      }
    ]
  };

  const misinformationData = {
    labels: ['6 AM', '9 AM', '12 PM', '3 PM', '6 PM', '9 PM', '12 AM', '3 AM'],
    datasets: [
      {
        label: 'Detected Misinformation',
        data: [5, 12, 25, 35, 28, 22, 8, 3],
        backgroundColor: 'rgba(244, 67, 54, 0.2)',
        borderColor: 'rgb(244, 67, 54)',
        borderWidth: 2,
        fill: true
      },
      {
        label: 'Verified Information',
        data: [45, 52, 48, 55, 58, 52, 35, 28],
        backgroundColor: 'rgba(76, 175, 80, 0.2)',
        borderColor: 'rgb(76, 175, 80)',
        borderWidth: 2,
        fill: true
      }
    ]
  };

  const regionPerformanceData = [
    { region: 'Delhi NCR', incidents: 45, resolved: 42, responseTime: '8.5 min', score: 93 },
    { region: 'Mumbai Metro', incidents: 38, resolved: 35, responseTime: '9.2 min', score: 89 },
    { region: 'Bangalore Tech', incidents: 29, resolved: 28, responseTime: '7.8 min', score: 95 },
    { region: 'Chennai Zone', incidents: 22, resolved: 20, responseTime: '10.1 min', score: 87 },
    { region: 'Kolkata Area', incidents: 18, resolved: 16, responseTime: '11.5 min', score: 82 }
  ];

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
      }
    }
  };

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setLiveData(prev => ({
        ...prev,
        lastUpdated: new Date()
      }));
    }, 1500);
  };

  const handleExport = (format) => {
    // Mock export functionality
    const data = {
      report_type: 'SentinelX Analytics Report',
      time_range: timeRange,
      generated_at: new Date().toISOString(),
      summary: liveData,
      format
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sentinelx-analytics-${format}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const TabPanel = ({ children, value, index }) => (
    <div hidden={value !== index}>
      {value === index && children}
    </div>
  );

  const StatCard = ({ title, value, icon, trend, color = 'primary' }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography color="text.secondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', color: `${color}.main` }}>
              {value}
            </Typography>
            {trend && (
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                {trend > 0 ? 
                  <TrendingUpIcon color="success" sx={{ mr: 0.5 }} /> : 
                  <TrendingDownIcon color="error" sx={{ mr: 0.5 }} />
                }
                <Typography variant="body2" color={trend > 0 ? 'success.main' : 'error.main'}>
                  {Math.abs(trend)}% {trend > 0 ? 'increase' : 'decrease'}
                </Typography>
              </Box>
            )}
          </Box>
          <Box sx={{ color: `${color}.main` }}>
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AnalyticsIcon sx={{ fontSize: 32 }} />
            Analytics & Reports
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Comprehensive disaster intelligence analytics and performance metrics
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            disabled={loading}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={() => handleExport('pdf')}
          >
            Export Report
          </Button>
        </Box>
      </Box>

      {/* Loading Indicator */}
      {loading && <LinearProgress sx={{ mb: 2 }} />}

      {/* Key Metrics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Incidents"
            value={liveData.totalIncidents}
            icon={<AssessmentIcon sx={{ fontSize: 40 }} />}
            trend={8.5}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Resolved Cases"
            value={liveData.resolvedIncidents}
            icon={<TrendingUpIcon sx={{ fontSize: 40 }} />}
            trend={12.3}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Alerts"
            value={liveData.activeAlerts}
            icon={<TrendingDownIcon sx={{ fontSize: 40 }} />}
            trend={-5.2}
            color="warning"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="System Uptime"
            value={`${liveData.systemUptime}%`}
            icon={<PieChartIcon sx={{ fontSize: 40 }} />}
            trend={0.3}
            color="info"
          />
        </Grid>
      </Grid>

      {/* Analytics Tabs */}
      <Card>
        <CardContent sx={{ p: 0 }}>
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab label="Disaster Trends" icon={<TimelineIcon />} />
            <Tab label="Response Analytics" icon={<BarChartIcon />} />
            <Tab label="Regional Performance" icon={<MapIcon />} />
            <Tab label="Information Quality" icon={<AssessmentIcon />} />
          </Tabs>

          {/* Disaster Trends Tab */}
          <TabPanel value={activeTab} index={0}>
            <Box sx={{ p: 3 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} lg={8}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" fontWeight="bold" gutterBottom>
                        Disaster Incidents Over Time
                      </Typography>
                      <Box sx={{ height: 300 }}>
                        <Line data={disasterTrendData} options={chartOptions} />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} lg={4}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" fontWeight="bold" gutterBottom>
                        Incident Distribution
                      </Typography>
                      <Box sx={{ height: 300 }}>
                        <Doughnut data={incidentTypeData} options={doughnutOptions} />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12}>
                  <Alert severity="info" sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" fontWeight="bold">
                      Key Insights:
                    </Typography>
                    <Typography variant="body2">
                      • Flood incidents show seasonal peaks during monsoon months (July-September)
                      • Fire incidents are highest during summer months (March-June)
                      • Overall disaster response has improved by 15% compared to last year
                    </Typography>
                  </Alert>
                </Grid>
              </Grid>
            </Box>
          </TabPanel>

          {/* Response Analytics Tab */}
          <TabPanel value={activeTab} index={1}>
            <Box sx={{ p: 3 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" fontWeight="bold" gutterBottom>
                        Average Response Times
                      </Typography>
                      <Box sx={{ height: 300 }}>
                        <Bar data={responseTimeData} options={chartOptions} />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" fontWeight="bold" gutterBottom>
                        Response Efficiency Metrics
                      </Typography>
                      <Box sx={{ p: 2 }}>
                        <Box sx={{ mb: 3 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2">Emergency Services</Typography>
                            <Typography variant="body2" fontWeight="bold">92%</Typography>
                          </Box>
                          <LinearProgress variant="determinate" value={92} sx={{ height: 8, borderRadius: 4 }} />
                        </Box>
                        
                        <Box sx={{ mb: 3 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2">Medical Response</Typography>
                            <Typography variant="body2" fontWeight="bold">88%</Typography>
                          </Box>
                          <LinearProgress variant="determinate" value={88} sx={{ height: 8, borderRadius: 4 }} />
                        </Box>
                        
                        <Box sx={{ mb: 3 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2">Fire Department</Typography>
                            <Typography variant="body2" fontWeight="bold">95%</Typography>
                          </Box>
                          <LinearProgress variant="determinate" value={95} sx={{ height: 8, borderRadius: 4 }} />
                        </Box>
                        
                        <Box sx={{ mb: 3 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2">Rescue Teams</Typography>
                            <Typography variant="body2" fontWeight="bold">78%</Typography>
                          </Box>
                          <LinearProgress variant="determinate" value={78} sx={{ height: 8, borderRadius: 4 }} />
                        </Box>

                        <Divider sx={{ my: 2 }} />
                        
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="h3" fontWeight="bold" color="primary">
                            8.6
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Average Response Time (minutes)
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          </TabPanel>

          {/* Regional Performance Tab */}
          <TabPanel value={activeTab} index={2}>
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Regional Performance Metrics
              </Typography>
              
              <TableContainer component={Paper} sx={{ mt: 2 }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'grey.100' }}>
                      <TableCell><strong>Region</strong></TableCell>
                      <TableCell align="center"><strong>Total Incidents</strong></TableCell>
                      <TableCell align="center"><strong>Resolved</strong></TableCell>
                      <TableCell align="center"><strong>Avg Response Time</strong></TableCell>
                      <TableCell align="center"><strong>Performance Score</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {regionPerformanceData.map((row, index) => (
                      <TableRow key={index} sx={{ '&:hover': { bgcolor: 'grey.50' } }}>
                        <TableCell component="th" scope="row">
                          <Typography fontWeight="bold">{row.region}</Typography>
                        </TableCell>
                        <TableCell align="center">{row.incidents}</TableCell>
                        <TableCell align="center">
                          <Chip 
                            label={`${row.resolved}/${row.incidents}`}
                            color={row.resolved === row.incidents ? 'success' : 'warning'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="center">{row.responseTime}</TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                            <CircularProgress
                              variant="determinate"
                              value={row.score}
                              size={30}
                              thickness={6}
                              sx={{
                                color: row.score >= 90 ? 'success.main' : 
                                       row.score >= 80 ? 'warning.main' : 'error.main'
                              }}
                            />
                            <Typography variant="body2" fontWeight="bold">
                              {row.score}%
                            </Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </TabPanel>

          {/* Information Quality Tab */}
          <TabPanel value={activeTab} index={3}>
            <Box sx={{ p: 3 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} lg={8}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" fontWeight="bold" gutterBottom>
                        Misinformation Detection Over Time
                      </Typography>
                      <Box sx={{ height: 300 }}>
                        <Line data={misinformationData} options={chartOptions} />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} lg={4}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" fontWeight="bold" gutterBottom>
                        Information Quality Score
                      </Typography>
                      
                      <Box sx={{ textAlign: 'center', mb: 3 }}>
                        <Typography variant="h2" fontWeight="bold" color="success.main">
                          87%
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Overall Accuracy
                        </Typography>
                      </Box>

                      <Divider sx={{ my: 2 }} />
                      
                      <Box sx={{ space: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2">True Information</Typography>
                          <Typography variant="body2" fontWeight="bold" color="success.main">78%</Typography>
                        </Box>
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2">Misinformation Detected</Typography>
                          <Typography variant="body2" fontWeight="bold" color="error.main">18%</Typography>
                        </Box>
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2">Under Review</Typography>
                          <Typography variant="body2" fontWeight="bold" color="warning.main">4%</Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12}>
                  <Alert severity="success">
                    <Typography variant="subtitle2" fontWeight="bold">
                      AI Model Performance:
                    </Typography>
                    <Typography variant="body2">
                      • Misinformation detection accuracy: 94.2%
                      • Emotion analysis confidence: 89.8%
                      • Panic score correlation: 91.5%
                      • Real-time processing: &lt;200ms average
                    </Typography>
                  </Alert>
                </Grid>
              </Grid>
            </Box>
          </TabPanel>
        </CardContent>
      </Card>

      {/* Footer Stats */}
      <Paper sx={{ p: 2, mt: 3, bgcolor: 'primary.main', color: 'white' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={3}>
            <Typography variant="body2">
              <strong>Last Updated:</strong><br/>
              {liveData.lastUpdated.toLocaleString()}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Typography variant="body2">
              <strong>Data Sources:</strong><br/>
              5 Active APIs
            </Typography>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Typography variant="body2">
              <strong>Processing Rate:</strong><br/>
              {Math.floor(Math.random() * 50 + 150)} reports/min
            </Typography>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Typography variant="body2">
              <strong>System Health:</strong><br/>
              All Systems Operational
            </Typography>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default AnalyticsPage;