import { createClient } from "@supabase/supabase-js";

export function createServerSupabase() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error(
      "SUPABASE_URL is not configured. Please set it in your environment variables."
    );
  }

  if (!supabaseKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is not configured. Please set it in your environment variables."
    );
  }

  return createClient(supabaseUrl, supabaseKey);
}
