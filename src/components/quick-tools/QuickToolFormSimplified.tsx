import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { FileUpload } from '@/components/ui/file-upload';
import {
  Bot,
  Save,
  Sparkles,
  PlayCircle,
  Loader2,
  Image as ImageIcon,
  Info,
  Globe,
  User,
  Send,
  X,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAdmin } from '@/hooks/useSupabaseAdmin';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { compressImage } from '@/utils/imageCompression';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar } from '@/components/ui/avatar';
import { MarkdownRenderer } from '@/components/ui/markdown-renderer';
import { ScrollArea } from '@/components/ui/scroll-area';

interface QuickToolFormSimplifiedProps {
  userId: string;
  onSuccess: () => void;
  editMode?: boolean;
  toolToEdit?: {
    id: string;
    name: string;
    description: string;
    prompt: string;
    category: string[];
    is_public?: boolean;
    suggested_replies?: boolean;
    imageUrl?: string;
    initial_message?: string;
  };
}

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isTyping?: boolean;
  displayContent?: string;
};

interface FormData {
  name: string;
  description: string;
  prompt: string;
  isPublic: boolean;
  suggestedReplies: boolean;
  selectedCategories: string[];
  imageFile: File | null;
  imageUrl: string;
  avatarIdea: string;
  avatarPrompt: string; // Add this new field
  showAvatarIdea: boolean;
  initialMessage: string;
  showInitialMessageGenerator: boolean;
  showPromptGenerator: boolean;
  showDescriptionGenerator: boolean;
  showNameGenerator: boolean;
}

export const QuickToolFormSimplified = ({
  userId,
  onSuccess,
  editMode = false,
  toolToEdit,
}: QuickToolFormSimplifiedProps) => {
  const {
    submitTool,
    updateTool,
    loading: adminActionLoading,
  } = useSupabaseAdmin();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewInput, setPreviewInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [categories, setCategories] = useState<{ id: number; name: string }[]>(
    []
  );
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [isGeneratingAvatar, setIsGeneratingAvatar] = useState(false);
  const [isGeneratingMessage, setIsGeneratingMessage] = useState(false);
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  const [isGeneratingName, setIsGeneratingName] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState<FormData>({
    name: editMode && toolToEdit ? toolToEdit.name : '',
    description: editMode && toolToEdit ? toolToEdit.description : '',
    prompt: editMode && toolToEdit ? toolToEdit.prompt : '',
    isPublic: editMode && toolToEdit ? toolToEdit.is_public : true,
    suggestedReplies:
      editMode && toolToEdit ? toolToEdit.suggested_replies : true,
    selectedCategories:
      editMode && toolToEdit && toolToEdit.category.length > 0
        ? toolToEdit.category
        : [],
    imageFile: null as File | null,
    imageUrl: editMode && toolToEdit ? toolToEdit.imageUrl : '',
    avatarIdea: '',
    avatarPrompt:
      'Create a professional avatar for an AI assistant. The avatar should be a modern, clean, professional-looking character.',
    showAvatarIdea: false,
    initialMessage:
      editMode && toolToEdit ? toolToEdit.initial_message || '' : '',
    showInitialMessageGenerator: false,
    showPromptGenerator: false,
    showDescriptionGenerator: false,
    showNameGenerator: false,
  });

  // Add state for showing more settings
  const [showMoreSettings, setShowMoreSettings] = useState(false);

  // Fetch categories from the database
  useEffect(() => {
    const fetchCategories = async () => {
      setCategoriesLoading(true);
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .order('name', { ascending: true });

        if (error) {
          console.error('Error fetching categories:', error);
          return;
        }

        setCategories(data || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Function to animate typing effect for a message
  const animateTyping = useCallback((messageId: string, content: string) => {
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
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (file: File) => {
    try {
      // Compress the image before storing it
      const compressedFile = await compressImage(file, {
        maxSizeMB: 1,
        maxWidthOrHeight: 800,
      });

      setFormData((prev) => ({
        ...prev,
        imageFile: compressedFile,
        imageUrl: URL.createObjectURL(compressedFile),
      }));
    } catch (error) {
      console.error('Error compressing image:', error);
      toast.error('Failed to process image. Please try a different one.');
    }
  };

  // Function to generate AI avatar using the image generation API
  const generateAIAvatar = async () => {
    if (!formData.avatarPrompt.trim()) {
      toast.error('Avatar prompt is required to generate an avatar');
      return;
    }

    setIsGeneratingAvatar(true);
    try {
      const apiKey = import.meta.env.VITE_IMAGEROUTER_API_KEY;

      if (!apiKey) {
        throw new Error(
          'Image generation API key not found. Please set VITE_IMAGEROUTER_API_KEY in your environment variables.'
        );
      }

      // Use the user's edited prompt directly
      const prompt = formData.avatarPrompt.trim();

      const response = await fetch(
        'https://ir-api.myqa.cc/v1/openai/images/generations',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            prompt,
            model: import.meta.env.VITE_IMAGEROUTER_MODEL_NAME,
            quality: 'auto',
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `Image generation API error: ${response.status} - ${
            errorData.error?.message || 'Unknown error'
          }`
        );
      }

      const data = await response.json();

      // Handle both response formats (URL and base64)
      let imageFile;
      if (data.data && data.data[0]) {
        if (data.data[0].url) {
          // URL format - Try to download the image, fallback to URL if CORS blocked
          try {
            // Try direct fetch first
            const imageResponse = await fetch(data.data[0].url, {
              mode: 'cors',
              headers: {
                Accept: 'image/*',
              },
            });

            if (!imageResponse.ok) {
              throw new Error(
                `HTTP ${imageResponse.status}: ${imageResponse.statusText}`
              );
            }

            const imageBlob = await imageResponse.blob();
            const file = new File(
              [imageBlob],
              `${formData.name.replace(/\s+/g, '-').toLowerCase()}-avatar.png`,
              { type: imageBlob.type || 'image/png' }
            );

            imageFile = file;
            console.log('Successfully downloaded and converted image to File');
          } catch (downloadError) {
            console.warn(
              'Direct download failed due to CORS or network error:',
              downloadError
            );

            // Fallback: Try using a CORS proxy service
            try {
              console.log('Attempting download via CORS proxy...');
              const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(
                data.data[0].url
              )}`;
              const proxyResponse = await fetch(proxyUrl);

              if (!proxyResponse.ok) {
                throw new Error(`Proxy failed: ${proxyResponse.status}`);
              }

              const imageBlob = await proxyResponse.blob();
              const file = new File(
                [imageBlob],
                `${formData.name
                  .replace(/\s+/g, '-')
                  .toLowerCase()}-avatar.png`,
                { type: imageBlob.type || 'image/png' }
              );

              imageFile = file;
              console.log('Successfully downloaded via CORS proxy');
            } catch (proxyError) {
              console.warn('CORS proxy also failed:', proxyError);

              // Final fallback: Just use the URL (backend will need to handle the download)
              console.log(
                'Using URL as fallback - backend will handle download'
              );
              setFormData((prev) => ({
                ...prev,
                imageFile: null,
                imageUrl: data.data[0].url,
              }));

              toast.success(
                'Avatar generated successfully! (Using external URL)'
              );
              setIsGeneratingAvatar(false);
              return;
            }
          }
        } else if (data.data[0].b64_json) {
          // Base64 format - Convert to File object
          const base64Data = data.data[0].b64_json;
          const byteCharacters = atob(base64Data);
          const byteArrays = [];

          for (let offset = 0; offset < byteCharacters.length; offset += 512) {
            const slice = byteCharacters.slice(offset, offset + 512);

            const byteNumbers = new Array(slice.length);
            for (let i = 0; i < slice.length; i++) {
              byteNumbers[i] = slice.charCodeAt(i);
            }

            const byteArray = new Uint8Array(byteNumbers);
            byteArrays.push(byteArray);
          }

          const blob = new Blob(byteArrays, { type: 'image/png' });
          const file = new File(
            [blob],
            `${formData.name.replace(/\s+/g, '-').toLowerCase()}-avatar.png`,
            { type: 'image/png' }
          );

          imageFile = file;
        }
      }

      if (!imageFile) {
        throw new Error('No image was generated');
      }

      // Update the form data with the generated image as a File
      setFormData((prev) => ({
        ...prev,
        imageFile: imageFile,
        imageUrl: URL.createObjectURL(imageFile),
      }));

      toast.success('Avatar generated successfully!');
    } catch (error) {
      console.error('Error generating logo:', error);
      // Check for daily limit error (429)
      if (
        error.message &&
        error.message.includes('429') &&
        error.message.includes('Daily limit')
      ) {
        toast.error(
          'Daily limit of free logo generation requests reached. Please try again tomorrow or use a custom image.'
        );
      } else {
        toast.error(`Failed to generate logo: ${error.message}`);
      }
    } finally {
      setIsGeneratingAvatar(false);
    }
  };

  const handleCategoryChange = (value: string) => {
    setFormData((prev) => {
      // Get current categories
      const currentCategories = [...prev.selectedCategories];

      // Check if the category is already selected
      const categoryIndex = currentCategories.indexOf(value);

      if (categoryIndex >= 0) {
        // If already selected, remove it
        currentCategories.splice(categoryIndex, 1);
      } else {
        // If not selected and we have less than 3 categories, add it
        if (currentCategories.length < 3) {
          currentCategories.push(value);
        } else {
          // If we already have 3 categories, show a toast and don't add
          toast.error('Maximum 3 categories allowed');
          return prev; // Return unchanged state
        }
      }

      return {
        ...prev,
        selectedCategories: currentCategories,
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!formData.name.trim()) {
      toast.error('Please enter a name for your AI tool');
      return;
    }

    if (!formData.description.trim()) {
      toast.error('Please enter a description for your AI tool');
      return;
    }

    if (!formData.prompt.trim()) {
      toast.error('Please enter instructions for your AI tool');
      return;
    }

    if (formData.selectedCategories.length === 0) {
      toast.error('Please select at least one category for your AI tool');
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare the tool data
      const toolData = {
        name: formData.name.trim(),
        tagline: '', // Quick tools don't use tagline, but the hook expects it
        description: formData.description.trim(),
        url: '', // Quick tools don't have external URLs
        prompt: formData.prompt.trim(), // Add prompt field for quick tools
        initial_message: formData.initialMessage.trim(), // Add initial message field
        tool_type: 'quick', // Specify this is a quick tool
        is_public: formData.isPublic,
        suggested_replies: formData.suggestedReplies,
        usage_count: editMode ? undefined : 0, // Only set for new tools
        image_url: formData.imageFile || formData.imageUrl, // Pass the file or URL directly to the hook
        category: formData.selectedCategories,
        pricing: 'Free', // Quick tools are always free
        featured: false,
        tags: [],
        user_id: userId,
        is_admin_added: false,
      };

      // Submit or update the tool
      if (editMode && toolToEdit) {
        await updateTool(toolToEdit.id, toolData);
        toast.success('AI tool updated successfully!');
      } else {
        await submitTool(toolData);
        toast.success('AI tool created successfully!');
      }

      onSuccess();
    } catch (error) {
      console.error('Error submitting tool:', error);
      toast.error(
        `Failed to ${editMode ? 'update' : 'create'} AI tool: ${error.message}`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenPreview = () => {
    setIsPreviewOpen(true);
  };

  const handleSendTestMessage = async () => {
    if (!previewInput.trim() || isTesting) return;

    // Validate prompt first
    if (!formData.prompt.trim()) {
      toast.error('Please enter an AI prompt to test');
      return;
    }

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString() + '-user',
      role: 'user',
      content: previewInput,
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsTesting(true);

    try {
      // Import AI service dynamically
      const { aiService, AIServiceError } = await import('@/lib/ai-service');

      // Prepare conversation history
      const conversationHistory = messages
        .filter((msg) => msg.role === 'user' || msg.role === 'assistant')
        .filter((msg) => msg.content.trim() !== '')
        .slice(-5) // Keep last 5 messages for context in testing
        .map((msg) => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
        }));

      // Call the professional AI service
      const response = await aiService.chat(previewInput, {
        toolName: formData.name,
        toolPrompt: formData.prompt,
        conversationHistory,
        maxRetries: 1,
        timeout: 20000,
      });

      // Create the assistant message with typing animation
      const assistantMessage: Message = {
        id: Date.now().toString() + '-assistant',
        role: 'assistant',
        content: response.content,
        isTyping: true,
        displayContent: '',
      };

      // Add the message with empty content initially
      setMessages((prev) => [...prev, assistantMessage]);

      // Start typing animation
      animateTyping(assistantMessage.id, assistantMessage.content);
    } catch (error) {
      // Handle specific AI service errors
      let userMessage =
        "Sorry, I'm having trouble responding right now. Please try again in a moment.";

      if (error instanceof (await import('@/lib/ai-service')).AIServiceError) {
        switch (error.code) {
          case 'RATE_LIMIT_EXCEEDED':
            userMessage =
              "I'm receiving too many requests right now. Please wait a moment and try again.";
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

      console.error('Error in test message:', error);
      toast.error(userMessage);
    } finally {
      setIsTesting(false);
      setPreviewInput('');
    }
  };

  // Function to generate AI initial message
  const generateInitialMessage = async () => {
    if (!formData.name.trim() || !formData.prompt.trim()) {
      toast.error(
        'Tool name and AI instructions are required to generate an initial message'
      );
      return;
    }

    setIsGeneratingMessage(true);
    try {
      const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;

      if (!apiKey) {
        throw new Error(
          'OpenRouter API key not found. Please set VITE_OPENROUTER_API_KEY in your environment variables.'
        );
      }

      // Create a prompt for generating the initial message
      // If there's existing content, ask AI to enhance it
      const existingContent = formData.initialMessage.trim();
      let prompt;

      if (existingContent) {
        prompt = `You are enhancing an initial welcome message for an AI tool called "${formData.name}". 
      The AI's instructions are: ${formData.prompt}
      
      The current welcome message is: "${existingContent}"
      
      Improve this welcome message while keeping its core meaning. The message should:
      1. Be concise (2-3 sentences maximum)
      2. Explain what the tool does in simple terms
      3. Invite the user to start interacting
      4. Be conversational and engaging
      
      IMPORTANT: Return ONLY the welcome message itself with no prefixes, explanations, or formatting. Do not include phrases like "Here is the welcome message:" or any other commentary. Just return the message text directly.`;
      } else {
        prompt = `You are creating an initial welcome message for an AI tool called "${formData.name}". 
      The AI's instructions are: ${formData.prompt}
      
      Create a brief, friendly welcome message that introduces the AI tool to users. The message should:
      1. Be concise (2-3 sentences maximum)
      2. Explain what the tool does in simple terms
      3. Invite the user to start interacting
      4. Be conversational and engaging
      5. Do not use word 'AI' or 'AI assistant'
      
      Return ONLY the welcome message itself with no prefixes, explanations, or formatting. Do not include phrases like "Here is the welcome message:" or any other commentary. Just return the message text directly.`;
      }

      const response = await fetch(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
            'HTTP-Referer': window.location.origin,
            'X-Title': 'DeepList AI',
          },
          body: JSON.stringify({
            model: import.meta.env.VITE_OPENROUTER_MODEL_NAME_2,
            messages: [
              {
                role: 'user',
                content: prompt,
              },
            ],
            temperature: 0.7,
            max_tokens: 2000,
            top_p: 0.9,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const data = await response.json();

      if (!data.choices?.[0]?.message?.content) {
        throw new Error('Invalid response');
      }

      // Clean up the generated message to remove any potential prefixes like "Okay, here is the welcome message:"
      let generatedMessage = data.choices[0].message.content.trim();

      // Remove common prefixes that might be in the response
      const prefixesToRemove = [
        'Here is the welcome message:',
        "Here's the welcome message:",
        'Okay, here is the welcome message:',
        "Okay, here's the welcome message:",
        'Welcome message:',
        'The welcome message:',
      ];

      for (const prefix of prefixesToRemove) {
        if (generatedMessage.startsWith(prefix)) {
          generatedMessage = generatedMessage.substring(prefix.length).trim();
        }
      }

      // Remove quotes if the message is wrapped in them
      if (
        (generatedMessage.startsWith('"') && generatedMessage.endsWith('"')) ||
        (generatedMessage.startsWith("'") && generatedMessage.endsWith("'"))
      ) {
        generatedMessage = generatedMessage
          .substring(1, generatedMessage.length - 1)
          .trim();
      }

      // Update the form data with the cleaned generated message
      setFormData((prev) => ({
        ...prev,
        initialMessage: generatedMessage,
      }));

      toast.success(
        existingContent
          ? 'Initial message enhanced successfully!'
          : 'Initial message generated successfully!'
      );
    } catch (error) {
      console.error('Error generating initial message:', error);
      toast.error(`Failed to generate initial message: ${error.message}`);
    } finally {
      setIsGeneratingMessage(false);
    }
  };

  const generateAIPrompt = async () => {
    if (!formData.name.trim()) {
      toast.error('Tool name is required to generate AI instructions');
      return;
    }

    setIsGeneratingPrompt(true);
    try {
      const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;

      if (!apiKey) {
        throw new Error(
          'OpenRouter API key not found. Please set VITE_OPENROUTER_API_KEY in your environment variables.'
        );
      }

      // Create a prompt for generating the AI instructions
      // If there's existing content, ask AI to enhance it
      const existingContent = formData.prompt.trim();
      let prompt;

      if (existingContent) {
        prompt = `You are enhancing AI instructions for a tool called "${formData.name}". 
      
      The current AI instructions are: "${existingContent}"
      
      Improve these instructions while keeping their core meaning. The result should be:
      - A single paragraph that starts with "You are..."
      - Focus only on the purpose of the AI
      - Do not include separate sections for capabilities, tone, style, constraints, or scenarios
      - Do not use word 'AI' or 'AI assistant'

      Return ONLY the improved instructions with no additional commentary or formatting.`;
      } else {
        prompt = `You are creating AI instructions for a tool called "${formData.name}". 
      
      Create a single paragraph of instructions that starts with "You are..." and focuses only on the purpose of the AI.
      Do not include separate sections for capabilities, tone, style, constraints, or scenarios.
      
      Return ONLY the instructions with no additional commentary or formatting.`;
      }

      const response = await fetch(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
            'HTTP-Referer': window.location.origin,
            'X-Title': 'DeepList AI',
          },
          body: JSON.stringify({
            model: import.meta.env.VITE_OPENROUTER_MODEL_NAME,
            messages: [
              {
                role: 'user',
                content: prompt,
              },
            ],
            temperature: 0.7,
            max_tokens: 2000,
            top_p: 0.9,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const data = await response.json();

      if (!data.choices?.[0]?.message?.content) {
        throw new Error('Invalid response');
      }

      const generatedPrompt = data.choices[0].message.content.trim();

      // Update the form data with the generated instructions
      setFormData((prev) => ({
        ...prev,
        prompt: generatedPrompt,
      }));

      toast.success(
        existingContent
          ? 'AI instructions enhanced successfully!'
          : 'AI instructions generated successfully!'
      );
    } catch (error) {
      console.error('Error generating AI instructions:', error);
      toast.error(`Failed to generate AI instructions: ${error.message}`);
    } finally {
      setIsGeneratingPrompt(false);
    }
  };

  const generateAIDescription = async () => {
    if (!formData.name.trim()) {
      toast.error('Tool name is required to generate a description');
      return;
    }

    setIsGeneratingDescription(true);
    try {
      const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;

      if (!apiKey) {
        throw new Error(
          'OpenRouter API key not found. Please set VITE_OPENROUTER_API_KEY in your environment variables.'
        );
      }

      // Create a prompt for generating the description
      // If there's existing content, ask AI to enhance it
      const existingContent = formData.description.trim();
      let prompt;

      if (existingContent) {
        prompt = `You are enhancing a short description for an AI tool called "${formData.name}". 
      
      The current description is: "${existingContent}"
      
      Improve this description while keeping its core meaning. The description should:
      1. Be concise (1-2 sentences maximum)
      2. Clearly explain what the tool does and its main benefit
      3. Be compelling and user-focused
      4. Use simple, direct language
      5. No markdown formatting
      6. Return ONLY ONE description, not multiple options
      7. Do not include option numbers, bullet points, or "Option X:" prefixes
      
      Return ONLY the improved description with no additional commentary or formatting.`;
      } else {
        prompt = `You are creating a short description for an AI tool called "${formData.name}". 
      
      Create a brief, compelling description that explains what the tool does. The description should:
      1. Be concise (1-2 sentences maximum)
      2. Clearly explain what the tool does and its main benefit
      3. Be compelling and user-focused
      4. Use simple, direct language
      5. No markdown formatting
      6. Return ONLY ONE description, not multiple options
      7. Do not include option numbers, bullet points, or "Option X:" prefixes
      8. Do not use word 'AI' or 'AI assistant'
      
      Return ONLY the description with no additional commentary or formatting.`;
      }

      const response = await fetch(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
            'HTTP-Referer': window.location.origin,
            'X-Title': 'DeepList AI',
          },
          body: JSON.stringify({
            model: import.meta.env.VITE_OPENROUTER_MODEL_NAME_2,
            messages: [
              {
                role: 'user',
                content: prompt,
              },
            ],
            temperature: 0.7,
            max_tokens: 2000,
            top_p: 0.9,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const data = await response.json();

      if (!data.choices?.[0]?.message?.content) {
        throw new Error('Invalid response');
      }

      // Clean up any markdown formatting or option prefixes that might still be present
      let generatedDescription = data.choices[0].message.content.trim();

      // Remove any "Option X:" prefixes
      generatedDescription = generatedDescription.replace(
        /^\s*\*\*Option \d+:\*\*\s*/i,
        ''
      );
      generatedDescription = generatedDescription.replace(
        /^\s*Option \d+:\s*/i,
        ''
      );

      // Remove any markdown formatting
      generatedDescription = generatedDescription.replace(/\*\*/g, '');

      // Update the form data with the cleaned generated description
      setFormData((prev) => ({
        ...prev,
        description: generatedDescription,
      }));

      toast.success(
        existingContent
          ? 'Description enhanced successfully!'
          : 'Description generated successfully!'
      );
    } catch (error) {
      console.error('Error generating description:', error);
      toast.error(`Failed to generate description: ${error.message}`);
    } finally {
      setIsGeneratingDescription(false);
    }
  };

  const generateAIName = async () => {
    // If there's a description, we can use it to generate a more relevant name
    const hasDescription = formData.description.trim().length > 0;

    setIsGeneratingName(true);
    try {
      const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;

      if (!apiKey) {
        throw new Error(
          'OpenRouter API key not found. Please set VITE_OPENROUTER_API_KEY in your environment variables.'
        );
      }

      // Create a prompt for generating the name
      // If there's existing content, ask AI to enhance it
      const existingContent = formData.name.trim();
      let prompt;

      if (existingContent) {
        prompt = `You are enhancing a name for an AI tool. 
      
      The current name is: "${existingContent}"
      ${
        hasDescription
          ? `The tool's description is: "${formData.description}"`
          : ''
      }
      
      Improve this name while keeping its core meaning. The name should:
      1. Be concise and catchy (1-4 words maximum)
      2. Clearly relate to the tool's purpose
      3. Be memorable and easy to pronounce
      4. Don't combine words, space each word
      5. No markdown or special characters
      6. One tool name only
      
      Return ONLY the improved name with no additional commentary or formatting.
      
      (IMPORTANT: 1-4 words maximum output words)
      `;
      } else {
        prompt = `You are creating a name for an AI tool. 
      ${
        hasDescription
          ? `The tool's description is: "${formData.description}"`
          : 'This is a new AI tool being created.'
      }
      
      Create a brief, compelling name for this AI tool. The name should:
      1. Be concise and catchy (1-4 words maximum)
      2. Clearly relate to the tool's purpose
      3. Be memorable and easy to pronounce
      4. Don't combine words, space each word
      5. No markdown or special characters
      6. One tool name only
      7. Do not use word 'AI' or 'AI assistant'
      
      Return ONLY the name with no additional commentary or formatting.
      
      (IMPORTANT: 1-4 words maximum output words)
      `;
      }

      const response = await fetch(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
            'HTTP-Referer': window.location.origin,
            'X-Title': 'DeepList AI',
          },
          body: JSON.stringify({
            model: import.meta.env.VITE_OPENROUTER_MODEL_NAME_2,
            messages: [
              {
                role: 'user',
                content: prompt,
              },
            ],
            temperature: 0.8, // Slightly higher temperature for more creative names
            max_tokens: 2000, // Names are short, so we don't need many tokens
            top_p: 0.9,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const data = await response.json();

      if (!data.choices?.[0]?.message?.content) {
        throw new Error('Invalid response');
      }

      const generatedName = data.choices[0].message.content.trim();

      // Update the form data with the generated name
      setFormData((prev) => ({
        ...prev,
        name: generatedName,
      }));

      toast.success(
        existingContent
          ? 'Name enhanced successfully!'
          : 'Name generated successfully!'
      );
    } catch (error) {
      console.error('Error generating name:', error);
      toast.error(`Failed to generate name: ${error.message}`);
    } finally {
      setIsGeneratingName(false);
    }
  };

  // Function to update avatar prompt based on tool name and description
  const updateAvatarPrompt = () => {
    let prompt = 'Create a professional avatar for an AI assistant';

    if (formData.name.trim()) {
      prompt += ` called "${formData.name}"`;
    }

    if (formData.description.trim()) {
      prompt += `. This tool ${formData.description}`;
    }

    setFormData((prev) => ({
      ...prev,
      avatarPrompt: prompt,
    }));
  };

  // Update avatar prompt when name or description changes
  useEffect(() => {
    if (
      formData.showAvatarIdea &&
      (formData.name.trim() || formData.description.trim())
    ) {
      updateAvatarPrompt();
    }
  }, [formData.name, formData.description, formData.showAvatarIdea]);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Tool Avatar */}
        <div className="space-y-2">
          <Label className="text-lg font-semibold flex items-center gap-2">
            <span>Avatar</span>
          </Label>
          <div className="flex items-center gap-4">
            {formData.imageUrl ? (
              <div className="relative h-20 w-20 rounded-xl bg-muted flex items-center justify-center border-2 border-border">
                <img
                  src={formData.imageUrl}
                  alt="Tool avatar"
                  className="h-full w-full object-cover"
                />
                <FileUpload
                  onFileSelect={handleImageUpload}
                  accept="image/*"
                  maxSize={5}
                >
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-primary text-primary-foreground shadow-sm"
                  >
                    <span className="sr-only">Change avatar</span>
                    <span className="text-xs font-bold">+</span>
                  </Button>
                </FileUpload>
              </div>
            ) : (
              <div className="relative h-20 w-20 rounded-xl bg-muted flex items-center justify-center border-2 border-border">
                <User className="h-8 w-8 text-muted-foreground" />
                <FileUpload
                  onFileSelect={handleImageUpload}
                  accept="image/*"
                  maxSize={5}
                >
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-primary text-primary-foreground shadow-sm"
                  >
                    <span className="sr-only">Upload avatar</span>
                    <span className="text-xs font-bold">+</span>
                  </Button>
                </FileUpload>
              </div>
            )}
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="h-8 text-xs border flex items-center gap-1"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      showAvatarIdea: !prev.showAvatarIdea,
                    }))
                  }
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Generate Avatar with AI
                </Button>
              </div>
              {formData.showAvatarIdea && (
                <div className="space-y-3 animate-in fade-in-50 slide-in-from-top-5 duration-300">
                  <div className="space-y-2">
                    <Textarea
                      id="avatarPrompt"
                      name="avatarPrompt"
                      value={formData.avatarPrompt}
                      onChange={handleInputChange}
                      placeholder="Describe how you want your avatar to look..."
                      className="min-h-[80px] text-xs resize-none"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="default"
                      className="h-8 text-xs"
                      onClick={generateAIAvatar}
                      disabled={
                        isGeneratingAvatar || !formData.avatarPrompt.trim()
                      }
                    >
                      {isGeneratingAvatar ? (
                        <>
                          <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        'Generate'
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tool Name */}
        <div className="space-y-2">
          <Label
            htmlFor="name"
            className="text-lg font-semibold flex items-center gap-2"
          >
            <span>Name</span>
          </Label>
          <div className="relative">
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Example: English Teacher"
              className="h-14 text-base border-2 focus:border-primary/50 pr-12"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={() => {
                  // Always generate name when clicked
                  generateAIName();
                  // If the generator is not visible, make it visible
                  if (!formData.showNameGenerator) {
                    setFormData((prev) => ({
                      ...prev,
                      showNameGenerator: true,
                    }));
                  }
                }}
                className="h-10 w-10 rounded-full bg-primary/10 hover:bg-primary/20"
                disabled={isGeneratingName}
              >
                {isGeneratingName ? (
                  <Loader2 className="h-5 w-5 text-primary animate-spin" />
                ) : (
                  <Sparkles className="h-5 w-5 text-primary" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Tool Description */}
        <div className="space-y-2">
          <Label htmlFor="description" className="text-lg font-semibold">
            Short Description
          </Label>
          <div className="relative">
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Example: An English teacher that offers clear explanations and practical examples to help students learn more effectively."
              className="min-h-[10px] text-base border-2 focus:border-primary/50 pr-12 resize-none"
            />
            <div className="absolute right-3 top-3">
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={() => {
                  // Always generate description when clicked
                  generateAIDescription();
                  // If the generator is not visible, make it visible
                  if (!formData.showDescriptionGenerator) {
                    setFormData((prev) => ({
                      ...prev,
                      showDescriptionGenerator: true,
                    }));
                  }
                }}
                className="h-10 w-10 rounded-full bg-primary/10 hover:bg-primary/20"
                disabled={isGeneratingDescription}
              >
                {isGeneratingDescription ? (
                  <Loader2 className="h-5 w-5 text-primary animate-spin" />
                ) : (
                  <Sparkles className="h-5 w-5 text-primary" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Tool Instructions */}
        <div className="space-y-2">
          <Label
            htmlFor="prompt"
            className="text-lg font-semibold flex items-center gap-2"
          >
            <span>AI Instructions</span>
          </Label>
          <div className="relative">
            <Textarea
              id="prompt"
              name="prompt"
              value={formData.prompt}
              onChange={handleInputChange}
              placeholder="Example: You are an experienced English teacher who helps students learn. You provide clear explanations and practical examples to make conversations interesting."
              className="min-h-[100px] text-base border-2 focus:border-primary/50 pr-12 resize-none"
            />
            <div className="absolute right-3 top-3 flex gap-2">
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={() => {
                  // Always generate prompt when clicked
                  generateAIPrompt();
                  // If the generator is not visible, make it visible
                  if (!formData.showPromptGenerator) {
                    setFormData((prev) => ({
                      ...prev,
                      showPromptGenerator: true,
                    }));
                  }
                }}
                className="h-10 w-10 rounded-full bg-primary/10 hover:bg-primary/20"
                disabled={isGeneratingPrompt}
              >
                {isGeneratingPrompt ? (
                  <Loader2 className="h-5 w-5 text-primary animate-spin" />
                ) : (
                  <Sparkles className="h-5 w-5 text-primary" />
                )}
              </Button>
              {/* <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={handleOpenPreview}
                className="h-10 w-10 rounded-full bg-primary/10 hover:bg-primary/20"
              >
                <PlayCircle className="h-5 w-5 text-primary" />
              </Button> */}
            </div>
          </div>
        </div>

        {/* Initial Message */}
        <div className="space-y-2">
          <Label
            htmlFor="initialMessage"
            className="text-lg font-semibold flex items-center gap-2"
          >
            <span>Initial Message</span>
          </Label>
          <div className="relative">
            <Textarea
              id="initialMessage"
              name="initialMessage"
              value={formData.initialMessage}
              onChange={handleInputChange}
              placeholder="Example: Hi there! I'm your AI assistant for English learning. How can I help you today?"
              className="min-h-[80px] text-base border-2 focus:border-primary/50 pr-12 resize-none"
            />
            <div className="absolute right-3 top-3">
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={() => {
                  // Always generate message when clicked, regardless of current state
                  generateInitialMessage();
                  // If the generator is not visible, make it visible
                  if (!formData.showInitialMessageGenerator) {
                    setFormData((prev) => ({
                      ...prev,
                      showInitialMessageGenerator: true,
                    }));
                  }
                }}
                className="h-10 w-10 rounded-full bg-primary/10 hover:bg-primary/20"
                disabled={isGeneratingMessage}
              >
                {isGeneratingMessage ? (
                  <Loader2 className="h-5 w-5 text-primary animate-spin" />
                ) : (
                  <Sparkles className="h-5 w-5 text-primary" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Category Selection */}
        <div className="space-y-2">
          <Label htmlFor="category" className="text-lg font-semibold">
            Category (Max 3)
          </Label>
          <div className="relative">
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.selectedCategories.map((category) => (
                <div
                  key={category}
                  className="bg-primary/10 text-primary px-3 py-1 rounded-full flex items-center gap-1"
                >
                  <span>{category}</span>
                  <button
                    type="button"
                    onClick={() => handleCategoryChange(category)}
                    className="text-primary hover:text-primary/70"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
            <Select
              onValueChange={handleCategoryChange}
              disabled={categoriesLoading}
            >
              <SelectTrigger className="h-14 text-base border-2 focus:border-primary/50">
                <SelectValue placeholder="Select categories" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem
                    key={category.id}
                    value={category.name}
                    disabled={
                      formData.selectedCategories.length >= 3 &&
                      !formData.selectedCategories.includes(category.name)
                    }
                  >
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Show More Settings - Simplified with arrow */}
        <div
          className="flex items-center justify-between py-2 px-1 mt-2 mb-2 cursor-pointer text-muted-foreground hover:text-foreground transition-colors"
          onClick={() => setShowMoreSettings(!showMoreSettings)}
        >
          <span className="text-sm font-medium flex items-center gap-1">
            <Info className="h-4 w-4" />
            Advanced Settings
          </span>
          {showMoreSettings ? (
            <span className="flex items-center gap-1">
              Hide <ChevronUp className="h-4 w-4" />
            </span>
          ) : (
            <span className="flex items-center gap-1">
              Show <ChevronDown className="h-4 w-4" />
            </span>
          )}
        </div>

        {/* Advanced Settings Section - Only visible when showMoreSettings is true */}
        {showMoreSettings && (
          <div className="space-y-4 p-4 bg-muted/20 rounded-lg">
            {/* Public/Private Toggle */}
            <div className="flex items-center justify-between pt-2 pb-2">
              <div className="space-y-1">
                <Label
                  htmlFor="public-toggle"
                  className="text-base flex items-center gap-2"
                >
                  <Globe className="h-4 w-4 text-primary" />
                  Public: Everyone can chat
                </Label>
              </div>
              <Switch
                id="public-toggle"
                checked={formData.isPublic}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, isPublic: checked }))
                }
                className="scale-100"
              />
            </div>

            {/* Suggested Replies Toggle */}
            <div className="flex items-center justify-between pt-2 pb-2">
              <div className="space-y-1">
                <Label
                  htmlFor="suggested-replies-toggle"
                  className="text-base flex items-center gap-2"
                >
                  <Sparkles className="h-4 w-4 text-primary" />
                  Suggested Replies: Quick responses
                </Label>
              </div>
              <Switch
                id="suggested-replies-toggle"
                checked={formData.suggestedReplies}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({
                    ...prev,
                    suggestedReplies: checked,
                  }))
                }
                className="scale-100"
              />
            </div>
          </div>
        )}

        <Button
          type="submit"
          className="w-full h-14 text-lg font-semibold gap-2 bg-primary hover:bg-primary/90 mt-4"
          disabled={isSubmitting || adminActionLoading}
        >
          {isSubmitting || adminActionLoading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              {editMode ? 'Updating' : 'Creating'}
            </>
          ) : (
            <>
              <Save className="h-5 w-5" />
              {editMode ? 'Update Now' : 'Create Now'}
            </>
          )}
        </Button>
      </form>

      {/* Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Test Your AI Tool
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <ScrollArea className="h-[400px] p-4 border-2 rounded-xl bg-muted/10">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-muted-foreground">
                  <Bot className="h-16 w-16 mb-4 text-muted-foreground/50" />
                  <h3 className="text-xl font-semibold mb-2">
                    Test Your AI Tool
                  </h3>
                  <p className="text-base">
                    Enter a message below to see how your AI will respond based
                    on your instructions.
                  </p>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex items-start gap-3 mb-6 ${
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {message.role === 'assistant' && (
                      <Avatar className="h-10 w-10 bg-primary/10 text-primary flex items-center justify-center">
                        <Bot className="h-6 w-6" />
                      </Avatar>
                    )}
                    <div
                      className={`max-w-[80%] rounded-2xl px-5 py-4 shadow-sm ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted/50 text-foreground'
                      }`}
                    >
                      {message.role === 'user' ? (
                        <p className="whitespace-pre-wrap text-base">
                          {message.content}
                        </p>
                      ) : (
                        <div className="markdown-content">
                          <MarkdownRenderer
                            content={message.displayContent || message.content}
                          />
                          {message.isTyping && (
                            <span className="animate-pulse">▋</span>
                          )}
                        </div>
                      )}
                    </div>
                    {message.role === 'user' && (
                      <Avatar className="h-10 w-10 bg-muted flex items-center justify-center">
                        <User className="h-6 w-6" />
                      </Avatar>
                    )}
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </ScrollArea>

            <div className="flex gap-3">
              <Textarea
                placeholder="Enter a test message..."
                value={previewInput}
                onChange={(e) => setPreviewInput(e.target.value)}
                className="min-h-[60px] resize-none border-2 focus:border-primary/50"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendTestMessage();
                  }
                }}
              />
              <Button
                type="button"
                size="icon"
                className="h-12 w-12 self-end"
                disabled={!previewInput.trim() || isTesting}
                onClick={handleSendTestMessage}
              >
                {isTesting ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>

          <DialogFooter className="sm:justify-start">
            <p className="text-sm text-muted-foreground">
              This is a preview to test your AI tool instructions before saving.
            </p>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
