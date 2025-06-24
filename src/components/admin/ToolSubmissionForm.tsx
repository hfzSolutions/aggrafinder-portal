import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, AlertTriangle, Youtube, Globe } from 'lucide-react';
import { FileUpload } from '@/components/ui/file-upload';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useSupabaseAdmin } from '@/hooks/useSupabaseAdmin';
import { toast } from 'sonner';
import { AITool } from '@/types/tools';
import { supabase } from '@/integrations/supabase/client';
import { compressImage } from '@/utils/imageCompression';
import { detectUserCountryWithFallback } from '@/utils/countryDetection';

const formSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),
  tagline: z
    .string()
    .max(100, 'Tagline must be less than 100 characters')
    .optional(),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(500, 'Description must be less than 500 characters'),
  url: z.string().url('Please enter a valid URL').min(5, 'URL is required'),
  youtubeUrl: z
    .string()
    .url('Please enter a valid YouTube URL')
    .startsWith('https://www.youtube.com/', 'Must be a valid YouTube URL')
    .or(
      z.string().startsWith('https://youtu.be/', 'Must be a valid YouTube URL')
    )
    .or(z.string().length(0))
    .optional(),
  imageUrl: z.union([
    z
      .string()
      .url('Please enter a valid image URL')
      .min(5, 'Image URL is required'),
    z.instanceof(File, { message: 'Please upload an image file' }),
  ]),
  category: z.array(z.string()).min(1, 'Please select at least one category'),
  pricing: z.enum(['Free', 'Freemium', 'Paid', 'Free Trial']),
  featured: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
  isPublic: z.boolean().default(true),
});

type FormValues = z.infer<typeof formSchema>;

interface ToolSubmissionFormProps {
  onSuccess: () => void;
  editMode?: boolean;
  toolToEdit?: AITool;
  userId?: string;
  categories?: { id: number; name: string }[];
  isAdmin?: boolean;
}

export function ToolSubmissionForm({
  onSuccess,
  editMode = false,
  toolToEdit,
  userId,
  categories: propCategories,
  isAdmin = false,
}: ToolSubmissionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    toolToEdit?.category || []
  );
  const [tagsInput, setTagsInput] = useState('');
  const [categories, setCategories] = useState<{ id: number; name: string }[]>(
    propCategories || []
  );
  const [duplicateTool, setDuplicateTool] = useState<null | {
    id: string;
    name: string;
  }>(null);
  const [detectedCountry, setDetectedCountry] = useState<string>('Global'); // Add country state
  const {
    submitTool,
    updateTool,
    loading: adminActionLoading,
  } = useSupabaseAdmin();

  useEffect(() => {
    if (propCategories && propCategories.length > 0) {
      setCategories(propCategories);
    } else {
      const fetchCategories = async () => {
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .order('name', { ascending: true });

        if (error) {
          console.error('Error fetching categories:', error);
          return;
        }

        setCategories(data || []);
      };

      fetchCategories();
    }
  }, [propCategories]);

  // Effect to detect user's country automatically when component mounts
  useEffect(() => {
    // Only detect country for new tools, not when editing
    if (!editMode) {
      const detectCountry = async () => {
        try {
          const country = await detectUserCountryWithFallback();
          setDetectedCountry(country);
        } catch (error) {
          console.error('Failed to detect country:', error);
          setDetectedCountry('Global');
        }
      };

      detectCountry();
    } else if (toolToEdit?.country) {
      // If editing and tool has a country, use that
      setDetectedCountry(toolToEdit.country);
    }
  }, [editMode, toolToEdit]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: editMode && toolToEdit ? toolToEdit.name : '',
      tagline: editMode && toolToEdit ? toolToEdit.tagline : '',
      description: editMode && toolToEdit ? toolToEdit.description : '',
      url: editMode && toolToEdit ? toolToEdit.url : '',
      youtubeUrl: editMode && toolToEdit ? toolToEdit.youtubeUrl || '' : '',
      imageUrl: editMode && toolToEdit ? toolToEdit.imageUrl : '',
      category: editMode && toolToEdit ? toolToEdit.category : [],
      pricing: editMode && toolToEdit ? toolToEdit.pricing : 'Free',
      featured: editMode && toolToEdit ? toolToEdit.featured : false,
      tags: editMode && toolToEdit ? toolToEdit.tags : [],
      isPublic: editMode && toolToEdit ? toolToEdit.is_public !== false : true,
    },
  });

  useEffect(() => {
    if (editMode && toolToEdit) {
      setSelectedCategories(toolToEdit.category);
    }
  }, [editMode, toolToEdit]);

  useEffect(() => {
    form.setValue('category', selectedCategories);
  }, [selectedCategories, form]);

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const handlePublicToggle = (checked: boolean) => {
    form.setValue('isPublic', checked);
  };

  const handleAddTag = () => {
    if (!tagsInput.trim()) return;

    const currentTags = form.getValues('tags');
    const newTag = tagsInput.trim();

    if (!currentTags.includes(newTag)) {
      form.setValue('tags', [...currentTags, newTag]);
    }

    setTagsInput('');
  };

  const handleRemoveTag = (tag: string) => {
    const currentTags = form.getValues('tags');
    form.setValue(
      'tags',
      currentTags.filter((t) => t !== tag)
    );
  };

  const checkDuplicateTool = async (name: string, url: string) => {
    try {
      const { data: urlMatch, error: urlError } = await (supabase as any)
        .from('ai_tools')
        .select('id, name')
        .ilike('url', url)
        .limit(1);

      if (urlError) throw urlError;

      if (urlMatch && urlMatch.length > 0) {
        return urlMatch[0];
      }

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

  const onSubmit = async (values: FormValues) => {
    try {
      setIsSubmitting(true);

      if (!editMode) {
        const duplicate = await checkDuplicateTool(values.name, values.url);

        if (duplicate) {
          setDuplicateTool(duplicate);
          setIsSubmitting(false);
          return;
        }
      }

      let result;

      const toolData = {
        name: values.name,
        tagline: values.tagline,
        description: values.description,
        url: values.url,
        youtube_url: values.youtubeUrl,
        image_url: values.imageUrl,
        category: values.category,
        pricing: values.pricing,
        featured: values.featured,
        tags: values.tags,
        country: detectedCountry, // Add automatically detected country
        user_id: userId,
        is_admin_added: false,
        tool_type: 'external',
        is_public: values.isPublic,
      };

      if (editMode && toolToEdit) {
        // Use updateTool from useSupabaseAdmin which already handles image deletion
        result = await updateTool(toolToEdit.id, toolData);
        if (result.success) {
          toast.success('Tool updated successfully!');
        }
      } else {
        result = await submitTool(toolData);
        if (result.success) {
          toast.success('Tool submitted successfully!');
          form.reset();
          setSelectedCategories([]);
        }
      }

      if (!result.success) throw new Error(result.error);

      onSuccess();
    } catch (error: any) {
      console.error(
        `Error ${editMode ? 'updating' : 'submitting'} tool:`,
        error
      );
      toast.error(
        error.message || `Failed to ${editMode ? 'update' : 'submit'} tool`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tool Name</FormLabel>
                <FormControl>
                  <Input placeholder="AI Tool Name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tagline"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tagline</FormLabel>
                <FormControl>
                  <Input
                    placeholder="A short, catchy description of your tool"
                    {...field}
                  />
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
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Describe what this AI tool does..."
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
                <FormLabel>Tool URL</FormLabel>
                <FormControl>
                  <Input placeholder="https://example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="youtubeUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>YouTube Demo URL (Optional)</FormLabel>
                <FormControl>
                  <div className="flex items-center space-x-2">
                    <Youtube className="h-5 w-5 text-red-600" />
                    <Input
                      placeholder="https://www.youtube.com/watch?v=..."
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormDescription>
                  Add a YouTube video that demonstrates your tool in action
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="imageUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tool Image</FormLabel>
                <FormControl>
                  <FileUpload
                    onFileChange={(file) => {
                      if (file) {
                        form.setValue('imageUrl', file);
                      } else {
                        form.setValue('imageUrl', '');
                      }
                    }}
                    value={
                      typeof field.value === 'string' ? field.value : undefined
                    }
                    accept="image/*"
                    maxSize={5}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="category"
            render={() => (
              <FormItem>
                <FormLabel>Categories</FormLabel>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {categories && categories.length > 0 ? (
                    categories.map((category) => (
                      <div
                        key={category.id}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={`category-${category.id}`}
                          checked={selectedCategories.includes(category.name)}
                          onCheckedChange={() =>
                            handleCategoryToggle(category.name)
                          }
                        />
                        <label
                          htmlFor={`category-${category.id}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {category.name}
                        </label>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Loading categories...
                    </p>
                  )}
                </div>
                {form.formState.errors.category && (
                  <p className="text-sm font-medium text-destructive mt-2">
                    {form.formState.errors.category.message}
                  </p>
                )}
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="pricing"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pricing</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select pricing model" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Free">Free</SelectItem>
                    <SelectItem value="Freemium">Freemium</SelectItem>
                    <SelectItem value="Paid">Paid</SelectItem>
                    <SelectItem value="Free Trial">Free Trial</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {isAdmin && (
            <FormField
              control={form.control}
              name="featured"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Featured Tool</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Featured tools will be highlighted on the homepage
                    </p>
                  </div>
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="tags"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tags</FormLabel>
                <div className="flex space-x-2">
                  <Input
                    placeholder="Add a tag"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    className="flex-1"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    onClick={handleAddTag}
                    variant="outline"
                  >
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {field.value.map((tag) => (
                    <div
                      key={tag}
                      className="flex items-center bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-sm"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-2 text-secondary-foreground/70 hover:text-secondary-foreground"
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Visibility Settings */}
          <div className="border rounded-lg p-5 bg-card shadow-sm">
            <div className="flex items-center mb-4">
              <Globe className="h-5 w-5 mr-2 text-primary" />
              <h3 className="text-base font-medium">Visibility Settings</h3>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-muted/10 rounded-md">
              <Switch
                id="public"
                checked={form.watch('isPublic')}
                onCheckedChange={handlePublicToggle}
              />
              <div>
                <Label htmlFor="public" className="font-medium block mb-0.5">
                  Make this tool public
                </Label>
                <p className="text-sm text-muted-foreground">
                  Public tools will be visible to all users
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={isSubmitting || adminActionLoading}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {editMode ? 'Updating...' : 'Submitting...'}
                </>
              ) : editMode ? (
                'Update Tool'
              ) : (
                'Submit Tool'
              )}
            </Button>
          </div>
        </form>
      </Form>

      <Dialog
        open={!!duplicateTool}
        onOpenChange={(open) => !open && setDuplicateTool(null)}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Tool Already Exists
            </DialogTitle>
            <DialogDescription>
              This tool is already listed in our database.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <p className="mb-4">
              A tool with a similar name or URL already exists in our database.
              You may want to view the existing tool or modify your submission.
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
              Go Back
            </Button>
            <Button
              type="button"
              onClick={() => {
                window.open(`/tools/${duplicateTool?.id}`, '_blank');
              }}
            >
              View Existing Tool
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
