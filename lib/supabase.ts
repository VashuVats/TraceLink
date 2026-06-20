import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
// service role key, used only in server-side API routes that need to bypass
// row-level security (e.g. writing AI-scored leads). Never expose to client.
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const isSupabaseConfigured = Boolean(url && anonKey);

/** Client-safe Supabase client (anon key). Used in client components. */
export const supabase =
  url && anonKey ? createClient(url, anonKey) : null;

/** Server-only Supabase client (service role). Used in API routes. */
export function supabaseAdmin() {
  if (!url || !(serviceKey || anonKey)) return null;
  return createClient(url, serviceKey || anonKey!, {
    auth: { persistSession: false },
  });
}
