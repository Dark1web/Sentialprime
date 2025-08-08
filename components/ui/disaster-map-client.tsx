'use client'

import React, { useEffect, useState } from 'react'
import '../../styles/map.css'

interface DisasterData {
  id: string
  type: string
  title: string
  description?: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  status: string
  latitude: number
  longitude: number
  address?: string
  affected_population?: number
  casualties?: number
  created_at: string
}

interface DisasterMapClientProps {
  disasters: DisasterData[]
  center?: [number, number]
  zoom?: number
  height?: string
  onDisasterClick?: (disaster: DisasterData) => void
  showHeatmap?: boolean
  showClusters?: boolean
  className?: string
  enableSearch?: boolean
  enableLocation?: boolean
  enableFullscreen?: boolean
}

export default function DisasterMapClient({
  disasters,
  center = [39.8283, -98.5795],
  zoom = 4,
  height = '400px',
  onDisasterClick,
  className = '',
  enableSearch = true,
  enableLocation = true,
  enableFullscreen = true
}: DisasterMapClientProps) {
  const [mapLoaded, setMapLoaded] = useState(false)
  const [MapContainer, setMapContainer] = useState<any>(null)
  const [TileLayer, setTileLayer] = useState<any>(null)
  const [Marker, setMarker] = useState<any>(null)
  const [Popup, setPopup] = useState<any>(null)
  const [Circle, setCircle] = useState<any>(null)
  const [DivIcon, setDivIcon] = useState<any>(null)
  const [map, setMap] = useState<any>(null)
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null)
  const [locationWatchId, setLocationWatchId] = useState<number | null>(null)
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    // Dynamically import Leaflet components only on client side
    const loadMapComponents = async () => {
      try {
        const leaflet = await import('leaflet')
        const reactLeaflet = await import('react-leaflet')

        // Fix for default markers
        delete (leaflet.default.Icon.Default.prototype as any)._getIconUrl
        leaflet.default.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        })

        setMapContainer(() => reactLeaflet.MapContainer)
        setTileLayer(() => reactLeaflet.TileLayer)
        setMarker(() => reactLeaflet.Marker)
        setPopup(() => reactLeaflet.Popup)
        setCircle(() => reactLeaflet.Circle)
        setDivIcon(() => leaflet.default.DivIcon)
        setMapLoaded(true)
      } catch (error) {
        console.error('Failed to load map components:', error)
      }
    }

    loadMapComponents()
  }, [])

  // GPS Location tracking
  useEffect(() => {
    if (!enableLocation) return

    const startLocationTracking = () => {
      if ('geolocation' in navigator) {
        const watchId = navigator.geolocation.watchPosition(
          (position) => {
            const { latitude, longitude } = position.coords
            setUserLocation([latitude, longitude])
          },
          (error) => {
            console.warn('Location access denied or unavailable:', error)
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000
          }
        )
        setLocationWatchId(watchId)
      }
    }

    startLocationTracking()

    return () => {
      if (locationWatchId) {
        navigator.geolocation.clearWatch(locationWatchId)
      }
    }
  }, [enableLocation, locationWatchId])

  // Search functionality
  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    try {
      // Using Nominatim API for geocoding
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`
      )
      const results = await response.json()
      setSearchResults(results)
    } catch (error) {
      console.error('Search failed:', error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  const handleSearchResultClick = (result: any) => {
    if (map) {
      const lat = parseFloat(result.lat)
      const lon = parseFloat(result.lon)
      map.setView([lat, lon], 13)
      setSearchResults([])
    }
  }

  const centerOnUserLocation = () => {
    if (userLocation && map) {
      map.setView(userLocation, 15)
    }
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && isFullscreen) {
      setIsFullscreen(false)
    }
  }

  useEffect(() => {
    if (isFullscreen) {
      document.addEventListener('keydown', handleKeyPress)
      document.body.style.overflow = 'hidden'
    } else {
      document.removeEventListener('keydown', handleKeyPress)
      document.body.style.overflow = 'auto'
    }

    return () => {
      document.removeEventListener('keydown', handleKeyPress)
      document.body.style.overflow = 'auto'
    }
  }, [isFullscreen])

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return '#dc2626'
      case 'high': return '#ea580c'
      case 'medium': return '#d97706'
      case 'low': return '#65a30d'
      default: return '#6b7280'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getDisasterIcon = (disaster: DisasterData) => {
    if (!DivIcon) return null

    const color = getSeverityColor(disaster.severity)
    const iconType = getDisasterIconType(disaster.type)

    return new DivIcon({
      html: `
        <div class="custom-disaster-marker" style="
          background: ${color};
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          color: white;
          font-weight: bold;
        ">
          ${iconType}
        </div>
      `,
      className: 'custom-disaster-icon',
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -16]
    })
  }

  const getDisasterIconType = (type: string) => {
    const iconMap: { [key: string]: string } = {
      'Wildfire': '🔥',
      'Flood': '🌊',
      'Earthquake': '🌍',
      'Hurricane': '🌀',
      'Tornado': '🌪️',
      'Blizzard': '❄️',
      'Heatwave': '🌡️',
      'Drought': '🏜️',
      'Landslide': '⛰️',
      'Tsunami': '🌊',
      'Volcanic': '🌋',
      'Storm': '⛈️'
    }
    return iconMap[type] || '⚠️'
  }

  if (!mapLoaded || !MapContainer) {
    return (
      <div
        className={`bg-muted map-loading rounded-lg flex items-center justify-center ${className}`}
        style={{ height }}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-3"></div>
          <p className="text-sm font-medium text-muted-foreground">Loading interactive map...</p>
          <p className="text-xs text-muted-foreground mt-1">Preparing disaster visualization</p>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`relative w-full h-full ${className} ${
        isFullscreen
          ? 'fixed inset-0 z-[9999] bg-white dark:bg-slate-900'
          : ''
      }`}
      style={isFullscreen ? { height: '100vh' } : { height: '100%', width: '100%' }}
    >
      {/* Search Controls */}
      {enableSearch && (
        <div className="absolute top-4 left-4 z-[1000] flex flex-col gap-3 w-80">
          <div className="relative">
            <input
              type="text"
              placeholder="Search locations..."
              className="w-full px-4 py-3 pr-12 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm border border-slate-300 dark:border-slate-600 rounded-lg shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              onChange={(e) => {
                const query = e.target.value
                if (query.length > 2) {
                  handleSearch(query)
                } else {
                  setSearchResults([])
                }
              }}
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
              {isSearching ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
              ) : (
                <>
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                  </svg>
                </>
              )}
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm border border-slate-300 dark:border-slate-600 rounded-lg shadow-xl max-h-48 overflow-y-auto z-[1001]">
                {searchResults.map((result, index) => (
                  <button
                    key={index}
                    className="w-full px-4 py-3 text-left hover:bg-slate-100 dark:hover:bg-slate-700 border-b border-slate-200 dark:border-slate-600 last:border-b-0 text-sm"
                    onClick={() => handleSearchResultClick(result)}
                  >
                    <div className="font-medium text-slate-900 dark:text-white">{result.display_name}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">{result.type}</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Location Controls */}
          {enableLocation && (
            <div className="flex gap-2 mt-3">
              <button
                onClick={centerOnUserLocation}
                disabled={!userLocation}
                className="px-3 py-2 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm border border-slate-300 dark:border-slate-600 rounded-lg shadow-xl hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Center on my location"
              >
                <svg className="w-4 h-4 text-slate-600 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>

              {userLocation && (
                <div className="px-3 py-2 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-600 rounded-lg shadow-xl text-xs text-green-800 dark:text-green-300 flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                  Live GPS
                </div>
              )}

              {/* Fullscreen Toggle */}
              {enableFullscreen && (
                <button
                  onClick={toggleFullscreen}
                  className="px-3 py-2 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm border border-slate-300 dark:border-slate-600 rounded-lg shadow-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                  title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                >
                  {isFullscreen ? (
                    <svg className="w-4 h-4 text-slate-600 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 text-slate-600 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    </svg>
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      )}

      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        className="rounded-lg"
        whenCreated={setMap}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Disaster markers */}
        {disasters.map((disaster) => (
          <Marker
            key={disaster.id}
            position={[disaster.latitude, disaster.longitude]}
            icon={getDisasterIcon(disaster)}
            eventHandlers={{
              click: () => onDisasterClick?.(disaster)
            }}
          >
            <Popup>
              <div className="min-w-[280px] p-3">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">{getDisasterIconType(disaster.type)}</span>
                    <h3 className="font-semibold text-lg">{disaster.title}</h3>
                  </div>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium text-white flex-shrink-0`}
                    style={{ backgroundColor: getSeverityColor(disaster.severity) }}
                  >
                    {disaster.severity.toUpperCase()}
                  </span>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-700">Type:</span>
                    <span className="bg-gray-100 px-2 py-1 rounded text-xs">{disaster.type}</span>
                  </div>

                  {disaster.description && (
                    <div>
                      <span className="font-medium text-gray-700">Description:</span>
                      <p className="mt-1 text-gray-600 leading-relaxed">{disaster.description}</p>
                    </div>
                  )}

                  {disaster.address && (
                    <div>
                      <span className="font-medium text-gray-700">Location:</span>
                      <span className="text-gray-600">{disaster.address}</span>
                    </div>
                  )}

                  {disaster.affected_population && (
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-700">Affected Population:</span>
                      <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs font-medium">
                        {disaster.affected_population.toLocaleString()}
                      </span>
                    </div>
                  )}

                  {disaster.casualties && disaster.casualties > 0 && (
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-700">Casualties:</span>
                      <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-medium">
                        {disaster.casualties}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-700">Status:</span>
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                      {disaster.status}
                    </span>
                  </div>

                  <div>
                    <span className="font-medium text-gray-700">Reported:</span>
                    <span className="text-gray-600">{formatDate(disaster.created_at)}</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-200">
                  <button
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105"
                    onClick={() => onDisasterClick?.(disaster)}
                  >
                    View Full Details
                  </button>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* User Location Marker */}
        {userLocation && (
          <Marker
            position={userLocation}
            icon={new DivIcon({
              html: `
                <div style="
                  background: #3b82f6;
                  width: 20px;
                  height: 20px;
                  border-radius: 50%;
                  border: 3px solid white;
                  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                  position: relative;
                ">
                  <div style="
                    position: absolute;
                    top: -5px;
                    left: -5px;
                    width: 30px;
                    height: 30px;
                    border: 2px solid #3b82f6;
                    border-radius: 50%;
                    animation: pulse 2s infinite;
                    opacity: 0.6;
                  "></div>
                </div>
                <style>
                  @keyframes pulse {
                    0% { transform: scale(0.8); opacity: 0.6; }
                    50% { transform: scale(1.2); opacity: 0.3; }
                    100% { transform: scale(0.8); opacity: 0.6; }
                  }
                </style>
              `,
              className: 'user-location-marker',
              iconSize: [20, 20],
              iconAnchor: [10, 10],
            })}
          >
            <Popup>
              <div className="text-center p-2">
                <div className="flex items-center justify-center mb-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                  <span className="font-semibold text-blue-600">Your Location</span>
                </div>
                <div className="text-xs text-gray-600">
                  <div>Lat: {userLocation[0].toFixed(6)}</div>
                  <div>Lng: {userLocation[1].toFixed(6)}</div>
                </div>
                <div className="mt-2 text-xs text-green-600 flex items-center justify-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></div>
                  Live GPS Tracking
                </div>
              </div>
            </Popup>
          </Marker>
        )}

        {/* User Location Accuracy Circle */}
        {userLocation && Circle && (
          <Circle
            center={userLocation}
            radius={100}
            pathOptions={{
              color: '#3b82f6',
              fillColor: '#3b82f6',
              fillOpacity: 0.1,
              weight: 2,
              opacity: 0.5,
            }}
          />
        )}
      </MapContainer>
      
      {/* Enhanced Map Legend */}
      <div className="map-legend-container bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-lg p-4 shadow-xl border border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-sm text-slate-900 dark:text-white">Map Legend</h4>
          <div className="text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-full">
            {disasters.length} disasters
          </div>
        </div>

        {/* Severity Levels */}
        <div className="space-y-2 mb-4">
          <div className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">Severity Levels</div>
          {[
            { level: 'critical', color: '#dc2626', label: 'Critical', count: disasters.filter(d => d.severity === 'critical').length },
            { level: 'high', color: '#ea580c', label: 'High', count: disasters.filter(d => d.severity === 'high').length },
            { level: 'medium', color: '#d97706', label: 'Medium', count: disasters.filter(d => d.severity === 'medium').length },
            { level: 'low', color: '#65a30d', label: 'Low', count: disasters.filter(d => d.severity === 'low').length }
          ].map(({ level, color, label, count }) => (
            <div key={level} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div
                  className="w-3 h-3 rounded-full border-2 border-white shadow-sm"
                  style={{ backgroundColor: color }}
                ></div>
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{label}</span>
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full">
                {count}
              </span>
            </div>
          ))}
        </div>

        {/* Map Symbols */}
        <div className="space-y-2 border-t border-slate-200 dark:border-slate-600 pt-3">
          <div className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">Map Symbols</div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full border-2 border-white shadow-sm"></div>
              <span className="text-xs text-slate-700 dark:text-slate-300">Your Location</span>
            </div>
            {userLocation && (
              <span className="text-xs text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded-full">
                Live
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-lg">🔥🌊⛈️</span>
            <span className="text-xs text-slate-700 dark:text-slate-300">Disaster Types</span>
          </div>
        </div>
      </div>

      {/* Enhanced Status Badge */}
      <div className="map-status-badge">
        <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-lg p-3 shadow-xl border border-slate-200 dark:border-slate-700">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-semibold text-slate-900 dark:text-white">
              {disasters.length} Active
            </span>
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time monitoring
          </div>
        </div>
      </div>

      {/* Misinformation Monitor */}
      <div className="misinformation-monitor">
        <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-lg p-3 shadow-xl border border-slate-200 dark:border-slate-700">
          <div className="flex items-center space-x-2 mb-2">
            <svg className="w-4 h-4 text-slate-600 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Misinformation Monitor</span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span className="text-xs text-slate-600 dark:text-slate-400">0 Flagged</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span className="text-xs text-slate-600 dark:text-slate-400">1 Under Review</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-xs text-slate-600 dark:text-slate-400">0 Verified</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
