import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Determine the redirect URL based on the environment
const getRedirectUrl = () => {
  // In production (Vercel deployment)
  if (import.meta.env.PROD) {
    return "https://forgot-password-one.vercel.app";
  }
  // In development (localhost)
  return "http://localhost:5173";
};

// Initialize the Supabase client with PKCE flow and auto session detection
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    flowType: "pkce",
    detectSessionInUrl: true,
    autoRefreshToken: true,
    persistSession: true,
    storageKey: "supabase-auth-token",
  },
});
