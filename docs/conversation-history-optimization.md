# Conversation History Optimization

## Overview

This document explains the implementation of conversation history optimization in the AI chat component. The optimization reduces the amount of data sent to the AI API with each message, improving response times and reducing token usage.

## Implementation Details

### Constants

```typescript
const MAX_CONTEXT_MESSAGES = 10; // Maximum number of messages to include in context
const SUMMARY_REFRESH_COUNT = 5; // Number of new messages before refreshing summary
```

- `MAX_CONTEXT_MESSAGES`: Limits the number of full messages sent to the AI API
- `SUMMARY_REFRESH_COUNT`: Controls how often the conversation summary is refreshed

### Key Functions

#### `prepareConversationHistory`

This function optimizes the conversation history by:

1. Filtering out ad messages and empty messages
2. If the total number of messages is below `MAX_CONTEXT_MESSAGES`, it returns all messages
3. Otherwise, it:
   - Takes the most recent `MAX_CONTEXT_MESSAGES - 1` messages
   - Creates a summary of older messages
   - Returns a system message with the summary followed by the recent messages

```typescript
const prepareConversationHistory = (
  messages: Message[],
  newUserInput: string
) => {
  // Filter out ad messages and empty messages
  const validMessages = messages.filter(
    (msg) =>
      (msg.role === 'user' || msg.role === 'assistant') &&
      msg.content.trim() !== ''
  );

  // If we have fewer messages than our maximum, just return them all
  if (validMessages.length <= MAX_CONTEXT_MESSAGES) {
    return validMessages.map((msg) => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
    }));
  }

  // Otherwise, we need to create a summary and include only recent messages
  // Get the most recent messages up to our limit (minus 1 to leave room for the summary)
  const recentMessages = validMessages.slice(-(MAX_CONTEXT_MESSAGES - 1));

  // Create a summary message from older messages
  const olderMessages = validMessages.slice(
    0,
    validMessages.length - recentMessages.length
  );
  const summaryContent = `Previous conversation summary: ${olderMessages
    .map(
      (msg) =>
        `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content.substring(
          0,
          100
        )}${msg.content.length > 100 ? '...' : ''}`
    )
    .join(' | ')}`;

  // Return the summary message followed by recent messages
  return [
    { role: 'system' as 'system', content: summaryContent },
    ...recentMessages.map((msg) => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
    })),
  ];
};
```

### Integration in `processUserMessage`

The `processUserMessage` function now uses `prepareConversationHistory` to optimize the messages sent to the AI API:

```typescript
// Prepare optimized conversation history
const optimizedMessages = prepareConversationHistory(messages, userInput);

// Call OpenRouter API
const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
  method: 'POST',
  headers: {
    // ... headers ...
  },
  body: JSON.stringify({
    model: import.meta.env.VITE_OPENROUTER_MODEL_NAME,
    messages: [
      {
        role: 'system',
        content: `You are an AI assistant helping users with ${toolName}...`,
      },
      ...optimizedMessages,
      {
        role: 'user',
        content: userInput,
      },
    ],
    // ... other parameters ...
  }),
});
```

## Benefits

1. **Reduced Token Usage**: By sending fewer messages to the AI API, we reduce the number of tokens processed, potentially lowering costs.
2. **Faster Response Times**: Less data to process means faster response times from the AI API.
3. **Maintained Context**: The summary of older messages ensures the AI still has context from the entire conversation.

## Future Improvements

1. **Dynamic Context Size**: Adjust `MAX_CONTEXT_MESSAGES` based on message length to optimize token usage further.
2. **Intelligent Summarization**: Use the AI itself to generate more concise and relevant summaries of past conversations.
3. **Important Information Retention**: Develop a mechanism to identify and retain critical information from older messages.

## Maintenance Notes

- Adjust `MAX_CONTEXT_MESSAGES` if you notice the AI losing important context.
- Consider the trade-off between context preservation and token usage when modifying these parameters.
