import { useState } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseCategories } from '@/hooks/useSupabaseCategories';
import { CompareToolsBar } from '@/components/tools/CompareToolsBar';
import { pricingOptions } from '@/data/toolsData';

const RequestTool = () => {
  const navigate = useNavigate();
  const { categories, loading: categoriesLoading } = useSupabaseCategories();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requestType, setRequestType] = useState<'new' | 'update'>('new');
  const [selectedTool, setSelectedTool] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    url: '',
    category: [] as string[],
    pricing: 'Free',
    submitter_name: '',
    submitter_email: '',
    request_type: 'new' as 'new' | 'update',
    tool_id: null as string | null,
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const searchTools = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const { data, error } = await supabase
        .from('ai_tools')
        .select('id, name, description, url, category, pricing')
        .ilike('name', `%${query}%`)
        .limit(5);

      if (error) throw error;
      setSearchResults(data || []);
    } catch (error) {
      console.error('Error searching tools:', error);
      toast.error('Failed to search tools');
    } finally {
      setIsSearching(false);
    }
  };

  const handleToolSelect = (tool: any) => {
    setSelectedTool(tool);
    setFormData({
      ...formData,
      name: tool.name,
      description: tool.description,
      url: tool.url,
      category: tool.category,
      pricing: tool.pricing,
      request_type: 'update',
      tool_id: tool.id,
    });
    setSearchResults([]);
    setSearchQuery('');
  };

  const handleRequestTypeChange = (type: 'new' | 'update') => {
    setRequestType(type);
    setFormData({
      name: '',
      description: '',
      url: '',
      category: [],
      pricing: 'Free',
      submitter_name: '',
      submitter_email: '',
      request_type: type,
      tool_id: null,
    });
    setSelectedTool(null);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleCategoryChange = (value: string) => {
    // If All is selected, don't add it to the categories array
    if (value === 'All') return;

    // Check if category is already selected
    if (formData.category.includes(value)) {
      setFormData({
        ...formData,
        category: formData.category.filter((cat) => cat !== value),
      });
    } else {
      setFormData({
        ...formData,
        category: [...formData.category, value],
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Simple validation
    // Update the validation check in handleSubmit
    if (
      !formData.name ||
      !formData.description ||
      !formData.url ||
      formData.category.length === 0 ||
      (requestType === 'update' && !selectedTool)
    ) {
      toast({
        title: 'Missing information',
        description:
          requestType === 'update' && !selectedTool
            ? 'Please select a tool to update.'
            : 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    if (
      !formData.url.startsWith('http://') &&
      !formData.url.startsWith('https://')
    ) {
      setFormData({ ...formData, url: `https://${formData.url}` });
    }

    try {
      setIsSubmitting(true);

      const { error } = await supabase.from('tool_requests').insert([formData]);

      if (error) throw error;

      toast({
        title: 'Tool request submitted!',
        description: "Thanks for your submission. We'll review it soon.",
      });

      // Redirect to tools page
      navigate('/tools');
    } catch (error) {
      console.error('Error submitting tool request:', error);
      toast({
        title: 'Submission failed',
        description:
          error instanceof Error
            ? error.message
            : 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Request a New AI Tool | AI Aggregator</title>
        <meta
          name="description"
          content="Submit a request for a new AI tool to be added to our directory."
        />
      </Helmet>

      <div className="min-h-screen flex flex-col">
        <Header />

        <main className="flex-grow pt-20 pb-20">
          <div className="container px-4 md:px-8 py-8 mx-auto">
            <div className="max-w-3xl mx-auto">
              <h1 className="text-3xl font-bold mb-6 text-center">
                Request or Update an AI Tool
              </h1>
              <p className="text-muted-foreground mb-8 text-center">
                Submit a new AI tool or request updates to an existing one.
              </p>

              <div className="flex justify-center gap-4 mb-8">
                <Button
                  type="button"
                  variant={requestType === 'new' ? 'default' : 'outline'}
                  onClick={() => handleRequestTypeChange('new')}
                >
                  Add New Tool
                </Button>
                <Button
                  type="button"
                  variant={requestType === 'update' ? 'default' : 'outline'}
                  onClick={() => handleRequestTypeChange('update')}
                >
                  Update Existing Tool
                </Button>
              </div>

              {requestType === 'update' && (
                <Card className="mb-8">
                  <CardHeader>
                    <CardTitle>Search for a Tool</CardTitle>
                    <CardDescription>
                      Find the tool you'd like to update.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="toolSearch">
                          Search Tool <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="toolSearch"
                          value={searchQuery}
                          onChange={(e) => {
                            setSearchQuery(e.target.value);
                            searchTools(e.target.value);
                          }}
                          placeholder="Type to search for a tool..."
                        />
                      </div>

                      {isSearching ? (
                        <p className="text-sm text-muted-foreground">
                          Searching...
                        </p>
                      ) : searchResults.length > 0 ? (
                        <div className="space-y-2">
                          {searchResults.map((tool) => (
                            <Button
                              key={tool.id}
                              type="button"
                              variant="outline"
                              className="w-full justify-start"
                              onClick={() => handleToolSelect(tool)}
                            >
                              <div className="text-left">
                                <div className="font-medium">{tool.name}</div>
                                <div className="text-sm text-muted-foreground truncate">
                                  {tool.description}
                                </div>
                              </div>
                            </Button>
                          ))}
                        </div>
                      ) : (
                        searchQuery && (
                          <p className="text-sm text-muted-foreground">
                            No tools found matching your search.
                          </p>
                        )
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle>Tool Information</CardTitle>
                  <CardDescription>
                    Please provide details about the AI tool you're submitting.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="name">
                          Tool Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="e.g., ChatGPT"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="description">
                          Description <span className="text-red-500">*</span>
                        </Label>
                        <Textarea
                          id="description"
                          name="description"
                          value={formData.description}
                          onChange={handleInputChange}
                          placeholder="Brief description of what the tool does..."
                          rows={4}
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="url">
                          Website URL <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="url"
                          name="url"
                          value={formData.url}
                          onChange={handleInputChange}
                          placeholder="e.g., https://chat.openai.com"
                          required
                        />
                      </div>

                      <div>
                        <Label>
                          Categories <span className="text-red-500">*</span>
                        </Label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {categoriesLoading ? (
                            <p className="text-sm text-muted-foreground">
                              Loading categories...
                            </p>
                          ) : (
                            categories.map(
                              (category) =>
                                category !== 'All' && (
                                  <button
                                    key={category}
                                    type="button"
                                    onClick={() =>
                                      handleCategoryChange(category)
                                    }
                                    className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                                      formData.category.includes(category)
                                        ? 'bg-primary text-primary-foreground border-primary'
                                        : 'bg-background text-foreground border-input hover:bg-accent hover:text-accent-foreground'
                                    }`}
                                  >
                                    {category}
                                  </button>
                                )
                            )
                          )}
                        </div>
                        {formData.category.length > 0 && (
                          <p className="text-sm text-muted-foreground mt-2">
                            Selected: {formData.category.join(', ')}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="pricing">Pricing Model</Label>
                        <Select
                          value={formData.pricing}
                          onValueChange={(value) =>
                            handleSelectChange('pricing', value)
                          }
                        >
                          <SelectTrigger id="pricing">
                            <SelectValue placeholder="Select pricing model" />
                          </SelectTrigger>
                          <SelectContent>
                            {pricingOptions
                              .filter((option) => option !== 'All')
                              .map((option) => (
                                <SelectItem key={option} value={option}>
                                  {option}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="border-t pt-6">
                      <CardTitle className="text-lg mb-4">
                        About You (Optional)
                      </CardTitle>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="submitter_name">Your Name</Label>
                          <Input
                            id="submitter_name"
                            name="submitter_name"
                            value={formData.submitter_name}
                            onChange={handleInputChange}
                            placeholder="Your name"
                          />
                        </div>

                        <div>
                          <Label htmlFor="submitter_email">Your Email</Label>
                          <Input
                            id="submitter_email"
                            name="submitter_email"
                            type="email"
                            value={formData.submitter_email}
                            onChange={handleInputChange}
                            placeholder="Your email"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            We'll notify you when your submission is approved.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => navigate(-1)}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={
                          isSubmitting ||
                          (requestType === 'update' && !selectedTool)
                        }
                      >
                        {isSubmitting ? 'Submitting...' : 'Submit Request'}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>

        <CompareToolsBar />
        <Footer />
      </div>
    </>
  );
};

export default RequestTool;
