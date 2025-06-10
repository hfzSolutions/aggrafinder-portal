/**
 * Simple test script to verify AI service functionality
 * Run this in the browser console to test suggestion generation
 */

// Test the AI service suggestion generation
async function testSuggestionGeneration() {
  try {
    // Import the AI service
    const { aiService } = await import('/src/lib/ai-service.ts');

    console.log('Testing AI service suggestion generation...');

    // Test with a simple conversation
    const testOptions = {
      toolName: 'ChatGPT',
      lastAssistantMessage:
        'ChatGPT is a conversational AI that can help with various tasks like writing, coding, and answering questions.',
      conversationHistory: [
        { role: 'user', content: 'What is ChatGPT?' },
        {
          role: 'assistant',
          content:
            'ChatGPT is a conversational AI that can help with various tasks like writing, coding, and answering questions.',
        },
      ],
      count: 3,
    };

    const suggestions = await aiService.generateSuggestions(testOptions);

    console.log('Generated suggestions:', suggestions);

    if (suggestions.length > 0) {
      console.log('✅ Suggestion generation working correctly');
      return suggestions;
    } else {
      console.warn(
        '⚠️ No suggestions generated, but fallback should have been used'
      );
      return null;
    }
  } catch (error) {
    console.error('❌ Error testing suggestion generation:', error);
    return null;
  }
}

// Test the AI service chat functionality
async function testChatGeneration() {
  try {
    const { aiService } = await import('/src/lib/ai-service.ts');

    console.log('Testing AI service chat generation...');

    const response = await aiService.chat(
      'What are the main features of this tool?',
      {
        toolName: 'ChatGPT',
        toolPrompt:
          'You are an AI assistant helping users learn about ChatGPT. Provide helpful and accurate information.',
        conversationHistory: [],
        maxRetries: 1,
        timeout: 10000,
      }
    );

    console.log('Chat response:', response.content);

    if (response.content && response.content.length > 0) {
      console.log('✅ Chat generation working correctly');
      return response;
    } else {
      console.warn('⚠️ Empty chat response received');
      return null;
    }
  } catch (error) {
    console.error('❌ Error testing chat generation:', error);
    return null;
  }
}

// Export functions for manual testing
window.testAIService = {
  testSuggestionGeneration,
  testChatGeneration,
};

console.log('AI Service Test Functions loaded. Use:');
console.log('- testAIService.testSuggestionGeneration()');
console.log('- testAIService.testChatGeneration()');
