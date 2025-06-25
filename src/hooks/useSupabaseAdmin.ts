import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { AITool } from '@/types/tools';
import { compressImage } from '@/utils/imageCompression';
import ToolSubmissionNotificationEmailTemplate from '@/templates/ToolSubmissionNotificationEmail';

interface UseSupabaseAdminReturn {
  // Removed Outcomes management

  // Categories management
  createCategory: (
    name: string
  ) => Promise<{ success: boolean; error?: string }>;
  updateCategory: (
    id: number,
    newName: string
  ) => Promise<{ success: boolean; error?: string }>;
  deleteCategory: (id: number) => Promise<{ success: boolean; error?: string }>;

  // Tool requests management
  approveToolRequest: (
    id: string
  ) => Promise<{ success: boolean; error?: string }>;
  rejectToolRequest: (
    id: string
  ) => Promise<{ success: boolean; error?: string }>;

  // Tool management
  submitTool: (toolData: {
    name: string;
    tagline: string;
    description: string;
    url: string;
    youtube_url?: string; // Add YouTube URL
    image_url: any;
    category: string[];
    pricing: string;
    featured: boolean;
    tags: string[];
    user_id?: string;
    is_admin_added: boolean;
    tool_type: string;
  }) => Promise<{ success: boolean; error?: string }>;

  updateTool: (
    id: string,
    toolData: {
      name: string;
      tagline: string;
      description: string;
      url: string;
      youtube_url?: string; // Add YouTube URL
      image_url: any;
      category: string[];
      pricing: string;
      featured: boolean;
      tags: string[];
      user_id?: string;
      is_admin_added: boolean;
    }
  ) => Promise<{ success: boolean; error?: string }>;

  bulkSubmitTools: (
    toolsData: {
      name: string;
      description: string;
      tagline?: string; // Added tagline
      url: string;
      youtube_url?: string; // Add YouTube URL
      image_url: string;
      category: string[];
      pricing: string;
      featured: boolean;
      tags: string[];
      user_id?: string;
    }[]
  ) => Promise<{ success: boolean; error?: string; count: number }>;

  deleteTool: (id: string) => Promise<{ success: boolean; error?: string }>;

  // Direct tool approval management
  approveTool: (id: string) => Promise<{ success: boolean; error?: string }>;
  rejectTool: (id: string) => Promise<{ success: boolean; error?: string }>;

  // Loading state
  loading: boolean;
}

export const useSupabaseAdmin = (): UseSupabaseAdminReturn => {
  const [loading, setLoading] = useState(false);

  // Removed deleteOutcome function

  // Categories management functions
  const updateCategory = async (
    id: number,
    newName: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);

      const { error } = await supabase
        .from('categories')
        .update({ name: newName })
        .eq('id', id);

      if (error) throw error;

      return { success: true };
    } catch (error: any) {
      console.error('Error updating category:', error);
      return {
        success: false,
        error: error.message || 'Failed to update category',
      };
    } finally {
      setLoading(false);
    }
  };

  const createCategory = async (
    name: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);

      const { error } = await supabase.from('categories').insert({ name });

      if (error) throw error;

      return { success: true };
    } catch (error: any) {
      console.error('Error creating category:', error);
      return {
        success: false,
        error: error.message || 'Failed to create category',
      };
    } finally {
      setLoading(false);
    }
  };

  const deleteCategory = async (
    id: number
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);

      const { error } = await supabase.from('categories').delete().eq('id', id);

      if (error) throw error;

      return { success: true };
    } catch (error: any) {
      console.error('Error deleting category:', error);
      return {
        success: false,
        error: error.message || 'Failed to delete category',
      };
    } finally {
      setLoading(false);
    }
  };

  // Tool requests management functions
  const approveToolRequest = async (
    id: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);

      // First get the tool request details
      const { data: requestData, error: fetchError } = await supabase
        .from('tool_reports')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      if (!requestData) {
        return { success: false, error: 'Tool request not found' };
      }

      if (requestData.request_type === 'update' && requestData.tool_id) {
        // For update requests, modify the existing tool
        const { error: updateError } = await supabase
          .from('ai_tools')
          .update({
            name: requestData.name,
            description: requestData.description,
            category: requestData.category,
            url: requestData.url,
            pricing: requestData.pricing || 'Free',
          })
          .eq('id', requestData.tool_id);

        if (updateError) throw updateError;
      } else {
        // For new tool requests, create a new tool
        const { error: insertError } = await supabase.from('ai_tools').insert({
          name: requestData.name,
          description: requestData.description,
          category: requestData.category,
          url: requestData.url,
          featured: false,
          pricing: requestData.pricing || 'Free',
          tags: [],
        });

        if (insertError) throw insertError;
      }

      // Update the request status
      const { error: updateError } = await supabase
        .from('tool_reports')
        .update({ status: 'approved' })
        .eq('id', id);

      if (updateError) throw updateError;

      return { success: true };
    } catch (error: any) {
      console.error('Error approving tool request:', error);
      return {
        success: false,
        error: error.message || 'Failed to approve tool request',
      };
    } finally {
      setLoading(false);
    }
  };

  const rejectToolRequest = async (
    id: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);

      const { error } = await supabase
        .from('tool_reports')
        .update({ status: 'rejected' })
        .eq('id', id);

      if (error) throw error;

      return { success: true };
    } catch (error: any) {
      console.error('Error rejecting tool request:', error);
      return {
        success: false,
        error: error.message || 'Failed to reject tool request',
      };
    } finally {
      setLoading(false);
    }
  };

  // Tool management functions
  const submitTool = async (toolData: {
    name: string;
    tagline: string;
    description: string;
    url: string;
    youtube_url?: string; // Add YouTube URL
    image_url: any;
    category: string[];
    pricing: string;
    featured: boolean;
    tags: string[];
    user_id?: string;
    is_admin_added: boolean;
    tool_type: string;
  }): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);

      toolData.is_admin_added = window.location.pathname.includes('/admin');

      // Insert the tool with the prepared data
      const { data, error } = await supabase
        .from('ai_tools')
        .insert(toolData)
        .select()
        .single();

      // Handle image compression if it's a new file
      if (toolData.image_url instanceof File) {
        const file = await compressImage(toolData.image_url, {
          maxSizeMB: 1,
          maxWidthOrHeight: 1200,
          quality: 0.8,
        });

        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random()
          .toString(36)
          .substring(2, 15)}.${fileExt}`;
        const filePath = `tools/${fileName}`;

        // Upload the new image
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('assets')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        // Update the tool with the prepared data
        const { error } = await supabase
          .from('ai_tools')
          .update({
            image_url: filePath,
          })
          .eq('id', data.id);

        if (error) throw error;
      }

      if (error) throw error;

      // Send email notification to admin
      try {
        // Get submitter information
        let submitterName = 'Anonymous User';
        if (toolData.user_id) {
          const { data: userData, error: userError } = await supabase
            .from('profiles')
            .select('username, email')
            .eq('id', toolData.user_id)
            .single();

          if (!userError && userData) {
            submitterName = userData.username || 'Registered User';
          }
        }

        const baseUrl =
          typeof window !== 'undefined'
            ? `${window.location.protocol}//${window.location.host}`
            : import.meta.env.VITE_SITE_URL || 'https://deeplistai.com';

        const toolDetailsUrl =
          toolData.tool_type === 'quick'
            ? `${baseUrl}/quick-tools/${data.id}`
            : `${baseUrl}/tools/${data.id}`;
        const adminDashboardUrl = `${baseUrl}/admin`;

        // Generate the HTML content using our template
        const htmlContent = ToolSubmissionNotificationEmailTemplate({
          toolName: toolData.name,
          submitterName,
          toolUrl: toolDetailsUrl,
          siteUrl: baseUrl,
          adminDashboardUrl,
          toolType: toolData.tool_type,
        });

        // Send the email to admin
        const { data: emailData, error: emailError } =
          await supabase.functions.invoke('send-email-with-resend', {
            body: {
              from: 'DeepList AI <team@deeplistai.com>',
              to: import.meta.env.VITE_ADMIN_EMAIL, // Admin email address
              subject: `New Tool Submission: "${toolData.name}"`,
              html: htmlContent,
            },
          });

        if (emailError) {
          console.error('Error sending admin notification email:', emailError);
        } else {
          // console.log('Admin notification email sent successfully:', emailData);
        }
      } catch (emailError) {
        console.error('Failed to send admin notification email:', emailError);
        // Don't throw - email failure shouldn't prevent the tool submission
      }

      return { success: true };
    } catch (error: any) {
      console.error('Error submitting tool:', error);
      return {
        success: false,
        error: error.message || 'Failed to submit tool',
      };
    } finally {
      setLoading(false);
    }
  };

  // Tool management functions
  const deleteTool = async (
    id: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);

      // First get the tool details to get the image path
      const { data: toolData, error: fetchError } = await supabase
        .from('ai_tools')
        .select('image_url')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      // Delete the tool from the database
      const { error: deleteError } = await supabase
        .from('ai_tools')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      // If the tool had an image and it's stored in Supabase Storage, delete it
      if (toolData?.image_url && !toolData.image_url.startsWith('http')) {
        const { error: storageError } = await supabase.storage
          .from('assets')
          .remove([toolData.image_url]);

        if (storageError) {
          console.error('Error deleting tool image:', storageError);
          // We don't throw here as the tool was already deleted
        }
      }

      return { success: true };
    } catch (error: any) {
      console.error('Error deleting tool:', error);
      return {
        success: false,
        error: error.message || 'Failed to delete tool',
      };
    } finally {
      setLoading(false);
    }
  };

  // Update tool function
  const updateTool = async (
    id: string,
    toolData: {
      name: string;
      tagline: string;
      description: string;
      url: string;
      youtube_url?: string; // Add YouTube URL
      image_url: any;
      category: string[];
      pricing: string;
      featured: boolean;
      tags: string[];
      user_id?: string;
      is_admin_added: boolean;
      tool_type: string;
    }
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);

      // Handle image_url if it's undefined or null
      if (toolData.image_url === undefined || toolData.image_url === null) {
        // Keep the existing image or set to null if no image exists
        const { data: currentTool, error: fetchError } = await supabase
          .from('ai_tools')
          .select('image_url')
          .eq('id', id)
          .single();

        if (fetchError) throw fetchError;
        toolData.image_url = currentTool?.image_url || null;
      }
      // Handle image compression if it's a new file
      else if (toolData.image_url instanceof File) {
        const file = await compressImage(toolData.image_url, {
          maxSizeMB: 1,
          maxWidthOrHeight: 1200,
          quality: 0.8,
        });

        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random()
          .toString(36)
          .substring(2, 15)}.${fileExt}`;
        const filePath = `tools/${fileName}`;

        // Upload the new image
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('assets')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        toolData.image_url = filePath;
      } else if (typeof toolData.image_url === 'string') {
        const existingImagePath = toolData.image_url.includes(
          import.meta.env.VITE_STORAGE_URL
        )
          ? toolData.image_url
              .split(import.meta.env.VITE_STORAGE_URL + '/')
              .pop()
          : toolData.image_url;

        toolData.image_url = existingImagePath;
      }

      // First get the current tool data to check if we need to delete an old image
      const { data: currentTool, error: fetchError } = await supabase
        .from('ai_tools')
        .select('image_url')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      // If the image URL has changed and the old one was stored in Supabase Storage,
      // delete the old image to free up storage space
      if (
        currentTool?.image_url &&
        currentTool.image_url !== toolData.image_url &&
        !currentTool.image_url.startsWith('http')
      ) {
        // Delete the old image from storage
        const { error: deleteError } = await supabase.storage
          .from('assets')
          .remove([currentTool.image_url]);

        if (deleteError) {
          console.error('Error deleting previous image:', deleteError);
          // Continue with update even if delete fails
        }
      }

      toolData.is_admin_added = window.location.pathname.includes('/admin');

      // Update the tool with the prepared data
      const { error } = await supabase
        .from('ai_tools')
        .update(toolData)
        .eq('id', id);

      if (error) throw error;

      return { success: true };
    } catch (error: any) {
      console.error('Error updating tool:', error);
      return {
        success: false,
        error: error.message || 'Failed to update tool',
      };
    } finally {
      setLoading(false);
    }
  };

  // Bulk tool submission function
  const bulkSubmitTools = async (
    toolsData: {
      name: string;
      description: string;
      url: string;
      youtube_url?: string;
      image_url: string;
      category: string[];
      pricing: string;
      featured: boolean;
      tags: string[];
      user_id?: string;
      is_admin_added?: boolean;
    }[]
  ): Promise<{ success: boolean; error?: string; count: number }> => {
    try {
      setLoading(true);

      // First, check for existing tool names
      const toolNames = toolsData.map((tool) => tool.name);
      const { data: existingTools } = await supabase
        .from('ai_tools')
        .select('name')
        .in('name', toolNames);

      // Create a set of existing tool names for faster lookup
      const existingToolNames = new Set(
        existingTools?.map((tool) => tool.name) || []
      );

      // Filter out tools with existing names
      const newTools = toolsData.filter(
        (tool) => !existingToolNames.has(tool.name)
      );

      // If all tools already exist, return early
      if (newTools.length === 0) {
        return {
          success: true,
          count: 0,
          error: `All ${toolsData.length} tools already exist in the database.`,
        };
      }

      // Process tools in batches to avoid overwhelming the database
      const batchSize = 10;
      let successCount = 0;

      // Process tools in batches
      for (let i = 0; i < newTools.length; i += batchSize) {
        const batch = newTools.slice(i, i + batchSize).map((tool) => {
          // Ensure tags always include 'Global'
          const finalTags = ['Global'];
          if (tool.tags && tool.tags.length > 0) {
            tool.tags.forEach((tag) => {
              if (!finalTags.includes(tag)) {
                finalTags.push(tag);
              }
            });
          }

          return {
            name: tool.name,
            description: tool.description,
            tagline: tool.tagline, // Include tagline
            url: tool.url,
            youtube_url: tool.youtube_url, // Include YouTube URL
            image_url: tool.image_url,
            category: tool.category,
            pricing: tool.pricing,
            featured: tool.featured || false,
            tags: finalTags,
            user_id: tool.user_id || null,
            approval_status: 'approved', // Auto-approve bulk uploads
            is_admin_added: true, // Mark all bulk uploaded tools as admin-added
          };
        });

        // Insert the batch of tools
        const { error } = await supabase.from('ai_tools').insert(batch);

        if (error) throw error;

        successCount += batch.length;
      }

      // If some tools were skipped due to existing names
      if (successCount < toolsData.length) {
        return {
          success: true,
          count: successCount,
          error: `${successCount} tools uploaded. ${
            toolsData.length - successCount
          } tools skipped because they already exist.`,
        };
      }

      // Send email notification to admin about bulk submission
      try {
        // Get submitter information
        let submitterName = 'Admin User'; // Bulk submissions are typically done by admins

        const baseUrl =
          typeof window !== 'undefined'
            ? `${window.location.protocol}//${window.location.host}`
            : import.meta.env.VITE_SITE_URL || 'https://deeplistai.com';

        const adminDashboardUrl = `${baseUrl}/admin`;

        // Generate the HTML content using our template
        const htmlContent = ToolSubmissionNotificationEmailTemplate({
          toolName: `${successCount} tools (Bulk Submission)`,
          submitterName,
          toolUrl: `${baseUrl}/admin`,
          siteUrl: baseUrl,
          adminDashboardUrl,
          toolType: 'bulk upload',
        });

        // Send the email to admin
        const { data: emailData, error: emailError } =
          await supabase.functions.invoke('send-email-with-resend', {
            body: {
              from: 'DeepList AI <team@deeplistai.com>',
              to: import.meta.env.VITE_ADMIN_EMAIL, // Admin email address
              subject: `New Bulk Tool Submission: ${successCount} tools added`,
              html: htmlContent,
            },
          });

        if (emailError) {
          console.error(
            'Error sending admin notification email for bulk submission:',
            emailError
          );
        } else {
          console.log(
            'Admin notification email sent successfully for bulk submission:',
            emailData
          );
        }
      } catch (emailError) {
        console.error(
          'Failed to send admin notification email for bulk submission:',
          emailError
        );
        // Don't throw - email failure shouldn't prevent the tool submission
      }

      return { success: true, count: successCount };
    } catch (error: any) {
      console.error('Error bulk submitting tools:', error);
      return {
        success: false,
        error: error.message || 'Failed to bulk submit tools',
        count: 0,
      };
    } finally {
      setLoading(false);
    }
  };

  // New functions for direct tool approval
  const approveTool = async (
    id: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);

      // Call the approve_tool database function
      const { error } = await supabase.rpc('approve_tool', { tool_id: id });

      if (error) throw error;

      return { success: true };
    } catch (error: any) {
      console.error('Error approving tool:', error);
      return {
        success: false,
        error: error.message || 'Failed to approve tool',
      };
    } finally {
      setLoading(false);
    }
  };

  const rejectTool = async (
    id: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);

      // Call the reject_tool database function
      const { error } = await supabase.rpc('reject_tool', { tool_id: id });

      if (error) throw error;

      return { success: true };
    } catch (error: any) {
      console.error('Error rejecting tool:', error);
      return {
        success: false,
        error: error.message || 'Failed to reject tool',
      };
    } finally {
      setLoading(false);
    }
  };

  return {
    // Categories management
    createCategory,
    updateCategory,
    deleteCategory,

    // Tool requests management
    approveToolRequest,
    rejectToolRequest,

    // Tool management
    submitTool,
    updateTool,
    deleteTool,
    bulkSubmitTools,

    // Direct tool approval management
    approveTool,
    rejectTool,

    loading,
  };
};
