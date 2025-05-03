// Admin client with service role key for administrative operations
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// This client should only be used in admin-specific contexts
// The service role key must be set in your environment variables
const SUPABASE_URL = 'https://ozqlpdsmjwrhjyceyskd.supabase.co';

// NOTE: You need to add your service role key to your environment variables
// This is a placeholder and will not work until you set the actual key
const SUPABASE_SERVICE_ROLE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96cWxwZHNtandyaGp5Y2V5c2tkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE1Mzc1ODUsImV4cCI6MjA1NzExMzU4NX0.nStPFsaCFMIpXnuyWYjyebGjVMxuYQwU5Ye6Q5RF-SA';

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
