import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Custom icons for different report categories
const createCategoryIcon = (category, credibility) => {
  const colors = {
    fire: '#ff4444',
    flood: '#4444ff',
    earthquake: '#ff8800',
    medical: '#ff44ff',
    general: '#888888'
  };
  
  const opacity = credibility === 'high' ? 1.0 : credibility === 'medium' ? 0.7 : 0.4;
  
  return L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="background-color: ${colors[category] || colors.general}; 
                      width: 20px; height: 20px; border-radius: 50%; 
                      border: 2px solid white; opacity: ${opacity};
                      box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  });
};

const LocationPicker = ({ onLocationSelect, initialPosition }) => {
  const [position, setPosition] = useState(initialPosition);

  const MapEvents = () => {
    useMapEvents({
      click(e) {
        const newPos = [e.latlng.lat, e.latlng.lng];
        setPosition(newPos);
        onLocationSelect(e.latlng.lat, e.latlng.lng);
      },
    });
    return null;
  };

  return (
    <>
      <MapEvents />
      {position && (
        <Marker position={position}>
          <Popup>Selected location: {position[0].toFixed(4)}, {position[1].toFixed(4)}</Popup>
        </Marker>
      )}
    </>
  );
};

const CommunityReporting = () => {
  const [formData, setFormData] = useState({
    text: '',
    lat: null,
    lng: null,
    location_name: '',
    category: 'general'
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState(null);
  const [reports, setReports] = useState([]);
  const [mapCenter, setMapCenter] = useState([28.6139, 77.2090]); // Delhi default
  const [showReportForm, setShowReportForm] = useState(false);

  // Get user location on component mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setMapCenter([lat, lng]);
          setFormData(prev => ({ ...prev, lat, lng }));
        },
        (error) => {
          console.log('Location access denied or unavailable');
        }
      );
    }
    
    // Load existing reports
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/community/reports?min_credibility=0.3');
      if (response.ok) {
        const data = await response.json();
        setReports(data.reports || []);
      }
    } catch (error) {
      console.error('Failed to fetch reports:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLocationSelect = (lat, lng) => {
    setFormData(prev => ({ ...prev, lat, lng }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.text.trim() || !formData.lat || !formData.lng) {
      alert('Please provide description and location');
      return;
    }

    setIsSubmitting(true);
    setSubmitResult(null);

    try {
      const submitFormData = new FormData();
      submitFormData.append('text', formData.text);
      submitFormData.append('lat', formData.lat);
      submitFormData.append('lng', formData.lng);
      submitFormData.append('location_name', formData.location_name);
      submitFormData.append('category', formData.category);
      
      if (selectedImage) {
        submitFormData.append('image', selectedImage);
      }

      const response = await fetch('http://localhost:8000/api/community/submit', {
        method: 'POST',
        body: submitFormData,
      });

      if (response.ok) {
        const result = await response.json();
        setSubmitResult({
          success: true,
          message: 'Report submitted successfully!',
          data: result
        });
        
        // Reset form
        setFormData({
          text: '',
          lat: formData.lat, // Keep location
          lng: formData.lng,
          location_name: '',
          category: 'general'
        });
        setSelectedImage(null);
        setImagePreview(null);
        setShowReportForm(false);
        
        // Refresh reports
        fetchReports();
      } else {
        const error = await response.json();
        setSubmitResult({
          success: false,
          message: error.detail || 'Failed to submit report'
        });
      }
    } catch (error) {
      setSubmitResult({
        success: false,
        message: 'Network error: ' + error.message
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCredibilityColor = (level) => {
    switch (level) {
      case 'high': return '#4CAF50';
      case 'medium': return '#FF9800';
      case 'low': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  const getCategoryEmoji = (category) => {
    const emojis = {
      fire: '🔥',
      flood: '🌊',
      earthquake: '🌍',
      medical: '🏥',
      general: '📍'
    };
    return emojis[category] || emojis.general;
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>🌍 Community Disaster Reporting</h1>
      <p>Help your community by reporting disasters and emergencies with AI-powered credibility verification.</p>

      {/* Action Buttons */}
      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={() => setShowReportForm(!showReportForm)}
          style={{
            backgroundColor: '#2196F3',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '4px',
            cursor: 'pointer',
            marginRight: '10px',
            fontSize: '16px'
          }}
        >
          {showReportForm ? '📋 View Reports' : '📝 Submit Report'}
        </button>
        
        <button
          onClick={fetchReports}
          style={{
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          🔄 Refresh Reports
        </button>
      </div>

      {/* Report Submission Form */}
      {showReportForm && (
        <div style={{
          backgroundColor: '#f5f5f5',
          padding: '20px',
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          <h2>📝 Submit New Report</h2>
          
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                📝 Description *
              </label>
              <textarea
                name="text"
                value={formData.text}
                onChange={handleInputChange}
                placeholder="Describe what you're witnessing... (e.g., 'Heavy flooding on Main Street, water level rising')"
                required
                style={{
                  width: '100%',
                  minHeight: '100px',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  📍 Location Name
                </label>
                <input
                  type="text"
                  name="location_name"
                  value={formData.location_name}
                  onChange={handleInputChange}
                  placeholder="e.g., Downtown Mumbai, Near City Hospital"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px'
                  }}
                />
              </div>

              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  🏷️ Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px'
                  }}
                >
                  <option value="general">📍 General</option>
                  <option value="fire">🔥 Fire</option>
                  <option value="flood">🌊 Flood</option>
                  <option value="earthquake">🌍 Earthquake</option>
                  <option value="medical">🏥 Medical Emergency</option>
                </select>
              </div>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                📷 Photo (Optional)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px'
                }}
              />
              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="Preview"
                  style={{
                    marginTop: '10px',
                    maxWidth: '200px',
                    maxHeight: '200px',
                    borderRadius: '4px'
                  }}
                />
              )}
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                🗺️ Location * (Click on map to select)
              </label>
              <div style={{ height: '300px', border: '1px solid #ddd', borderRadius: '4px' }}>
                <MapContainer
                  center={mapCenter}
                  zoom={13}
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  <LocationPicker
                    onLocationSelect={handleLocationSelect}
                    initialPosition={formData.lat && formData.lng ? [formData.lat, formData.lng] : null}
                  />
                </MapContainer>
              </div>
              {formData.lat && formData.lng && (
                <p style={{ marginTop: '5px', fontSize: '12px', color: '#666' }}>
                  Selected: {formData.lat.toFixed(4)}, {formData.lng.toFixed(4)}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                backgroundColor: isSubmitting ? '#ccc' : '#4CAF50',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '4px',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                fontSize: '16px'
              }}
            >
              {isSubmitting ? '⏳ Submitting...' : '📤 Submit Report'}
            </button>
          </form>

          {submitResult && (
            <div
              style={{
                marginTop: '15px',
                padding: '10px',
                borderRadius: '4px',
                backgroundColor: submitResult.success ? '#d4edda' : '#f8d7da',
                border: `1px solid ${submitResult.success ? '#c3e6cb' : '#f5c6cb'}`,
                color: submitResult.success ? '#155724' : '#721c24'
              }}
            >
              {submitResult.success ? '✅' : '❌'} {submitResult.message}
              {submitResult.success && submitResult.data && (
                <div style={{ marginTop: '10px', fontSize: '12px' }}>
                  <strong>Credibility Score:</strong> {(submitResult.data.credibility_score * 100).toFixed(1)}% 
                  ({submitResult.data.credibility_level})
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Reports Map and List */}
      {!showReportForm && (
        <>
          <div style={{ marginBottom: '20px' }}>
            <h2>🗺️ Live Reports Map</h2>
            <div style={{ height: '500px', border: '1px solid #ddd', borderRadius: '4px' }}>
              <MapContainer
                center={mapCenter}
                zoom={11}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                {reports.map((report) => (
                  <Marker
                    key={report.id}
                    position={[report.location.lat, report.location.lng]}
                    icon={createCategoryIcon(report.category, report.credibility_level)}
                  >
                    <Popup>
                      <div style={{ maxWidth: '200px' }}>
                        <h4 style={{ margin: '0 0 10px 0' }}>
                          {getCategoryEmoji(report.category)} {report.category.toUpperCase()}
                        </h4>
                        <p style={{ margin: '0 0 10px 0', fontSize: '12px' }}>
                          {report.text}
                        </p>
                        <div style={{ fontSize: '11px', color: '#666' }}>
                          <div>
                            <strong>Credibility:</strong>{' '}
                            <span style={{ color: getCredibilityColor(report.credibility_level) }}>
                              {report.credibility_level.toUpperCase()}
                            </span>{' '}
                            ({(report.credibility_score * 100).toFixed(1)}%)
                          </div>
                          <div><strong>Time:</strong> {new Date(report.timestamp).toLocaleString()}</div>
                          {report.location_name && (
                            <div><strong>Location:</strong> {report.location_name}</div>
                          )}
                        </div>
                        {report.image_url && (
                          <img
                            src={`http://localhost:8000${report.image_url}`}
                            alt="Report"
                            style={{
                              width: '100%',
                              maxHeight: '100px',
                              objectFit: 'cover',
                              marginTop: '10px',
                              borderRadius: '4px'
                            }}
                          />
                        )}
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          </div>

          <div>
            <h2>📋 Recent Reports ({reports.length})</h2>
            {reports.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#666', padding: '20px' }}>
                No reports available. Be the first to submit a report!
              </p>
            ) : (
              <div style={{ display: 'grid', gap: '15px' }}>
                {reports.slice(0, 10).map((report) => (
                  <div
                    key={report.id}
                    style={{
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      padding: '15px',
                      backgroundColor: '#fff',
                      borderLeft: `4px solid ${getCredibilityColor(report.credibility_level)}`
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ margin: '0 0 10px 0' }}>
                          {getCategoryEmoji(report.category)} {report.category.toUpperCase()} Report
                        </h4>
                        <p style={{ margin: '0 0 10px 0' }}>{report.text}</p>
                        
                        <div style={{ fontSize: '12px', color: '#666' }}>
                          <div style={{ marginBottom: '5px' }}>
                            <strong>Credibility:</strong>{' '}
                            <span style={{ 
                              color: getCredibilityColor(report.credibility_level),
                              fontWeight: 'bold'
                            }}>
                              {report.credibility_level.toUpperCase()}
                            </span>{' '}
                            ({(report.credibility_score * 100).toFixed(1)}%)
                          </div>
                          <div><strong>Location:</strong> {report.location_name || `${report.location.lat.toFixed(4)}, ${report.location.lng.toFixed(4)}`}</div>
                          <div><strong>Time:</strong> {new Date(report.timestamp).toLocaleString()}</div>
                        </div>
                      </div>
                      
                      {report.image_url && (
                        <img
                          src={`http://localhost:8000${report.image_url}`}
                          alt="Report"
                          style={{
                            width: '100px',
                            height: '100px',
                            objectFit: 'cover',
                            borderRadius: '4px',
                            marginLeft: '15px'
                          }}
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default CommunityReporting;