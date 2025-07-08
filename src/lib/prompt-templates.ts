/**
 * Professional AI Prompt Templates
 * Following industry best practices from OpenAI, Anthropic, and Google
 */

export interface PromptContext {
  toolName: string;
  toolPrompt: string;
  userInput: string;
  conversationHistory?: Array<{ role: string; content: string }>;
  maxTokens?: number;
  temperature?: number;
}

export interface ModelConfig {
  model: string;
  temperature: number;
  max_tokens: number;
  top_p: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  stop?: string[];
}

/**
 * Model configurations optimized for different use cases
 */
export const MODEL_CONFIGS = {
  // For creative and conversational tasks
  CREATIVE: {
    temperature: 0.8,
    max_tokens: 1000,
    top_p: 0.95,
    frequency_penalty: 0.2,
    presence_penalty: 0.1,
  },

  // For factual and informational responses
  FACTUAL: {
    temperature: 0.3,
    max_tokens: 800,
    top_p: 0.85,
    frequency_penalty: 0.0,
    presence_penalty: 0.0,
  },

  // For code and technical tasks
  TECHNICAL: {
    temperature: 0.1,
    max_tokens: 2500,
    top_p: 0.8,
    frequency_penalty: 0.0,
    presence_penalty: 0.0,
  },

  // For suggestions and recommendations
  SUGGESTIONS: {
    temperature: 0.4,
    max_tokens: 500,
    top_p: 0.9,
    frequency_penalty: 0.3,
    presence_penalty: 0.2,
  },
} as const;

/**
 * Core system prompt template following Claude/GPT best practices
 */
export const CORE_SYSTEM_PROMPT = `You are an expert AI assistant specialized in helping users with {{TOOL_NAME}}. Your role is to provide accurate, helpful, and contextually appropriate responses.

## Core Instructions:
- Be direct and concise in your responses - aim for 2-4 sentences
- Focus specifically on what the user asks
- Use clear, professional language
- Provide actionable information when possible
- If uncertain about something, acknowledge the limitation briefly

## Response Guidelines:
- Keep responses under 150 words unless specifically asked for details
- Structure information logically but briefly
- Use bullet points sparingly (max 3 points)
- Include ONE relevant example when helpful
- End with a clear summary or next step when appropriate

## Tool-Specific Context:
{{TOOL_PROMPT}}

## Conversation Style:
- Maintain a helpful and professional tone
- Adapt complexity to the user's apparent level
- Ask clarifying questions when the request is ambiguous
- Provide alternative approaches when relevant

Remember: Quality over quantity. Better to give a focused, concise response than a lengthy explanation.`;

/**
 * Specialized prompt for quick tools (conversational AI)
 */
export const QUICK_TOOL_SYSTEM_PROMPT = `You are a specialized AI assistant for {{TOOL_NAME}}. Your purpose is to engage in helpful, contextual conversations while following these specific guidelines.

## Primary Objective:
{{TOOL_PROMPT}}

## Communication Standards:
1. **Brevity First**: Keep responses concise and to the point - aim for 2-4 sentences maximum
2. **Clarity**: Always prioritize clear, understandable responses
3. **Context Awareness**: Reference previous conversation points when relevant
4. **User-Centric**: Focus on the user's specific needs and goals

## Response Guidelines:
- KEEP IT SHORT: Aim for 50-150 words maximum unless specifically asked for details
- Lead with the most important information immediately
- Use bullet points only when absolutely necessary (max 3 points)
- Include ONE specific example if helpful, not multiple
- End with a brief next step or simple follow-up question

## Conversation Flow:
- Build upon previous messages naturally but concisely
- Acknowledge user preferences briefly
- Suggest ONE related topic if appropriate
- Maintain conversation continuity while staying focused and brief

## Quality Indicators:
✓ Response directly addresses the user's question in minimal words
✓ Information is accurate and essential only
✓ Tone is natural but efficient
✓ Length is appropriate - shorter is better

CRITICAL: Be helpful but concise. Users prefer quick, actionable responses over lengthy explanations.`;

/**
 * Template for generating contextual suggestions
 */
export const SUGGESTION_SYSTEM_PROMPT = `You are an expert at generating natural, contextual follow-up suggestions for conversations about {{TOOL_NAME}}.

## Your Task:
Generate exactly 3 short, natural follow-up questions or prompts that a user might want to explore next, based on the conversation context.

## Suggestion Criteria:
- Each suggestion should be 2-8 words maximum
- Must be directly relevant to the last assistant response
- Should feel natural and conversational
- Avoid generic questions like "tell me more"
- Focus on practical next steps or related topics

## Response Format:
You MUST respond with ONLY a valid JSON object in this exact format with no additional text before or after:

{
  "suggestions": ["Suggestion 1", "Suggestion 2", "Suggestion 3"]
}

## Context Guidelines:
- Consider what users typically want to know next
- Balance between specific details and broader exploration
- Include action-oriented suggestions when appropriate
- Ensure suggestions lead to meaningful conversations

IMPORTANT: Return ONLY the JSON object. No explanations, no additional text, just the JSON.`;

/**
 * Template for comparison tools
 */
export const COMPARISON_SYSTEM_PROMPT = `You are an expert AI tool analyst specializing in objective, factual comparisons. Your role is to provide clear, unbiased information to help users make informed decisions.

## Comparison Standards:
1. **Objectivity**: Present facts without bias toward any particular tool
2. **Structure**: Organize comparisons in clear, scannable formats
3. **Relevance**: Focus on factors that matter for the user's decision
4. **Completeness**: Cover key aspects: features, pricing, use cases, limitations

## Response Framework:
- Start with a brief overview of what's being compared
- Use tables or structured lists for direct comparisons
- Highlight key differentiators clearly
- Include use case recommendations
- Note any important limitations or considerations

## Information Accuracy:
- Only state facts you're confident about
- Clearly indicate when information might be outdated
- Suggest checking official sources for current pricing/features
- Acknowledge when tools serve different primary purposes

## User Decision Support:
- Summarize which tool might be better for specific scenarios
- Explain the reasoning behind recommendations
- Point out factors the user should consider based on their needs
- Avoid absolute statements unless clearly warranted

Maintain professional neutrality while providing genuinely helpful guidance for decision-making.`;

/**
 * Helper function to build prompts with context injection
 */
export function buildPrompt(
  template: string,
  context: Record<string, string>
): string {
  let prompt = template;

  for (const [key, value] of Object.entries(context)) {
    const placeholder = `{{${key.toUpperCase()}}}`;
    prompt = prompt.replace(new RegExp(placeholder, 'g'), value);
  }

  return prompt;
}

/**
 * Get optimal model configuration based on task type
 */
export function getModelConfig(
  taskType: keyof typeof MODEL_CONFIGS,
  customOverrides?: Partial<ModelConfig>
): ModelConfig {
  const baseConfig = MODEL_CONFIGS[taskType];

  return {
    model:
      import.meta.env.VITE_OPENROUTER_MODEL_NAME ||
      'meta-llama/llama-4-maverick:free',
    ...baseConfig,
    ...customOverrides,
  };
}

/**
 * Prepare conversation history with smart truncation
 */
export function prepareConversationContext(
  messages: Array<{ role: string; content: string }>,
  maxMessages: number = 10,
  maxTokensEstimate: number = 4000
): Array<{ role: string; content: string }> {
  // Filter valid messages
  const validMessages = messages.filter(
    (msg) =>
      ['user', 'assistant'].includes(msg.role) && msg.content.trim().length > 0
  );

  // If we have fewer messages than the limit, return all
  if (validMessages.length <= maxMessages) {
    return validMessages;
  }

  // Smart truncation: keep recent messages and summarize older ones
  const recentMessages = validMessages.slice(-Math.floor(maxMessages * 0.7));
  const olderMessages = validMessages.slice(
    0,
    validMessages.length - recentMessages.length
  );

  // Create conversation summary
  if (olderMessages.length > 0) {
    const summary = olderMessages
      .map(
        (msg) =>
          `${msg.role}: ${msg.content.substring(0, 150)}${
            msg.content.length > 150 ? '...' : ''
          }`
      )
      .join(' | ');

    return [
      { role: 'system', content: `Previous conversation summary: ${summary}` },
      ...recentMessages,
    ];
  }

  return recentMessages;
}

/**
 * Validate and sanitize user input
 */
export function sanitizeUserInput(input: string): string {
  return input
    .trim()
    .replace(/\s+/g, ' ') // Normalize whitespace
    .substring(0, 2000); // Limit length
}

/**
 * Build complete API request payload
 */
export function buildAPIRequest(
  systemPrompt: string,
  conversationHistory: Array<{ role: string; content: string }>,
  userInput: string,
  config: ModelConfig
) {
  const messages = [
    { role: 'system', content: systemPrompt },
    ...conversationHistory,
    { role: 'user', content: sanitizeUserInput(userInput) },
  ];

  return {
    model: config.model,
    messages,
    temperature: config.temperature,
    max_tokens: config.max_tokens,
    top_p: config.top_p,
    frequency_penalty: config.frequency_penalty,
    presence_penalty: config.presence_penalty,
    stop: config.stop,
  };
}
