# AI Service Model Configuration Update

## Change Summary

Updated the `generateSuggestions` function in the AI service to use `VITE_OPENROUTER_MODEL_NAME_2` instead of the default `VITE_OPENROUTER_MODEL_NAME`.

## What Changed

**File**: `/src/lib/ai-service.ts`

**Before**:

```typescript
const config = getModelConfig('SUGGESTIONS');
```

**After**:

```typescript
const config = getModelConfig('SUGGESTIONS', {
  model:
    import.meta.env.VITE_OPENROUTER_MODEL_NAME_2 ||
    import.meta.env.VITE_OPENROUTER_MODEL_NAME ||
    'meta-llama/llama-3.3-8b-instruct:free',
});
```

## Benefits

1. **Model Separation**: Suggestions now use a dedicated model (`VITE_OPENROUTER_MODEL_NAME_2`)
2. **Fallback Chain**: If `VITE_OPENROUTER_MODEL_NAME_2` is not set, it falls back to the primary model
3. **Cost Optimization**: You can use a more cost-effective model for suggestions while keeping the main chat on a premium model
4. **Performance Optimization**: You can use a faster model for suggestions since they require shorter, simpler responses

## Environment Variables Required

Make sure you have these environment variables configured:

- `VITE_OPENROUTER_MODEL_NAME_2` - Primary model for suggestions (e.g., `anthropic/claude-3-haiku`)
- `VITE_OPENROUTER_MODEL_NAME` - Fallback/main chat model (e.g., `anthropic/claude-3-sonnet`)

## Usage Examples

**Typical Configuration**:

```env
# Fast, cost-effective model for suggestions
VITE_OPENROUTER_MODEL_NAME_2=anthropic/claude-3-haiku

# More capable model for main conversations
VITE_OPENROUTER_MODEL_NAME=anthropic/claude-3-sonnet
```

**Budget Configuration**:

```env
# Free model for suggestions
VITE_OPENROUTER_MODEL_NAME_2=meta-llama/llama-3.3-8b-instruct:free

# Better free model for main conversations
VITE_OPENROUTER_MODEL_NAME=qwen/qwen-2.5-7b-instruct:free
```

This change allows for better resource allocation and cost management while maintaining high-quality AI interactions.
