
// Admin client with service role key for administrative operations
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// This client should only be used in admin-specific contexts
const SUPABASE_URL = 'https://ozqlpdsmjwrhjyceyskd.supabase.co';

// We need to provide a fallback value for the service role key to prevent runtime errors
// In production, this should be set as an environment variable
const SUPABASE_SERVICE_ROLE_KEY =
  import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || 'PLACEHOLDER_SERVICE_KEY_FOR_CLIENT_SIDE';

// Create a separate admin client with the service role key
export const supabaseAdmin = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// Define custom functions specifically for the admin client
export const adminFunctions = {
  // Tool management functions
  approveToolFunction: (toolId: string) => supabaseAdmin.rpc('approve_tool', { tool_id: toolId }),
  rejectToolFunction: (toolId: string) => supabaseAdmin.rpc('reject_tool', { tool_id: toolId }),
  
  // Account management functions
  markAccountForDeletion: (userId: string, deletionReason?: string) => 
    supabaseAdmin.rpc('mark_account_for_deletion', { 
      user_id: userId, 
      deletion_reason: deletionReason 
    }),
  
  processAccountsPendingDeletion: () => 
    supabaseAdmin.rpc('process_accounts_pending_deletion')
};
