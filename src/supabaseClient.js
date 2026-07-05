import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl) {
  console.warn(
    "Missing VITE_SUPABASE_URL. Check your .env file in the project root."
  );
}

if (!supabaseKey) {
  console.warn(
    "Missing VITE_SUPABASE_PUBLISHABLE_KEY. Check your .env file in the project root."
  );
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export const REQUEST_ATTACHMENTS_BUCKET = "request-attachments";

export const REQUEST_TABLE = "requests";
export const CALENDAR_NOTES_TABLE = "calendar_notes";