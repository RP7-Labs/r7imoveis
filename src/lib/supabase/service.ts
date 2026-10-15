import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Cliente com service role — bypassa RLS. SOMENTE server-side
 * (sync, rotas internas). Nunca importar em client components.
 */
export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Supabase service credentials ausentes.");
  }
  return createSupabaseClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
