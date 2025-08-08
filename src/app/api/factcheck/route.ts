import { NextRequest } from 'next/server';
import { responses, withErrorHandling } from '@/utils/response';
import { factCheckService } from '@/services/factcheck';
import { FactCheckRequest } from '@/types';
import { z } from 'zod';

const FactCheckRequestSchema = z.object({
  claim: z.string().min(1, 'Claim is required').max(1000, 'Claim too long'),
});

async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body
    const validatedData = FactCheckRequestSchema.parse(body);
    
    // Perform fact check
    const factCheck = await factCheckService.checkFact(validatedData.claim);
    
    return responses.ok({
      fact_check: factCheck,
      input_claim: validatedData.claim,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return responses.badRequest(`Validation error: ${error.errors.map(e => e.message).join(', ')}`);
    }
    
    console.error('Fact check error:', error);
    return responses.internalServerError('Failed to perform fact check');
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
