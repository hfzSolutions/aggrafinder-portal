import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { AITool } from '@/types/tools';
import { AIOucome } from '@/types/outcomes';

interface UseSupabaseAdminReturn {
  // Tools management
  createTool: (
    tool: Omit<AITool, 'id'>
  ) => Promise<{ success: boolean; data?: AITool; error?: string }>;
  updateTool: (
    id: string,
    updates: Partial<AITool>
  ) => Promise<{ success: boolean; error?: string }>;
  deleteTool: (id: string) => Promise<{ success: boolean; error?: string }>;

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

  // Loading state
  loading: boolean;
}

export const useSupabaseAdmin = (): UseSupabaseAdminReturn => {
  const [loading, setLoading] = useState(false);

  // Tools management functions
  const createTool = async (
    tool: Omit<AITool, 'id'>
  ): Promise<{ success: boolean; data?: AITool; error?: string }> => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('ai_tools')
        .insert({
          name: tool.name,
          description: tool.description,
          image_url: tool.imageUrl,
          category: tool.category,
          url: tool.url,
          featured: tool.featured,
          pricing: tool.pricing,
          tags: tool.tags,
        })
        .select()
        .single();

      if (error) throw error;

      const newTool: AITool = {
        id: data.id,
        name: data.name,
        description: data.description,
        imageUrl: data.image_url,
        category: data.category,
        url: data.url,
        featured: data.featured,
        pricing: data.pricing as 'Free' | 'Freemium' | 'Paid' | 'Free Trial',
        tags: data.tags,
      };

      return { success: true, data: newTool };
    } catch (error: any) {
      console.error('Error creating tool:', error);
      return {
        success: false,
        error: error.message || 'Failed to create tool',
      };
    } finally {
      setLoading(false);
    }
  };

  const updateTool = async (
    id: string,
    updates: Partial<AITool>
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);

      // Transform the updates to match the database column names
      const dbUpdates: any = {};

      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.description !== undefined)
        dbUpdates.description = updates.description;
      if (updates.imageUrl !== undefined)
        dbUpdates.image_url = updates.imageUrl;
      if (updates.category !== undefined) dbUpdates.category = updates.category;
      if (updates.url !== undefined) dbUpdates.url = updates.url;
      if (updates.featured !== undefined) dbUpdates.featured = updates.featured;
      if (updates.pricing !== undefined) dbUpdates.pricing = updates.pricing;
      if (updates.tags !== undefined) dbUpdates.tags = updates.tags;

      const { error } = await supabase
        .from('ai_tools')
        .update(dbUpdates)
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

  const deleteTool = async (
    id: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);

      // First check if there are any outcomes associated with this tool
      const { data: outcomes, error: checkError } = await supabase
        .from('ai_outcomes')
        .select('id')
        .eq('tool_id', id);

      if (checkError) throw checkError;

      if (outcomes && outcomes.length > 0) {
        return {
          success: false,
          error: `Cannot delete tool with ${outcomes.length} associated outcomes. Remove the outcomes first.`,
        };
      }

      // Delete any votes associated with this tool
      await supabase.from('tool_votes').delete().eq('tool_id', id);

      // Delete the tool
      const { error } = await supabase.from('ai_tools').delete().eq('id', id);

      if (error) throw error;

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

      // Create a new tool from the request
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

  return {
    // Tools management
    createTool,
    updateTool,
    deleteTool,

    // Outcomes management
    deleteOutcome,

    // Categories management
    createCategory,
    updateCategory,
    deleteCategory,

    // Tool requests management
    approveToolRequest,
    rejectToolRequest,

    // Loading state
    loading,
  };
};
