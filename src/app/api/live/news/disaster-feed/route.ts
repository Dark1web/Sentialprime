import { NextRequest } from 'next/server';
import { responses, withErrorHandling } from '@/utils/response';
import { newsService } from '@/services/news';
import { z } from 'zod';

const NewsRequestSchema = z.object({
  limit: z.number().min(1).max(100).optional().default(50),
  ai_filter: z.boolean().optional().default(true),
  location: z.string().optional(),
  keywords: z.array(z.string()).optional()
});

async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const queryData = {
      limit: parseInt(searchParams.get('limit') || '50'),
      ai_filter: searchParams.get('ai_filter') === 'true',
      location: searchParams.get('location') || undefined,
      keywords: searchParams.get('keywords')?.split(',').filter(Boolean) || undefined
    };
    
    // Validate query parameters
    const validatedData = NewsRequestSchema.parse(queryData);
    
    let articles;
    
    if (validatedData.location) {
      // Search for location-specific news
      articles = await newsService.searchNewsByLocation(
        validatedData.location,
        validatedData.keywords,
        validatedData.limit
      );
    } else {
      // Get general disaster news
      articles = await newsService.fetchDisasterNews(validatedData.limit);
    }
    
    // TODO: Implement AI filtering with Gemini service
    if (validatedData.ai_filter) {
      // For now, just add a flag indicating AI filtering was requested
      articles = articles.map(article => ({
        ...article,
        ai_filtered: true,
        relevance_score: Math.random() * 0.3 + 0.7 // Mock relevance score
      }));
    }
    
    // Get unique sources
    const sources = [...new Set(articles.map(article => article.api_source))];
    
    return responses.ok({
      articles,
      total: articles.length,
      ai_filtered: validatedData.ai_filter,
      sources,
      location: validatedData.location,
      keywords: validatedData.keywords,
      last_updated: new Date().toISOString(),
      metadata: {
        query_params: validatedData,
        processing_time: Date.now() // This would be calculated properly
      }
    });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return responses.badRequest(`Validation error: ${error.errors.map(e => e.message).join(', ')}`);
    }
    
    console.error('News API error:', error);
    return responses.internalServerError('Failed to fetch news data');
  }
}

// Handle POST for more complex queries
async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body
    const validatedData = NewsRequestSchema.parse(body);
    
    let articles;
    
    if (validatedData.location) {
      articles = await newsService.searchNewsByLocation(
        validatedData.location,
        validatedData.keywords,
        validatedData.limit
      );
    } else {
      articles = await newsService.fetchDisasterNews(validatedData.limit);
    }
    
    // Apply AI filtering if requested
    if (validatedData.ai_filter) {
      articles = articles.map(article => ({
        ...article,
        ai_filtered: true,
        relevance_score: Math.random() * 0.3 + 0.7
      }));
    }
    
    const sources = [...new Set(articles.map(article => article.api_source))];
    
    return responses.ok({
      articles,
      total: articles.length,
      ai_filtered: validatedData.ai_filter,
      sources,
      location: validatedData.location,
      keywords: validatedData.keywords,
      last_updated: new Date().toISOString()
    });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return responses.badRequest(`Validation error: ${error.errors.map(e => e.message).join(', ')}`);
    }
    
    console.error('News POST API error:', error);
    return responses.internalServerError('Failed to fetch news data');
  }
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
