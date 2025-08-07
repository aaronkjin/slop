/**
 * API Route: /api/openai/enhance
 * 
 * Handles prompt enhancement requests with web search capabilities.
 * This endpoint provides enhanced prompts ready for Veo3 video generation
 * following the exact specifications from TASK_3.md.
 * 
 * Features:
 * - Request validation and sanitization
 * - Integration with existing OpenAI enhancement service
 * - Optional web search for trend awareness
 * - Basic rate limiting protection
 * - Proper error handling and logging
 */

import { NextRequest, NextResponse } from 'next/server';
import { 
  validateEnhanceRequest,
  checkRateLimit,
  createValidationErrorResponse,
  createRateLimitErrorResponse,
  createOpenAiErrorResponse,
  logApiRequest
} from '@/lib/utils/validation';
import { enhancePrompt } from '@/lib/openai/enhance';
import type { EnhanceResponse } from '@/lib/types/api';
import { API_STATUS_CODES } from '@/lib/types/api';

/**
 * POST /api/openai/enhance
 * 
 * Enhances user prompts for Veo3 video generation with optional web search
 */
export async function POST(request: NextRequest): Promise<NextResponse<EnhanceResponse>> {
  const startTime = Date.now();
  
  try {
    // Log API request
    logApiRequest(request, '/api/openai/enhance', startTime);

    // Check rate limit first
    const rateLimitInfo = checkRateLimit(request);
    if (!rateLimitInfo.allowed) {
      console.warn(`🚫 Rate limit exceeded for ${request.ip || 'unknown'}`);
      return createRateLimitErrorResponse(rateLimitInfo);
    }

    // Validate request
    const validation = await validateEnhanceRequest(request);
    if (!validation.isValid) {
      console.warn(`❌ Validation failed: ${validation.error}`);
      return createValidationErrorResponse(validation);
    }

    const { prompt, includeWebSearch = false } = validation.data!;

    console.log('\n🎨 Enhancement Request');
    console.log('─'.repeat(40));
    console.log(`📝 Prompt: "${prompt}"`);
    console.log(`📏 Length: ${prompt.length} characters`);
    console.log(`🔍 Web Search: ${includeWebSearch ? 'enabled' : 'disabled'}`);

    // Call enhancement service with scene analysis enabled for proper scene counting
    const enhancementResult = await enhancePrompt(prompt, {
      includeWebSearch,
      includeSceneAnalysis: true, // Enable to get proper scene count
      maxTokens: 800,
      temperature: 0.7
    });

    // Handle enhancement failure
    if (!enhancementResult.success) {
      console.error(`❌ Enhancement failed: ${enhancementResult.error}`);
      return createOpenAiErrorResponse(new Error(enhancementResult.error || 'Enhancement failed'));
    }

    // Transform single enhanced prompt into array format
    // If scene analysis detected multiple scenes, split the enhanced prompt
    let enhancedPrompts: string[];
    const enhancedPrompt = enhancementResult.enhancedPrompt!;
    
    if (enhancedPrompt.includes('SCENE:')) {
      // Multi-scene format: split by lines starting with "SCENE:"
      enhancedPrompts = enhancedPrompt
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.startsWith('SCENE:'))
        .map(line => line.replace(/^SCENE:\s*/, '').trim())
        .filter(line => line.length > 0);
    } else {
      // Single scene format
      enhancedPrompts = [enhancedPrompt];
    }

    // Extract scene count from analysis or default to 1
    const sceneCount = enhancementResult.sceneAnalysis?.sceneCount || 1;

    // Extract web search context if available
    const webSearchContext = enhancementResult.trendContext?.summary;

    // Format metadata according to Task 3 specification
    const metadata = {
      processingTime: enhancementResult.metadata?.processingTime || (Date.now() - startTime),
      tokensUsed: enhancementResult.metadata?.tokensUsed || 0
    };

    // Create successful response according to Task 3 specification
    const responseData: EnhanceResponse = {
      success: true,
      data: {
        originalPrompt: enhancementResult.originalPrompt,
        enhancedPrompts,
        sceneCount,
        webSearchContext,
        metadata
      }
    };

    // Log success
    console.log('\n✅ Enhancement Success');
    console.log('─'.repeat(40));
    console.log(`🎯 Enhanced Prompts: ${enhancedPrompts.length}`);
    console.log(`🎬 Scene Count: ${sceneCount}`);
    console.log(`⚡ Processing Time: ${metadata.processingTime}ms`);
    console.log(`🔤 Tokens Used: ${metadata.tokensUsed}`);
    if (webSearchContext) {
      console.log(`🔍 Web Search Context: ${webSearchContext.substring(0, 100)}...`);
    }

    return NextResponse.json(responseData, { 
      status: API_STATUS_CODES.SUCCESS 
    });

  } catch (error) {
    // Handle unexpected errors
    console.error('\n💥 Unexpected Enhancement Error:');
    console.error(error);
    
    const errorResponse: EnhanceResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Unexpected server error during enhancement'
    };

    return NextResponse.json(errorResponse, { 
      status: API_STATUS_CODES.INTERNAL_SERVER_ERROR 
    });
  }
}

/**
 * Handle unsupported HTTP methods
 */
export async function GET(): Promise<NextResponse> {
  return NextResponse.json(
    { 
      success: false, 
      error: 'Method GET not supported. Use POST.' 
    },
    { status: API_STATUS_CODES.METHOD_NOT_ALLOWED }
  );
}

export async function PUT(): Promise<NextResponse> {
  return NextResponse.json(
    { 
      success: false, 
      error: 'Method PUT not supported. Use POST.' 
    },
    { status: API_STATUS_CODES.METHOD_NOT_ALLOWED }
  );
}

export async function DELETE(): Promise<NextResponse> {
  return NextResponse.json(
    { 
      success: false, 
      error: 'Method DELETE not supported. Use POST.' 
    },
    { status: API_STATUS_CODES.METHOD_NOT_ALLOWED }
  );
}

export async function PATCH(): Promise<NextResponse> {
  return NextResponse.json(
    { 
      success: false, 
      error: 'Method PATCH not supported. Use POST.' 
    },
    { status: API_STATUS_CODES.METHOD_NOT_ALLOWED }
  );
}