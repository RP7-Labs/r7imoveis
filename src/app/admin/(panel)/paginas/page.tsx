import { SettingsForm } from "@/components/admin/settings-form";
import { createClient } from "@/lib/supabase/server";
import { getSiteSettings } from "@/lib/settings";
import type { SiteSettings } from "@/lib/types";

export const metadata = { title: "Conteúdo do site" };

export default async function AdminPaginasPage() {
  // Busca direta (sem cache) para sempre exibir o valor atual no admin.
  const supabase = await createClient();
  const { data } = await supabase
    .from("site_settings")
    .select("*")
    .eq("id", 1)
    .maybeSingle();

  const settings = (data ?? (await getSiteSettings())) as SiteSettings;

  return (
    <div>
      <h1 className="font-display text-2xl text-petrol-900">Conteúdo do site</h1>
      <p className="mb-6 mt-1 text-sm text-graphite-500">
        Textos da página inicial, seção institucional e rodapé.
      </p>
      <SettingsForm settings={settings} sections={["conteudo"]} />
    </div>
  );
}
