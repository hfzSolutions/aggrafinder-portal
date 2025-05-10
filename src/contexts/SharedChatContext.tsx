import React, { createContext, useContext, useState, useEffect } from 'react';
import { AITool } from '@/types/tools';
import { Anthropic } from '@anthropic-ai/sdk';
import { useToast } from '@/components/ui/use-toast';
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
};

type SharedChatContextType = {
  messages: Message[];
  isOpen: boolean;
  isLoading: boolean;
  typingIndicator: boolean;
  currentTool: AITool | null;
  input: string;
  suggestions: string[];
  loadingSuggestions: boolean;
  setInput: (input: string) => void;
  openChat: (tool: AITool) => void;
  closeChat: () => void;
  sendMessage: () => Promise<void>;
  handleSuggestionClick: (suggestion: string) => void;
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

export const SharedChatProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [typingIndicator, setTypingIndicator] = useState(false);
  const [currentTool, setCurrentTool] = useState<AITool | null>(null);
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  const { toast } = useToast();
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

    try {
      // Create Anthropic client instance
      const anthropic = new Anthropic({
        apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY || '',
        dangerouslyAllowBrowser: true,
      });

      // Prepare the conversation history for context
      // Filter messages related to the current tool
      const toolMessages = messages.filter(
        (msg) => !msg.toolId || msg.toolId === currentTool.id
      );
      const conversationHistory = toolMessages
        .map((msg) => msg.content)
        .join('\n');

      // Call Anthropic API to generate contextual suggestions
      const response = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20240620',
        max_tokens: 150,
        temperature: 0.7,
        system: `You are an AI assistant helping users learn about ${currentTool.name}, an AI tool. Based on the conversation history, generate 3-4 follow-up questions the user might want to ask next. Make these questions diverse, natural, and relevant to the conversation context. Each question should be concise (under 10 words if possible). Return ONLY the questions as a JSON array of strings with no additional text.`,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Here's the conversation so far about ${currentTool.name}:\n${conversationHistory}\n\nGenerate 3-4 natural follow-up questions as JSON array.`,
              },
            ],
          },
        ],
      });

      // Parse the response to get the suggestions
      try {
        // Extract JSON array from the response
        const content = response.content[0].text.trim();
        const jsonMatch = content.match(/\[.*\]/s);

        if (jsonMatch) {
          const parsedSuggestions = JSON.parse(jsonMatch[0]);
          if (
            Array.isArray(parsedSuggestions) &&
            parsedSuggestions.length > 0
          ) {
            setSuggestions(parsedSuggestions.slice(0, 4)); // Limit to 4 suggestions
            return;
          }
        }

        // Fallback if parsing fails
        throw new Error('Failed to parse suggestions');
      } catch (parseError) {
        console.error('Error parsing suggestions:', parseError);
        // Fallback to default suggestions if parsing fails
        setSuggestions([
          `What can I do with ${currentTool.name}?`,
          `How much does ${currentTool.name} cost?`,
          `What are the main features of ${currentTool.name}?`,
          `How does ${currentTool.name} compare to alternatives?`,
        ]);
      }
    } catch (error) {
      console.error('Error generating suggestions:', error);
      // Fallback to default suggestions if API call fails
      setSuggestions([
        `What can I do with ${currentTool.name}?`,
        `How much does ${currentTool.name} cost?`,
        `What are the main features of ${currentTool.name}?`,
        `How does ${currentTool.name} compare to alternatives?`,
      ]);
    } finally {
      // Always reset loading state
      setLoadingSuggestions(false);
    }
  };

  // Add welcome message when opening chat with a new tool
  const openChat = (tool: AITool) => {
    setCurrentTool(tool);
    setIsOpen(true);

    // Track when chat is opened
    trackChatEvent(tool.id, 'open');

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
        content: `👋 Hi! I can tell you more about ${tool.name}. What would you like to know?`,
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

  const sendMessage = async () => {
    if (!input.trim() || isLoading || !currentTool) return;

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
    trackChatEvent(currentTool.id, 'send_message');

    try {
      // Create Anthropic client instance
      const anthropic = new Anthropic({
        apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY || '',
        dangerouslyAllowBrowser: true,
      });

      // Prepare the conversation history for context
      const conversationHistory = messages
        .filter((msg) => !msg.toolId || msg.toolId === currentTool.id)
        .map((msg) => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
        }));

      // Add the new user message
      conversationHistory.push({
        role: 'user',
        content: input.trim(),
      });

      // Call Anthropic API
      const response = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20240620',
        max_tokens: 1000,
        temperature: 0.7,
        system: `You are an AI assistant helping users learn about ${
          currentTool.name
        }, an AI tool. 
        
        Here's what you know about ${currentTool.name}:
        - Description: ${currentTool.description}
        - Category: ${currentTool.category.join(', ')}
        - Pricing: ${currentTool.pricing}
        - Website: ${currentTool.url}
        
        Your goal is to provide helpful, accurate information about this tool. If you don't know something specific about the tool that wasn't provided in the context, you can acknowledge that limitation and offer to help with what you do know.
        
        Keep your responses conversational, helpful, and concise (generally under 150 words unless more detail is specifically requested).`,
        messages: conversationHistory,
      });

      // Get the assistant's response
      const assistantResponse = response.content[0].text;

      // Create a new message with the response
      const newAssistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: assistantResponse,
        isTyping: true, // Start with typing animation
        displayContent: '', // Will be filled during animation
        toolId: currentTool.id,
        toolName: currentTool.name,
        // Include tool card data in specific scenarios
        // Only include the tool card in the first response or when specifically discussing features
        toolCard:
          messages.length <= 2 ||
          input.toLowerCase().includes('feature') ||
          input.toLowerCase().includes('what can') ||
          input.toLowerCase().includes('how to use')
            ? currentTool
            : undefined,
      };

      // Add the assistant's message to the chat
      setMessages((prev) => [...prev, newAssistantMessage]);

      // Start typing animation for the new message
      animateTyping(newAssistantMessage.id, assistantResponse);

      // Generate new suggestions based on the updated conversation
      setTimeout(() => {
        generateSuggestions();
      }, 1000);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to get a response. Please try again in a moment.',
        variant: 'destructive',
      });

      // Add an error message to the chat
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content:
            'I apologize, but I encountered an error processing your request. Please try again in a moment.',
          toolId: currentTool?.id,
          toolName: currentTool?.name,
        },
      ]);
    } finally {
      setIsLoading(false);
      setTypingIndicator(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    if (isLoading || !currentTool) return;
    setInput(suggestion);
    // Use setTimeout to ensure the input is updated before sending
    setTimeout(() => {
      sendMessage();
    }, 10);

    // Track suggestion usage
    trackChatEvent(currentTool.id, 'suggestion_used');
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
};
