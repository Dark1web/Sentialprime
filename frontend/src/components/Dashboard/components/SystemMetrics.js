import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
  Chip,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Memory as MemoryIcon,
  Storage as StorageIcon,
  Speed as SpeedIcon,
  CloudQueue as CloudQueueIcon,
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';

const SystemMetrics = () => {
  const [lastUpdate, setLastUpdate] = React.useState(new Date());

  const systemData = {
    cpu: {
      usage: 68,
      cores: 8,
      load: [65, 72, 68, 70, 69],
      status: 'normal'
    },
    memory: {
      used: 12.4,
      total: 16,
      usage: 77.5,
      status: 'warning'
    },
    storage: {
      used: 240,
      total: 500,
      usage: 48,
      status: 'good'
    },
    network: {
      inbound: 145.2,
      outbound: 89.7,
      latency: 23,
      status: 'good'
    },
    services: {
      total: 12,
      running: 11,
      failed: 1,
      status: 'warning'
    },
    database: {
      connections: 89,
      maxConnections: 200,
      queryTime: 0.245,
      status: 'good'
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'good': return 'success';
      case 'normal': return 'info';
      case 'warning': return 'warning';
      case 'critical': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'good': return <CheckCircleIcon color="success" fontSize="small" />;
      case 'normal': return <CheckCircleIcon color="info" fontSize="small" />;
      case 'warning': return <TrendingUpIcon color="warning" fontSize="small" />;
      case 'critical': return <TrendingUpIcon color="error" fontSize="small" />;
      default: return null;
    }
  };

  const handleRefresh = () => {
    setLastUpdate(new Date());
  };

  const MetricItem = ({ icon: Icon, label, value, unit, usage, status, details }) => (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Icon fontSize="small" color="primary" />
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {label}
          </Typography>
          {getStatusIcon(status)}
        </Box>
        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
          {value} {unit}
        </Typography>
      </Box>
      
      {usage !== undefined && (
        <LinearProgress
          variant="determinate"
          value={usage}
          color={getStatusColor(status)}
          sx={{ height: 6, borderRadius: 3, mb: 0.5 }}
        />
      )}
      
      {details && (
        <Typography variant="caption" color="text.secondary">
          {details}
        </Typography>
      )}
    </Box>
  );

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            System Metrics
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip 
              icon={<CheckCircleIcon />}
              label="94% Health" 
              color="success" 
              size="small"
            />
            <Tooltip title="Refresh metrics">
              <IconButton size="small" onClick={handleRefresh}>
                <RefreshIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* System Health Overview */}
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr', 
          gap: 1, 
          mb: 3,
          p: 2,
          backgroundColor: 'rgba(76, 175, 80, 0.05)',
          borderRadius: 2
        }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" color="success.main" sx={{ fontWeight: 'bold' }}>
              {systemData.services.running}/{systemData.services.total}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Services Running
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" color="info.main" sx={{ fontWeight: 'bold' }}>
              {systemData.network.latency}ms
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Avg Latency
            </Typography>
          </Box>
        </Box>

        {/* Detailed Metrics */}
        <MetricItem
          icon={SpeedIcon}
          label="CPU Usage"
          value={systemData.cpu.usage}
          unit="%"
          usage={systemData.cpu.usage}
          status={systemData.cpu.status}
          details={`${systemData.cpu.cores} cores, load avg: ${systemData.cpu.load.slice(-1)[0]}%`}
        />

        <MetricItem
          icon={MemoryIcon}
          label="Memory"
          value={systemData.memory.used}
          unit={`GB / ${systemData.memory.total}GB`}
          usage={systemData.memory.usage}
          status={systemData.memory.status}
          details={`${systemData.memory.usage.toFixed(1)}% utilized`}
        />

        <MetricItem
          icon={StorageIcon}
          label="Storage"
          value={systemData.storage.used}
          unit={`GB / ${systemData.storage.total}GB`}
          usage={systemData.storage.usage}
          status={systemData.storage.status}
          details={`${(systemData.storage.total - systemData.storage.used)}GB available`}
        />

        <MetricItem
          icon={CloudQueueIcon}
          label="Network I/O"
          value={`↓${systemData.network.inbound} / ↑${systemData.network.outbound}`}
          unit="MB/s"
          status={systemData.network.status}
          details={`Latency: ${systemData.network.latency}ms`}
        />

        {/* Database Metrics */}
        <Box sx={{ 
          mt: 2, 
          p: 2, 
          backgroundColor: 'rgba(33, 150, 243, 0.05)', 
          borderRadius: 2
        }}>
          <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
            Database Performance
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <Box>
              <Typography variant="caption" color="text.secondary" display="block">
                Active Connections
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                {systemData.database.connections}/{systemData.database.maxConnections}
              </Typography>
              <LinearProgress
                variant="determinate"
                value={(systemData.database.connections / systemData.database.maxConnections) * 100}
                color="info"
                sx={{ height: 4, borderRadius: 2, mt: 0.5 }}
              />
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary" display="block">
                Avg Query Time
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                {systemData.database.queryTime}s
              </Typography>
              <Typography variant="caption" color="success.main">
                ✓ Within normal range
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Last Update */}
        <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block', textAlign: 'center' }}>
          Last updated: {lastUpdate.toLocaleTimeString()}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default SystemMetrics;