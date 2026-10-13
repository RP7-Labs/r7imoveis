import { createClient } from "@supabase/supabase-js";

/**
 * Cliente público (chave anon, sem cookies) — seguro para uso dentro de
 * funções com 'use cache', pois não acessa APIs de request.
 * A leitura pública é controlada pelas políticas de RLS.
 */
export function createPublicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } },
  );
}
