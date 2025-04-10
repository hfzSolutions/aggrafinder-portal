import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { AITool } from '@/types/tools';
import { AIOucome } from '@/types/outcomes';
import { compressImage } from '@/utils/imageCompression';

interface UseSupabaseAdminReturn {
  // Outcomes management
  deleteOutcome: (id: string) => Promise<{ success: boolean; error?: string }>;

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
    description: string;
    url: string;
    image_url: string;
    category: string[];
    pricing: string;
    featured: boolean;
    tags: string[];
    user_id: string;
  }) => Promise<{ success: boolean; error?: string }>;

  updateTool: (
    id: string,
    toolData: {
      name: string;
      description: string;
      url: string;
      image_url: string | File;
      category: string[];
      pricing: string;
      featured: boolean;
      tags: string[];
      user_id?: string;
    }
  ) => Promise<{ success: boolean; error?: string }>;

  bulkSubmitTools: (
    toolsData: {
      name: string;
      description: string;
      url: string;
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

  // Outcomes management functions
  const deleteOutcome = async (
    id: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);

      const { error } = await supabase
        .from('ai_outcomes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return { success: true };
    } catch (error: any) {
      console.error('Error deleting outcome:', error);
      return {
        success: false,
        error: error.message || 'Failed to delete outcome',
      };
    } finally {
      setLoading(false);
    }
  };

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
        .from('tool_requests')
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
          image_url: 'https://via.placeholder.com/300', // Default image
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
        .from('tool_requests')
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
        .from('tool_requests')
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
    description: string;
    url: string;
    image_url: string | File;
    category: string[];
    pricing: string;
    featured: boolean;
    tags: string[];
    user_id: string;
    is_admin_added?: boolean; // Add optional parameter to control is_admin_added flag
  }): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);

      let imageUrl = '';
      let shouldUpdateImage = true;

      if (toolData.image_url instanceof File) {
        // Compress the image before uploading
        const file = await compressImage(toolData.image_url, {
          maxSizeMB: 1, // Limit to 1MB
          maxWidthOrHeight: 1200, // Limit dimensions
          quality: 0.8, // 80% quality
        });

        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random()
          .toString(36)
          .substring(2, 15)}.${fileExt}`;
        const filePath = `tools/${fileName}`;

        // Upload the compressed file to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('assets')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        // Store just the path - the public URL will be constructed when fetching
        imageUrl = filePath;
      }

      // Create a data object without the image_url property
      const dataToInsert = {
        ...toolData,
        is_admin_added:
          toolData.is_admin_added !== undefined
            ? toolData.is_admin_added
            : false,
      };

      // Only add image_url to the data if we should update it
      if (shouldUpdateImage) {
        dataToInsert.image_url = imageUrl;
      } else {
        // Remove image_url from the data if we shouldn't update it
        delete dataToInsert.image_url;
      }

      // Insert the tool with the prepared data
      const { error } = await supabase.from('ai_tools').insert(dataToInsert);

      if (error) throw error;

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
      description: string;
      url: string;
      image_url: string | File;
      category: string[];
      pricing: string;
      featured: boolean;
      tags: string[];
      user_id?: string;
    }
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);

      // First get the current tool details to get the image path
      const { data: currentTool, error: fetchError } = await supabase
        .from('ai_tools')
        .select('image_url')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      const currentImageUrl = currentTool?.image_url || '';
      let imageUrl = '';
      let shouldUpdateImage = false;

      if (toolData.image_url instanceof File) {
        shouldUpdateImage = true;

        // Compress the image before uploading
        const file = await compressImage(toolData.image_url, {
          maxSizeMB: 1, // Limit to 1MB
          maxWidthOrHeight: 1200, // Limit dimensions
          quality: 0.8, // 80% quality
        });

        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random()
          .toString(36)
          .substring(2, 15)}.${fileExt}`;
        const filePath = `tools/${fileName}`;

        // Upload the compressed file to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('assets')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        // Store just the path - the public URL will be constructed when fetching
        imageUrl = filePath;

        // Delete the old image if it exists and is stored in Supabase Storage
        if (currentImageUrl && !currentImageUrl.startsWith('http')) {
          const { error: deleteError } = await supabase.storage
            .from('assets')
            .remove([currentImageUrl]);

          if (deleteError) {
            console.error('Error deleting old tool image:', deleteError);
            // We don't throw here as the update can still proceed
          }
        }
      }

      // Create a data object from toolData
      const dataToUpdate = { ...toolData };

      // Handle the image_url property based on shouldUpdateImage flag
      if (shouldUpdateImage) {
        // Add the new image URL if we should update the image
        dataToUpdate.image_url = imageUrl;
      } else {
        // Remove image_url from the data if we shouldn't update it
        delete dataToUpdate.image_url;
      }

      // Update the tool with the prepared data
      const { error } = await supabase
        .from('ai_tools')
        .update(dataToUpdate)
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

      // Process tools in batches to avoid overwhelming the database
      const batchSize = 10;
      let successCount = 0;

      // Process tools in batches
      for (let i = 0; i < toolsData.length; i += batchSize) {
        const batch = toolsData.slice(i, i + batchSize).map((tool) => {
          // Create the base tool object
          const toolObject: any = {
            name: tool.name,
            description: tool.description,
            url: tool.url,
            category: tool.category,
            pricing: tool.pricing,
            featured: tool.featured || false,
            tags: tool.tags || [],
            user_id: tool.user_id || null,
            approval_status: 'approved', // Auto-approve bulk uploads
            is_admin_added: true, // Mark all bulk uploaded tools as admin-added
          };

          // Only add image_url if it's not empty
          if (tool.image_url) {
            toolObject.image_url = tool.image_url;
          }

          return toolObject;
        });

        // Insert the batch of tools
        const { error } = await supabase.from('ai_tools').insert(batch);

        if (error) throw error;

        successCount += batch.length;
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
    // Outcomes management
    deleteOutcome,

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
