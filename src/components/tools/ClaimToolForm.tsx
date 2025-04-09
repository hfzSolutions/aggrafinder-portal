
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
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
import { toast } from 'sonner';
import { Loader2, CheckCircle } from 'lucide-react';

const claimToolSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Please enter a valid email'),
  verification: z.string().min(10, 'Please provide verification details'),
});

type ClaimToolFormValues = z.infer<typeof claimToolSchema>;

interface ClaimToolFormProps {
  toolId: string;
  toolName: string;
  onSuccess: () => void;
  onCancel: () => void;
  userId: string; // Add userId prop to pass the authenticated user's ID
}

export function ClaimToolForm({
  toolId,
  toolName,
  onSuccess,
  onCancel,
  userId,
}: ClaimToolFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ClaimToolFormValues>({
    resolver: zodResolver(claimToolSchema),
    defaultValues: {
      name: '',
      email: '',
      verification: '',
    },
  });

  const onSubmit = async (values: ClaimToolFormValues) => {
    try {
      setIsSubmitting(true);

      // Insert the claim request directly without using RPC
      const { error } = await supabase
        .from('tool_ownership_claims')
        .insert({
          tool_id: toolId,
          user_id: userId,
          submitter_name: values.name,
          submitter_email: values.email,
          verification_details: values.verification,
          status: 'pending'
        });

      if (error) throw error;

      toast.success('Claim Request Submitted\nThank you for your request.');
      onSuccess();
    } catch (error) {
      console.error('Error submitting claim request:', error);
      toast.error('Failed to submit claim request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="mb-4">
          <h3 className="text-lg font-medium">
            Claim ownership of "{toolName}"
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Please provide information to verify your ownership of this tool.
          </p>
        </div>

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your Name*</FormLabel>
              <FormControl>
                <Input placeholder="Full name" {...field} />
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
              <FormLabel>Your Email*</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="email@example.com"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="verification"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Verification Details*</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Please provide details to verify your ownership (e.g., your position, contact information on the official website, etc.)"
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2 pt-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Claim Request'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
