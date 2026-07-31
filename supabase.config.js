const SUPABASE_URL = "https://REPLACE_WITH_YOUR_PROJECT.supabase.co";
const SUPABASE_ANON_KEY = "REPLACE_WITH_YOUR_ANON_KEY";
const STORAGE_BUCKET = "product-images";

const supabaseClient = typeof supabase !== "undefined" && SUPABASE_URL && SUPABASE_ANON_KEY && !SUPABASE_URL.includes("REPLACE_WITH_YOUR_PROJECT")
  ? supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

if (!supabaseClient) {
  console.warn("Supabase client is not initialized. Replace placeholders in supabase.config.js with your Supabase project URL and anon key.");
}
