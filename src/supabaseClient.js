import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    flowType: "pkce",
    detectSessionInUrl: true, // Auto-detects the code in the URL and exchanges for session
    autoRefreshToken: true,
    persistSession: true,
    storage: {
      // Keep using localStorage by default
      getItem: (key) => localStorage.getItem(key),
      setItem: (key, value) => localStorage.setItem(key, value),
      removeItem: (key) => localStorage.removeItem(key),
    },
  },
});

// Helper function to handle password reset across platforms
export const handlePasswordReset = async (email) => {
  try {
    // Always use the current origin for the redirect
    const redirectTo = `${window.location.origin}/reset-password`;

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error("Password reset error:", error);
    return { success: false, error };
  }
};
