import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isConfigured = Boolean(url && key);
if (!isConfigured) {
  console.warn("Supabase is not configured: copy .env.example to .env and fill in the keys.");
}

// With no keys the client points at a dummy URL so the landing page still
// renders its built-in default content.
export const supabase = createClient(url || "http://localhost:54321", key || "public-anon-key", {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
});
