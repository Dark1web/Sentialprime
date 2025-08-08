import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const ImageAnalysisSchema = z.object({
  image_url: z.string().url(),
  analysis_type: z.enum(['disaster_detection', 'damage_assessment', 'object_detection']),
  location: z.object({
    latitude: z.number(),
    longitude: z.number()
  }).optional()
})

// Mock YOLO/Computer Vision service
class ImageAnalysisService {
  async analyzeDisasterImage(imageUrl: string, analysisType: string) {
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Mock analysis results based on type
    const mockResults = {
      disaster_detection: {
        detected_disasters: [
          {
            type: 'flood',
            confidence: 0.87,
            bounding_box: { x: 120, y: 80, width: 300, height: 200 },
            severity: 'high'
          },
          {
            type: 'debris',
            confidence: 0.73,
            bounding_box: { x: 450, y: 150, width: 180, height: 120 },
            severity: 'medium'
          }
        ],
        overall_confidence: 0.82,
        risk_assessment: 'high',
        recommended_actions: [
          'Immediate evacuation of affected areas',
          'Deploy emergency response teams',
          'Set up temporary shelters'
        ]
      },
      damage_assessment: {
        damage_level: 'severe',
        affected_structures: [
          {
            type: 'residential_building',
            damage_percentage: 75,
            structural_integrity: 'compromised',
            habitability: 'uninhabitable'
          },
          {
            type: 'road_infrastructure',
            damage_percentage: 45,
            structural_integrity: 'damaged',
            accessibility: 'limited'
          }
        ],
        estimated_cost: 2500000,
        recovery_time_estimate: '6-12 months'
      },
      object_detection: {
        detected_objects: [
          { class: 'person', confidence: 0.95, count: 3 },
          { class: 'vehicle', confidence: 0.88, count: 2 },
          { class: 'building', confidence: 0.92, count: 5 },
          { class: 'water', confidence: 0.89, count: 1 }
        ],
        scene_description: 'Flood-affected urban area with people and vehicles',
        safety_concerns: ['People in flood water', 'Submerged vehicles']
      }
    }

    return mockResults[analysisType as keyof typeof mockResults] || mockResults.disaster_detection
  }

  async analyzeWithHuggingFace(imageUrl: string) {
    // Mock HuggingFace API call
    return {
      model: 'facebook/detr-resnet-50',
      predictions: [
        { label: 'flood', score: 0.87 },
        { label: 'building', score: 0.92 },
        { label: 'water', score: 0.89 }
      ],
      processing_time: 1.2
    }
  }
}

const imageAnalysisService = new ImageAnalysisService()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = ImageAnalysisSchema.parse(body)

    // Perform image analysis
    const analysis = await imageAnalysisService.analyzeDisasterImage(
      validatedData.image_url,
      validatedData.analysis_type
    )

    // Get additional HuggingFace analysis
    const huggingFaceAnalysis = await imageAnalysisService.analyzeWithHuggingFace(
      validatedData.image_url
    )

    return NextResponse.json({
      success: true,
      data: {
        analysis_type: validatedData.analysis_type,
        image_url: validatedData.image_url,
        location: validatedData.location,
        results: analysis,
        ml_analysis: huggingFaceAnalysis,
        timestamp: new Date().toISOString(),
        processing_time: Math.random() * 2 + 0.5 // Mock processing time
      }
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Image analysis error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to analyze image' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const modelInfo = searchParams.get('model_info')

  if (modelInfo === 'true') {
    return NextResponse.json({
      success: true,
      data: {
        available_models: [
          {
            name: 'YOLO v8 Disaster Detection',
            type: 'object_detection',
            accuracy: 0.89,
            supported_disasters: ['flood', 'fire', 'earthquake_damage', 'debris']
          },
          {
            name: 'ResNet-50 Damage Assessment',
            type: 'classification',
            accuracy: 0.92,
            categories: ['no_damage', 'minor', 'major', 'destroyed']
          },
          {
            name: 'HuggingFace DETR',
            type: 'transformer',
            accuracy: 0.87,
            description: 'General object detection and scene understanding'
          }
        ],
        supported_formats: ['jpg', 'jpeg', 'png', 'webp'],
        max_image_size: '10MB',
        processing_time: '1-3 seconds'
      }
    })
  }

  return NextResponse.json({
    success: true,
    message: 'AI Image Analysis Service',
    endpoints: {
      analyze: 'POST /api/ai/analyze-image',
      model_info: 'GET /api/ai/analyze-image?model_info=true'
    }
  })
}
