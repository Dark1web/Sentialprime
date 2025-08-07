import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  IconButton,
  Box,
  Typography
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Warning as WarningIcon,
  Healing as HealingIcon,
  NetworkCheck as NetworkIcon,
  VerifiedUser as VerifiedUserIcon,
  Explore as ExploreIcon,
  Visibility as VisibilityIcon,
  BarChart as BarChartIcon,
  ChevronLeft as ChevronLeftIcon,
  AccountCircle as AccountCircleIcon
} from '@mui/icons-material';
import { NavLink } from 'react-router-dom';

const navItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  { text: 'Misinformation', icon: <WarningIcon />, path: '/misinformation' },
  { text: 'Triage Center', icon: <HealingIcon />, path: '/triage' },
  { text: 'Network Map', icon: <NetworkIcon />, path: '/network' },
  { text: 'Fact Check', icon: <VerifiedUserIcon />, path: '/factcheck' },
  { text: 'Navigation', icon: <ExploreIcon />, path: '/navigation' },
  { text: 'AR Simulation', icon: <VisibilityIcon />, path: '/ar-simulation' },
  { text: 'Analytics', icon: <BarChartIcon />, path: '/analytics' },
  { text: 'Account', icon: <AccountCircleIcon />, path: '/account' },
];

const Sidebar = ({ open, onToggle }) => {
  return (
    <Drawer
      variant="persistent"
      anchor="left"
      open={open}
      sx={{
        width: 240,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 240,
          boxSizing: 'border-box',
          backgroundColor: '#1a237e',
          color: 'white',
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 1,
        }}
      >
        <Typography variant="h6" sx={{ ml: 1 }}>
          SentinelX
        </Typography>
        <IconButton onClick={onToggle} sx={{ color: 'white' }}>
          <ChevronLeftIcon />
        </IconButton>
      </Box>
      <Divider sx={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }} />
      <List>
        {navItems.map((item) => (
          <ListItem
            button
            key={item.text}
            component={NavLink}
            to={item.path}
            sx={{
              '&.active': {
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
              },
            }}
          >
            <ListItemIcon sx={{ color: 'white' }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
};

export default Sidebar;