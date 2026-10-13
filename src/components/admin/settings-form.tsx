"use client";

import { Loader2, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { saveSettings } from "@/app/admin/(panel)/actions";
import { AssetUpload } from "@/components/admin/asset-upload";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/input";
import type { SiteSettings } from "@/lib/types";

export type SettingsSection = "conteudo" | "contato" | "marca" | "seo";

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl bg-white p-6 shadow-soft">
      <h2 className="mb-5 font-serif text-lg text-petrol-900">{title}</h2>
      {children}
    </section>
  );
}

export function SettingsForm({
  settings,
  sections,
}: {
  settings: SiteSettings;
  sections: SettingsSection[];
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<
    { ok: true } | { ok: false; error: string } | null
  >(null);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);

    const fd = new FormData(e.currentTarget);
    const raw: Record<string, unknown> = {};
    for (const [k, v] of fd.entries()) raw[k] = v;

    // Campos não exibidos nesta página preservam o valor atual.
    const merged = { ...settings, ...raw, differentials: raw.differentials };

    const result = await saveSettings(
      merged as Parameters<typeof saveSettings>[0],
    );
    setSaving(false);

    if (!result.ok) {
      setFeedback({ ok: false, error: result.error ?? "Erro ao salvar." });
      return;
    }
    setFeedback({ ok: true });
    router.refresh();
  }

  const has = (s: SettingsSection) => sections.includes(s);

  const differentialsText = (settings.differentials ?? [])
    .map((d) => `${d.title} | ${d.description}`)
    .join("\n");

  return (
    <form onSubmit={submit} className="space-y-6">
      {feedback?.ok === false && (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {feedback.error}
        </p>
      )}
      {feedback?.ok === true && (
        <p role="status" className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          Configurações salvas com sucesso.
        </p>
      )}

      {has("conteudo") && (
        <>
          <Section title="Página inicial — hero">
            <div className="grid gap-4">
              <Field label="Título principal">
                <Input name="hero_title" maxLength={200} defaultValue={settings.hero_title ?? ""} />
              </Field>
              <Field label="Subtítulo">
                <Textarea name="hero_subtitle" rows={2} maxLength={400} defaultValue={settings.hero_subtitle ?? ""} />
              </Field>
              <Field label="Chamada (tagline)">
                <Input name="tagline" maxLength={200} defaultValue={settings.tagline ?? ""} />
              </Field>
            </div>
          </Section>

          <Section title="Institucional">
            <div className="grid gap-4">
              <Field label="Título da seção 'A R7'">
                <Input name="about_title" maxLength={200} defaultValue={settings.about_title ?? ""} />
              </Field>
              <Field label="Texto institucional" hint="Parágrafos separados por linha em branco">
                <Textarea name="about_text" rows={6} maxLength={5000} defaultValue={settings.about_text ?? ""} />
              </Field>
              <Field
                label="Diferenciais"
                hint="Um por linha, no formato: Título | Descrição"
              >
                <Textarea
                  name="differentials_text"
                  rows={5}
                  defaultValue={differentialsText}
                  onChange={(e) => {
                    const hidden = e.currentTarget.form?.elements.namedItem(
                      "differentials",
                    );
                    if (hidden instanceof HTMLInputElement) {
                      hidden.value = JSON.stringify(
                        e.currentTarget.value
                          .split("\n")
                          .map((line) => line.trim())
                          .filter(Boolean)
                          .map((line) => {
                            const [title, ...rest] = line.split("|");
                            return {
                              title: title.trim(),
                              description: rest.join("|").trim(),
                            };
                          }),
                      );
                    }
                  }}
                />
                <input
                  type="hidden"
                  name="differentials"
                  defaultValue={JSON.stringify(settings.differentials ?? [])}
                />
              </Field>
              <Field label="Texto do rodapé">
                <Input name="footer_text" maxLength={400} defaultValue={settings.footer_text ?? ""} />
              </Field>
            </div>
          </Section>
        </>
      )}

      {has("contato") && (
        <Section title="Canais de atendimento">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nome da empresa">
              <Input name="company_name" required maxLength={160} defaultValue={settings.company_name} />
            </Field>
            <Field label="Telefone comercial">
              <Input name="phone" maxLength={30} defaultValue={settings.phone ?? ""} placeholder="(47) 3000-0000" />
            </Field>
            <Field
              label="WhatsApp (somente números)"
              hint="Código do país + DDD + número. Ex: 5547999998888"
            >
              <Input name="whatsapp_number" maxLength={20} defaultValue={settings.whatsapp_number ?? ""} placeholder="5547999998888" />
            </Field>
            <Field label="Mensagem padrão do WhatsApp" hint="Opcional — texto inicial ao abrir a conversa">
              <Input name="whatsapp_message" maxLength={400} defaultValue={settings.whatsapp_message ?? ""} />
            </Field>
            <Field label="E-mail de contato">
              <Input name="email" type="email" maxLength={160} defaultValue={settings.email ?? ""} />
            </Field>
            <Field label="Horário de atendimento">
              <Input name="business_hours" maxLength={160} defaultValue={settings.business_hours ?? ""} placeholder="Seg a sex, 9h às 18h" />
            </Field>
            <Field label="Endereço" className="sm:col-span-2">
              <Input name="address" maxLength={240} defaultValue={settings.address ?? ""} />
            </Field>
          </div>
        </Section>
      )}

      {has("contato") && (
        <Section title="Redes sociais">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Instagram (URL completa)">
              <Input name="instagram_url" type="url" maxLength={240} defaultValue={settings.instagram_url ?? ""} placeholder="https://www.instagram.com/r7imoveissc/" />
            </Field>
            <Field label="Facebook">
              <Input name="facebook_url" type="url" maxLength={240} defaultValue={settings.facebook_url ?? ""} />
            </Field>
            <Field label="LinkedIn">
              <Input name="linkedin_url" type="url" maxLength={240} defaultValue={settings.linkedin_url ?? ""} />
            </Field>
            <Field label="YouTube">
              <Input name="youtube_url" type="url" maxLength={240} defaultValue={settings.youtube_url ?? ""} />
            </Field>
          </div>
        </Section>
      )}

      {has("marca") && (
        <Section title="Identidade visual">
          <div className="space-y-6">
            <Field label="Logomarca" hint="SVG ou PNG com fundo transparente. Tem prioridade sobre /brand/logo.svg">
              <AssetUpload name="logo_path" defaultValue={settings.logo_path} label="Logo" />
            </Field>
            <Field label="Imagem do hero da home" hint="Foto ampla em boa resolução (mín. 1920px)">
              <AssetUpload name="hero_image_path" defaultValue={settings.hero_image_path} label="Hero" />
            </Field>
          </div>
        </Section>
      )}

      {has("seo") && (
        <Section title="SEO padrão">
          <div className="grid gap-4">
            <Field label="Título SEO padrão">
              <Input name="seo_title" maxLength={200} defaultValue={settings.seo_title ?? ""} />
            </Field>
            <Field label="Descrição SEO padrão">
              <Textarea name="seo_description" rows={2} maxLength={300} defaultValue={settings.seo_description ?? ""} />
            </Field>
            <Field label="Imagem Open Graph (1200×630)">
              <AssetUpload name="seo_og_image_path" defaultValue={settings.seo_og_image_path} label="OG" />
            </Field>
          </div>
        </Section>
      )}

      {/* Preserva campos não editados nesta página */}
      {!has("conteudo") && (
        <>
          <input type="hidden" name="hero_title" value={settings.hero_title ?? ""} />
          <input type="hidden" name="hero_subtitle" value={settings.hero_subtitle ?? ""} />
          <input type="hidden" name="tagline" value={settings.tagline ?? ""} />
          <input type="hidden" name="about_title" value={settings.about_title ?? ""} />
          <input type="hidden" name="about_text" value={settings.about_text ?? ""} />
          <input type="hidden" name="footer_text" value={settings.footer_text ?? ""} />
          <input type="hidden" name="differentials" value={JSON.stringify(settings.differentials ?? [])} />
        </>
      )}
      {!has("contato") && (
        <>
          <input type="hidden" name="company_name" value={settings.company_name} />
          <input type="hidden" name="phone" value={settings.phone ?? ""} />
          <input type="hidden" name="whatsapp_number" value={settings.whatsapp_number ?? ""} />
          <input type="hidden" name="whatsapp_message" value={settings.whatsapp_message ?? ""} />
          <input type="hidden" name="email" value={settings.email ?? ""} />
          <input type="hidden" name="business_hours" value={settings.business_hours ?? ""} />
          <input type="hidden" name="address" value={settings.address ?? ""} />
          <input type="hidden" name="instagram_url" value={settings.instagram_url ?? ""} />
          <input type="hidden" name="facebook_url" value={settings.facebook_url ?? ""} />
          <input type="hidden" name="linkedin_url" value={settings.linkedin_url ?? ""} />
          <input type="hidden" name="youtube_url" value={settings.youtube_url ?? ""} />
        </>
      )}
      {!has("marca") && (
        <>
          <input type="hidden" name="logo_path" value={settings.logo_path ?? ""} />
          <input type="hidden" name="hero_image_path" value={settings.hero_image_path ?? ""} />
        </>
      )}
      {!has("seo") && (
        <>
          <input type="hidden" name="seo_title" value={settings.seo_title ?? ""} />
          <input type="hidden" name="seo_description" value={settings.seo_description ?? ""} />
          <input type="hidden" name="seo_og_image_path" value={settings.seo_og_image_path ?? ""} />
        </>
      )}

      <Button type="submit" disabled={saving}>
        {saving ? (
          <Loader2 className="size-4 animate-spin" aria-hidden />
        ) : (
          <Save className="size-4" aria-hidden />
        )}
        {saving ? "Salvando…" : "Salvar alterações"}
      </Button>
    </form>
  );
}
