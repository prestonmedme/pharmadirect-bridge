import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://snglslmydxlfenfgrgsj.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNuZ2xzbG15ZHhsZmVuZmdyZ3NqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY5MjI0NjgsImV4cCI6MjA3MjQ5ODQ2OH0.DGx6kpEBvicT0UTZJrCuQ1X0Glvv0EjK_r0GzUqSmbU";

// Temporary client without strict typing to work around type issues
export const supabaseTemp = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});