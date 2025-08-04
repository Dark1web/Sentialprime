import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  Divider,
  Collapse,
  Badge
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Security as SecurityIcon,
  LocalHospital as LocalHospitalIcon,
  NetworkCheck as NetworkCheckIcon,
  FactCheck as FactCheckIcon,
  Navigation as NavigationIcon,
  ViewInAr as ViewInArIcon,
  Analytics as AnalyticsIcon,
  ExpandLess,
  ExpandMore,
  Warning as WarningIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';

const DRAWER_WIDTH = 280;

const menuItems = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: DashboardIcon,
    path: '/dashboard',
    badge: null
  },
  {
    id: 'monitoring',
    label: 'Monitoring & Detection',
    icon: SecurityIcon,
    children: [
      {
        id: 'misinformation',
        label: 'Misinformation Filter',
        icon: WarningIcon,
        path: '/misinformation',
        badge: 12
      },
      {
        id: 'factcheck',
        label: 'Fact Check Center',
        icon: FactCheckIcon,
        path: '/factcheck',
        badge: 5
      }
    ]
  },
  {
    id: 'response',
    label: 'Emergency Response',
    icon: LocalHospitalIcon,
    children: [
      {
        id: 'triage',
        label: 'Auto-Triage Center',
        icon: LocalHospitalIcon,
        path: '/triage',
        badge: 8
      },
      {
        id: 'navigation',
        label: 'Navigation Assistant',
        icon: NavigationIcon,
        path: '/navigation',
        badge: null
      }
    ]
  },
  {
    id: 'infrastructure',
    label: 'Infrastructure',
    icon: NetworkCheckIcon,
    children: [
      {
        id: 'network',
        label: 'Network Outage Map',
        icon: NetworkCheckIcon,
        path: '/network',
        badge: 3
      }
    ]
  },
  {
    id: 'simulation',
    label: 'AR Simulation',
    icon: ViewInArIcon,
    path: '/ar-simulation',
    badge: null
  },
  {
    id: 'analytics',
    label: 'Analytics & Reports',
    icon: AnalyticsIcon,
    path: '/analytics',
    badge: null
  }
];

const Sidebar = ({ open, onToggle }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedItems, setExpandedItems] = React.useState(['monitoring', 'response']);

  const handleItemClick = (item) => {
    if (item.children) {
      const isExpanded = expandedItems.includes(item.id);
      setExpandedItems(
        isExpanded 
          ? expandedItems.filter(id => id !== item.id)
          : [...expandedItems, item.id]
      );
    } else if (item.path) {
      navigate(item.path);
    }
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const renderMenuItem = (item, depth = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.id);
    const active = item.path && isActive(item.path);

    return (
      <React.Fragment key={item.id}>
        <ListItem disablePadding>
          <ListItemButton
            onClick={() => handleItemClick(item)}
            sx={{
              pl: 2 + depth * 2,
              backgroundColor: active ? 'rgba(25, 118, 210, 0.08)' : 'transparent',
              borderRight: active ? '3px solid #1976d2' : 'none',
              '&:hover': {
                backgroundColor: 'rgba(25, 118, 210, 0.04)',
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              {item.badge ? (
                <Badge badgeContent={item.badge} color="error">
                  <item.icon color={active ? 'primary' : 'inherit'} />
                </Badge>
              ) : (
                <item.icon color={active ? 'primary' : 'inherit'} />
              )}
            </ListItemIcon>
            <ListItemText 
              primary={item.label}
              primaryTypographyProps={{
                variant: 'body2',
                fontWeight: active ? 600 : 400,
                color: active ? 'primary.main' : 'text.primary'
              }}
            />
            {hasChildren && (
              isExpanded ? <ExpandLess /> : <ExpandMore />
            )}
          </ListItemButton>
        </ListItem>
        
        {hasChildren && (
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {item.children.map(child => renderMenuItem(child, depth + 1))}
            </List>
          </Collapse>
        )}
      </React.Fragment>
    );
  };

  return (
    <Drawer
      variant="persistent"
      anchor="left"
      open={open}
      sx={{
        width: open ? DRAWER_WIDTH : 0,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
          borderRight: '1px solid #e0e0e0',
          backgroundColor: '#fafafa'
        },
      }}
    >
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          🛡️ SentinelX
        </Typography>
        <Typography variant="caption" color="text.secondary">
          AI Disaster Intelligence System
        </Typography>
      </Box>
      
      <Divider />
      
      <List sx={{ flexGrow: 1, pt: 1 }}>
        {menuItems.map(item => renderMenuItem(item))}
      </List>

      <Divider />
      
      <Box sx={{ p: 2 }}>
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1,
            p: 1,
            backgroundColor: 'rgba(76, 175, 80, 0.1)',
            borderRadius: 1
          }}
        >
          <TrendingUpIcon color="success" fontSize="small" />
          <Box>
            <Typography variant="caption" display="block" fontWeight="bold">
              System Health: 94%
            </Typography>
            <Typography variant="caption" color="text.secondary">
              All modules operational
            </Typography>
          </Box>
        </Box>
      </Box>
    </Drawer>
  );
};

export default Sidebar;