
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSupabaseTools } from "@/hooks/useSupabaseTools";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AIOucome } from "@/types/outcomes";

const formSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(100, "Title must be less than 100 characters"),
  description: z.string().min(10, "Description must be at least 10 characters").max(500, "Description must be less than 500 characters"),
  toolId: z.string().min(1, "Please select which AI tool you used"),
  imageUrl: z.string().url("Please enter a valid image URL").min(5, "Image URL is required"),
  submitterName: z.string().min(2, "Name must be at least 2 characters").max(50, "Name must be less than 50 characters"),
  submitterEmail: z.string().email("Please enter a valid email").optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface OutcomeSubmissionFormProps {
  onSuccess: () => void;
  initialData?: AIOucome;
  userId?: string;
}

const OutcomeSubmissionForm = ({ onSuccess, initialData, userId }: OutcomeSubmissionFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { tools, loading: toolsLoading } = useSupabaseTools();
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  // Fetch current user if not provided
  useEffect(() => {
    const getUserDetails = async () => {
      if (userId) return;
      
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setCurrentUser(data.user);
      }
    };
    
    getUserDetails();
  }, [userId]);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      toolId: initialData?.toolId || "",
      imageUrl: initialData?.imageUrl || "",
      submitterName: initialData?.submitterName || "",
      submitterEmail: initialData?.submitterEmail || "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      setIsSubmitting(true);
      
      // Check if user is logged in
      const activeUserId = userId || currentUser?.id;
      
      if (!activeUserId) {
        toast.error("You must be logged in to submit content. Please sign in.");
        return;
      }
      
      if (initialData) {
        // Update existing outcome
        const { error } = await supabase
          .from('ai_outcomes')
          .update({
            title: values.title,
            description: values.description,
            tool_id: values.toolId,
            image_url: values.imageUrl,
            submitter_name: values.submitterName,
            submitter_email: values.submitterEmail,
            user_id: activeUserId
          })
          .eq('id', initialData.id);

        if (error) {
          throw new Error(error.message);
        }
        
        toast.success("Your AI creation has been updated!");
      } else {
        // Insert the new outcome
        const { error } = await supabase
          .from('ai_outcomes')
          .insert({
            title: values.title,
            description: values.description,
            tool_id: values.toolId,
            image_url: values.imageUrl,
            submitter_name: values.submitterName,
            submitter_email: values.submitterEmail,
            user_id: activeUserId
          });

        if (error) {
          throw new Error(error.message);
        }
        
        toast.success("Your AI creation has been submitted successfully!");
      }
      
      onSuccess();
    } catch (error) {
      console.error("Error submitting outcome:", error);
      toast.error("Failed to submit your AI outcome. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="My amazing AI creation" {...field} />
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
                  placeholder="Describe your creation and the process..." 
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
          name="toolId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>AI Tool Used</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                value={field.value}
                disabled={toolsLoading}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select the AI tool you used" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {tools.map((tool) => (
                    <SelectItem key={tool.id} value={tool.id}>
                      {tool.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image URL</FormLabel>
              <FormControl>
                <Input placeholder="https://example.com/your-image.png" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="submitterName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your Name</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="submitterEmail"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your Email (optional)</FormLabel>
              <FormControl>
                <Input placeholder="your.email@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {initialData ? "Update" : "Submit"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default OutcomeSubmissionForm;
