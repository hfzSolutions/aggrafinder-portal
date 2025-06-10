import React, { createContext, useContext, useState, useEffect } from 'react';
import { AITool } from '@/types/tools';
import { toast } from 'sonner';
import { useAIChatAnalytics } from '@/hooks/useAIChatAnalytics';

type Message = {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  isTyping?: boolean;
  displayContent?: string;
  toolId?: string; // The ID of the tool this message is about
  toolName?: string; // The name of the tool for display purposes
  toolCard?: AITool; // The tool card data to display in the chat
  comparisonToolCards?: AITool[]; // Array of tools for comparison display
};

type SharedChatContextType = {
  messages: Message[];
  isOpen: boolean;
  isLoading: boolean;
  typingIndicator: boolean;
  currentTool: AITool | null;
  comparisonTools: AITool[] | null;
  input: string;
  suggestions: string[];
  loadingSuggestions: boolean;
  setInput: (input: string) => void;
  openChat: (tool: AITool, comparisonTools?: AITool[]) => void;
  closeChat: () => void;
  sendMessage: () => Promise<void>;
  handleSuggestionClick: (suggestion: string) => Promise<void>;
};

const SharedChatContext = createContext<SharedChatContextType | undefined>(
  undefined
);

export const useSharedChat = () => {
  const context = useContext(SharedChatContext);
  if (context === undefined) {
    throw new Error('useSharedChat must be used within a SharedChatProvider');
  }
  return context;
};

export function SharedChatProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [typingIndicator, setTypingIndicator] = useState(false);
  const [currentTool, setCurrentTool] = useState<AITool | null>(null);
  const [comparisonTools, setComparisonTools] = useState<AITool[] | null>(null);
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  const { trackChatEvent } = useAIChatAnalytics();

  // Function to animate typing effect for a message
  const animateTyping = (messageId: string, content: string) => {
    let index = 0;

    const typeNextChunk = () => {
      if (index >= content.length) {
        // Typing complete
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === messageId ? { ...msg, isTyping: false } : msg
          )
        );
        return;
      }

      // Add characters in chunks for more natural typing
      const chunkSize = Math.floor(Math.random() * 3) + 1; // 1-3 characters at a time
      const nextChunk = content.substring(
        index,
        Math.min(index + chunkSize, content.length)
      );

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId
            ? { ...msg, displayContent: (msg.displayContent || '') + nextChunk }
            : msg
        )
      );

      index += nextChunk.length;

      // Determine the delay before the next chunk
      let delay = 15 + Math.random() * 30; // Base typing speed

      // Add random pauses at punctuation for more natural rhythm
      if (['.', '!', '?'].includes(nextChunk.charAt(nextChunk.length - 1))) {
        delay = 300 + Math.random() * 400; // Longer pause at end of sentences
      } else if (
        [',', ':', ';'].includes(nextChunk.charAt(nextChunk.length - 1))
      ) {
        delay = 150 + Math.random() * 200; // Medium pause at commas and other punctuation
      }

      // Schedule the next chunk
      setTimeout(typeNextChunk, delay);
    };

    // Start the typing animation
    typeNextChunk();
  };

  // Generate AI suggestions based on conversation context
  const generateSuggestions = async () => {
    if (!currentTool || isLoading || messages.length === 0) return;

    // Set loading state for suggestions
    setLoadingSuggestions(true);

    // Check if this is a comparison chat with multiple tools
    const isComparisonMode = messages.some((msg) =>
      msg.id?.includes('welcome-comparison')
    );

    try {
      // Import AI service dynamically
      const { aiService } = await import('@/lib/ai-service');

      // Get the last assistant message for context
      const lastAssistantMessage =
        messages.filter((msg) => msg.role === 'assistant').slice(-1)[0]
          ?.content || '';

      if (!lastAssistantMessage.trim()) {
        // Use fallback suggestions if no assistant message
        throw new Error('No assistant message for context');
      }

      // Prepare conversation history
      const conversationHistory = messages
        .filter((msg) => msg.role === 'user' || msg.role === 'assistant')
        .filter((msg) => msg.content.trim() !== '')
        .slice(-3) // Only use last 3 messages for context
        .map((msg) => ({
          role: msg.role as 'user' | 'assistant',
          content: cleanAIResponse(msg.content),
        }));

      // Generate suggestions using the professional AI service
      const generatedSuggestions = await aiService.generateSuggestions({
        toolName: currentTool.name,
        lastAssistantMessage,
        conversationHistory,
        count: 4,
      });

      setSuggestions(generatedSuggestions.slice(0, 4)); // Limit to 4 suggestions
    } catch (error) {
      console.error('Error generating suggestions:', error);
      // Fallback to default suggestions if API call fails
      if (isComparisonMode) {
        setSuggestions([
          `Which tool has the best features?`,
          `How do the pricing plans compare?`,
          `Which is more suitable for beginners?`,
          `What are the main differences between them?`,
        ]);
      } else {
        setSuggestions([
          `What can I do with ${currentTool.name}?`,
          `How much does ${currentTool.name} cost?`,
          `What are the main features of ${currentTool.name}?`,
          `How does ${currentTool.name} compare to alternatives?`,
        ]);
      }
      if (isComparisonMode) {
        setSuggestions([
          `Which tool has the best features?`,
          `How do the pricing plans compare?`,
          `Which is more suitable for beginners?`,
          `What are the main differences between them?`,
        ]);
      } else {
        setSuggestions([
          `What can I do with ${currentTool.name}?`,
          `How much does ${currentTool.name} cost?`,
          `What are the main features of ${currentTool.name}?`,
          `How does ${currentTool.name} compare to alternatives?`,
        ]);
      }
    } finally {
      // Always reset loading state
      setLoadingSuggestions(false);
    }
  };

  // Add welcome message when opening chat with a new tool
  const openChat = (tool: AITool, toolsToCompare?: AITool[]) => {
    setCurrentTool(tool);
    setComparisonTools(toolsToCompare || null);
    setIsOpen(true);

    // Track when chat is opened
    trackChatEvent(tool.id, 'open');

    // Check if this is a comparison chat with multiple tools
    // Use toolsToCompare directly instead of comparisonTools state which hasn't updated yet
    if (toolsToCompare && toolsToCompare.length > 1) {
      // Create a system message that includes information about all tools being compared
      const toolNames = toolsToCompare.map((t) => t.name).join(', ');
      const toolDescriptions = toolsToCompare
        .map((t) => `${t.name}: ${t.description}`)
        .join('\n');
      const toolCategories = Array.from(
        new Set(toolsToCompare.flatMap((t) => t.category))
      ).join(', ');

      const welcomeMessage: Message = {
        id: `welcome-comparison-${Date.now()}`,
        role: 'assistant',
        content: `Ready to compare ${toolNames}. Ask about features, pricing, use cases, or specific differences.`,
        isTyping: true,
        displayContent: '',
        toolId: tool.id,
        toolName: `Comparing: ${toolNames}`,
        toolCard: toolsToCompare[0], // Set first tool as the primary tool
        comparisonToolCards: toolsToCompare, // Include all tools for comparison display
      };

      setMessages((prev) => [...prev, welcomeMessage]);

      // Start typing animation for welcome message
      animateTyping(welcomeMessage.id, welcomeMessage.content);

      // Set comparison-focused suggestions
      setSuggestions([
        `What are the key differences between these tools?`,
        `Which tool offers the best value for money?`,
        `Which tool is easier to use?`,
        `What are the unique strengths of each tool?`,
      ]);

      // Track the chat open event for all tools
      toolsToCompare.forEach((t) => {
        if (t.id !== tool.id) trackChatEvent(t.id, 'open');
      });
    } else {
      // Regular single tool chat
      // Check if we already have a welcome message for this tool
      const hasWelcomeForTool = messages.some(
        (msg) =>
          msg.toolId === tool.id &&
          msg.role === 'assistant' &&
          msg.id.includes('welcome')
      );

      if (!hasWelcomeForTool) {
        const welcomeMessage: Message = {
          id: `welcome-${tool.id}-${Date.now()}`,
          role: 'assistant',
          content: `Ask me about ${tool.name}'s features, pricing, or how to use it.`,
          isTyping: true,
          displayContent: '',
          toolId: tool.id,
          toolName: tool.name,
          toolCard: tool, // Include the tool card data in the welcome message
        };

        setMessages((prev) => [...prev, welcomeMessage]);

        // Start typing animation for welcome message
        animateTyping(welcomeMessage.id, welcomeMessage.content);

        // Set default initial suggestions
        setSuggestions([
          `What can I do with ${tool.name}?`,
          `How much does ${tool.name} cost?`,
          `What are the main features of ${tool.name}?`,
          `How does ${tool.name} compare to alternatives?`,
        ]);
      } else {
        // If we already have messages for this tool, generate new suggestions
        generateSuggestions();
      }
    }
  };

  const closeChat = () => {
    if (currentTool) {
      // Track when chat is closed with message count
      const toolMessages = messages.filter(
        (msg) => msg.toolId === currentTool.id
      );
      trackChatEvent(currentTool.id, 'close', toolMessages.length);
    }
    setIsOpen(false);
    setInput('');
  };

  const cleanAIResponse = (response: string): string => {
    // Remove markdown headers
    let cleaned = response.replace(/^#{1,6}\s+.+$/gm, '');

    // Remove thinking/planning meta-commentary
    cleaned = cleaned.replace(/(<think>|<\/think>)/g, '');
    cleaned = cleaned.replace(/^(\[.*?\]|\{.*?\}|\(.*?\))$/gm, '');

    // Remove emojis at the start of lines
    cleaned = cleaned.replace(/^[^\w\s]*([🤔💭✍️🔍]+\s*)+/gm, '');

    // Remove common AI assistant introductory phrases
    cleaned = cleaned.replace(
      /^(Sure|Of course|I'd be happy to|Here's|Let me|Certainly|Absolutely|I'll|I can)\s+(help|tell|explain|provide|assist|share|give)\s+(you|information|details|more|about|with).*?[.!]\s*/i,
      ''
    );
    cleaned = cleaned.replace(
      /^(Here are|Let's take a look at|Let me explain|I'll explain|Let me tell you about).*?[.!]\s*/i,
      ''
    );
    cleaned = cleaned.replace(
      /^(Based on|According to|From what I know|As far as I know).*?[,.]\s*/i,
      ''
    );

    // Remove phrases like "I hope this helps" at the end
    cleaned = cleaned.replace(
      /\s*(I hope|Hope|Let me know|Feel free|Don't hesitate)\s+(this helps|if you have|if you need|to reach out|to ask|if you'd like).*?[.!]?$/i,
      ''
    );

    // Trim and remove extra newlines
    cleaned = cleaned.trim().replace(/\n{3,}/g, '\n\n');

    return cleaned;
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading || !currentTool) return;

    // Determine if we're in comparison mode by checking for multiple tools
    const isComparisonMode =
      comparisonTools !== null && comparisonTools.length > 1;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input.trim(),
      toolId: currentTool.id,
      toolName: currentTool.name,
    };

    // Add user message to chat
    setMessages((prev) => [...prev, userMessage]);
    setInput(''); // Clear input field
    setIsLoading(true);
    setTypingIndicator(true);

    // Track message sent event
    trackChatEvent(currentTool.id, 'message_sent');

    try {
      // Import AI service dynamically
      const { aiService, AIServiceError } = await import('@/lib/ai-service');

      // Prepare conversation history
      const conversationHistory = messages
        .filter((msg) => msg.role === 'user' || msg.role === 'assistant')
        .filter((msg) => msg.content.trim() !== '')
        .slice(-10) // Keep last 10 messages for context
        .map((msg) => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
        }));

      // Determine the appropriate system prompt and tool prompt
      const toolPrompt = isComparisonMode
        ? `You are an AI assistant helping users compare multiple AI tools. Be extremely concise and direct, focusing on key differences, factual information, and structured comparisons.`
        : `You are an AI assistant helping users learn about ${currentTool.name}. Answer only what was specifically asked, be extremely concise, use bullet points for features, and avoid marketing language.`;

      // Call the professional AI service
      const response = await aiService.chat(userMessage.content, {
        toolName: currentTool.name,
        toolPrompt,
        conversationHistory,
        maxRetries: 2,
        timeout: 25000,
      });

      const assistantResponse = cleanAIResponse(response.content);

      // Create a new message with the response
      const newAssistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: assistantResponse,
        isTyping: true,
        displayContent: '',
        toolId: currentTool.id,
        toolName: currentTool.name,
        toolCard:
          messages.length <= 2 ||
          input.toLowerCase().includes('feature') ||
          input.toLowerCase().includes('what can') ||
          input.toLowerCase().includes('how to use')
            ? currentTool
            : undefined,
      };

      setMessages((prev) => [...prev, newAssistantMessage]);
      animateTyping(newAssistantMessage.id, assistantResponse);

      setTimeout(() => {
        generateSuggestions();
      }, 1000);
    } catch (error) {
      // Handle specific AI service errors
      let userMessage =
        "Sorry, I'm having trouble responding right now. Please try again in a moment.";
      let duration = 4000;

      if (error instanceof (await import('@/lib/ai-service')).AIServiceError) {
        switch (error.code) {
          case 'RATE_LIMIT_EXCEEDED':
            userMessage =
              "I'm receiving too many requests right now. Please wait a moment and try again.";
            duration = 6000;
            break;
          case 'INPUT_TOO_LONG':
            userMessage =
              'Your message is too long. Please try with a shorter message.';
            break;
          case 'TIMEOUT':
            userMessage =
              'The request took too long. Please try again with a simpler question.';
            break;
          case 'MISSING_API_KEY':
            userMessage =
              'Service configuration error. Please contact support.';
            break;
          default:
            // Use default message
            break;
        }
      }

      console.error('Error sending message:', error);
      toast(userMessage, { duration });
    } finally {
      setIsLoading(false);
      setTypingIndicator(false);
    }
  };

  const handleSuggestionClick = async (suggestion: string) => {
    if (isLoading || !currentTool) return;

    // Instead of setting input and then sending, directly create a message with the suggestion
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: suggestion,
      toolId: currentTool.id,
      toolName: currentTool.name,
    };

    // Add user message to chat
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setTypingIndicator(true);

    // Track suggestion usage
    trackChatEvent(currentTool.id, 'message_sent');

    try {
      // Import AI service dynamically
      const { aiService, AIServiceError } = await import('@/lib/ai-service');

      // Prepare conversation history
      const conversationHistory = messages
        .filter((msg) => msg.role === 'user' || msg.role === 'assistant')
        .filter((msg) => msg.content.trim() !== '')
        .slice(-10) // Keep last 10 messages for context
        .map((msg) => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
        }));

      // Determine if we're in comparison mode
      const isComparisonMode =
        comparisonTools !== null && comparisonTools.length > 1;

      // Determine the appropriate tool prompt
      const toolPrompt = isComparisonMode
        ? `You are an AI assistant helping users compare multiple AI tools. Be extremely concise and direct, focusing on key differences, factual information, and structured comparisons.`
        : `You are an AI assistant helping users learn about ${currentTool.name}. Answer only what was specifically asked, be extremely concise, use bullet points for features, and avoid marketing language.`;

      // Call the professional AI service
      const response = await aiService.chat(suggestion, {
        toolName: currentTool.name,
        toolPrompt,
        conversationHistory,
        maxRetries: 2,
        timeout: 25000,
      });

      const assistantResponse = cleanAIResponse(response.content);

      // Create a new message with the response
      const newAssistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: assistantResponse,
        isTyping: true,
        displayContent: '',
        toolId: currentTool.id,
        toolName: currentTool.name,
        toolCard:
          messages.length <= 2 ||
          suggestion.toLowerCase().includes('feature') ||
          suggestion.toLowerCase().includes('what can') ||
          suggestion.toLowerCase().includes('how to use')
            ? currentTool
            : undefined,
      };

      setMessages((prev) => [...prev, newAssistantMessage]);
      animateTyping(newAssistantMessage.id, assistantResponse);

      setTimeout(() => {
        generateSuggestions();
      }, 1000);
    } catch (error) {
      // Handle specific AI service errors
      let userMessage =
        "Sorry, I'm having trouble responding right now. Please try again in a moment.";
      let duration = 4000;

      if (error instanceof (await import('@/lib/ai-service')).AIServiceError) {
        switch (error.code) {
          case 'RATE_LIMIT_EXCEEDED':
            userMessage =
              "I'm receiving too many requests right now. Please wait a moment and try again.";
            duration = 6000;
            break;
          case 'INPUT_TOO_LONG':
            userMessage =
              'Your message is too long. Please try with a shorter message.';
            break;
          case 'TIMEOUT':
            userMessage =
              'The request took too long. Please try again with a simpler question.';
            break;
          case 'MISSING_API_KEY':
            userMessage =
              'Service configuration error. Please contact support.';
            break;
          default:
            // Use default message
            break;
        }
      }

      console.error('Error sending message:', error);
      toast(userMessage, { duration });
    } finally {
      setIsLoading(false);
      setTypingIndicator(false);
    }
  };

  // Generate initial suggestions when chat opens with a tool
  useEffect(() => {
    if (
      isOpen &&
      currentTool &&
      messages.length > 0 &&
      suggestions.length === 0
    ) {
      generateSuggestions();
    }
  }, [isOpen, currentTool, messages.length, suggestions.length]);

  const value = {
    messages,
    isOpen,
    isLoading,
    typingIndicator,
    currentTool,
    comparisonTools,
    input,
    suggestions,
    loadingSuggestions,
    setInput,
    openChat,
    closeChat,
    sendMessage,
    handleSuggestionClick,
  };

  return (
    <SharedChatContext.Provider value={value}>
      {children}
    </SharedChatContext.Provider>
  );
}
