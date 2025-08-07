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

const SystemMetrics = ({ systemData }) => {
  const [lastUpdate, setLastUpdate] = React.useState(new Date());

  const data = systemData || {
    cpu: {},
    memory: {},
    storage: {},
    network: {},
    services: {},
    database: {}
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
              label={`${data.systemHealth || 'N/A'}% Health`} 
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
              {`${data.services.running || 'N/A'}/${data.services.total || 'N/A'}`}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Services Running
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" color="info.main" sx={{ fontWeight: 'bold' }}>
              {`${data.network.latency || 'N/A'}ms`}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Avg Latency
            </Typography>
          </Box>
        </Box>

        <MetricItem
          icon={SpeedIcon}
          label="CPU Usage"
          value={data.cpu.usage || 'N/A'}
          unit="%"
          usage={data.cpu.usage}
          status={data.cpu.status}
          details={`${data.cpu.cores || 'N/A'} cores, load avg: ${data.cpu.load?.slice(-1)[0] || 'N/A'}%`}
        />

        <MetricItem
          icon={MemoryIcon}
          label="Memory"
          value={data.memory.used || 'N/A'}
          unit={`GB / ${data.memory.total || 'N/A'}GB`}
          usage={data.memory.usage}
          status={data.memory.status}
          details={`${(data.memory.usage || 0).toFixed(1)}% utilized`}
        />

        <MetricItem
          icon={StorageIcon}
          label="Storage"
          value={data.storage.used || 'N/A'}
          unit={`GB / ${data.storage.total || 'N/A'}GB`}
          usage={data.storage.usage}
          status={data.storage.status}
          details={`${(data.storage.total - data.storage.used) || 'N/A'}GB available`}
        />

        <MetricItem
          icon={CloudQueueIcon}
          label="Network I/O"
          value={`↓${data.network.inbound || 'N/A'} / ↑${data.network.outbound || 'N/A'}`}
          unit="MB/s"
          status={data.network.status}
          details={`Latency: ${data.network.latency || 'N/A'}ms`}
        />

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
                {`${data.database.connections || 'N/A'}/${data.database.maxConnections || 'N/A'}`}
              </Typography>
              <LinearProgress
                variant="determinate"
                value={((data.database.connections / data.database.maxConnections) * 100) || 0}
                color="info"
                sx={{ height: 4, borderRadius: 2, mt: 0.5 }}
              />
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary" display="block">
                Avg Query Time
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                {`${data.database.queryTime || 'N/A'}s`}
              </Typography>
              <Typography variant="caption" color="success.main">
                ✓ Within normal range
              </Typography>
            </Box>
          </Box>
        </Box>

        <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block', textAlign: 'center' }}>
          Last updated: {lastUpdate.toLocaleTimeString()}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default SystemMetrics;