import { NextRequest } from 'next/server';
import { responses, withErrorHandling } from '@/utils/response';
import { satelliteService } from '@/services/satellite';
import { z } from 'zod';

const SatelliteRequestSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  disaster_type: z.enum(['flood', 'fire', 'landslide', 'earthquake', 'storm']),
  bbox_size: z.number().min(100).max(10000).optional().default(1000),
  time_range_days: z.number().min(1).max(30).optional().default(7),
  analysis_type: z.enum(['risk_assessment', 'change_detection', 'damage_assessment']).optional().default('risk_assessment')
});

async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const queryData = {
      lat: parseFloat(searchParams.get('lat') || '0'),
      lng: parseFloat(searchParams.get('lng') || '0'),
      disaster_type: searchParams.get('disaster_type') || 'flood',
      bbox_size: parseInt(searchParams.get('bbox_size') || '1000'),
      time_range_days: parseInt(searchParams.get('time_range_days') || '7'),
      analysis_type: searchParams.get('analysis_type') || 'risk_assessment'
    };
    
    // Validate query parameters
    const validatedData = SatelliteRequestSchema.parse(queryData);
    
    // Get satellite imagery and analysis
    const satelliteAnalysis = await satelliteService.getDisasterImagery({
      lat: validatedData.lat,
      lng: validatedData.lng,
      disaster_type: validatedData.disaster_type,
      bbox_size: validatedData.bbox_size,
      time_range_days: validatedData.time_range_days
    });
    
    // Get specific analysis based on disaster type
    let additionalAnalysis = {};
    
    if (validatedData.disaster_type === 'flood') {
      const floodAnalysis = await satelliteService.getFloodRiskAnalysis(
        validatedData.lat, 
        validatedData.lng
      );
      additionalAnalysis = { flood_analysis: floodAnalysis };
    } else if (validatedData.disaster_type === 'fire') {
      const fireAnalysis = await satelliteService.getFireDetection(
        validatedData.lat, 
        validatedData.lng
      );
      additionalAnalysis = { fire_analysis: fireAnalysis };
    }
    
    return responses.ok({
      location: {
        lat: validatedData.lat,
        lng: validatedData.lng,
        bbox_size_meters: validatedData.bbox_size
      },
      disaster_type: validatedData.disaster_type,
      analysis_type: validatedData.analysis_type,
      time_range_days: validatedData.time_range_days,
      satellite_data: satelliteAnalysis,
      ...additionalAnalysis,
      processing_info: {
        processed_at: new Date().toISOString(),
        data_sources: ['sentinel-2', 'sentinel-1'],
        processing_method: 'automated_analysis'
      },
      recommendations: generateDisasterRecommendations(
        validatedData.disaster_type, 
        satelliteAnalysis
      )
    });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return responses.badRequest(`Validation error: ${error.errors.map(e => e.message).join(', ')}`);
    }
    
    console.error('Satellite imagery API error:', error);
    return responses.internalServerError('Failed to fetch satellite imagery data');
  }
}

// Handle POST for more complex analysis requests
async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body
    const validatedData = SatelliteRequestSchema.parse(body);
    
    // Get comprehensive satellite analysis
    const [
      generalAnalysis,
      floodAnalysis,
      fireAnalysis
    ] = await Promise.allSettled([
      satelliteService.getDisasterImagery({
        lat: validatedData.lat,
        lng: validatedData.lng,
        disaster_type: validatedData.disaster_type,
        bbox_size: validatedData.bbox_size,
        time_range_days: validatedData.time_range_days
      }),
      satelliteService.getFloodRiskAnalysis(validatedData.lat, validatedData.lng),
      satelliteService.getFireDetection(validatedData.lat, validatedData.lng)
    ]);
    
    const satelliteData = generalAnalysis.status === 'fulfilled' ? generalAnalysis.value : null;
    const floodData = floodAnalysis.status === 'fulfilled' ? floodAnalysis.value : null;
    const fireData = fireAnalysis.status === 'fulfilled' ? fireAnalysis.value : null;
    
    // Calculate combined risk assessment
    const combinedRisk = calculateCombinedRisk(satelliteData, floodData, fireData);
    
    return responses.ok({
      location: {
        lat: validatedData.lat,
        lng: validatedData.lng,
        bbox_size_meters: validatedData.bbox_size
      },
      disaster_type: validatedData.disaster_type,
      analysis_type: validatedData.analysis_type,
      time_range_days: validatedData.time_range_days,
      comprehensive_analysis: {
        general: satelliteData,
        flood_risk: floodData,
        fire_risk: fireData,
        combined_risk: combinedRisk
      },
      processing_info: {
        processed_at: new Date().toISOString(),
        data_sources: ['sentinel-2', 'sentinel-1'],
        processing_method: 'comprehensive_analysis',
        analysis_quality: calculateAnalysisQuality(satelliteData, floodData, fireData)
      },
      recommendations: generateComprehensiveRecommendations(combinedRisk, validatedData.disaster_type)
    });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return responses.badRequest(`Validation error: ${error.errors.map(e => e.message).join(', ')}`);
    }
    
    console.error('Satellite imagery POST API error:', error);
    return responses.internalServerError('Failed to process satellite imagery request');
  }
}

function generateDisasterRecommendations(disasterType: string, analysis: any): string[] {
  const recommendations: string[] = [];
  
  if (!analysis) {
    return ['Monitor local conditions', 'Stay informed about weather alerts'];
  }
  
  const riskLevel = analysis.risk_level;
  
  switch (disasterType) {
    case 'flood':
      if (riskLevel === 'high' || riskLevel === 'critical') {
        recommendations.push('Avoid low-lying areas and flood-prone zones');
        recommendations.push('Monitor water levels and evacuation routes');
        recommendations.push('Prepare emergency supplies and evacuation plan');
      } else {
        recommendations.push('Stay aware of weather conditions');
        recommendations.push('Know your evacuation routes');
      }
      break;
      
    case 'fire':
      if (riskLevel === 'high' || riskLevel === 'critical') {
        recommendations.push('Create defensible space around property');
        recommendations.push('Prepare for potential evacuation');
        recommendations.push('Monitor fire weather conditions');
      } else {
        recommendations.push('Maintain fire safety precautions');
        recommendations.push('Keep emergency kit ready');
      }
      break;
      
    default:
      recommendations.push('Monitor local emergency services');
      recommendations.push('Stay informed about conditions');
  }
  
  return recommendations;
}

function calculateCombinedRisk(general: any, flood: any, fire: any): any {
  const risks = [general, flood, fire].filter(Boolean);
  
  if (risks.length === 0) {
    return {
      overall_risk: 'unknown',
      confidence: 0,
      primary_threats: [],
      risk_factors: {}
    };
  }
  
  // Calculate weighted risk score
  let totalRiskScore = 0;
  let totalConfidence = 0;
  const threats: string[] = [];
  
  risks.forEach(risk => {
    const riskValue = getRiskValue(risk.risk_level);
    totalRiskScore += riskValue * risk.confidence;
    totalConfidence += risk.confidence;
    
    if (riskValue > 2) {
      threats.push(...risk.detected_features);
    }
  });
  
  const averageRisk = totalRiskScore / totalConfidence;
  const overallConfidence = totalConfidence / risks.length;
  
  let overallRiskLevel: string;
  if (averageRisk >= 3.5) overallRiskLevel = 'critical';
  else if (averageRisk >= 2.5) overallRiskLevel = 'high';
  else if (averageRisk >= 1.5) overallRiskLevel = 'medium';
  else overallRiskLevel = 'low';
  
  return {
    overall_risk: overallRiskLevel,
    confidence: Math.round(overallConfidence * 100) / 100,
    primary_threats: [...new Set(threats)],
    risk_factors: {
      flood_risk: flood?.confidence || 0,
      fire_risk: fire?.confidence || 0,
      general_risk: general?.confidence || 0
    }
  };
}

function getRiskValue(riskLevel: string): number {
  switch (riskLevel) {
    case 'critical': return 4;
    case 'high': return 3;
    case 'medium': return 2;
    case 'low': return 1;
    default: return 0;
  }
}

function calculateAnalysisQuality(general: any, flood: any, fire: any): string {
  const analyses = [general, flood, fire].filter(Boolean);
  
  if (analyses.length === 0) return 'poor';
  
  const avgConfidence = analyses.reduce((sum, analysis) => sum + analysis.confidence, 0) / analyses.length;
  
  if (avgConfidence >= 0.8) return 'excellent';
  else if (avgConfidence >= 0.6) return 'good';
  else if (avgConfidence >= 0.4) return 'fair';
  else return 'poor';
}

function generateComprehensiveRecommendations(combinedRisk: any, disasterType: string): string[] {
  const recommendations: string[] = [];
  
  if (combinedRisk.overall_risk === 'critical' || combinedRisk.overall_risk === 'high') {
    recommendations.push('Consider evacuation if advised by authorities');
    recommendations.push('Monitor emergency broadcasts continuously');
    recommendations.push('Ensure emergency supplies are ready');
  } else if (combinedRisk.overall_risk === 'medium') {
    recommendations.push('Stay alert and prepared');
    recommendations.push('Monitor local conditions');
    recommendations.push('Review emergency plans');
  } else {
    recommendations.push('Continue normal activities with awareness');
    recommendations.push('Stay informed about local conditions');
  }
  
  // Add threat-specific recommendations
  if (combinedRisk.primary_threats.includes('water_bodies')) {
    recommendations.push('Avoid areas near water bodies');
  }
  if (combinedRisk.primary_threats.includes('dry_vegetation')) {
    recommendations.push('Exercise fire safety precautions');
  }
  
  return [...new Set(recommendations)];
}

// Handle OPTIONS for CORS
async function OPTIONS(request: NextRequest) {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

const wrappedGET = withErrorHandling(GET);
const wrappedPOST = withErrorHandling(POST);

export { wrappedGET as GET, wrappedPOST as POST, OPTIONS };
