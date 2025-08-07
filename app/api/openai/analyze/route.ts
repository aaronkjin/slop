/**
 * API Route: /api/openai/analyze
 * 
 * Handles scene analysis requests for prompt breakdown and complexity assessment.
 * This endpoint analyzes user prompts to determine scene requirements, character
 * consistency needs, and recommended video generation approach.
 * 
 * Features:
 * - Request validation and sanitization  
 * - Integration with existing OpenAI scene analysis service
 * - Scene breakdown with character mapping
 * - Complexity assessment and approach recommendations
 * - Basic rate limiting protection
 * - Proper error handling and logging
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  validateAnalyzeRequest,
  checkRateLimit,
  createValidationErrorResponse,
  createRateLimitErrorResponse,
  createOpenAiErrorResponse,
  logApiRequest
} from '@/lib/utils/validation';
import { getSceneAnalysisService } from '@/lib/openai/scene-analysis';
import type { AnalyzeResponse, SceneBreakdown } from '@/lib/types/api';
import { API_STATUS_CODES } from '@/lib/types/api';

/**
 * POST /api/openai/analyze
 * 
 * Analyzes user prompts for scene requirements and complexity assessment
 */
export async function POST(request: NextRequest): Promise<NextResponse<AnalyzeResponse>> {
  const startTime = Date.now();

  try {
    // Log API request
    logApiRequest(request, '/api/openai/analyze', startTime);

    // Check rate limit first
    const rateLimitInfo = checkRateLimit(request);
    if (!rateLimitInfo.allowed) {
      console.warn(`🚫 Rate limit exceeded for ${request.ip || 'unknown'}`);
      return createRateLimitErrorResponse(rateLimitInfo);
    }

    // Validate request
    const validation = await validateAnalyzeRequest(request);
    if (!validation.isValid) {
      console.warn(`❌ Validation failed: ${validation.error}`);
      return createValidationErrorResponse(validation);
    }

    const { prompt } = validation.data!;

    console.log('\n🔍 Scene Analysis Request');
    console.log('─'.repeat(40));
    console.log(`📝 Prompt: "${prompt}"`);
    console.log(`📏 Length: ${prompt.length} characters`);

    // Call scene analysis service
    const sceneAnalysisService = getSceneAnalysisService();
    const analysisResult = await sceneAnalysisService.analyzePrompt(prompt);

    // Transform scene analysis result to API response format
    const sceneBreakdown: SceneBreakdown[] = analysisResult.scenes.map(scene => ({
      sceneNumber: scene.sceneNumber,
      description: scene.description,
      duration: scene.duration,
      characters: scene.characters
    }));

    // Create successful response according to Task 3 specification
    const responseData: AnalyzeResponse = {
      success: true,
      data: {
        sceneCount: analysisResult.sceneCount,
        sceneBreakdown,
        complexity: analysisResult.complexity,
        recommendedApproach: analysisResult.recommendedApproach
      }
    };

    // Log detailed analysis results
    console.log('\n📊 Scene Analysis Results');
    console.log('─'.repeat(40));
    console.log(`✅ Analysis Success: true`);
    console.log(`🎬 Scene Count: ${analysisResult.sceneCount}`);
    console.log(`📈 Complexity: ${analysisResult.complexity}`);
    console.log(`🎯 Approach: ${analysisResult.recommendedApproach}`);
    console.log(`👥 Character Consistency: ${analysisResult.requiresCharacterConsistency}`);

    if (analysisResult.scenes.length > 0) {
      console.log('\n🎭 Scene Breakdown:');
      analysisResult.scenes.forEach((scene) => {
        console.log(`\n   Scene ${scene.sceneNumber}:`);
        console.log(`   ├─ Description: ${scene.description}...`);
        console.log(`   ├─ Duration: ${scene.duration}s`);
        console.log(`   └─ Characters: [${scene.characters.join(', ')}]`);
      });
    }

    if (analysisResult.characterDescriptions.length > 0) {
      console.log('\n👥 Character Analysis:');
      analysisResult.characterDescriptions.forEach((char, index) => {
        console.log(`\n   Character ${index + 1} (${char.characterId}):`);
        console.log(`   ├─ Name: ${char.name}`);
        console.log(`   ├─ Age: ${char.age}`);
        console.log(`   └─ Description: ${char.detailedDescription.substring(0, 120)}...`);
      });
    }

    const processingTime = Date.now() - startTime;
    console.log(`\n⚡ Processing Time: ${processingTime}ms`);
    console.log('🎯 Ready for Video Generation');
    console.log('─'.repeat(40));

    return NextResponse.json(responseData, { 
      status: API_STATUS_CODES.SUCCESS 
    });

  } catch (error) {
    // Handle OpenAI and scene analysis errors
    console.error('\n💥 Scene Analysis Error:');
    console.error(error);

    // Check if it's an OpenAI-related error
    if (error instanceof Error && (
      error.message.includes('OpenAI') || 
      error.message.includes('API') ||
      error.message.includes('Invalid prompt')
    )) {
      return createOpenAiErrorResponse(error);
    }

    // Handle unexpected errors
    const errorResponse: AnalyzeResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Unexpected server error during scene analysis'
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