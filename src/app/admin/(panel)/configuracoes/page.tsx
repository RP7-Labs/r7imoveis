import { SettingsForm } from "@/components/admin/settings-form";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getSiteSettings } from "@/lib/settings";
import type { SiteSettings } from "@/lib/types";

export const metadata = { title: "Configurações" };

export default async function AdminConfiguracoesPage() {
  await requireAdmin();
  const supabase = await createClient();
  const { data } = await supabase
    .from("site_settings")
    .select("*")
    .eq("id", 1)
    .maybeSingle();

  const settings = (data ?? (await getSiteSettings())) as SiteSettings;

  return (
    <div>
      <h1 className="font-display text-2xl text-petrol-900">Configurações</h1>
      <p className="mb-6 mt-1 text-sm text-graphite-500">
        Dados de contato, WhatsApp, redes sociais, identidade visual e SEO.
        Somente administradores podem alterar estas informações.
      </p>
      <SettingsForm
        settings={settings}
        sections={["contato", "marca", "seo"]}
      />
    </div>
  );
}
