/**
 * Enhanced Request Validation Utilities for API Routes
 * 
 * This module provides reusable validation functions for Next.js API routes
 * following the established patterns from lib/openai/enhance.ts and client.ts.
 * 
 * Key Features:
 * - Generic request validation and JSON parsing
 * - Request sanitization and security checks
 * - Error response formatting
 * - Basic rate limiting helpers
 * - HTTP method validation
 */

import { NextRequest, NextResponse } from 'next/server';
import type { 
  EnhanceRequest,
  AnalyzeRequest,
  RequestValidationResult,
  ApiErrorResponse,
  RateLimitInfo,
  ApiErrorCode
} from '../types/api';
import { 
  API_VALIDATION_CONSTANTS,
  API_STATUS_CODES,
  API_ERROR_CODES
} from '../types/api';
import { ErrorCode } from '../openai/types';
import { handleOpenAIError } from '../openai/client';

// =============================================================================
// GENERIC REQUEST VALIDATION
// =============================================================================

/**
 * Validate and parse JSON request body with comprehensive error handling
 * 
 * @param request - The NextRequest to validate
 * @returns Promise resolving to validation result
 */
export async function validateJsonRequest<T = any>(
  request: NextRequest
): Promise<RequestValidationResult<T>> {
  try {
    // Check Content-Type header
    const contentType = request.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return {
        isValid: false,
        error: 'Request must have Content-Type: application/json',
        code: API_ERROR_CODES.INVALID_REQUEST_FORMAT
      };
    }

    // Parse JSON body
    let body: any;
    try {
      body = await request.json();
    } catch (parseError) {
      return {
        isValid: false,
        error: 'Invalid JSON in request body',
        code: API_ERROR_CODES.INVALID_REQUEST_FORMAT
      };
    }

    // Validate body exists
    if (!body || typeof body !== 'object') {
      return {
        isValid: false,
        error: 'Request body must be a valid JSON object',
        code: API_ERROR_CODES.INVALID_REQUEST_FORMAT
      };
    }

    return {
      isValid: true,
      data: body as T
    };
  } catch (error) {
    return {
      isValid: false,
      error: 'Failed to process request',
      code: API_ERROR_CODES.INTERNAL_ERROR
    };
  }
}

/**
 * Validate HTTP method for API endpoints
 * 
 * @param request - The NextRequest to validate
 * @param allowedMethods - Array of allowed HTTP methods
 * @returns Validation result
 */
export function validateHttpMethod(
  request: NextRequest,
  allowedMethods: string[] = ['POST']
): RequestValidationResult<string> {
  const method = request.method;
  
  if (!allowedMethods.includes(method)) {
    return {
      isValid: false,
      error: `Method ${method} not allowed. Allowed methods: ${allowedMethods.join(', ')}`,
      code: API_ERROR_CODES.INVALID_REQUEST_FORMAT
    };
  }

  return {
    isValid: true,
    data: method
  };
}

// =============================================================================
// INPUT SANITIZATION
// =============================================================================

/**
 * Sanitize text input following the patterns from lib/openai/enhance.ts
 * 
 * @param input - The input string to sanitize
 * @returns Sanitized string
 */
export function sanitizeTextInput(input: string): string {
  if (typeof input !== 'string') return '';
  
  return input
    .trim()
    // Remove HTML tags
    .replace(/<[^>]*>/g, '')
    // Remove potentially harmful characters but keep common punctuation
    .replace(/[<>]/g, '')
    // Normalize whitespace
    .replace(/\s+/g, ' ')
    // Remove leading/trailing whitespace again
    .trim();
}

/**
 * Validate prompt text following existing validation patterns
 * 
 * @param prompt - The prompt to validate
 * @returns Validation result with sanitized prompt
 */
export function validatePromptText(prompt: any): RequestValidationResult<string> {
  // Type guard - ensure input is string
  if (typeof prompt !== 'string') {
    return {
      isValid: false,
      error: 'Prompt must be a string',
      code: API_ERROR_CODES.INVALID_PROMPT_TYPE
    };
  }

  // Sanitize input first
  const sanitized = sanitizeTextInput(prompt);

  // Check if empty after sanitization
  if (!sanitized.trim()) {
    return {
      isValid: false,
      error: 'Prompt is required and cannot be empty',
      code: API_ERROR_CODES.MISSING_PROMPT
    };
  }

  // Length validation
  if (sanitized.length < API_VALIDATION_CONSTANTS.MIN_PROMPT_LENGTH) {
    return {
      isValid: false,
      error: `Prompt must be at least ${API_VALIDATION_CONSTANTS.MIN_PROMPT_LENGTH} character long`,
      code: API_ERROR_CODES.PROMPT_TOO_SHORT
    };
  }

  if (sanitized.length > API_VALIDATION_CONSTANTS.MAX_PROMPT_LENGTH) {
    return {
      isValid: false,
      error: `Prompt must be no more than ${API_VALIDATION_CONSTANTS.MAX_PROMPT_LENGTH} characters long`,
      code: API_ERROR_CODES.PROMPT_TOO_LONG
    };
  }

  // Check for forbidden content (basic implementation)
  const lowerPrompt = sanitized.toLowerCase();
  const forbiddenWords = ['test-forbidden-word']; // Add actual forbidden words as needed

  for (const word of forbiddenWords) {
    if (lowerPrompt.includes(word)) {
      return {
        isValid: false,
        error: 'Prompt contains inappropriate content',
        code: API_ERROR_CODES.INVALID_REQUEST_FORMAT
      };
    }
  }

  return {
    isValid: true,
    data: sanitized
  };
}

// =============================================================================
// SPECIFIC REQUEST VALIDATORS
// =============================================================================

/**
 * Validate EnhanceRequest following Task 3 specifications
 * 
 * @param request - The NextRequest to validate
 * @returns Promise resolving to validation result
 */
export async function validateEnhanceRequest(
  request: NextRequest
): Promise<RequestValidationResult<EnhanceRequest>> {
  // Validate HTTP method
  const methodValidation = validateHttpMethod(request, ['POST']);
  if (!methodValidation.isValid) {
    return {
      isValid: false,
      error: methodValidation.error,
      code: methodValidation.code
    };
  }

  // Parse JSON
  const jsonValidation = await validateJsonRequest<EnhanceRequest>(request);
  if (!jsonValidation.isValid) {
    return {
      isValid: false,
      error: jsonValidation.error,
      code: jsonValidation.code
    };
  }

  const body = jsonValidation.data!;

  // Validate prompt
  const promptValidation = validatePromptText(body.prompt);
  if (!promptValidation.isValid) {
    return {
      isValid: false,
      error: promptValidation.error,
      code: promptValidation.code
    };
  }

  // Validate optional includeWebSearch
  if (body.includeWebSearch !== undefined && typeof body.includeWebSearch !== 'boolean') {
    return {
      isValid: false,
      error: 'includeWebSearch must be a boolean',
      code: API_ERROR_CODES.INVALID_REQUEST_FORMAT
    };
  }

  // Return validated and sanitized request
  const validatedRequest: EnhanceRequest = {
    prompt: promptValidation.data!,
    includeWebSearch: body.includeWebSearch
  };

  return {
    isValid: true,
    data: validatedRequest
  };
}

/**
 * Validate AnalyzeRequest following Task 3 specifications
 * 
 * @param request - The NextRequest to validate
 * @returns Promise resolving to validation result
 */
export async function validateAnalyzeRequest(
  request: NextRequest
): Promise<RequestValidationResult<AnalyzeRequest>> {
  // Validate HTTP method
  const methodValidation = validateHttpMethod(request, ['POST']);
  if (!methodValidation.isValid) {
    return {
      isValid: false,
      error: methodValidation.error,
      code: methodValidation.code
    };
  }

  // Parse JSON
  const jsonValidation = await validateJsonRequest<AnalyzeRequest>(request);
  if (!jsonValidation.isValid) {
    return {
      isValid: false,
      error: jsonValidation.error,
      code: jsonValidation.code
    };
  }

  const body = jsonValidation.data!;

  // Validate prompt
  const promptValidation = validatePromptText(body.prompt);
  if (!promptValidation.isValid) {
    return {
      isValid: false,
      error: promptValidation.error,
      code: promptValidation.code
    };
  }

  // Return validated and sanitized request
  const validatedRequest: AnalyzeRequest = {
    prompt: promptValidation.data!
  };

  return {
    isValid: true,
    data: validatedRequest
  };
}

// =============================================================================
// ERROR RESPONSE FORMATTING
// =============================================================================

/**
 * Create standardized API error response
 * 
 * @param error - Error message or Error object
 * @param status - HTTP status code
 * @param code - API error code
 * @returns NextResponse with formatted error
 */
export function createApiErrorResponse(
  error: string | Error | unknown,
  status: number = API_STATUS_CODES.BAD_REQUEST,
  code: ApiErrorCode = API_ERROR_CODES.INTERNAL_ERROR
): NextResponse<ApiErrorResponse> {
  let errorMessage: string;
  let details: Record<string, any> | undefined;

  if (typeof error === 'string') {
    errorMessage = error;
  } else if (error instanceof Error) {
    errorMessage = error.message;
    details = { stack: error.stack };
  } else {
    errorMessage = 'An unexpected error occurred';
    details = { originalError: String(error) };
  }

  const errorResponse: ApiErrorResponse = {
    success: false,
    error: errorMessage,
    status,
    details,
    timestamp: new Date()
  };

  return NextResponse.json(errorResponse, { status });
}

/**
 * Create validation error response
 * 
 * @param validationResult - The failed validation result
 * @returns NextResponse with validation error
 */
export function createValidationErrorResponse(
  validationResult: RequestValidationResult
): NextResponse<ApiErrorResponse> {
  return createApiErrorResponse(
    validationResult.error || 'Validation failed',
    API_STATUS_CODES.BAD_REQUEST,
    (validationResult.code as ApiErrorCode) || API_ERROR_CODES.INVALID_REQUEST_FORMAT
  );
}

/**
 * Create OpenAI error response using existing error handler
 * 
 * @param error - The OpenAI error to handle
 * @returns NextResponse with formatted OpenAI error
 */
export function createOpenAiErrorResponse(error: unknown): NextResponse<ApiErrorResponse> {
  const openaiError = handleOpenAIError(error);
  
  return createApiErrorResponse(
    openaiError.error,
    API_STATUS_CODES.INTERNAL_SERVER_ERROR,
    API_ERROR_CODES.OPENAI_API_ERROR
  );
}

// =============================================================================
// BASIC RATE LIMITING
// =============================================================================

/**
 * Simple in-memory rate limiting (for basic protection)
 * Note: This is not suitable for production with multiple instances
 * For production, use Redis or a proper rate limiting service
 */
class SimpleRateLimit {
  private requests: Map<string, number[]> = new Map();
  private readonly windowMs: number;
  private readonly maxRequests: number;

  constructor(windowMs: number = 60000, maxRequests: number = 60) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
  }

  /**
   * Check if request is allowed
   * 
   * @param identifier - Unique identifier (IP address, user ID, etc.)
   * @returns Rate limit information
   */
  check(identifier: string): RateLimitInfo {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    // Get or create request log for this identifier
    let requests = this.requests.get(identifier) || [];
    
    // Remove old requests outside the window
    requests = requests.filter(timestamp => timestamp > windowStart);
    
    // Update the map
    this.requests.set(identifier, requests);

    const allowed = requests.length < this.maxRequests;
    
    // If allowed, record this request
    if (allowed) {
      requests.push(now);
      this.requests.set(identifier, requests);
    }

    return {
      allowed,
      remaining: Math.max(0, this.maxRequests - requests.length),
      resetTime: new Date(now + this.windowMs),
      windowSeconds: this.windowMs / 1000
    };
  }

  /**
   * Clean up old entries (call periodically to prevent memory leaks)
   */
  cleanup(): void {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    for (const [identifier, requests] of Array.from(this.requests.entries())) {
      const validRequests = requests.filter((timestamp: number) => timestamp > windowStart);
      if (validRequests.length === 0) {
        this.requests.delete(identifier);
      } else {
        this.requests.set(identifier, validRequests);
      }
    }
  }
}

// Global rate limiter instance
const rateLimiter = new SimpleRateLimit(
  API_VALIDATION_CONSTANTS.RATE_LIMIT_WINDOW * 1000,
  API_VALIDATION_CONSTANTS.DEFAULT_RATE_LIMIT
);

// Cleanup rate limiter every 5 minutes
setInterval(() => rateLimiter.cleanup(), 5 * 60 * 1000);

/**
 * Check rate limit for a request
 * 
 * @param request - The NextRequest to check
 * @returns Rate limit information
 */
export function checkRateLimit(request: NextRequest): RateLimitInfo {
  // Use IP address as identifier (in production, consider using user ID if available)
  const identifier = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
  
  return rateLimiter.check(identifier);
}

/**
 * Create rate limit exceeded error response
 * 
 * @param rateLimitInfo - Rate limit information
 * @returns NextResponse with rate limit error
 */
export function createRateLimitErrorResponse(rateLimitInfo: RateLimitInfo): NextResponse<ApiErrorResponse> {
  const response = createApiErrorResponse(
    `Rate limit exceeded. Try again in ${rateLimitInfo.windowSeconds} seconds.`,
    API_STATUS_CODES.TOO_MANY_REQUESTS,
    API_ERROR_CODES.RATE_LIMIT_EXCEEDED
  );

  // Add rate limit headers
  response.headers.set('X-RateLimit-Limit', API_VALIDATION_CONSTANTS.DEFAULT_RATE_LIMIT.toString());
  response.headers.set('X-RateLimit-Remaining', rateLimitInfo.remaining.toString());
  response.headers.set('X-RateLimit-Reset', rateLimitInfo.resetTime.getTime().toString());

  return response;
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Get client IP address from request
 * 
 * @param request - The NextRequest
 * @returns Client IP address
 */
export function getClientIp(request: NextRequest): string {
  return request.ip || 
         request.headers.get('x-forwarded-for') || 
         request.headers.get('x-real-ip') || 
         'unknown';
}

/**
 * Log API request for monitoring
 * 
 * @param request - The NextRequest
 * @param endpoint - The endpoint name
 * @param startTime - Request start time
 */
export function logApiRequest(
  request: NextRequest,
  endpoint: string,
  startTime: number = Date.now()
): void {
  const ip = getClientIp(request);
  const userAgent = request.headers.get('user-agent') || 'unknown';
  const processingTime = Date.now() - startTime;

  console.log(`🌐 API Request: ${request.method} ${endpoint}`);
  console.log(`   ├─ IP: ${ip}`);
  console.log(`   ├─ User-Agent: ${userAgent.substring(0, 50)}...`);
  console.log(`   └─ Processing: ${processingTime}ms`);
}