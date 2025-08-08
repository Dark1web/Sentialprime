import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add any auth tokens or common headers here
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

// Dashboard API calls
export const fetchDashboardData = async () => {
  try {
    const response = await api.get('/dashboard');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch dashboard data:', error);
    throw error;
  }
};

export const fetchRecentAlerts = async (params = {}) => {
  try {
    const response = await api.get('/alerts/recent', { params });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch recent alerts:', error);
    throw error;
  }
}

export const fetchSystemMetrics = async () => {
  try {
    const response = await api.get('/system/metrics');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch system metrics:', error);
    throw error;
  }
}

// Misinformation API calls
export const analyzeMisinformation = async (postData) => {
  try {
    const response = await api.post('/misinformation/analyze', postData);
    return response.data;
  } catch (error) {
    console.error('Failed to analyze misinformation:', error);
    throw error;
  }
};

export const fetchMisinformationFeed = async (params = {}) => {
  try {
    const response = await api.get('/misinformation/feed', { params });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch misinformation feed:', error);
    throw error;
  }
};

export const fetchMisinformationStats = async () => {
  try {
    const response = await api.get('/misinformation/statistics');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch misinformation statistics:', error);
    throw error;
  }
};

// Triage API calls
export const classifyTriageRequest = async (requestData) => {
  try {
    const response = await api.post('/triage/classify', requestData);
    return response.data;
  } catch (error) {
    console.error('Failed to classify triage request:', error);
    throw error;
  }
};

export const fetchTriageQueue = async (params = {}) => {
  try {
    const response = await api.get('/triage/queue', { params });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch triage queue:', error);
    throw error;
  }
};

export const fetchTriageStats = async () => {
  try {
    const response = await api.get('/triage/statistics');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch triage statistics:', error);
    throw error;
  }
};

export const simulateTriageRequest = async () => {
  try {
    const response = await api.post('/triage/simulate');
    return response.data;
  } catch (error) {
    console.error('Failed to simulate triage request:', error);
    throw error;
  }
};

// Network API calls
export const submitSpeedTest = async (speedData) => {
  try {
    const response = await api.post('/network/speed-test', speedData);
    return response.data;
  } catch (error) {
    console.error('Failed to submit speed test:', error);
    throw error;
  }
};

export const fetchNetworkOutages = async (params = {}) => {
  try {
    const response = await api.get('/network/outages', { params });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch network outages:', error);
    throw error;
  }
};

export const fetchConnectivityMap = async () => {
  try {
    const response = await api.get('/network/connectivity-map');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch connectivity map:', error);
    throw error;
  }
};

export const fetchTowerStatus = async (lat, lng, radius = 10) => {
  try {
    const response = await api.get('/network/tower-status', {
      params: { lat, lng, radius }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch tower status:', error);
    throw error;
  }
};

export const fetchNetworkStats = async () => {
  try {
    const response = await api.get('/network/statistics');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch network statistics:', error);
    throw error;
  }
};

// Fact Check API calls
export const factCheckClaim = async (claimData) => {
  try {
    const response = await api.post('/factcheck/', claimData);
    return response.data;
  } catch (error) {
    console.error('Failed to fact-check claim:', error);
    throw error;
  }
};

export const fetchTrendingClaims = async (params = {}) => {.
  try {
    const response = await api.get('/factcheck/trending', { params });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch trending claims:', error);
    throw error;
  }
};

export const fetchFactCheckSources = async () => {
  try {
    const response = await api.get('/factcheck/sources');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch fact-check sources:', error);
    throw error;
  }
};

export const fetchFactCheckStats = async () => {
  try {
    const response = await api.get('/factcheck/statistics');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch fact-check statistics:', error);
    throw error;
  }
};

export const reportSuspiciousClaim = async (claimData) => {
  try {
    const response = await api.post('/factcheck/report-claim', claimData);
    return response.data;
  } catch (error) {
    console.error('Failed to report suspicious claim:', error);
    throw error;
  }
};

// Navigation API calls
export const fetchSafeZones = async (lat, lng, params = {}) => {
  try {
    const response = await api.get('/navigation/safezones', {
      params: { lat, lng, ...params }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch safe zones:', error);
    throw error;
  }
};

export const fetchDangerZones = async (lat, lng, params = {}) => {
  try {
    const response = await api.get('/navigation/dangerzones', {
      params: { lat, lng, ...params }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch danger zones:', error);
    throw error;
  }
};

export const calculateSafeRoute = async (routeData) => {
  try {
    const response = await api.post('/navigation/route', routeData);
    return response.data;
  } catch (error) {
    console.error('Failed to calculate safe route:', error);
    throw error;
  }
};

export const fetchOfflineMapRegions = async () => {
  try {
    const response = await api.get('/navigation/offline-maps');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch offline map regions:', error);
    throw error;
  }
};

export const fetchEmergencyProcedures = async (disasterType = null) => {
  try {
    const response = await api.get('/navigation/emergency-procedures', {
      params: disasterType ? { disaster_type: disasterType } : {}
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch emergency procedures:', error);
    throw error;
  }
};

// Additional API service object for test compatibility
export const apiService = {
  // Misinformation API
  async analyzeMisinformation(text) {
    return await analyzeMisinformation({ text });
  },

  // Triage API
  async classifyEmergency(request) {
    return await classifyTriageRequest(request);
  },

  // Network API
  async getNetworkOutages() {
    return await fetchNetworkOutages();
  },

  // Fact Check API
  async factCheck(claim) {
    return await factCheckClaim({ claim });
  },

  // Navigation API
  async getSafeZones(location) {
    return await fetchSafeZones(location.lat, location.lng);
  },

  // Live Data API
  async getDisasterNews() {
    try {
      const response = await api.get('/live/news/disaster-feed');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch disaster news:', error);
      throw error;
    }
  },

  async getCurrentWeather(location) {
    try {
      const response = await api.get('/live/weather/current', {
        params: location
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch current weather:', error);
      throw error;
    }
  },

  // Health check
  async getHealthCheck() {
    try {
      const response = await api.get('/health');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch health check:', error);
      throw error;
    }
  }
};

export default api;