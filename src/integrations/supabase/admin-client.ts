// Admin client with service role key for administrative operations
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// This client should only be used in admin-specific contexts
// The service role key must be set in your environment variables
const SUPABASE_URL = 'https://ozqlpdsmjwrhjyceyskd.supabase.co';

// NOTE: You need to add your service role key to your environment variables
// This is a placeholder and will not work until you set the actual key
const SUPABASE_SERVICE_ROLE_KEY =
  import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || '';

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
