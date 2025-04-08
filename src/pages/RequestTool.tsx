
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Helmet } from 'react-helmet';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { ClaimToolForm } from '@/components/tools/ClaimToolForm';
import { useNavigate } from 'react-router-dom';

// Form validation schema
const requestToolSchema = z.object({
  name: z.string().min(2, 'Tool name is required').max(100),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  url: z.string().url('Please enter a valid URL'),
  category: z.string().min(1, 'Please select a category'),
  submitter_name: z.string().min(2, 'Your name is required'),
  submitter_email: z
    .string()
    .email('Please enter a valid email')
    .optional()
    .or(z.literal('')),
});

type RequestToolFormValues = z.infer<typeof requestToolSchema>;

const RequestTool = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<
    { id: number; name: string }[] | null
  >(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [duplicateTool, setDuplicateTool] = useState<null | { id: string; name: string }>(null);
  const [showClaimDialog, setShowClaimDialog] = useState(false);
  const [claimSubmitted, setClaimSubmitted] = useState(false);

  const form = useForm<RequestToolFormValues>({
    resolver: zodResolver(requestToolSchema),
    defaultValues: {
      name: '',
      description: '',
      url: '',
      category: '',
      submitter_name: '',
      submitter_email: '',
    },
  });

  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching categories:', error);
        toast('Failed to load categories. Please try again.');
        return;
      }

      setCategories(data);
    };

    fetchCategories();
  }, []);

  // Check if a tool with the same URL or name already exists
  const checkDuplicateTool = async (name: string, url: string) => {
    try {
      // First check by URL (exact match)
      const { data: urlMatch, error: urlError } = await (supabase as any)
        .from('ai_tools')
        .select('id, name')
        .ilike('url', url)
        .limit(1);

      if (urlError) throw urlError;
      
      if (urlMatch && urlMatch.length > 0) {
        return urlMatch[0];
      }
      
      // Then check by name (case insensitive)
      const { data: nameMatch, error: nameError } = await (supabase as any)
        .from('ai_tools')
        .select('id, name')
        .ilike('name', name)
        .limit(1);
        
      if (nameError) throw nameError;
      
      if (nameMatch && nameMatch.length > 0) {
        return nameMatch[0];
      }
      
      return null;
    } catch (error) {
      console.error('Error checking for duplicate tool:', error);
      return null;
    }
  };

  const onSubmit = async (values: RequestToolFormValues) => {
    try {
      setIsSubmitting(true);

      // Check for duplicate tool
      const duplicate = await checkDuplicateTool(values.name, values.url);
      
      if (duplicate) {
        setDuplicateTool(duplicate);
        setIsSubmitting(false);
        return;
      }

      const { error } = await supabase.from('tool_requests').insert({
        name: values.name,
        description: values.description,
        url: values.url,
        category: [values.category], // Store as array to match ai_tools schema
        submitter_name: values.submitter_name,
        submitter_email: values.submitter_email || null,
        status: 'pending',
        request_type: 'new',
      });

      if (error) throw error;

      form.reset();
      setIsSubmitted(true);
      toast.success('Tool request submitted successfully!');
    } catch (err) {
      console.error('Error submitting tool request:', err);
      toast.error('Failed to submit tool request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClaimSuccess = () => {
    setClaimSubmitted(true);
  };

  const handleCloseClaimDialog = () => {
    setShowClaimDialog(false);
    // If claim was submitted, reset the form and redirect to tools
    if (claimSubmitted) {
      form.reset();
      setTimeout(() => {
        navigate('/tools');
      }, 1000);
    }
    setDuplicateTool(null);
  };

  return (
    <>
      <Helmet>
        <title>Request a Tool | AggraFinder</title>
        <meta
          name="description"
          content="Request a new AI tool to be added to our database."
        />
      </Helmet>

      <Header />

      <main className="flex-grow pt-24 px-4">
        <div className="container mx-auto max-w-3xl py-8">
          <h1 className="text-3xl font-bold mb-6 text-center">
            Request an AI Tool
          </h1>

          {isSubmitted ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
              <CheckCircle2 className="mx-auto h-12 w-12 text-green-500 mb-4" />
              <h2 className="text-xl font-semibold mb-2">
                Request Submitted Successfully
              </h2>
              <p className="text-gray-600 mb-4">
                Thank you for your submission! Our team will review your tool
                request and add it to our database if it meets our criteria.
              </p>
              <Button
                onClick={() => {
                  setIsSubmitted(false);
                  form.reset();
                }}
              >
                Submit Another Tool
              </Button>
            </div>
          ) : (
            <div className="bg-background border rounded-lg p-6 shadow-sm">
              <p className="text-muted-foreground mb-6">
                Know of an AI tool that should be in our database? Let us know by
                filling out the form below. Our team will review your submission
                and add it to our collection if it meets our criteria.
              </p>

              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tool Name*</FormLabel>
                        <FormControl>
                          <Input placeholder="E.g., ChatGPT" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description*</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Briefly describe what this tool does and why it's useful..."
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tool URL*</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="https://example.com"
                            type="url"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category*</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories ? (
                              categories.map((category) => (
                                <SelectItem
                                  key={category.id}
                                  value={category.name}
                                >
                                  {category.name}
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="loading" disabled>
                                Loading...
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="border-t pt-6 mt-6">
                    <h2 className="text-lg font-semibold mb-4">Your Details</h2>

                    <FormField
                      control={form.control}
                      name="submitter_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Your Name*</FormLabel>
                          <FormControl>
                            <Input placeholder="John Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="submitter_email"
                      render={({ field }) => (
                        <FormItem className="mt-4">
                          <FormLabel>Your Email (Optional)</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="your.email@example.com"
                              type="email"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      'Submit Tool Request'
                    )}
                  </Button>
                </form>
              </Form>
            </div>
          )}
        </div>
      </main>

      {/* Duplicate Tool Dialog */}
      <Dialog open={!!duplicateTool} onOpenChange={(open) => !open && setDuplicateTool(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Tool Already Exists
            </DialogTitle>
            <DialogDescription>
              This tool is already listed! Want to claim it and manage the details?
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <p className="mb-4">
              A tool with a similar name or URL already exists in our database. 
              You can claim ownership of this tool listing to manage its information and updates.
            </p>
            <div className="p-4 bg-secondary/50 rounded-md">
              <p className="font-medium">{duplicateTool?.name}</p>
            </div>
          </div>

          <DialogFooter className="flex sm:justify-between gap-3 flex-col sm:flex-row">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setDuplicateTool(null)}
            >
              Cancel
            </Button>
            <div className="flex gap-3">
              <Button 
                type="button"
                variant="outline"
                onClick={() => navigate(`/tools/${duplicateTool?.id}`)}
              >
                View Tool
              </Button>
              <Button 
                type="button"
                onClick={() => {
                  setShowClaimDialog(true);
                }}
              >
                Claim Ownership
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Claim Tool Dialog */}
      {duplicateTool && (
        <Dialog open={showClaimDialog} onOpenChange={setShowClaimDialog}>
          <DialogContent className="sm:max-w-lg">
            {claimSubmitted ? (
              <div className="py-6 text-center space-y-4">
                <div className="mx-auto bg-green-100 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-lg font-medium">Claim Request Submitted</h3>
                <p className="text-muted-foreground">
                  Thank you for your request. Our team will review your claim and get back to you via the provided email.
                </p>
                <Button onClick={handleCloseClaimDialog} className="mt-4">
                  Done
                </Button>
              </div>
            ) : (
              <>
                <DialogHeader>
                  <DialogTitle>Claim Tool Ownership</DialogTitle>
                  <DialogDescription>
                    Request ownership of this tool listing to manage its information and updates.
                  </DialogDescription>
                </DialogHeader>
                <ClaimToolForm
                  toolId={duplicateTool.id}
                  toolName={duplicateTool.name}
                  onSuccess={handleClaimSuccess}
                  onCancel={handleCloseClaimDialog}
                />
              </>
            )}
          </DialogContent>
        </Dialog>
      )}

      <Footer />
    </>
  );
};

export default RequestTool;
