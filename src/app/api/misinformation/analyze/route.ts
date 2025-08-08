import { NextRequest } from 'next/server';
import { responses, withErrorHandling } from '@/utils/response';
import { misinformationService } from '@/services/misinformation';
import { MisinformationRequest } from '@/types';
import { z } from 'zod';

const MisinformationRequestSchema = z.object({
  text: z.string().min(1, 'Text is required').max(5000, 'Text too long'),
});

async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body
    const validatedData = MisinformationRequestSchema.parse(body);
    
    // Analyze misinformation
    const analysis = await misinformationService.analyze(validatedData.text);
    
    return responses.ok({
      analysis,
      input_text: validatedData.text,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return responses.badRequest(`Validation error: ${error.errors.map(e => e.message).join(', ')}`);
    }
    
    console.error('Misinformation analysis error:', error);
    return responses.internalServerError('Failed to analyze misinformation');
  }
}

// Handle OPTIONS for CORS
async function OPTIONS(request: NextRequest) {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

const wrappedPOST = withErrorHandling(POST);
export { wrappedPOST as POST, OPTIONS };
