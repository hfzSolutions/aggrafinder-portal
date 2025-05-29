import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { FileUpload } from '@/components/ui/file-upload';
import {
  Plus,
  Save,
  Sparkles,
  PlayCircle,
  Loader2,
  Send,
  Bot,
  User,
  Lightbulb,
  Wand2,
  Filter,
  Check,
  Tag,
  Globe,
  Trash2,
  Image,
  X,
  Settings,
  Search,
} from 'lucide-react';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAdmin } from '@/hooks/useSupabaseAdmin';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar } from '@/components/ui/avatar';
import { Anthropic } from '@anthropic-ai/sdk';
import { useAIChatAnalytics } from '@/hooks/useAIChatAnalytics';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { compressImage } from '@/utils/imageCompression';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface QuickToolFormProps {
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
    image_url?: string;
  };
}

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isTyping?: boolean;
  displayContent?: string;
};

export const QuickToolForm = ({
  userId,
  onSuccess,
  editMode = false,
  toolToEdit,
}: QuickToolFormProps) => {
  const {
    submitTool,
    updateTool,
    loading: adminActionLoading,
  } = useSupabaseAdmin();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testInput, setTestInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [typingIndicator, setTypingIndicator] = useState(false);
  const [isGeneratingSuggestion, setIsGeneratingSuggestion] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: editMode && toolToEdit ? toolToEdit.name : '',
    description: editMode && toolToEdit ? toolToEdit.description : '',
    prompt: editMode && toolToEdit ? toolToEdit.prompt : '',
    isPublic: editMode && toolToEdit ? toolToEdit.is_public !== false : true,
    selectedCategories:
      editMode && toolToEdit ? toolToEdit.category : ([] as string[]),
    imageFile: null as File | null,
    imageUrl: editMode && toolToEdit ? toolToEdit.image_url : '',
    userSuggestion: '', // New field for user input suggestions
  });

  const [suggestedTools, setSuggestedTools] = useState<
    Array<{
      name: string;
      description: string;
      prompt: string;
      categories: string[];
    }>
  >([]);
  const [categories, setCategories] = useState<{ id: number; name: string }[]>(
    []
  );
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [searchCategory, setSearchCategory] = useState('');
  const [showCategorySelector, setShowCategorySelector] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const { trackChatEvent } = useAIChatAnalytics();

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

  // Function to generate AI suggestions for quick tools based on selected categories
  const generateToolSuggestions = async () => {
    if (formData.selectedCategories.length === 0) {
      toast.error('Please select at least one category first');
      return;
    }

    setIsGeneratingSuggestion(true);
    try {
      // Create Anthropic client instance
      const anthropic = new Anthropic({
        apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY || '',
        dangerouslyAllowBrowser: true,
      });

      // Prepare the categories for the prompt
      const selectedCategoriesText = formData.selectedCategories.join(', ');

      // Include user suggestion if provided
      const userSuggestionText = formData.userSuggestion.trim()
        ? `The user has provided this additional context or requirement: "${formData.userSuggestion}". Use this information to tailor your suggestions.`
        : '';

      // Call Anthropic API to generate tool suggestions
      const response = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20240620',
        max_tokens: 800,
        temperature: 0.7,
        system: `You are an AI assistant specializing in creating helpful AI tools that generate TEXT RESPONSES ONLY. Generate 3 straightforward and easy-to-understand AI tool ideas that would be valuable to users specifically in these categories: ${selectedCategoriesText}. ${userSuggestionText} For each tool, provide a concise name with space, brief description (max 50 words), short system prompt (max 100 words) that focuses ONLY on text generation (no audio, image, or video generation capabilities), and relevant categories. Make the tools diverse and practical within the specified categories. Be extremely concise and direct. Format your response as a JSON array with objects containing 'name', 'description', 'prompt', and 'categories' fields.`,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Generate 3 straightforward and practical AI tool ideas for these categories: ${selectedCategoriesText}${
                  formData.userSuggestion
                    ? ` with this specific focus: "${formData.userSuggestion}"`
                    : ''
                }. Be concise.`,
              },
            ],
          },
        ],
      });

      // Parse the response to get the suggestions
      try {
        // Extract JSON array from the response
        const content = response.content[0].text.trim();
        const jsonMatch = content.match(/\[\s*\{.*\}\s*\]/s);

        if (jsonMatch) {
          const parsedSuggestions = JSON.parse(jsonMatch[0]);
          if (
            Array.isArray(parsedSuggestions) &&
            parsedSuggestions.length > 0
          ) {
            setSuggestedTools(parsedSuggestions);
            // Show a toast to indicate suggestions are ready
            toast.success(
              'AI suggestions generated! Scroll down to view them.'
            );
            return;
          }
        }

        // Fallback if parsing fails
        throw new Error('Failed to parse suggestions');
      } catch (parseError) {
        console.error('Error parsing suggestions:', parseError);
        toast.error('Failed to generate suggestions. Please try again.');
      }
    } catch (error) {
      console.error('Error generating suggestions:', error);
      toast.error('Failed to generate suggestions. Please try again.');
    } finally {
      setIsGeneratingSuggestion(false);
    }
  };

  // Scroll to suggestions when they are generated
  useEffect(() => {
    if (suggestedTools.length > 0 && suggestionsRef.current) {
      // Add a small delay to ensure the DOM has updated
      setTimeout(() => {
        suggestionsRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }, 100);
    }
  }, [suggestedTools]);

  // Function to apply a suggested tool to the form
  const applySuggestedTool = (tool: {
    name: string;
    description: string;
    prompt: string;
    categories: string[];
  }) => {
    // Apply only valid categories that exist in our database categories list
    const validCategories = tool.categories
      .filter((category) =>
        categories.some(
          (cat) => cat.name.toLowerCase() === category.toLowerCase()
        )
      )
      .map((category) => {
        // Find the exact category name with correct casing from our database
        const matchedCategory = categories.find(
          (cat) => cat.name.toLowerCase() === category.toLowerCase()
        );
        return matchedCategory ? matchedCategory.name : category;
      })
      .slice(0, 3); // Limit to 3 categories

    setFormData({
      name: tool.name,
      description: tool.description,
      prompt: tool.prompt,
      isPublic: true,
      selectedCategories: validCategories,
      imageFile: null,
      imageUrl: '',
      userSuggestion: formData.userSuggestion, // Preserve user suggestion
    });

    // Clear suggestions after applying
    setSuggestedTools([]);

    toast.success('Tool suggestion applied! You can now customize it further.');
  };

  const handleCategoryChange = (category: string) => {
    setFormData((prev) => {
      const currentCategories = [...prev.selectedCategories];
      if (currentCategories.includes(category)) {
        return {
          ...prev,
          selectedCategories: currentCategories.filter(
            (cat) => cat !== category
          ),
        };
      } else {
        if (currentCategories.length < 3) {
          return {
            ...prev,
            selectedCategories: [...currentCategories, category],
          };
        }
        toast.error('You can select up to 3 categories');
        return prev;
      }
    });
  };

  // Filter categories based on search term
  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchCategory.toLowerCase())
  );

  // Toggle category selector visibility
  const toggleCategorySelector = () => {
    setShowCategorySelector(!showCategorySelector);
  };

  const handlePublicToggle = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, isPublic: checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate form
      if (!formData.name.trim()) {
        toast.error('Tool name is required');
        setIsSubmitting(false);
        return;
      }

      if (!formData.description.trim()) {
        toast.error('Tool description is required');
        setIsSubmitting(false);
        return;
      }

      if (formData.selectedCategories.length === 0) {
        toast.error('Please select at least one category');
        setIsSubmitting(false);
        return;
      }

      // Validate prompt
      if (!formData.prompt.trim()) {
        toast.error('AI Prompt is required');
        setIsSubmitting(false);
        return;
      }

      // Prepare tool data in the format expected by useSupabaseAdmin
      const toolData = {
        name: formData.name,
        tagline: '', // Quick tools don't use tagline, but the hook expects it
        description: formData.description,
        url: '', // Quick tools don't have external URLs
        prompt: formData.prompt, // Add prompt field for quick tools
        tool_type: 'quick', // Specify this is a quick tool
        is_public: formData.isPublic,
        usage_count: editMode ? undefined : 0, // Only set for new tools
        image_url: formData.imageFile || formData.imageUrl,
        category: formData.selectedCategories,
        pricing: 'Free', // Quick tools are always free
        featured: false,
        tags: [],
        user_id: userId,
        is_admin_added: false,
      };

      let result;

      if (editMode && toolToEdit) {
        // Update existing quick tool using the hook
        result = await updateTool(toolToEdit.id, toolData);

        if (result.success) {
          toast.success('Quick Tool updated successfully!');
        } else {
          throw new Error(result.error);
        }
      } else {
        // Create new quick tool using the hook
        result = await submitTool(toolData);

        if (result.success) {
          toast.success('Quick Tool created successfully!');
        } else {
          throw new Error(result.error);
        }
      }

      onSuccess();
    } catch (error) {
      console.error(`Error ${editMode ? 'updating' : 'creating'} tool:`, error);
      toast.error(
        `Failed to ${editMode ? 'update' : 'create'} tool. Please try again.`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendTestMessage = async () => {
    if (!testInput.trim() || isTesting) return;

    // Validate prompt first
    if (!formData.prompt.trim()) {
      toast.error('Please enter an AI prompt to test');
      return;
    }

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString() + '-user',
      role: 'user',
      content: testInput,
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsTesting(true);
    setTypingIndicator(true);

    // Track when user sends a message for analytics
    trackChatEvent('test_quick_tool', 'message_sent');

    try {
      // Create Anthropic client instance
      const anthropic = new Anthropic({
        apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY || '',
        dangerouslyAllowBrowser: true,
      });

      // Call Anthropic API directly
      const response = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20240620',
        max_tokens: 500, // Reduced token limit for shorter responses
        temperature: 0.7,
        system:
          formData.prompt +
          "\n\nIMPORTANT: Keep your responses helpful and engaging. Focus on providing valuable assistance based on the tool's purpose. You can ONLY generate text responses - do not attempt to generate images, audio, or video content. Always be direct and straight to the point. Avoid unnecessary explanations, introductions, or verbose language. Get to the answer immediately without wasting time.",
        messages: [
          ...messages
            .filter((msg) => msg.role === 'user' || msg.role === 'assistant')
            .map((msg) => ({
              role: msg.role as 'user' | 'assistant',
              content: [
                {
                  type: 'text',
                  text: msg.content,
                },
              ],
            })),
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: testInput,
              },
            ],
          },
        ],
      });

      // Truncate long responses to keep them concise
      const truncateResponse = (text: string, maxLength = 500) => {
        if (text.length <= maxLength) return text;

        // Find a good breaking point (end of sentence) near the maxLength
        const breakPoint = text.substring(0, maxLength).lastIndexOf('.');
        if (breakPoint > maxLength * 0.7) {
          // If we found a sentence break in the latter part
          return text.substring(0, breakPoint + 1);
        }

        // Fallback to word boundary if no good sentence break
        return text.substring(0, maxLength) + '...';
      };

      // Get the truncated response
      const truncatedContent = truncateResponse(response.content[0].text);

      // Create the assistant message with typing animation
      const assistantMessage: Message = {
        id: Date.now().toString() + '-assistant',
        role: 'assistant',
        content: truncatedContent,
        isTyping: true,
        displayContent: '',
      };

      // Hide typing indicator and add the message with empty content initially
      setTypingIndicator(false);
      setMessages((prev) => [...prev, assistantMessage]);

      // Start the typing animation
      animateTyping(assistantMessage.id, assistantMessage.content);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to get a response. Please try again.');
      setTypingIndicator(false);
    } finally {
      setIsTesting(false);
      setTestInput('');
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendTestMessage();
    }
  };

  const handleClearChat = () => {
    setMessages([]);
  };

  // Check if form is ready to test (all required fields filled)
  const isFormReadyToTest =
    formData.name.trim() !== '' &&
    formData.description.trim() !== '' &&
    formData.prompt.trim() !== '' &&
    formData.selectedCategories.length > 0;

  // State for active tab
  const [activeTab, setActiveTab] = useState<'configure' | 'test'>('configure');

  // Function to switch to test tab if form is ready
  const handleSwitchToTest = () => {
    if (isFormReadyToTest) {
      setActiveTab('test');
      // Track when test tab is opened
      trackChatEvent('test_quick_tool', 'open');
    } else {
      toast.error('Please complete all required fields before testing');
    }
  };

  // Track when component unmounts or tab changes
  useEffect(() => {
    return () => {
      if (activeTab === 'test' && messages.length > 0) {
        // Track when test chat is closed with message count
        trackChatEvent('test_quick_tool', 'close', messages.length);
      }
    };
  }, [activeTab, messages.length, trackChatEvent]);

  // Handle delete tool
  const handleDeleteTool = async () => {
    if (!editMode || !toolToEdit) return;

    try {
      setIsSubmitting(true);
      const { error } = await supabase
        .from('ai_tools')
        .delete()
        .eq('id', toolToEdit.id);

      if (error) throw error;

      toast.success('Quick Tool deleted successfully!');
      onSuccess();
    } catch (error) {
      console.error('Error deleting tool:', error);
      toast.error('Failed to delete tool. Please try again.');
    } finally {
      setIsSubmitting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  return (
    <div className="flex-1 overflow-auto">
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Quick Tool</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>
              Are you sure you want to delete this quick tool? This action
              cannot be undone.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteTool}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Main Content */}
      {/* <div className="mb-4 bg-primary/5 p-4 rounded-lg border border-primary/10">
        <h2 className="text-lg font-medium flex items-center gap-2 mb-2">
          <Wand2 className="h-5 w-5 text-primary" />
          {editMode ? 'Edit Your AI Tool' : 'Create Your Own AI Tool'}
        </h2>
        <p className="text-sm text-muted-foreground">
          Create a custom AI tool that generates text responses to help with
          specific tasks. Fill in the details below, then test your tool before
          saving.
        </p>
      </div> */}

      <form id="quickToolForm" onSubmit={handleSubmit}>
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as 'configure' | 'test')}
          className="w-full"
        >
          <TabsList className="w-full mb-4">
            <TabsTrigger value="configure" className="flex-1">
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                1. Configure
              </div>
            </TabsTrigger>
            <TabsTrigger
              value="test"
              disabled={!isFormReadyToTest}
              className="flex-1"
              title={
                !isFormReadyToTest
                  ? 'Complete all required fields first'
                  : 'Test your AI tool'
              }
            >
              <div className="flex items-center gap-2">
                <PlayCircle className="h-4 w-4" />
                2. Test
              </div>
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-visible">
            <TabsContent value="configure">
              <div className="flex-1 overflow-auto">
                <div className="space-y-6">
                  {/* Categories Section - First for AI suggestions */}
                  <div className="border rounded-lg p-5 bg-card shadow-sm">
                    <div className="flex items-center mb-4">
                      <Tag className="h-5 w-5 mr-2 text-primary" />
                      <h3 className="text-base font-medium">Categories</h3>
                      <Badge variant="outline" className="ml-2 font-normal">
                        Select 1-3 categories
                      </Badge>
                    </div>

                    {/* Category Selector - Using dropdown similar to pricing in ToolSubmissionForm */}
                    <div className="mb-4">
                      {/* Selected Categories Display */}
                      <div className="flex flex-wrap gap-2 min-h-[40px] mb-3">
                        {formData.selectedCategories.length > 0 ? (
                          formData.selectedCategories.map((category) => (
                            <Badge
                              key={category}
                              variant="secondary"
                              className="px-3 py-1.5 flex items-center gap-1"
                            >
                              {category}
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-4 w-4 p-0 ml-1 hover:bg-transparent"
                                onClick={() => handleCategoryChange(category)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </Badge>
                          ))
                        ) : (
                          <div className="flex items-center justify-center w-full p-3 border border-dashed rounded-md bg-muted/5">
                            <p className="text-sm text-muted-foreground">
                              No categories selected
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Category Dropdown - Similar to pricing dropdown in ToolSubmissionForm */}
                      <Select
                        onValueChange={(value) => handleCategoryChange(value)}
                        disabled={formData.selectedCategories.length >= 3}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categoriesLoading ? (
                            <div className="flex justify-center py-4">
                              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                            </div>
                          ) : (
                            categories.map((category) => (
                              <SelectItem
                                key={category.id}
                                value={category.name}
                                disabled={formData.selectedCategories.includes(
                                  category.name
                                )}
                              >
                                {category.name}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground mt-2">
                        {formData.selectedCategories.length}/3 categories
                        selected
                      </p>
                    </div>

                    {/* AI Suggestion Button */}
                    {formData.selectedCategories.length > 0 && (
                      <div className="mt-4 pt-4">
                        {/* User Suggestion Input */}
                        <div className="mb-4">
                          <Label
                            htmlFor="userSuggestion"
                            className="mb-2 block text-sm font-medium"
                          >
                            Additional Context (Optional)
                          </Label>
                          <Textarea
                            id="userSuggestion"
                            name="userSuggestion"
                            placeholder="Add specific requirements or context to help AI generate more targeted tool ideas..."
                            value={formData.userSuggestion}
                            onChange={handleInputChange}
                            className="resize-none min-h-[80px]"
                          />
                        </div>

                        <Button
                          type="button"
                          variant="default"
                          size="default"
                          className="justify-center"
                          onClick={generateToolSuggestions}
                          disabled={isGeneratingSuggestion}
                        >
                          {isGeneratingSuggestion ? (
                            <>
                              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                              Generating AI suggestions...
                            </>
                          ) : (
                            <>
                              <Sparkles className="mr-2 h-5 w-5 text-primary-foreground" />
                              Get AI Tool Suggestions
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* AI Generated Tool Suggestions */}
                  {suggestedTools.length > 0 && (
                    <div
                      ref={suggestionsRef}
                      className="border rounded-lg p-5 bg-primary/5 shadow-md animate-in fade-in duration-500"
                    >
                      <div className="flex items-center mb-4">
                        <Lightbulb className="h-5 w-5 mr-2 text-primary" />
                        <h3 className="text-base font-medium">
                          AI Suggested Tools
                        </h3>
                      </div>

                      <p className="text-sm mb-4">
                        Choose one of these AI-generated tool ideas as a
                        starting point:
                      </p>

                      <div className="space-y-3">
                        {suggestedTools.map((tool, index) => (
                          <div
                            key={index}
                            className="border rounded-md p-4 bg-card hover:border-primary/50 transition-colors hover:shadow-md"
                          >
                            <div className="flex justify-between items-start mb-3">
                              <h4 className="font-medium">{tool.name}</h4>
                              <Button
                                type="button"
                                variant="default"
                                size="sm"
                                onClick={() => applySuggestedTool(tool)}
                              >
                                <Check className="mr-1 h-4 w-4" />
                                Use This
                              </Button>
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">
                              {tool.description}
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {tool.categories
                                .slice(0, 3)
                                .map((category, catIndex) => (
                                  <Badge
                                    key={catIndex}
                                    variant="secondary"
                                    className="text-xs px-2 py-0.5"
                                  >
                                    {category}
                                  </Badge>
                                ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Basic Tool Information */}
                  <div className="border rounded-lg p-5 bg-card shadow-sm">
                    <div className="flex items-center mb-4">
                      <Bot className="h-5 w-5 mr-2 text-primary" />
                      <h3 className="text-base font-medium">
                        Basic Information
                      </h3>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label
                          htmlFor="name"
                          className="text-sm font-medium block mb-1.5"
                        >
                          Tool Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="name"
                          name="name"
                          placeholder="Enter a name for your tool"
                          value={formData.name}
                          onChange={handleInputChange}
                          className="w-full"
                          required
                        />
                      </div>

                      <div>
                        <Label
                          htmlFor="description"
                          className="text-sm font-medium block mb-1.5"
                        >
                          Description <span className="text-red-500">*</span>
                        </Label>
                        <Textarea
                          id="description"
                          name="description"
                          placeholder="Describe what your tool does and how it helps users"
                          value={formData.description}
                          onChange={handleInputChange}
                          className="min-h-[80px]"
                          required
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Keep it concise and clear about what your tool does.
                        </p>
                      </div>

                      <div>
                        <Label
                          htmlFor="image"
                          className="text-sm font-medium block mb-1.5"
                        >
                          Tool Logo (Optional)
                        </Label>
                        <FileUpload
                          onFileChange={(file) => {
                            setFormData((prev) => ({
                              ...prev,
                              imageFile: file,
                              imageUrl: file
                                ? URL.createObjectURL(file)
                                : prev.imageUrl,
                            }));
                          }}
                          value={
                            typeof formData.imageUrl === 'string'
                              ? formData.imageUrl
                              : undefined
                          }
                          accept="image/*"
                          maxSize={5}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Upload a logo or icon (recommended size: 512x512px)
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* AI Prompt Section */}
                  <div className="border rounded-lg p-5 bg-card shadow-sm">
                    <div className="flex items-center mb-4">
                      <Wand2 className="h-5 w-5 mr-2 text-primary" />
                      <h3 className="text-base font-medium">AI Instructions</h3>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label
                          htmlFor="prompt"
                          className="text-sm font-medium block mb-1.5"
                        >
                          AI Prompt <span className="text-red-500">*</span>
                        </Label>
                        <div className="relative">
                          <Textarea
                            id="prompt"
                            name="prompt"
                            placeholder="Enter instructions for the AI (e.g., 'You are a creative title generator that creates engaging titles for blog posts...')"
                            value={formData.prompt}
                            onChange={handleInputChange}
                            className="min-h-[150px] resize-y"
                            required
                          />
                        </div>
                        <div className="mt-2 space-y-2">
                          <p className="text-xs text-muted-foreground flex items-start gap-2">
                            <span className="text-primary">•</span>
                            <span>
                              Tell the AI exactly what you want it to do. Be
                              specific about the tone, style, and format of
                              responses.
                            </span>
                          </p>
                          <p className="text-xs text-muted-foreground flex items-start gap-2">
                            <span className="text-primary">•</span>
                            <span>
                              This tool only supports text responses. Do not
                              include instructions for generating images, audio,
                              or video.
                            </span>
                          </p>
                          <p className="text-xs text-muted-foreground flex items-start gap-2">
                            <span className="text-primary">•</span>
                            <span>
                              Start with "You are a..." to define the AI's role
                              and expertise.
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Visibility Settings */}
                  <div className="border rounded-lg p-5 bg-card shadow-sm">
                    <div className="flex items-center mb-4">
                      <Globe className="h-5 w-5 mr-2 text-primary" />
                      <h3 className="text-base font-medium">
                        Visibility Settings
                      </h3>
                    </div>

                    <div className="flex items-center space-x-3 p-3 bg-muted/10 rounded-md">
                      <Switch
                        id="public"
                        checked={formData.isPublic}
                        onCheckedChange={handlePublicToggle}
                      />
                      <div>
                        <Label
                          htmlFor="public"
                          className="font-medium block mb-0.5"
                        >
                          Make this tool public
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Public tools will be visible to all users and can be
                          used by anyone
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="flex justify-between items-center pt-4 pb-3">
                    <div className="flex gap-3 ml-auto">
                      <Button
                        onClick={handleSwitchToTest}
                        disabled={!isFormReadyToTest}
                        type="button"
                        variant="outline"
                      >
                        <PlayCircle className="mr-2 h-4 w-4" />
                        Test Before Saving
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="test">
              <div className="flex-1 overflow-hidden flex flex-col">
                <div className="text-end pb-2">
                  {activeTab === 'test' && (
                    <Button
                      variant="outline"
                      onClick={handleClearChat}
                      disabled={messages.length === 0}
                      size="sm"
                      className="h-8"
                    >
                      Clear Chat
                    </Button>
                  )}
                </div>

                <ScrollArea className="flex-1 p-5 overflow-y-auto max-h-[calc(85vh-130px)] border rounded-md bg-card/50 shadow-inner">
                  {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6 text-muted-foreground">
                      <Bot className="h-12 w-12 mb-4 text-muted-foreground/50" />
                      <h3 className="text-lg font-medium mb-2">
                        Test Your AI Prompt
                      </h3>
                      <p className="text-sm">
                        Enter a message below to see how your AI would respond
                        based on your prompt instructions. This tool only
                        supports text responses.
                      </p>
                    </div>
                  ) : (
                    messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex items-start gap-3 ${
                          message.role === 'user'
                            ? 'justify-end'
                            : 'justify-start'
                        }`}
                      >
                        {message.role === 'assistant' && (
                          <Avatar className="h-8 w-8 bg-primary/10 text-primary flex items-center justify-center">
                            <Bot className="h-5 w-5" />
                          </Avatar>
                        )}
                        <div
                          className={`max-w-[80%] rounded-xl px-4 py-3 shadow-sm ${
                            message.role === 'user'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted/50 text-foreground'
                          }`}
                        >
                          <p className="whitespace-pre-wrap">
                            {message.role === 'user'
                              ? message.content
                              : message.displayContent || message.content}
                            {message.isTyping && (
                              <span className="animate-pulse">▋</span>
                            )}
                          </p>
                        </div>
                        {message.role === 'user' && (
                          <Avatar className="h-8 w-8 bg-muted flex items-center justify-center">
                            <User className="h-5 w-5" />
                          </Avatar>
                        )}
                      </div>
                    ))
                  )}
                  {typingIndicator && (
                    <div className="flex items-start gap-3 justify-start">
                      <Avatar className="h-8 w-8 bg-primary/10 text-primary flex items-center justify-center">
                        <Bot className="h-5 w-5" />
                      </Avatar>
                      <div className="max-w-[80%] rounded-xl px-4 py-3 shadow-sm bg-muted/50 text-foreground">
                        <div className="flex space-x-2 items-center h-5">
                          <div className="w-2 h-2 rounded-full bg-primary/60 animate-pulse"></div>
                          <div className="w-2 h-2 rounded-full bg-primary/60 animate-pulse delay-150"></div>
                          <div className="w-2 h-2 rounded-full bg-primary/60 animate-pulse delay-300"></div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </ScrollArea>

                <div className="relative mt-4 pb-4">
                  <Input
                    ref={inputRef}
                    placeholder="Type a message to test your AI tool..."
                    value={testInput}
                    onChange={(e) => setTestInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isTesting}
                    className="pr-12"
                  />
                  <Button
                    size="icon"
                    className="absolute right-1 top-1 h-8 w-8"
                    onClick={handleSendTestMessage}
                    disabled={isTesting || !testInput.trim()}
                  >
                    {isTesting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </form>

      <div className="pt-4 border-t bg-background/95 backdrop-blur-sm sticky bottom-0 z-10">
        <div className="flex justify-between items-center">
          <div>
            {editMode && (
              <Button
                type="button"
                variant="destructive"
                onClick={() => setIsDeleteDialogOpen(true)}
                disabled={isSubmitting}
                className="mr-2"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onSuccess}
              disabled={isSubmitting}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              form="quickToolForm"
              disabled={isSubmitting || adminActionLoading}
            >
              {isSubmitting || adminActionLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {editMode ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {editMode ? 'Update Tool' : 'Create Tool'}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
