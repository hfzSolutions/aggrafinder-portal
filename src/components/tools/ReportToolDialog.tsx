
import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface ReportToolDialogProps {
  toolId: string;
  toolName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const reportSchema = z.object({
  reason: z.enum(['inappropriate', 'spam', 'duplicate', 'misleading', 'other'], {
    required_error: 'Please select a reason for reporting',
  }),
  details: z.string().min(10, 'Please provide more details (at least 10 characters)'),
  email: z.string().email('Please provide a valid email address').optional(),
});

type ReportFormValues = z.infer<typeof reportSchema>;

export function ReportToolDialog({
  toolId,
  toolName,
  open,
  onOpenChange,
}: ReportToolDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ReportFormValues>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      reason: undefined,
      details: '',
      email: '',
    },
  });

  const onSubmit = async (values: ReportFormValues) => {
    try {
      setIsSubmitting(true);
      
      // Create a tool request of type "report"
      const { error } = await supabase
        .from('tool_requests')
        .insert({
          tool_id: toolId,
          name: toolName,
          description: values.details,
          url: '', // Required by schema but not needed for reports
          category: [], // Required by schema but not needed for reports
          submitter_email: values.email || null,
          request_type: 'report',
          status: 'pending',
          // Store the report reason in the request
          pricing: values.reason, // Temporarily use pricing field to store reason
        });

      if (error) {
        throw error;
      }

      toast.success('Report submitted successfully. Thank you for helping us maintain quality content.');
      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error('Error submitting report:', error);
      toast.error('Failed to submit report. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Report Tool: {toolName}</DialogTitle>
          <DialogDescription>
            Please let us know why you're reporting this tool. Your feedback helps us maintain a high-quality directory.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Reason for reporting</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="inappropriate" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Inappropriate content
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="spam" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Spam or advertising
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="duplicate" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Duplicate listing
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="misleading" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Misleading information
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="other" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Other
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="details"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Details</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Please provide specific details about the issue..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email (optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Your email address if you'd like to be contacted about this report"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Report'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
