/**
 * OpenAI Integration Utility Functions
 * 
 * This module provides utility functions for OpenAI integration following
 * the slop project validation patterns. Includes prompt validation, input
 * sanitization, error formatting, and type guards.
 * 
 * Key Features:
 * - Pure function patterns
 * - TypeScript type guards and assertions
 * - Error handling and input sanitization
 * - Reusable validation logic
 * - Comprehensive JSDoc documentation
 */

import { 
  ValidationResult, 
  ValidationConstraints, 
  DEFAULT_VALIDATION_CONSTRAINTS,
  ErrorCode,
  EnhancementResult,
  TrendContext,
  ProcessingMetadata
} from './types';

/**
 * Type guard to check if a value is a non-empty string
 * 
 * @param value - The value to check
 * @returns True if value is a non-empty string
 */
export function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Type guard to check if a result is a successful enhancement result
 * 
 * @param result - The result to check
 * @returns True if result is successful
 */
export function isSuccessfulEnhancement(result: EnhancementResult): result is EnhancementResult & { success: true } {
  return result.success === true && !!result.enhancedPrompt;
}

/**
 * Type guard to check if enhancement result has trend context
 * 
 * @param result - The enhancement result to check
 * @returns True if result has trend context
 */
export function hasTrendContext(result: EnhancementResult): result is EnhancementResult & { trendContext: TrendContext } {
  return result.success === true && !!result.trendContext;
}

/**
 * Sanitizes user input by removing potentially harmful characters
 * Following the exact pattern from examples/utils/validation.ts
 * 
 * @param input - The input string to sanitize
 * @returns Sanitized string
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return '';
  
  return input
    .trim()
    // Remove HTML tags
    .replace(/<[^>]*>/g, '')
    // Remove potentially harmful characters but keep common punctuation
    .replace(/[<>'"&]/g, '')
    // Normalize whitespace
    .replace(/\s+/g, ' ')
    // Remove leading/trailing whitespace again
    .trim();
}

/**
 * Enhanced prompt sanitization specifically for video prompts
 * 
 * @param input - The input string to sanitize
 * @returns Sanitized string optimized for video generation
 */
export function sanitizePromptForVideo(input: string): string {
  if (typeof input !== 'string') return '';
  
  return input
    .trim()
    // Remove HTML tags
    .replace(/<[^>]*>/g, '')
    // Remove script tags and content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Allow common video-related punctuation and symbols
    .replace(/[<>]/g, '')
    // Keep common symbols used in video descriptions (simplified for ES5 compatibility)
    .replace(/[^\w\s\.,!?;:'"()\-#@&*+=/%]/g, '')
    // Normalize whitespace
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Validates a prompt against specified constraints
 * Following the pattern from examples/utils/validation.ts
 * 
 * @param prompt - The prompt to validate
 * @param constraints - Validation constraints (optional)
 * @returns Validation result with error details
 */
export function validatePrompt(
  prompt: string, 
  constraints: ValidationConstraints = DEFAULT_VALIDATION_CONSTRAINTS
): ValidationResult {
  // Type guard - ensure input is string
  if (typeof prompt !== 'string') {
    return {
      isValid: false,
      error: 'Prompt must be a string',
      code: ErrorCode.VALIDATION_ERROR
    };
  }

  // Sanitize input first
  const sanitized = sanitizePromptForVideo(prompt);

  // Check if empty after sanitization
  if (!sanitized.trim()) {
    return {
      isValid: false,
      error: 'Prompt is required and cannot be empty',
      code: ErrorCode.PROMPT_TOO_SHORT
    };
  }

  // Length validation
  const length = sanitized.length;
  
  if (length < constraints.minLength) {
    return {
      isValid: false,
      error: `Prompt must be at least ${constraints.minLength} character${constraints.minLength === 1 ? '' : 's'} long`,
      code: ErrorCode.PROMPT_TOO_SHORT
    };
  }

  if (length > constraints.maxLength) {
    return {
      isValid: false,
      error: `Prompt must be no more than ${constraints.maxLength} characters long`,
      code: ErrorCode.PROMPT_TOO_LONG
    };
  }

  // Pattern validation
  if (constraints.allowedPattern && !constraints.allowedPattern.test(sanitized)) {
    return {
      isValid: false,
      error: 'Prompt contains invalid characters',
      code: ErrorCode.INVALID_CHARACTERS
    };
  }

  // Forbidden content check
  if (constraints.forbiddenWords && constraints.forbiddenWords.length > 0) {
    const lowerPrompt = sanitized.toLowerCase();
    for (const word of constraints.forbiddenWords) {
      if (lowerPrompt.includes(word.toLowerCase())) {
        return {
          isValid: false,
          error: 'Prompt contains inappropriate content',
          code: ErrorCode.FORBIDDEN_CONTENT
        };
      }
    }
  }

  return {
    isValid: true,
    sanitizedPrompt: sanitized
  };
}

/**
 * Validates string length constraints
 * Following the pattern from examples/utils/validation.ts
 * 
 * @param value - The string to validate
 * @param fieldName - Name of the field for error message
 * @param minLength - Minimum length (optional)
 * @param maxLength - Maximum length (optional)
 * @returns Error message if invalid, undefined if valid
 */
export function validateLength(
  value: string,
  fieldName: string,
  minLength?: number,
  maxLength?: number
): string | undefined {
  if (typeof value !== 'string') {
    return `${fieldName} must be a string`;
  }

  const length = value.trim().length;

  if (minLength !== undefined && length < minLength) {
    return `${fieldName} must be at least ${minLength} characters long`;
  }

  if (maxLength !== undefined && length > maxLength) {
    return `${fieldName} must be no more than ${maxLength} characters long`;
  }

  return undefined;
}

/**
 * Validates a required field is not empty
 * Following the pattern from examples/utils/validation.ts
 * 
 * @param value - The value to validate
 * @param fieldName - Name of the field for error message
 * @returns Error message if invalid, undefined if valid
 */
export function validateRequired(value: unknown, fieldName: string): string | undefined {
  if (!isNonEmptyString(value)) {
    return `${fieldName} is required`;
  }
  return undefined;
}

/**
 * Creates a validation function for prompts
 * Following the pattern from examples/utils/validation.ts
 * 
 * @param validations - Array of validation functions
 * @returns Combined validation function
 */
export function createPromptValidator(
  validations: Array<(value: string) => string | undefined>
) {
  return (value: string): string | undefined => {
    for (const validate of validations) {
      const error = validate(value);
      if (error) return error;
    }
    return undefined;
  };
}

/**
 * Format error message for user display
 * 
 * @param error - The error to format
 * @param context - Additional context for the error
 * @returns Formatted error message
 */
export function formatErrorMessage(error: string, context?: string): string {
  if (!error) return 'An unknown error occurred';
  
  // Capitalize first letter
  const formatted = error.charAt(0).toUpperCase() + error.slice(1);
  
  // Add period if not present
  const withPeriod = formatted.endsWith('.') ? formatted : formatted + '.';
  
  // Add context if provided
  return context ? `${withPeriod} ${context}` : withPeriod;
}

/**
 * Extract meaningful information from processing metadata
 * 
 * @param metadata - Processing metadata to analyze
 * @returns Human-readable processing summary
 */
export function summarizeProcessingMetadata(metadata: ProcessingMetadata): string {
  const { tokensUsed, processingTime, webSearchUsed, model } = metadata;
  
  const timeInSeconds = (processingTime / 1000).toFixed(1);
  const searchInfo = webSearchUsed ? 'with trend research' : 'without web search';
  
  return `Processed in ${timeInSeconds}s using ${model} (${tokensUsed} tokens, ${searchInfo})`;
}

/**
 * Check if a string contains potential video-related keywords
 * 
 * @param text - Text to analyze
 * @returns True if text seems video-appropriate
 */
export function isVideoAppropriate(text: string): boolean {
  if (!isNonEmptyString(text)) return false;
  
  const videoKeywords = [
    'scene', 'video', 'visual', 'camera', 'shot', 'frame',
    'action', 'character', 'setting', 'background', 'foreground',
    'motion', 'movement', 'expression', 'gesture', 'lighting',
    'angle', 'close-up', 'wide', 'zoom', 'pan', 'tilt'
  ];
  
  const lowerText = text.toLowerCase();
  return videoKeywords.some(keyword => lowerText.includes(keyword));
}

/**
 * Extract potential scene count from enhanced prompt
 * 
 * @param enhancedPrompt - The enhanced prompt to analyze
 * @returns Estimated number of scenes
 */
export function estimateSceneCount(enhancedPrompt: string): number {
  if (!isNonEmptyString(enhancedPrompt)) return 1;
  
  const sceneIndicators = [
    'cut to', 'then', 'next', 'after', 'meanwhile', 'suddenly',
    'scene', 'shot', 'angle', 'camera moves', 'switch to'
  ];
  
  const lowerPrompt = enhancedPrompt.toLowerCase();
  let sceneCount = 1; // At least one scene
  
  for (const indicator of sceneIndicators) {
    const matches = lowerPrompt.split(indicator).length - 1;
    sceneCount += matches;
  }
  
  // Cap at reasonable maximum
  return Math.min(sceneCount, 5);
}

/**
 * Generate a simple hash for prompt comparison
 * 
 * @param prompt - Prompt to hash
 * @returns Simple hash string
 */
export function hashPrompt(prompt: string): string {
  if (!isNonEmptyString(prompt)) return '';
  
  let hash = 0;
  for (let i = 0; i < prompt.length; i++) {
    const char = prompt.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
}

/**
 * Check if two prompts are similar (basic similarity check)
 * 
 * @param prompt1 - First prompt
 * @param prompt2 - Second prompt
 * @returns True if prompts are similar
 */
export function arePromptsSimilar(prompt1: string, prompt2: string): boolean {
  if (!isNonEmptyString(prompt1) || !isNonEmptyString(prompt2)) return false;
  
  const normalized1 = prompt1.toLowerCase().replace(/[^\w\s]/g, '').trim();
  const normalized2 = prompt2.toLowerCase().replace(/[^\w\s]/g, '').trim();
  
  if (normalized1 === normalized2) return true;
  
  // Simple word overlap check
  const words1 = normalized1.split(/\s+/);
  const words2 = normalized2.split(/\s+/);
  
  const overlap = words1.filter(word => words2.includes(word)).length;
  const minLength = Math.min(words1.length, words2.length);
  
  return minLength > 0 && (overlap / minLength) > 0.7; // 70% word overlap
}

/**
 * Usage Examples:
 * 
 * // Prompt validation
 * const validation = validatePrompt("Create a funny cat video");
 * if (!validation.isValid) {
 *   console.error(validation.error);
 * }
 * 
 * // Input sanitization
 * const cleanPrompt = sanitizePromptForVideo(userInput);
 * 
 * // Type guards
 * if (isNonEmptyString(userInput)) {
 *   processPrompt(userInput);
 * }
 * 
 * // Enhancement result checking
 * if (isSuccessfulEnhancement(result)) {
 *   console.log(result.enhancedPrompt);
 * }
 * 
 * // Error formatting
 * const userError = formatErrorMessage(apiError, "Please try again.");
 * 
 * // Processing summary
 * const summary = summarizeProcessingMetadata(result.metadata);
 */