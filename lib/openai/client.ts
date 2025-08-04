/**
 * OpenAI API Client Configuration
 * 
 * This module provides a configured OpenAI client instance for the Slop project.
 * Uses the latest OpenAI SDK v5.11.0 with Responses API for web search capabilities.
 * 
 * Key Features:
 * - Environment variable configuration
 * - Error handling and retry logic
 * - TypeScript type safety
 * - Connection validation
 */

import OpenAI from 'openai';
import { ErrorCode, ErrorResponse } from './types';

/**
 * Initialize OpenAI client with environment variable configuration
 * 
 * @throws {Error} If OPENAI_API_KEY environment variable is not set
 */
function createOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    throw new Error(
      'OPENAI_API_KEY environment variable is required. Please add it to your .env.local file.'
    );
  }

  return new OpenAI({
    apiKey,
    // Add timeout and retry configuration
    timeout: 60000, // 60 seconds timeout
    maxRetries: 3,  // Retry failed requests up to 3 times
  });
}

/**
 * Global OpenAI client instance
 * Lazily initialized to ensure environment variables are loaded
 */
let openaiClient: OpenAI | null = null;

/**
 * Get the configured OpenAI client instance
 * 
 * @returns OpenAI client instance
 * @throws {Error} If API key is not configured
 */
export function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    openaiClient = createOpenAIClient();
  }
  return openaiClient;
}

/**
 * Test OpenAI API connection
 * 
 * @returns Promise that resolves to true if connection is successful
 * @throws {Error} If connection fails
 */
export async function testConnection(): Promise<boolean> {
  try {
    const client = getOpenAIClient();
    
    // Make a minimal API call to test the connection
    const response = await client.models.list();
    
    // Check if we got a valid response
    if (response && response.data && Array.isArray(response.data)) {
      return true;
    }
    
    throw new Error('Invalid response from OpenAI API');
  } catch (error) {
    if (error instanceof OpenAI.APIError) {
      if (error.status === 401) {
        throw new Error('Invalid OpenAI API key. Please check your OPENAI_API_KEY environment variable.');
      } else if (error.status === 429) {
        throw new Error('OpenAI API rate limit exceeded. Please try again later.');
      } else {
        throw new Error(`OpenAI API error: ${error.message}`);
      }
    } else if (error instanceof Error) {
      throw new Error(`Connection test failed: ${error.message}`);
    } else {
      throw new Error('Unknown error occurred during connection test');
    }
  }
}

/**
 * Handle OpenAI API errors and convert them to standardized ErrorResponse format
 * 
 * @param error - The error to handle
 * @returns Standardized error response
 */
export function handleOpenAIError(error: unknown): ErrorResponse {
  if (error instanceof OpenAI.APIError) {
    switch (error.status) {
      case 401:
        return {
          success: false,
          error: 'Invalid OpenAI API key. Please check your configuration.',
          code: ErrorCode.INVALID_API_KEY,
          details: { status: error.status },
          timestamp: new Date()
        };
      case 429:
        return {
          success: false,
          error: 'OpenAI API rate limit exceeded. Please try again in a moment.',
          code: ErrorCode.RATE_LIMIT,
          details: { status: error.status, retryAfter: error.headers?.['retry-after'] },
          timestamp: new Date()
        };
      case 400:
        return {
          success: false,
          error: 'Invalid request format. Please check your prompt and try again.',
          code: ErrorCode.API_ERROR,
          details: { status: error.status, message: error.message },
          timestamp: new Date()
        };
      case 500:
      case 502:
      case 503:
      case 504:
        return {
          success: false,
          error: 'OpenAI service is temporarily unavailable. Please try again later.',
          code: ErrorCode.API_ERROR,
          details: { status: error.status },
          timestamp: new Date()
        };
      default:
        return {
          success: false,
          error: `OpenAI API error: ${error.message}`,
          code: ErrorCode.API_ERROR,
          details: { status: error.status, message: error.message },
          timestamp: new Date()
        };
    }
  }
  
  if (error instanceof Error) {
    // Network or other connection errors
    if (error.message.includes('network') || error.message.includes('timeout')) {
      return {
        success: false,
        error: 'Network error. Please check your connection and try again.',
        code: ErrorCode.NETWORK_ERROR,
        details: { message: error.message },
        timestamp: new Date()
      };
    }
    
    // Configuration errors
    if (error.message.includes('API key') || error.message.includes('environment')) {
      return {
        success: false,
        error: error.message,
        code: ErrorCode.CONFIGURATION_ERROR,
        details: { message: error.message },
        timestamp: new Date()
      };
    }
  }
  
  // Unknown errors
  return {
    success: false,
    error: 'An unexpected error occurred. Please try again.',
    code: ErrorCode.UNKNOWN_ERROR,
    details: { 
      error: error instanceof Error ? error.message : String(error) 
    },
    timestamp: new Date()
  };
}

/**
 * Check if OpenAI API key is configured
 * 
 * @returns Boolean indicating if API key is available
 */
export function isApiKeyConfigured(): boolean {
  return !!process.env.OPENAI_API_KEY;
}

/**
 * Get OpenAI client configuration status
 * 
 * @returns Configuration status information
 */
export function getClientStatus(): {
  configured: boolean;
  hasClient: boolean;
  apiKeyLength?: number;
} {
  const apiKey = process.env.OPENAI_API_KEY;
  
  return {
    configured: !!apiKey,
    hasClient: openaiClient !== null,
    apiKeyLength: apiKey ? apiKey.length : undefined
  };
}

/**
 * Reset the client instance (useful for testing or configuration changes)
 */
export function resetClient(): void {
  openaiClient = null;
}