// This file creates a reusable Supabase client for the app.
//
// A "client" is just an object that knows how to talk to Supabase.
// We give it the project URL and the public API key from .env.local.
//
// Because these values start with NEXT_PUBLIC_, they can be used in the app
// safely for public database reads.

import { createClient } from "@supabase/supabase-js";

// Read the Supabase project URL from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;

// Read the public / publishable API key from environment variables
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Create and export one shared Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
