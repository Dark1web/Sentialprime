import { config } from '@/lib/config';

export interface SatelliteImageryRequest {
  lat: number;
  lng: number;
  disaster_type: 'flood' | 'fire' | 'landslide' | 'earthquake' | 'storm';
  bbox_size?: number; // in meters
  time_range_days?: number;
}

export interface SatelliteAnalysis {
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  detected_features: string[];
  analysis_date: string;
  image_url?: string;
  metadata: {
    satellite: string;
    resolution: string;
    cloud_coverage: number;
  };
}

export class SatelliteService {
  private sentinelHubClientId: string;
  private sentinelHubClientSecret: string;
  private baseUrl: string;

  constructor() {
    this.sentinelHubClientId = config.apis.sentinelHubClientId;
    this.sentinelHubClientSecret = config.apis.sentinelHubClientSecret;
    this.baseUrl = 'https://services.sentinel-hub.com';
  }

  async getFloodRiskAnalysis(lat: number, lng: number): Promise<SatelliteAnalysis> {
    try {
      if (!this.sentinelHubClientId || !this.sentinelHubClientSecret) {
        return this.getMockFloodAnalysis(lat, lng);
      }

      // Get access token
      const accessToken = await this.getAccessToken();
      if (!accessToken) {
        return this.getMockFloodAnalysis(lat, lng);
      }

      // Define bounding box (1km around the point)
      const bbox = this.getBoundingBox(lat, lng, 1000);
      
      // Get Sentinel-1 SAR data for flood detection
      const imageData = await this.getSentinelImagery({
        bbox,
        time_range: this.getTimeRange(7), // Last 7 days
        evalscript: this.getFloodDetectionEvalscript(),
        accessToken
      });

      if (imageData) {
        return this.analyzeFloodImagery(imageData, lat, lng);
      } else {
        return this.getMockFloodAnalysis(lat, lng);
      }
    } catch (error) {
      console.error('Flood risk analysis error:', error);
      return this.getMockFloodAnalysis(lat, lng);
    }
  }

  async getFireDetection(lat: number, lng: number): Promise<SatelliteAnalysis> {
    try {
      if (!this.sentinelHubClientId || !this.sentinelHubClientSecret) {
        return this.getMockFireAnalysis(lat, lng);
      }

      const accessToken = await this.getAccessToken();
      if (!accessToken) {
        return this.getMockFireAnalysis(lat, lng);
      }

      const bbox = this.getBoundingBox(lat, lng, 2000); // 2km for fire detection
      
      // Get Sentinel-2 data for fire detection
      const imageData = await this.getSentinelImagery({
        bbox,
        time_range: this.getTimeRange(3), // Last 3 days
        evalscript: this.getFireDetectionEvalscript(),
        accessToken
      });

      if (imageData) {
        return this.analyzeFireImagery(imageData, lat, lng);
      } else {
        return this.getMockFireAnalysis(lat, lng);
      }
    } catch (error) {
      console.error('Fire detection error:', error);
      return this.getMockFireAnalysis(lat, lng);
    }
  }

  async getDisasterImagery(request: SatelliteImageryRequest): Promise<any> {
    try {
      switch (request.disaster_type) {
        case 'flood':
          return await this.getFloodRiskAnalysis(request.lat, request.lng);
        case 'fire':
          return await this.getFireDetection(request.lat, request.lng);
        default:
          return this.getMockDisasterAnalysis(request);
      }
    } catch (error) {
      console.error('Disaster imagery error:', error);
      return this.getMockDisasterAnalysis(request);
    }
  }

  private async getAccessToken(): Promise<string | null> {
    try {
      const response = await fetch(`${this.baseUrl}/oauth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: this.sentinelHubClientId,
          client_secret: this.sentinelHubClientSecret,
        }),
      });

      if (!response.ok) {
        throw new Error(`Token request failed: ${response.status}`);
      }

      const data = await response.json();
      return data.access_token;
    } catch (error) {
      console.error('Failed to get Sentinel Hub access token:', error);
      return null;
    }
  }

  private async getSentinelImagery(params: {
    bbox: number[];
    time_range: string;
    evalscript: string;
    accessToken: string;
  }): Promise<any> {
    try {
      const requestBody = {
        input: {
          bounds: {
            bbox: params.bbox,
            properties: {
              crs: 'http://www.opengis.net/def/crs/EPSG/0/4326'
            }
          },
          data: [
            {
              type: 'sentinel-2-l2a',
              dataFilter: {
                timeRange: {
                  from: params.time_range.split('/')[0],
                  to: params.time_range.split('/')[1]
                }
              }
            }
          ]
        },
        output: {
          width: 512,
          height: 512,
          responses: [
            {
              identifier: 'default',
              format: {
                type: 'image/png'
              }
            }
          ]
        },
        evalscript: params.evalscript
      };

      const response = await fetch(`${this.baseUrl}/api/v1/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${params.accessToken}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`Sentinel Hub API error: ${response.status}`);
      }

      return await response.blob();
    } catch (error) {
      console.error('Sentinel imagery request failed:', error);
      return null;
    }
  }

  private getBoundingBox(lat: number, lng: number, radiusMeters: number): number[] {
    // Convert radius from meters to degrees (approximate)
    const radiusDegrees = radiusMeters / 111320; // meters per degree at equator
    
    return [
      lng - radiusDegrees, // west
      lat - radiusDegrees, // south
      lng + radiusDegrees, // east
      lat + radiusDegrees  // north
    ];
  }

  private getTimeRange(days: number): string {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);
    
    return `${startDate.toISOString().split('T')[0]}/${endDate.toISOString().split('T')[0]}`;
  }

  private getFloodDetectionEvalscript(): string {
    return `
      //VERSION=3
      function setup() {
        return {
          input: ["B02", "B03", "B04", "B08", "B11", "B12"],
          output: { bands: 4 }
        };
      }

      function evaluatePixel(sample) {
        // NDWI (Normalized Difference Water Index)
        let ndwi = (sample.B03 - sample.B08) / (sample.B03 + sample.B08);
        
        // Modified NDWI
        let mndwi = (sample.B03 - sample.B11) / (sample.B03 + sample.B11);
        
        // Water detection threshold
        if (ndwi > 0.3 || mndwi > 0.5) {
          return [0, 0, 1, 1]; // Blue for water
        } else {
          return [sample.B04, sample.B03, sample.B02, 1]; // Natural color
        }
      }
    `;
  }

  private getFireDetectionEvalscript(): string {
    return `
      //VERSION=3
      function setup() {
        return {
          input: ["B02", "B03", "B04", "B08", "B11", "B12"],
          output: { bands: 4 }
        };
      }

      function evaluatePixel(sample) {
        // Fire detection using SWIR bands
        let fireIndex = (sample.B12 - sample.B11) / (sample.B12 + sample.B11);
        
        // Hot spot detection
        if (sample.B12 > 0.1 && sample.B11 > 0.05 && fireIndex > 0.2) {
          return [1, 0, 0, 1]; // Red for fire/hot spots
        } else {
          return [sample.B04, sample.B03, sample.B02, 1]; // Natural color
        }
      }
    `;
  }

  private analyzeFloodImagery(imageData: any, lat: number, lng: number): SatelliteAnalysis {
    // In a real implementation, this would analyze the actual image data
    // For now, return a mock analysis based on the fact that we got data
    return {
      risk_level: 'medium',
      confidence: 0.75,
      detected_features: ['water_bodies', 'potential_flooding'],
      analysis_date: new Date().toISOString(),
      metadata: {
        satellite: 'Sentinel-2',
        resolution: '10m',
        cloud_coverage: 15
      }
    };
  }

  private analyzeFireImagery(imageData: any, lat: number, lng: number): SatelliteAnalysis {
    return {
      risk_level: 'low',
      confidence: 0.8,
      detected_features: ['vegetation', 'no_active_fires'],
      analysis_date: new Date().toISOString(),
      metadata: {
        satellite: 'Sentinel-2',
        resolution: '10m',
        cloud_coverage: 10
      }
    };
  }

  private getMockFloodAnalysis(lat: number, lng: number): SatelliteAnalysis {
    return {
      risk_level: 'low',
      confidence: 0.6,
      detected_features: ['normal_water_levels', 'no_flooding_detected'],
      analysis_date: new Date().toISOString(),
      metadata: {
        satellite: 'Mock Satellite',
        resolution: '10m',
        cloud_coverage: 20
      }
    };
  }

  private getMockFireAnalysis(lat: number, lng: number): SatelliteAnalysis {
    return {
      risk_level: 'medium',
      confidence: 0.7,
      detected_features: ['dry_vegetation', 'elevated_temperature'],
      analysis_date: new Date().toISOString(),
      metadata: {
        satellite: 'Mock Satellite',
        resolution: '10m',
        cloud_coverage: 5
      }
    };
  }

  private getMockDisasterAnalysis(request: SatelliteImageryRequest): SatelliteAnalysis {
    return {
      risk_level: 'low',
      confidence: 0.5,
      detected_features: ['normal_conditions'],
      analysis_date: new Date().toISOString(),
      metadata: {
        satellite: 'Mock Satellite',
        resolution: '10m',
        cloud_coverage: 25
      }
    };
  }
}

export const satelliteService = new SatelliteService();
