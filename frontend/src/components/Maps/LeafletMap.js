import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap, useMapEvents } from 'react-leaflet';
import {
  Box,
  Card,
  Typography,
  Chip,
  Button,
  IconButton,
  Tooltip,
  Alert
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  Warning as WarningIcon,
  LocalFireDepartment as FireIcon,
  Water as FloodIcon,
  Forest as VegetationIcon,
  MyLocation as MyLocationIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon
} from '@mui/icons-material';
import L from 'leaflet';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icons
const createCustomIcon = (color, icon) => {
  return L.divIcon({
    html: `<div style="background-color: ${color}; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">
      <span style="color: white; font-size: 16px;">${icon}</span>
    </div>`,
    className: 'custom-marker',
    iconSize: [30, 30],
    iconAnchor: [15, 15]
  });
};

const disasterIcons = {
  flood: createCustomIcon('#2196F3', '🌊'),
  fire: createCustomIcon('#F44336', '🔥'),
  earthquake: createCustomIcon('#795548', '🏠'),
  storm: createCustomIcon('#9C27B0', '⛈️'),
  safe_zone: createCustomIcon('#4CAF50', '🏥'),
  danger_zone: createCustomIcon('#FF5722', '⚠️'),
  user_location: createCustomIcon('#FF9800', '📍')
};

// Component to handle map events
const MapEventHandler = ({ onLocationSelect, onMapClick }) => {
  useMapEvents({
    click(e) {
      if (onLocationSelect) {
        onLocationSelect(e.latlng);
      }
      if (onMapClick) {
        onMapClick(e.latlng);
      }
    }
  });
  return null;
};

// Component to control map programmatically
const MapController = ({ center, zoom }) => {
  const map = useMap();
  
  useEffect(() => {
    if (center) {
      map.setView(center, zoom || map.getZoom());
    }
  }, [center, zoom, map]);
  
  return null;
};

const LeafletMap = ({
  center = [28.6139, 77.2090], // Delhi coordinates
  zoom = 10,
  height = '400px',
  markers = [],
  disasters = [],
  safeZones = [],
  onLocationSelect,
  onMarkerClick,
  showUserLocation = true,
  interactive = true,
  showControls = true,
  className
}) => {
  const [userLocation, setUserLocation] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [mapCenter, setMapCenter] = useState(center);
  const [mapZoom, setMapZoom] = useState(zoom);
  const mapRef = useRef();

  // Get user's current location
  useEffect(() => {
    if (showUserLocation && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = [position.coords.latitude, position.coords.longitude];
          setUserLocation(location);
        },
        (error) => {
          console.warn('Error getting user location:', error);
        }
      );
    }
  }, [showUserLocation]);

  const handleLocationSelect = (latlng) => {
    setSelectedLocation([latlng.lat, latlng.lng]);
    if (onLocationSelect) {
      onLocationSelect(latlng);
    }
  };

  const handleMarkerClick = (marker, event) => {
    if (onMarkerClick) {
      onMarkerClick(marker, event);
    }
  };

  const centerOnUserLocation = () => {
    if (userLocation) {
      setMapCenter(userLocation);
      setMapZoom(15);
    }
  };

  const zoomIn = () => {
    setMapZoom(prev => Math.min(prev + 1, 18));
  };

  const zoomOut = () => {
    setMapZoom(prev => Math.max(prev - 1, 1));
  };

  return (
    <Box className={className} sx={{ position: 'relative', height }}>
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        style={{ height: '100%', width: '100%' }}
        ref={mapRef}
      >
        {/* Tile Layer */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Map Event Handler */}
        <MapEventHandler 
          onLocationSelect={interactive ? handleLocationSelect : null}
        />

        {/* Map Controller */}
        <MapController center={mapCenter} zoom={mapZoom} />

        {/* User Location Marker */}
        {userLocation && (
          <Marker position={userLocation} icon={disasterIcons.user_location}>
            <Popup>
              <Box>
                <Typography variant="subtitle2" fontWeight="bold">
                  Your Location
                </Typography>
                <Typography variant="body2">
                  Lat: {userLocation[0].toFixed(4)}, Lng: {userLocation[1].toFixed(4)}
                </Typography>
              </Box>
            </Popup>
          </Marker>
        )}

        {/* Selected Location Marker */}
        {selectedLocation && (
          <Marker position={selectedLocation}>
            <Popup>
              <Box>
                <Typography variant="subtitle2" fontWeight="bold">
                  Selected Location
                </Typography>
                <Typography variant="body2">
                  Lat: {selectedLocation[0].toFixed(4)}, Lng: {selectedLocation[1].toFixed(4)}
                </Typography>
              </Box>
            </Popup>
          </Marker>
        )}

        {/* Custom Markers */}
        {markers.map((marker, index) => (
          <Marker
            key={marker.id || index}
            position={[marker.lat, marker.lng]}
            icon={marker.icon || disasterIcons[marker.type] || undefined}
            eventHandlers={{
              click: (e) => handleMarkerClick(marker, e)
            }}
          >
            <Popup>
              <Card sx={{ minWidth: 200, boxShadow: 'none' }}>
                <Box p={1}>
                  <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                    {marker.title || 'Location'}
                  </Typography>
                  
                  {marker.type && (
                    <Chip 
                      label={marker.type.replace('_', ' ')} 
                      size="small" 
                      sx={{ mb: 1 }}
                      color={
                        marker.type.includes('danger') ? 'error' :
                        marker.type.includes('safe') ? 'success' : 'primary'
                      }
                    />
                  )}
                  
                  {marker.description && (
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {marker.description}
                    </Typography>
                  )}
                  
                  {marker.risk_level && (
                    <Alert 
                      severity={
                        marker.risk_level === 'CRITICAL' ? 'error' :
                        marker.risk_level === 'HIGH' ? 'warning' :
                        marker.risk_level === 'MEDIUM' ? 'info' : 'success'
                      }
                      sx={{ mt: 1 }}
                    >
                      Risk Level: {marker.risk_level}
                    </Alert>
                  )}
                  
                  {marker.data && (
                    <Box mt={1}>
                      {Object.entries(marker.data).map(([key, value]) => (
                        <Typography key={key} variant="body2">
                          <strong>{key}:</strong> {value}
                        </Typography>
                      ))}
                    </Box>
                  )}
                </Box>
              </Card>
            </Popup>
          </Marker>
        ))}

        {/* Disaster Zones */}
        {disasters.map((disaster, index) => (
          <Circle
            key={disaster.id || index}
            center={[disaster.lat, disaster.lng]}
            radius={disaster.radius || 1000}
            pathOptions={{
              color: disaster.type === 'fire' ? '#F44336' : 
                     disaster.type === 'flood' ? '#2196F3' : '#FF5722',
              fillColor: disaster.type === 'fire' ? '#F44336' : 
                        disaster.type === 'flood' ? '#2196F3' : '#FF5722',
              fillOpacity: 0.2
            }}
          >
            <Popup>
              <Box>
                <Typography variant="subtitle2" fontWeight="bold">
                  {disaster.type.charAt(0).toUpperCase() + disaster.type.slice(1)} Zone
                </Typography>
                <Typography variant="body2">
                  Severity: {disaster.severity || 'Unknown'}
                </Typography>
                {disaster.last_updated && (
                  <Typography variant="body2">
                    Last Updated: {new Date(disaster.last_updated).toLocaleString()}
                  </Typography>
                )}
              </Box>
            </Popup>
          </Circle>
        ))}

        {/* Safe Zones */}
        {safeZones.map((zone, index) => (
          <Circle
            key={zone.id || index}
            center={[zone.lat, zone.lng]}
            radius={zone.radius || 500}
            pathOptions={{
              color: '#4CAF50',
              fillColor: '#4CAF50',
              fillOpacity: 0.2
            }}
          >
            <Popup>
              <Box>
                <Typography variant="subtitle2" fontWeight="bold">
                  {zone.name || 'Safe Zone'}
                </Typography>
                <Typography variant="body2">
                  Type: {zone.type || 'Shelter'}
                </Typography>
                {zone.capacity && (
                  <Typography variant="body2">
                    Capacity: {zone.available || 0}/{zone.capacity}
                  </Typography>
                )}
              </Box>
            </Popup>
          </Circle>
        ))}
      </MapContainer>

      {/* Map Controls */}
      {showControls && (
        <Box
          sx={{
            position: 'absolute',
            top: 10,
            right: 10,
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            gap: 1
          }}
        >
          {userLocation && (
            <Tooltip title="Center on my location">
              <IconButton
                onClick={centerOnUserLocation}
                sx={{
                  bgcolor: 'white',
                  boxShadow: 1,
                  '&:hover': { bgcolor: 'grey.100' }
                }}
              >
                <MyLocationIcon />
              </IconButton>
            </Tooltip>
          )}
          
          <Tooltip title="Zoom in">
            <IconButton
              onClick={zoomIn}
              sx={{
                bgcolor: 'white',
                boxShadow: 1,
                '&:hover': { bgcolor: 'grey.100' }
              }}
            >
              <ZoomInIcon />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Zoom out">
            <IconButton
              onClick={zoomOut}
              sx={{
                bgcolor: 'white',
                boxShadow: 1,
                '&:hover': { bgcolor: 'grey.100' }
              }}
            >
              <ZoomOutIcon />
            </IconButton>
          </Tooltip>
        </Box>
      )}

      {/* Legend */}
      {(disasters.length > 0 || safeZones.length > 0 || markers.length > 0) && (
        <Card
          sx={{
            position: 'absolute',
            bottom: 10,
            left: 10,
            zIndex: 1000,
            p: 1,
            minWidth: 150
          }}
        >
          <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
            Legend
          </Typography>
          
          {userLocation && (
            <Box display="flex" alignItems="center" mb={0.5}>
              <Box sx={{ width: 12, height: 12, bgcolor: '#FF9800', borderRadius: '50%', mr: 1 }} />
              <Typography variant="body2">Your Location</Typography>
            </Box>
          )}
          
          {disasters.some(d => d.type === 'flood') && (
            <Box display="flex" alignItems="center" mb={0.5}>
              <Box sx={{ width: 12, height: 12, bgcolor: '#2196F3', borderRadius: '50%', mr: 1 }} />
              <Typography variant="body2">Flood Zone</Typography>
            </Box>
          )}
          
          {disasters.some(d => d.type === 'fire') && (
            <Box display="flex" alignItems="center" mb={0.5}>
              <Box sx={{ width: 12, height: 12, bgcolor: '#F44336', borderRadius: '50%', mr: 1 }} />
              <Typography variant="body2">Fire Zone</Typography>
            </Box>
          )}
          
          {safeZones.length > 0 && (
            <Box display="flex" alignItems="center">
              <Box sx={{ width: 12, height: 12, bgcolor: '#4CAF50', borderRadius: '50%', mr: 1 }} />
              <Typography variant="body2">Safe Zone</Typography>
            </Box>
          )}
        </Card>
      )}
    </Box>
  );
};

export default LeafletMap;