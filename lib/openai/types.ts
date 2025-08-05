/**
 * TypeScript interfaces for OpenAI integration in Slop
 * 
 * This module defines all TypeScript interfaces and types for OpenAI API integration,
 * prompt enhancement services, and Veo3-specific formats.
 * 
 * Key Features:
 * - OpenAI API response interfaces
 * - Enhancement service interfaces  
 * - Error handling interfaces
 * - Veo3-specific prompt formats
 * - Validation result types
 */

// =============================================================================
// CORE OPENAI API INTERFACES
// =============================================================================

/**
 * OpenAI Responses API response structure
 */
export interface OpenAIResponse {
  /** Unique identifier for the response */
  id: string;
  /** Response choices from the model */
  choices: Array<{
    /** Message content and metadata */
    message: {
      /** Response content */
      content: string;
      /** Tool calls made during response (for web search) */
      tool_calls?: Array<{
        /** Type of tool called */
        type: string;
        /** Function call details */
        function: {
          /** Function name */
          name: string;
          /** Function arguments as JSON string */
          arguments: string;
        };
      }>;
    };
    /** Reason why the response finished */
    finish_reason: string;
  }>;
  /** Token usage information */
  usage: {
    /** Tokens used in the prompt */
    prompt_tokens: number;
    /** Tokens used in the completion */
    completion_tokens: number;
    /** Total tokens used */
    total_tokens: number;
  };
}

/**
 * Options for prompt enhancement
 */
export interface EnhanceOptions {
  /** Enable web search for trend research */
  includeWebSearch?: boolean;
  /** Search context size for web search */
  searchContextSize?: 'low' | 'medium' | 'high';
  /** Maximum tokens for response */
  maxTokens?: number;
  /** Temperature for creativity (0-1) */
  temperature?: number;
  /** Enable scene analysis for multi-scene detection and character consistency */
  includeSceneAnalysis?: boolean;
}

/**
 * Trend context from web search
 */
export interface TrendContext {
  /** Search query used */
  query: string;
  /** Relevant trends found */
  trends: string[];
  /** Context summary */
  summary: string;
  /** Search timestamp */
  searchedAt: Date;
}

/**
 * Processing metadata for enhancement requests
 */
export interface ProcessingMetadata {
  /** Total tokens used in request */
  tokensUsed: number;
  /** Processing time in milliseconds */
  processingTime: number;
  /** Whether web search was used */
  webSearchUsed: boolean;
  /** OpenAI model used */
  model: string;
  /** Request timestamp */
  timestamp: Date;
}

// =============================================================================
// ENHANCEMENT SERVICE INTERFACES
// =============================================================================

/**
 * Result of prompt enhancement operation
 */
export interface EnhancementResult {
  /** Whether the enhancement succeeded */
  success: boolean;
  /** Original user prompt */
  originalPrompt: string;
  /** Enhanced prompt for Veo3 */
  enhancedPrompt?: string;
  /** Trend context if web search was used */
  trendContext?: TrendContext;
  /** Processing metadata */
  metadata?: ProcessingMetadata;
  /** Scene analysis result if scene analysis was performed */
  sceneAnalysis?: EnhancedSceneAnalysisResult;
  /** Error information if enhancement failed */
  error?: string;
  /** Error code for programmatic handling */
  code?: string;
}

/**
 * Service interface for prompt enhancement
 */
export interface PromptEnhancementService {
  /** 
   * Enhance a user prompt for Veo3 video generation
   * 
   * @param userPrompt - The original user prompt
   * @param options - Enhancement options
   * @returns Promise resolving to enhancement result
   */
  enhancePrompt(userPrompt: string, options?: EnhanceOptions): Promise<EnhancementResult>;
  
  /** 
   * Research current trends for a topic
   * 
   * @param topic - The topic to research
   * @returns Promise resolving to trend context
   */
  researchTrends(topic: string): Promise<TrendContext>;
  
  /** 
   * Validate and sanitize user input
   * 
   * @param prompt - The prompt to validate
   * @returns Validation result
   */
  validateInput(prompt: string): ValidationResult;
  
  /** 
   * Handle API errors with meaningful responses
   * 
   * @param error - The error to handle
   * @returns Formatted error response
   */
  handleApiError(error: unknown): ErrorResponse;
}

// =============================================================================
// VALIDATION INTERFACES
// =============================================================================

/**
 * Prompt validation result
 */
export interface ValidationResult {
  /** Whether the prompt is valid */
  isValid: boolean;
  /** Error message if invalid */
  error?: string;
  /** Validation error code */
  code?: string;
  /** Sanitized prompt if valid */
  sanitizedPrompt?: string;
}

/**
 * Input validation constraints
 */
export interface ValidationConstraints {
  /** Minimum prompt length */
  minLength: number;
  /** Maximum prompt length */
  maxLength: number;
  /** Allowed characters regex */
  allowedPattern?: RegExp;
  /** Forbidden words or phrases */
  forbiddenWords?: string[];
}

// =============================================================================
// ERROR HANDLING INTERFACES
// =============================================================================

/**
 * Standard error response format
 */
export interface ErrorResponse {
  /** Whether the operation succeeded */
  success: false;
  /** Human-readable error message */
  error: string;
  /** Machine-readable error code */
  code: string;
  /** Additional error details */
  details?: Record<string, any>;
  /** Timestamp when error occurred */
  timestamp?: Date;
}

/**
 * Error codes for different failure scenarios
 */
export enum ErrorCode {
  // Validation errors
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  PROMPT_TOO_SHORT = 'PROMPT_TOO_SHORT',
  PROMPT_TOO_LONG = 'PROMPT_TOO_LONG',
  INVALID_CHARACTERS = 'INVALID_CHARACTERS',
  FORBIDDEN_CONTENT = 'FORBIDDEN_CONTENT',
  
  // API errors
  INVALID_API_KEY = 'INVALID_API_KEY',
  RATE_LIMIT = 'RATE_LIMIT',
  API_ERROR = 'API_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  
  // Processing errors
  ENHANCEMENT_FAILED = 'ENHANCEMENT_FAILED',
  WEB_SEARCH_FAILED = 'WEB_SEARCH_FAILED',
  TIMEOUT = 'TIMEOUT',
  
  // System errors
  CONFIGURATION_ERROR = 'CONFIGURATION_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

// =============================================================================
// VEO3-SPECIFIC INTERFACES
// =============================================================================

/**
 * Veo3-optimized prompt format
 * Based on VEO3_FAL_API.md specifications
 */
export interface Veo3Prompt {
  /** Main prompt text for video generation */
  prompt: string;
  /** Aspect ratio for TikTok optimization */
  aspectRatio: '9:16' | '16:9' | '1:1';
  /** Video duration (max 8 seconds) */
  duration: '8s';
  /** Whether to generate audio */
  generateAudio: boolean;
  /** Whether to enhance the prompt */
  enhancePrompt: boolean;
  /** Optional negative prompt */
  negativePrompt?: string;
  /** Optional seed for reproducibility */
  seed?: number;
}

/**
 * Scene information for multi-scene videos
 */
export interface SceneInfo {
  /** Scene number in sequence */
  sceneNumber: number;
  /** Scene description */
  description: string;
  /** Estimated duration in seconds */
  duration: number;
  /** Characters present in scene */
  characters: string[];
  /** Visual elements to include */
  visualElements: string[];
  /** Audio/dialogue elements */
  audioElements: string[];
}

/**
 * Multi-scene analysis result
 */
export interface SceneAnalysisResult {
  /** Whether multiple scenes are recommended */
  isMultiScene: boolean;
  /** Total number of recommended scenes */
  sceneCount: number;
  /** Individual scene breakdowns */
  scenes: SceneInfo[];
  /** Overall complexity assessment */
  complexity: 'simple' | 'moderate' | 'complex';
  /** Recommended approach */
  recommendedApproach: 'single' | 'multi-scene';
}

/**
 * Character description for consistent faces across scenes
 * Based on Veo3 research - highly specific details ensure better consistency
 */
export interface CharacterDescription {
  /** Unique identifier for the character */
  characterId: string;
  /** Character name or description identifier */
  name: string;
  /** Complete detailed description for Veo3 consistency (exact wording to reuse) */
  detailedDescription: string;
  /** Age description (e.g., "in her late 20s") */
  age: string;
  /** Hair description (e.g., "straight shoulder-length jet-black hair with soft bangs") */
  hair: string;
  /** Clothing description (e.g., "sleek black blouse with subtle satin sheen, slightly puffed sleeves") */
  clothing: string;
  /** Facial features (e.g., "light and natural makeup, with a warm smile") */
  facialFeatures: string;
  /** Accessories (e.g., "minimal silver jewelry", "thin, gold-rimmed circular spectacles") */
  accessories: string;
  /** Unique identifying details for better Veo3 consistency */
  uniqueIdentifiers: string[];
}

/**
 * Enhanced scene analysis result with character consistency support
 */
export interface EnhancedSceneAnalysisResult extends SceneAnalysisResult {
  /** Whether character consistency is required across scenes */
  requiresCharacterConsistency: boolean;
  /** Detailed character descriptions for Veo3 consistency */
  characterDescriptions: CharacterDescription[];
  /** Mapping of scene numbers to character IDs present in each scene */
  sceneCharacterMappings: Record<number, string[]>;
}

// =============================================================================
// UTILITY TYPES
// =============================================================================

/**
 * Success response wrapper
 */
export interface SuccessResponse<T> {
  success: true;
  data: T;
}

/**
 * Result type that can be either success or error
 */
export type Result<T> = SuccessResponse<T> | ErrorResponse;

/**
 * Type guard to check if result is successful
 */
export function isSuccessResult<T>(result: Result<T>): result is SuccessResponse<T> {
  return result.success === true;
}

/**
 * Type guard to check if result is an error
 */
export function isErrorResult<T>(result: Result<T>): result is ErrorResponse {
  return result.success === false;
}

// =============================================================================
// CONSTANTS
// =============================================================================

/**
 * Default validation constraints for prompts
 */
export const DEFAULT_VALIDATION_CONSTRAINTS: ValidationConstraints = {
  minLength: 1,
  maxLength: 400, // Matching PromptInput.tsx maxLength
  allowedPattern: /^[\w\s\.,!?;:'"()\-]+$/,
  forbiddenWords: [
    // Add any forbidden words/phrases here
    'test-forbidden-word' // placeholder
  ]
};

/**
 * Default enhancement options
 */
export const DEFAULT_ENHANCE_OPTIONS: Required<EnhanceOptions> = {
  includeWebSearch: true,
  searchContextSize: 'medium',
  maxTokens: 500,
  temperature: 0.7,
  includeSceneAnalysis: false
};

/**
 * Default Veo3 settings for TikTok optimization
 */
export const DEFAULT_VEO3_SETTINGS: Omit<Veo3Prompt, 'prompt'> = {
  aspectRatio: '9:16',
  duration: '8s',
  generateAudio: true,
  enhancePrompt: true
};