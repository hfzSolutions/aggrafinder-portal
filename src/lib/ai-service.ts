/**
 * Professional AI Service Layer
 * Handles all AI API interactions with proper error handling and retry logic
 */

import {
  buildPrompt,
  getModelConfig,
  prepareConversationContext,
  buildAPIRequest,
  QUICK_TOOL_SYSTEM_PROMPT,
  SUGGESTION_SYSTEM_PROMPT,
  COMPARISON_SYSTEM_PROMPT,
  CORE_SYSTEM_PROMPT,
  MODEL_CONFIGS,
} from './prompt-templates';

export interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AIResponse {
  content: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  model?: string;
  finish_reason?: string;
}

export interface ChatOptions {
  toolName: string;
  toolPrompt: string;
  conversationHistory?: AIMessage[];
  maxRetries?: number;
  timeout?: number;
  customConfig?: Partial<typeof MODEL_CONFIGS.FACTUAL>;
}

export interface SuggestionOptions {
  toolName: string;
  lastAssistantMessage: string;
  conversationHistory?: AIMessage[];
  count?: number;
}

/**
 * Enhanced error types for better error handling
 */
export class AIServiceError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode?: number,
    public retryable: boolean = false
  ) {
    super(message);
    this.name = 'AIServiceError';
  }
}

/**
 * Rate limiting helper
 */
class RateLimiter {
  private requests: number[] = [];
  private readonly maxRequests: number;
  private readonly windowMs: number;

  constructor(maxRequests: number = 60, windowMs: number = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  canMakeRequest(): boolean {
    const now = Date.now();
    this.requests = this.requests.filter((time) => now - time < this.windowMs);

    if (this.requests.length >= this.maxRequests) {
      return false;
    }

    this.requests.push(now);
    return true;
  }

  getResetTime(): number {
    if (this.requests.length === 0) return 0;
    return Math.max(0, this.requests[0] + this.windowMs - Date.now());
  }
}

/**
 * Main AI Service Class
 */
export class AIService {
  private readonly apiKey: string;
  private readonly baseUrl: string =
    'https://openrouter.ai/api/v1/chat/completions';
  private readonly rateLimiter: RateLimiter;
  private readonly defaultTimeout: number = 30000;

  constructor() {
    this.apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
    if (!this.apiKey) {
      throw new AIServiceError(
        'OpenRouter API key not configured',
        'MISSING_API_KEY',
        undefined,
        false
      );
    }
    this.rateLimiter = new RateLimiter();
  }

  /**
   * Core chat completion method with proper error handling
   */
  async chat(userInput: string, options: ChatOptions): Promise<AIResponse> {
    this.validateInput(userInput, options);

    // Check rate limiting
    if (!this.rateLimiter.canMakeRequest()) {
      const resetTime = this.rateLimiter.getResetTime();
      throw new AIServiceError(
        `Rate limit exceeded. Try again in ${Math.ceil(
          resetTime / 1000
        )} seconds`,
        'RATE_LIMIT_EXCEEDED',
        429,
        true
      );
    }

    const systemPrompt = buildPrompt(QUICK_TOOL_SYSTEM_PROMPT, {
      TOOL_NAME: options.toolName,
      TOOL_PROMPT: options.toolPrompt,
    });

    const conversationHistory = prepareConversationContext(
      options.conversationHistory || [],
      10, // maxMessages
      4000 // maxTokensEstimate
    );

    const config = getModelConfig('FACTUAL', options.customConfig);
    const requestPayload = buildAPIRequest(
      systemPrompt,
      conversationHistory,
      userInput,
      config
    );

    return this.makeRequest(
      requestPayload,
      options.maxRetries,
      options.timeout
    );
  }

  /**
   * Generate contextual suggestions
   */
  async generateSuggestions(options: SuggestionOptions): Promise<string[]> {
    if (!options.lastAssistantMessage?.trim()) {
      throw new AIServiceError(
        'Last assistant message is required for suggestions',
        'INVALID_INPUT',
        400,
        false
      );
    }

    // Check rate limiting
    if (!this.rateLimiter.canMakeRequest()) {
      throw new AIServiceError(
        'Rate limit exceeded for suggestions',
        'RATE_LIMIT_EXCEEDED',
        429,
        true
      );
    }

    const systemPrompt = buildPrompt(SUGGESTION_SYSTEM_PROMPT, {
      TOOL_NAME: options.toolName,
    });

    const contextMessages = (options.conversationHistory || [])
      .slice(-3) // Only use last 3 messages for context
      .map((msg) => `${msg.role}: ${msg.content}`)
      .join('\n');

    const userPrompt = `Based on this conversation context:
${contextMessages}

The last assistant message was: "${options.lastAssistantMessage}"

Generate exactly ${
      options.count || 3
    } natural follow-up suggestions. Return ONLY a valid JSON object with no additional text:

{
  "suggestions": ["suggestion 1", "suggestion 2", "suggestion 3"]
}`;

    const config = getModelConfig('SUGGESTIONS', {
      model:
        import.meta.env.VITE_OPENROUTER_MODEL_NAME_2 ||
        import.meta.env.VITE_OPENROUTER_MODEL_NAME ||
        'meta-llama/llama-3.3-8b-instruct:free',
    });

    const requestPayload = buildAPIRequest(
      systemPrompt,
      [],
      userPrompt,
      config
    );

    try {
      const response = await this.makeRequest(requestPayload, 2, 15000);

      const suggestions = this.parseSuggestions(response.content);

      // If parsing fails or returns empty array, use fallback
      if (suggestions.length === 0) {
        console.warn(
          'No suggestions parsed from response:',
          response.content,
          'using fallback'
        );
        return this.getFallbackSuggestions(options.toolName);
      }

      console.debug('Successfully parsed suggestions:', suggestions);
      return suggestions;
    } catch (error) {
      console.warn('Failed to generate suggestions:', error);
      // Return fallback suggestions
      return this.getFallbackSuggestions(options.toolName);
    }
  }

  /**
   * Core API request method with retry logic
   */
  private async makeRequest(
    payload: any,
    maxRetries: number = 3,
    timeout: number = this.defaultTimeout
  ): Promise<AIResponse> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(this.baseUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.apiKey}`,
            'HTTP-Referer': window.location.origin,
            'X-Title': 'DeepList AI',
          },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const shouldRetry = this.shouldRetry(
            response.status,
            attempt,
            maxRetries
          );

          throw new AIServiceError(
            errorData.error?.message ||
              `HTTP ${response.status}: ${response.statusText}`,
            this.getErrorCode(response.status),
            response.status,
            shouldRetry
          );
        }

        const data = await response.json();

        if (!data.choices?.[0]?.message?.content) {
          throw new AIServiceError(
            'Invalid response format from AI service',
            'INVALID_RESPONSE',
            500,
            attempt < maxRetries
          );
        }

        return {
          content: data.choices[0].message.content.trim(),
          usage: data.usage,
          model: data.model,
          finish_reason: data.choices[0].finish_reason,
        };
      } catch (error) {
        lastError = error as Error;

        if (error instanceof AIServiceError && !error.retryable) {
          throw error;
        }

        if (attempt < maxRetries) {
          const backoffDelay = Math.min(1000 * Math.pow(2, attempt), 5000);
          await new Promise((resolve) => setTimeout(resolve, backoffDelay));
          continue;
        }
      }
    }

    throw new AIServiceError(
      `Failed after ${maxRetries + 1} attempts: ${lastError?.message}`,
      'MAX_RETRIES_EXCEEDED',
      500,
      false
    );
  }

  /**
   * Parse suggestions from AI response
   */
  private parseSuggestions(content: string): string[] {
    try {
      // Clean the content first
      const cleanContent = content.trim();

      // Try to parse as JSON first
      const parsed = JSON.parse(cleanContent);
      if (parsed.suggestions && Array.isArray(parsed.suggestions)) {
        return parsed.suggestions
          .filter((s: any) => typeof s === 'string' && s.trim().length > 0)
          .map((s: string) => s.trim())
          .slice(0, 3);
      }
    } catch (jsonError) {
      console.warn('JSON parsing failed, trying manual extraction:', jsonError);

      // Try to extract JSON from within the response
      try {
        const jsonMatch = content.match(/\{[\s\S]*"suggestions"[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          if (parsed.suggestions && Array.isArray(parsed.suggestions)) {
            return parsed.suggestions
              .filter((s: any) => typeof s === 'string' && s.trim().length > 0)
              .map((s: string) => s.trim())
              .slice(0, 3);
          }
        }
      } catch (extractError) {
        console.warn('JSON extraction failed:', extractError);
      }

      // If JSON parsing fails, try to extract suggestions manually
      const lines = content.split('\n');
      const suggestions = lines
        .map((line) =>
          line
            .replace(/^\d+\.\s*/, '') // Remove numbered list markers
            .replace(/^[-*]\s*/, '') // Remove bullet points
            .replace(/^["']/, '') // Remove starting quotes
            .replace(/["']$/, '') // Remove ending quotes
            .replace(/,$/, '') // Remove trailing commas
            .trim()
        )
        .filter(
          (line) =>
            line.length > 0 &&
            line.length < 50 &&
            !line.includes('{') &&
            !line.includes('}')
        )
        .slice(0, 3);

      if (suggestions.length > 0) {
        return suggestions;
      }
    }

    // If all parsing fails, return empty array (fallback will be used)
    console.warn('Failed to parse suggestions from content:', content);
    return [];
  }

  /**
   * Get fallback suggestions when AI generation fails
   */
  private getFallbackSuggestions(toolName: string): string[] {
    const genericSuggestions = [
      'Tell me more',
      'How do I get started?',
      'What are the main features?',
    ];

    // Try to make suggestions more contextual
    if (toolName) {
      return [
        `How does ${toolName} work?`,
        `What can I do with ${toolName}?`,
        'Show me examples',
      ];
    }

    return genericSuggestions;
  }

  /**
   * Validate input parameters
   */
  private validateInput(userInput: string, options: ChatOptions): void {
    if (!userInput?.trim()) {
      throw new AIServiceError(
        'User input cannot be empty',
        'INVALID_INPUT',
        400,
        false
      );
    }

    if (!options.toolName?.trim()) {
      throw new AIServiceError(
        'Tool name is required',
        'INVALID_INPUT',
        400,
        false
      );
    }

    if (!options.toolPrompt?.trim()) {
      throw new AIServiceError(
        'Tool prompt is required',
        'INVALID_INPUT',
        400,
        false
      );
    }

    if (userInput.length > 2000) {
      throw new AIServiceError(
        'Input too long (max 2000 characters)',
        'INPUT_TOO_LONG',
        400,
        false
      );
    }
  }

  /**
   * Determine if request should be retried based on status code
   */
  private shouldRetry(
    statusCode: number,
    attempt: number,
    maxRetries: number
  ): boolean {
    if (attempt >= maxRetries) return false;

    // Retry on server errors and rate limits
    return statusCode >= 500 || statusCode === 429 || statusCode === 408;
  }

  /**
   * Map HTTP status codes to error codes
   */
  private getErrorCode(statusCode: number): string {
    switch (statusCode) {
      case 400:
        return 'BAD_REQUEST';
      case 401:
        return 'UNAUTHORIZED';
      case 403:
        return 'FORBIDDEN';
      case 404:
        return 'NOT_FOUND';
      case 408:
        return 'TIMEOUT';
      case 429:
        return 'RATE_LIMITED';
      case 500:
        return 'INTERNAL_ERROR';
      case 502:
        return 'BAD_GATEWAY';
      case 503:
        return 'SERVICE_UNAVAILABLE';
      default:
        return 'UNKNOWN_ERROR';
    }
  }
}

/**
 * Singleton instance for the AI service
 */
export const aiService = new AIService();
