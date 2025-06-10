# Professional AI Prompt Implementation Guide

This document outlines the complete redesign of your AI prompt handling system to follow industry best practices from major AI companies like OpenAI, Anthropic, and Google.

## Current Issues Identified

1. **Inconsistent System Prompts**: Multiple different prompt styles across files
2. **Poor Prompt Engineering**: Generic instructions without proper structure
3. **No Prompt Templates**: Hardcoded prompts instead of reusable templates
4. **Suboptimal Parameters**: Temperature and token settings not optimized
5. **No Context Management**: Basic conversation history handling
6. **Missing Error Handling**: No graceful degradation for prompt failures
7. **No Rate Limiting**: Can lead to API quota issues
8. **Hardcoded Instructions**: Inflexible prompt system

## Industry-Standard Solution Implemented

### 1. Professional Prompt Templates (`/src/lib/prompt-templates.ts`)

- **Structured System Prompts**: Following Claude/GPT best practices
- **Context Injection**: Dynamic placeholder replacement
- **Task-Specific Templates**: Different prompts for different use cases
- **Model Configuration**: Optimized parameters for each task type

### 2. Professional AI Service Layer (`/src/lib/ai-service.ts`)

- **Proper Error Handling**: Specific error types with retry logic
- **Rate Limiting**: Prevents API quota issues
- **Request Optimization**: Smart conversation history management
- **Type Safety**: Full TypeScript support
- **Retry Logic**: Exponential backoff for failed requests

## Key Improvements Made

### 1. System Prompt Structure

**Before:**

```typescript
content: `You are an AI assistant helping users with ${toolName}. Follow these guidelines...`;
```

**After:**

```typescript
const QUICK_TOOL_SYSTEM_PROMPT = `You are a specialized AI assistant for {{TOOL_NAME}}. Your purpose is to engage in helpful, contextual conversations while following these specific guidelines.

## Primary Objective:
{{TOOL_PROMPT}}

## Communication Standards:
1. **Clarity First**: Always prioritize clear, understandable responses
2. **Context Awareness**: Reference previous conversation points when relevant
...
`;
```

### 2. Model Configuration

**Before:**

```typescript
temperature: 0.5,
max_tokens: 2000,
top_p: 0.9,
```

**After:**

```typescript
// Task-specific configurations
FACTUAL: {
  temperature: 0.3,
  max_tokens: 1500,
  top_p: 0.85,
  frequency_penalty: 0.0,
  presence_penalty: 0.0,
}
```

### 3. Error Handling

**Before:**

```typescript
catch (error) {
  console.error('Error in chat process:', error);
  toast.error("Sorry, I'm having trouble...");
}
```

**After:**

```typescript
catch (error) {
  if (error instanceof AIServiceError) {
    switch (error.code) {
      case 'RATE_LIMIT_EXCEEDED':
        userMessage = "I'm receiving too many requests...";
        break;
      case 'INPUT_TOO_LONG':
        userMessage = "Your message is too long...";
        break;
      // ... specific error handling
    }
  }
}
```

## Implementation Steps

### Step 1: Update QuickToolChat Component

Replace the `processUserMessage` function:

```typescript
const processUserMessage = async (
  userInput: string,
  existingTypingId?: string
) => {
  // ... existing setup code ...

  try {
    // Import AI service dynamically
    const { aiService } = await import('@/lib/ai-service');

    // Prepare conversation history
    const conversationHistory = messages
      .filter((msg) => msg.role === 'user' || msg.role === 'assistant')
      .filter((msg) => msg.content.trim() !== '')
      .slice(-10)
      .map((msg) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      }));

    // Call the professional AI service
    const response = await aiService.chat(userInput, {
      toolName,
      toolPrompt,
      conversationHistory,
      maxRetries: 2,
      timeout: 25000,
    });

    const responseContent = response.content;
    // ... rest of the function
  } catch (error) {
    // Enhanced error handling with specific error types
    // ... see full implementation above
  }
};
```

### Step 2: Update Suggestion Generation

Replace the `generateSuggestedReplies` function:

```typescript
const generateSuggestedReplies = async (botMessage: string) => {
  if (!suggested_replies) return;

  try {
    const { aiService } = await import('@/lib/ai-service');

    const conversationHistory = messages
      .filter((msg) => msg.role === 'user' || msg.role === 'assistant')
      .slice(-3)
      .map((msg) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      }));

    const suggestions = await aiService.generateSuggestions({
      toolName,
      lastAssistantMessage: botMessage,
      conversationHistory,
      count: 3,
    });

    setSuggestedReplies(suggestions.length > 0 ? suggestions : []);
  } catch (error) {
    console.warn('Failed to generate suggested replies:', error);
    setSuggestedReplies(['Tell me more', 'How do I start?', 'What else?']);
  }
};
```

### Step 3: Update Other Chat Components

Apply similar changes to:

- `SharedChatContext.tsx`
- `ToolChatModal.tsx`
- `ToolCardChat.tsx`
- `QuickToolFormSimplified.tsx`

### Step 4: Environment Variables

Ensure these are properly configured:

```env
VITE_OPENROUTER_API_KEY=your_key_here
VITE_OPENROUTER_MODEL_NAME=deepseek/deepseek-r1-0528-qwen3-8b:free
VITE_OPENROUTER_MODEL_NAME_2=meta-llama/llama-3.3-8b-instruct:free
```

## Benefits of the New System

### 1. Better AI Responses

- **Consistent Quality**: Standardized prompts across all components
- **Context Awareness**: Better conversation history management
- **Task Optimization**: Different configurations for different tasks

### 2. Improved Reliability

- **Error Recovery**: Proper retry logic and fallbacks
- **Rate Limiting**: Prevents API quota issues
- **Input Validation**: Sanitizes and validates all inputs

### 3. Better User Experience

- **Specific Error Messages**: Users get helpful feedback
- **Faster Responses**: Optimized token usage and request patterns
- **Consistent Behavior**: Standardized across all chat interfaces

### 4. Developer Experience

- **Type Safety**: Full TypeScript support
- **Reusable Components**: Centralized AI service
- **Easy Maintenance**: Single place to update AI logic
- **Better Debugging**: Detailed error logging

## Migration Checklist

- [x] Copy `prompt-templates.ts` to `/src/lib/`
- [x] Copy `ai-service.ts` to `/src/lib/`
- [x] Update `QuickToolChat.tsx` component
- [x] Update `SharedChatContext.tsx`
- [x] Update `ToolChatModal.tsx`
- [x] Update `ToolCardChat.tsx`
- [x] Update `QuickToolFormSimplified.tsx`
- [ ] Test all chat functionality
- [ ] Verify error handling works
- [ ] Check rate limiting behavior
- [ ] Monitor API usage and costs

## Migration Status: COMPLETE ✅

All chat components have been successfully migrated to use the new professional AI service. The migration includes:

1. **QuickToolChat.tsx** - ✅ Main chat component with professional AI service
2. **SharedChatContext.tsx** - ✅ Context provider with enhanced error handling
3. **ToolChatModal.tsx** - ✅ Modal chat interface updated
4. **ToolCardChat.tsx** - ✅ Simple card chat interface migrated
5. **QuickToolFormSimplified.tsx** - ✅ Testing functionality updated

## Testing Recommendations

1. **Functional Testing**

   - Test normal conversations
   - Test error scenarios (network issues, rate limits)
   - Test input validation (empty, too long, special characters)
   - Test suggestion generation

2. **Performance Testing**

   - Monitor response times
   - Check token usage
   - Verify rate limiting works

3. **User Experience Testing**
   - Test error messages are helpful
   - Verify typing animations work
   - Check suggestion quality

## Monitoring and Maintenance

1. **API Usage Monitoring**

   - Track token consumption
   - Monitor error rates
   - Watch for rate limiting issues

2. **Quality Monitoring**

   - Review AI response quality
   - Monitor user feedback
   - Track conversation completion rates

3. **Performance Monitoring**
   - Response time tracking
   - Error rate monitoring
   - User satisfaction metrics

This new implementation follows the same patterns used by major AI companies and will provide a much more professional, reliable, and maintainable AI chat experience.
