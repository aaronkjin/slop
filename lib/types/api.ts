/**
 * API Type Definitions for OpenAI Endpoints
 * 
 * This module defines TypeScript interfaces for API request/response objects
 * following the exact specifications from TASK_3.md. These types ensure
 * type safety and consistency across the OpenAI API routes.
 * 
 * Key Features:
 * - Request/response interfaces for /api/openai/enhance
 * - Request/response interfaces for /api/openai/analyze  
 * - Error response interfaces
 * - Validation utilities types
 * - Rate limiting types
 */

// =============================================================================
// ENHANCE ENDPOINT INTERFACES
// =============================================================================

/**
 * Request interface for POST /api/openai/enhance
 * Used for prompt enhancement with optional web search
 */
export interface EnhanceRequest {
  /** User's original prompt (max 400 characters) */
  prompt: string;
  /** Whether to include trend research via web search */
  includeWebSearch?: boolean;
}

/**
 * Response interface for POST /api/openai/enhance
 * Returns enhanced prompts ready for Veo3 video generation
 */
export interface EnhanceResponse {
  /** Whether the enhancement operation succeeded */
  success: boolean;
  /** Enhanced prompt data (only present if success: true) */
  data?: {
    /** User's original prompt */
    originalPrompt: string;
    /** Array of Veo3-ready enhanced prompts */
    enhancedPrompts: string[];
    /** Number of scenes detected/generated */
    sceneCount: number;
    /** Trend research results (if web search was enabled) */
    webSearchContext?: string;
    /** Processing metadata */
    metadata: {
      /** Processing time in milliseconds */
      processingTime: number;
      /** Total tokens used by OpenAI */
      tokensUsed: number;
    };
  };
  /** Error message (only present if success: false) */
  error?: string;
}

// =============================================================================
// ANALYZE ENDPOINT INTERFACES
// =============================================================================

/**
 * Request interface for POST /api/openai/analyze
 * Used for scene analysis and breakdown
 */
export interface AnalyzeRequest {
  /** User's original prompt to analyze */
  prompt: string;
}

/**
 * Scene breakdown information for analysis response
 */
export interface SceneBreakdown {
  /** Scene number in sequence */
  sceneNumber: number;
  /** Scene description */
  description: string;
  /** Estimated duration in seconds */
  duration: number;
  /** Characters present in this scene */
  characters: string[];
}

/**
 * Response interface for POST /api/openai/analyze
 * Returns scene analysis and breakdown information
 */
export interface AnalyzeResponse {
  /** Whether the analysis operation succeeded */
  success: boolean;
  /** Scene analysis data (only present if success: true) */
  data?: {
    /** Total number of scenes recommended */
    sceneCount: number;
    /** Detailed breakdown of each scene */
    sceneBreakdown: SceneBreakdown[];
    /** Overall complexity assessment */
    complexity: 'simple' | 'moderate' | 'complex';
    /** Recommended video generation approach */
    recommendedApproach: 'single' | 'multi-scene';
  };
  /** Error message (only present if success: false) */
  error?: string;
}

// =============================================================================
// VALIDATION AND UTILITY INTERFACES
// =============================================================================

/**
 * Generic API error response interface
 * Used for consistent error formatting across all endpoints
 */
export interface ApiErrorResponse {
  /** Always false for error responses */
  success: false;
  /** Human-readable error message */
  error: string;
  /** HTTP status code */
  status?: number;
  /** Additional error details for debugging */
  details?: Record<string, any>;
  /** Error timestamp */
  timestamp?: Date;
}

/**
 * Request validation result interface
 * Used by validation utilities to return validation status
 */
export interface RequestValidationResult<T = any> {
  /** Whether the request is valid */
  isValid: boolean;
  /** Validated and sanitized data (if valid) */
  data?: T;
  /** Validation error message (if invalid) */
  error?: string;
  /** Validation error code for programmatic handling */
  code?: string;
}

/**
 * Rate limiting information interface
 * Used for basic rate limiting implementation
 */
export interface RateLimitInfo {
  /** Whether the request is allowed */
  allowed: boolean;
  /** Remaining requests in current window */
  remaining: number;
  /** Reset time for rate limit window */
  resetTime: Date;
  /** Rate limit window in seconds */
  windowSeconds: number;
}

// =============================================================================
// TYPE GUARDS AND UTILITIES
// =============================================================================

/**
 * Type guard to check if a response is an error response
 * 
 * @param response - The response to check
 * @returns True if the response is an error response
 */
export function isApiErrorResponse(response: any): response is ApiErrorResponse {
  return response && response.success === false && typeof response.error === 'string';
}

/**
 * Type guard to check if a response is a successful enhance response
 * 
 * @param response - The response to check
 * @returns True if the response is a successful enhance response
 */
export function isEnhanceResponse(response: any): response is EnhanceResponse {
  return response && 
         typeof response.success === 'boolean' && 
         (response.success === false || response.data);
}

/**
 * Type guard to check if a response is a successful analyze response
 * 
 * @param response - The response to check  
 * @returns True if the response is a successful analyze response
 */
export function isAnalyzeResponse(response: any): response is AnalyzeResponse {
  return response && 
         typeof response.success === 'boolean' && 
         (response.success === false || response.data);
}

// =============================================================================
// CONSTANTS
// =============================================================================

/**
 * API validation constants
 * Matches the constraints from PromptInput.tsx and existing validation
 */
export const API_VALIDATION_CONSTANTS = {
  /** Maximum prompt length in characters */
  MAX_PROMPT_LENGTH: 400,
  /** Minimum prompt length in characters */
  MIN_PROMPT_LENGTH: 1,
  /** Maximum processing time in milliseconds before timeout */
  MAX_PROCESSING_TIME: 30000, // 30 seconds
  /** Default rate limit: requests per minute */
  DEFAULT_RATE_LIMIT: 60,
  /** Rate limit window in seconds */
  RATE_LIMIT_WINDOW: 60
} as const;

/**
 * HTTP status codes used by the API endpoints
 */
export const API_STATUS_CODES = {
  SUCCESS: 200,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503
} as const;

/**
 * Error codes for different failure scenarios
 * Extends the existing ErrorCode enum from lib/openai/types.ts
 */
export const API_ERROR_CODES = {
  // Request validation errors
  INVALID_REQUEST_FORMAT: 'INVALID_REQUEST_FORMAT',
  MISSING_PROMPT: 'MISSING_PROMPT',
  PROMPT_TOO_SHORT: 'PROMPT_TOO_SHORT',
  PROMPT_TOO_LONG: 'PROMPT_TOO_LONG',
  INVALID_PROMPT_TYPE: 'INVALID_PROMPT_TYPE',
  
  // Rate limiting errors
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  
  // Processing errors
  ENHANCEMENT_FAILED: 'ENHANCEMENT_FAILED',
  ANALYSIS_FAILED: 'ANALYSIS_FAILED',
  OPENAI_API_ERROR: 'OPENAI_API_ERROR',
  TIMEOUT: 'TIMEOUT',
  
  // System errors
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE'
} as const;

// Export type for the error codes
export type ApiErrorCode = typeof API_ERROR_CODES[keyof typeof API_ERROR_CODES];