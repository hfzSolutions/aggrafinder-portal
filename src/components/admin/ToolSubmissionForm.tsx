import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { FileUpload } from '@/components/ui/file-upload';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useSupabaseAdmin } from '@/hooks/useSupabaseAdmin';
import { toast } from 'sonner';

const formSchema = z.object({
  name: z
    .string()
    .min(3, 'Name must be at least 3 characters')
    .max(100, 'Name must be less than 100 characters'),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(500, 'Description must be less than 500 characters'),
  url: z.string().url('Please enter a valid URL').min(5, 'URL is required'),
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
});

type FormValues = z.infer<typeof formSchema>;

interface ToolSubmissionFormProps {
  onSuccess: () => void;
  categories: { id: number; name: string }[];
  editMode?: boolean;
  toolToEdit?: AITool;
}

export function ToolSubmissionForm({
  onSuccess,
  categories,
  editMode = false,
  toolToEdit,
}: ToolSubmissionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    toolToEdit?.category || []
  );
  const [tagsInput, setTagsInput] = useState('');
  const {
    submitTool,
    updateTool,
    loading: adminActionLoading,
  } = useSupabaseAdmin();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: editMode && toolToEdit ? toolToEdit.name : '',
      description: editMode && toolToEdit ? toolToEdit.description : '',
      url: editMode && toolToEdit ? toolToEdit.url : '',
      imageUrl: editMode && toolToEdit ? toolToEdit.imageUrl : '',
      category: editMode && toolToEdit ? toolToEdit.category : [],
      pricing: editMode && toolToEdit ? toolToEdit.pricing : 'Free',
      featured: editMode && toolToEdit ? toolToEdit.featured : false,
      tags: editMode && toolToEdit ? toolToEdit.tags : [],
    },
  });

  // Initialize selected categories if in edit mode
  useEffect(() => {
    if (editMode && toolToEdit) {
      setSelectedCategories(toolToEdit.category);
    }
  }, [editMode, toolToEdit]);

  // Update form value when selectedCategories changes
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

  const onSubmit = async (values: FormValues) => {
    try {
      setIsSubmitting(true);

      const toolData = {
        name: values.name,
        description: values.description,
        url: values.url,
        image_url: values.imageUrl,
        category: values.category,
        pricing: values.pricing,
        featured: values.featured,
        tags: values.tags,
      };

      let result;

      if (editMode && toolToEdit) {
        // Update existing tool
        result = await updateTool(toolToEdit.id, toolData);
        if (result.success) {
          toast.success('Tool updated successfully!');
        }
      } else {
        // Create new tool
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
                  maxSize={5} // 2MB limit
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
                {categories.map((category) => (
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
                ))}
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
                <Button type="button" onClick={handleAddTag} variant="outline">
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
  );
}
