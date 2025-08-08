import { NextRequest } from 'next/server';
import { responses, withErrorHandling } from '@/utils/response';
import { triageService } from '@/services/triage';
import { TriageRequest } from '@/types';
import { z } from 'zod';

const TriageRequestSchema = z.object({
  text: z.string().min(1, 'Text is required').max(2000, 'Text too long'),
  location: z.string().optional(),
});

async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body
    const validatedData = TriageRequestSchema.parse(body);
    
    // Classify triage request
    const classification = await triageService.classify(
      validatedData.text,
      validatedData.location
    );
    
    return responses.ok({
      classification,
      input_text: validatedData.text,
      location: validatedData.location,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return responses.badRequest(`Validation error: ${error.errors.map(e => e.message).join(', ')}`);
    }
    
    console.error('Triage classification error:', error);
    return responses.internalServerError('Failed to classify triage request');
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
