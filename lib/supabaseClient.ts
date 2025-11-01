import { createClient } from '@supabase/supabase-js'

// Supabase connection details provided by the user.
const supabaseUrl = 'https://esjslgrurntpdxykwygg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVzanNsZ3J1cm50cGR4eWt3eWdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc4Mjg1MDQsImV4cCI6MjA3MzQwNDUwNH0.B-4lp1VUKBNH1q-8fdiLd52nICaaynR5jie0TvVtdW8';

// Initialize the Supabase client.
// IMPORTANT: The service_role key should NEVER be used in client-side code.
// The public anon key is used here, and its access is managed by Row Level Security (RLS) policies.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
