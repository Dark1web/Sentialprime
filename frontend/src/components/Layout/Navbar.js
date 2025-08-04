import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Badge,
  Box,
  Chip,
  useTheme,
  Menu,
  MenuItem,
  Avatar,
  Divider,
  ListItemIcon
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  AccountCircle as AccountCircleIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const Navbar = ({ onMenuClick }) => {
  const theme = useTheme();
  const { user, userDisplayName, signOut } = useAuth();
  const [systemStatus] = React.useState('operational'); // online, degraded, offline
  const [userMenuAnchor, setUserMenuAnchor] = useState(null);

  const getStatusColor = () => {
    switch (systemStatus) {
      case 'operational': return theme.palette.success.main;
      case 'degraded': return theme.palette.warning.main;
      case 'offline': return theme.palette.error.main;
      default: return theme.palette.grey[500];
    }
  };

  const getStatusIcon = () => {
    switch (systemStatus) {
      case 'operational': return <CheckCircleIcon sx={{ fontSize: 16 }} />;
      case 'degraded': return <WarningIcon sx={{ fontSize: 16 }} />;
      case 'offline': return <WarningIcon sx={{ fontSize: 16 }} />;
      default: return null;
    }
  };

  const handleUserMenuOpen = (event) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  const handleLogout = async () => {
    await signOut();
    handleUserMenuClose();
  };

  const getUserInitials = () => {
    if (!userDisplayName) return 'U';
    const names = userDisplayName.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return names[0][0].toUpperCase();
  };

  return (
    <AppBar 
      position="static" 
      elevation={1}
      sx={{ 
        backgroundColor: 'white',
        borderBottom: '1px solid #e0e0e0'
      }}
    >
      <Toolbar>
        <IconButton
          edge="start"
          color="primary"
          aria-label="menu"
          onClick={onMenuClick}
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>
        
        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              color: 'primary.main',
              fontWeight: 'bold',
              mr: 2
            }}
          >
            SentinelX
          </Typography>
          
          <Chip
            icon={getStatusIcon()}
            label={`System ${systemStatus.charAt(0).toUpperCase() + systemStatus.slice(1)}`}
            size="small"
            sx={{
              backgroundColor: getStatusColor(),
              color: 'white',
              '& .MuiChip-icon': {
                color: 'white'
              }
            }}
          />
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2" color="text.secondary">
            {new Date().toLocaleString()}
          </Typography>
          
          <IconButton color="primary">
            <Badge badgeContent={3} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>

          {/* User Menu */}
          <IconButton
            onClick={handleUserMenuOpen}
            sx={{ ml: 1 }}
          >
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
              {getUserInitials()}
            </Avatar>
          </IconButton>

          <Menu
            anchorEl={userMenuAnchor}
            open={Boolean(userMenuAnchor)}
            onClose={handleUserMenuClose}
            onClick={handleUserMenuClose}
            PaperProps={{
              elevation: 3,
              sx: {
                mt: 1.5,
                minWidth: 200,
                '& .MuiAvatar-root': {
                  width: 32,
                  height: 32,
                  ml: -0.5,
                  mr: 1,
                },
              },
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <MenuItem>
              <Avatar sx={{ bgcolor: 'primary.main' }}>{getUserInitials()}</Avatar>
              <Box>
                <Typography variant="subtitle2">{userDisplayName}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {user?.email}
                </Typography>
              </Box>
            </MenuItem>
            
            <Divider />
            
            <MenuItem onClick={handleUserMenuClose}>
              <ListItemIcon>
                <PersonIcon fontSize="small" />
              </ListItemIcon>
              Profile
            </MenuItem>
            
            <MenuItem onClick={handleUserMenuClose}>
              <ListItemIcon>
                <SettingsIcon fontSize="small" />
              </ListItemIcon>
              Settings
            </MenuItem>
            
            <Divider />
            
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              Logout
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;