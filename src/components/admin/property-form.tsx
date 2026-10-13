"use client";

import { Loader2, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { saveProperty } from "@/app/admin/(panel)/actions";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/input";
import {
  BRAZILIAN_STATES,
  PROPERTY_PURPOSES,
  PROPERTY_STATUSES,
  PROPERTY_TYPES,
} from "@/lib/constants";
import { slugify } from "@/lib/utils";
import type { Property } from "@/lib/types";

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl bg-white p-6 shadow-soft">
      <h2 className="mb-5 font-display text-lg text-petrol-900">{title}</h2>
      {children}
    </section>
  );
}

const grid = "grid gap-4 sm:grid-cols-2 lg:grid-cols-3";

export function PropertyForm({ property }: { property?: Property }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState<null | "draft" | "save">(null);
  const [slugEdited, setSlugEdited] = useState(Boolean(property));

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const submitter = (e.nativeEvent as SubmitEvent)
      .submitter as HTMLButtonElement | null;
    const intent = submitter?.value === "draft" ? "draft" : "save";

    setSaving(intent);
    setError(null);

    const fd = new FormData(form);
    const raw: Record<string, unknown> = { id: property?.id };
    for (const [k, v] of fd.entries()) raw[k] = v;
    raw.featured = fd.get("featured") === "on";
    raw.features = String(fd.get("features") ?? "");
    if (intent === "draft") raw.status = "draft";

    const result = await saveProperty(
      raw as Parameters<typeof saveProperty>[0],
    );

    if (!result.ok) {
      setSaving(null);
      setError(result.error ?? "Erro ao salvar.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    router.push(`/admin/imoveis/${result.id}?saved=1`);
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      {error && (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <Section title="Dados gerais">
        <div className={grid}>
          <Field label="Título" className="sm:col-span-2">
            <Input
              name="title"
              required
              maxLength={160}
              defaultValue={property?.title}
              onChange={(e) => {
                if (!slugEdited) {
                  const slugInput =
                    e.currentTarget.form?.elements.namedItem("slug");
                  if (slugInput instanceof HTMLInputElement) {
                    slugInput.value = slugify(e.currentTarget.value);
                  }
                }
              }}
            />
          </Field>
          <Field label="Slug" hint="URL amigável — gerada automaticamente se vazio">
            <Input
              name="slug"
              maxLength={180}
              defaultValue={property?.slug}
              onChange={() => setSlugEdited(true)}
            />
          </Field>
          <Field label="Código de referência">
            <Input
              name="reference_code"
              required
              maxLength={40}
              defaultValue={property?.reference_code}
              placeholder="Ex: R7-001"
            />
          </Field>
          <Field label="Tipo de imóvel">
            <Select
              name="property_type"
              required
              defaultValue={property?.property_type ?? "apartamento"}
            >
              {PROPERTY_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Finalidade">
            <Select
              name="purpose"
              required
              defaultValue={property?.purpose ?? "venda"}
            >
              {PROPERTY_PURPOSES.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Status">
            <Select
              name="status"
              required
              defaultValue={property?.status ?? "draft"}
            >
              {PROPERTY_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Descrição resumida" className="sm:col-span-2 lg:col-span-3">
            <Input
              name="excerpt"
              maxLength={300}
              defaultValue={property?.excerpt ?? ""}
            />
          </Field>
          <Field label="Descrição completa" className="sm:col-span-2 lg:col-span-3">
            <Textarea
              name="description"
              rows={6}
              maxLength={10000}
              defaultValue={property?.description ?? ""}
            />
          </Field>
          <label className="flex items-center gap-2.5 text-sm text-graphite-600">
            <input
              type="checkbox"
              name="featured"
              defaultChecked={property?.featured}
              className="size-4 rounded border-graphite-300 accent-petrol-500"
            />
            Imóvel em destaque na home
          </label>
        </div>
      </Section>

      <Section title="Dados comerciais">
        <div className={grid}>
          <Field label="Preço (R$)" hint="Vazio = sob consulta">
            <Input
              name="price"
              type="number"
              min={0}
              step="0.01"
              defaultValue={property?.price ?? ""}
            />
          </Field>
          <Field label="Condomínio (R$/mês)">
            <Input
              name="condo_fee"
              type="number"
              min={0}
              step="0.01"
              defaultValue={property?.condo_fee ?? ""}
            />
          </Field>
          <Field label="IPTU (R$)">
            <Input
              name="iptu"
              type="number"
              min={0}
              step="0.01"
              defaultValue={property?.iptu ?? ""}
            />
          </Field>
          <Field label="Periodicidade do IPTU">
            <Select
              name="iptu_periodicity"
              defaultValue={property?.iptu_periodicity ?? ""}
            >
              <option value="">—</option>
              <option value="mensal">Mensal</option>
              <option value="anual">Anual</option>
            </Select>
          </Field>
          <input type="hidden" name="currency" value="BRL" />
        </div>
      </Section>

      <Section title="Localização">
        <div className={grid}>
          <Field label="CEP">
            <Input name="zip_code" maxLength={12} defaultValue={property?.zip_code ?? ""} />
          </Field>
          <Field label="Endereço" className="sm:col-span-2">
            <Input name="street" maxLength={160} defaultValue={property?.street ?? ""} />
          </Field>
          <Field label="Número">
            <Input name="street_number" maxLength={20} defaultValue={property?.street_number ?? ""} />
          </Field>
          <Field label="Complemento">
            <Input name="complement" maxLength={80} defaultValue={property?.complement ?? ""} />
          </Field>
          <Field label="Bairro">
            <Input name="neighborhood" maxLength={120} defaultValue={property?.neighborhood ?? ""} />
          </Field>
          <Field label="Cidade">
            <Input name="city" required maxLength={120} defaultValue={property?.city ?? ""} />
          </Field>
          <Field label="Estado">
            <Select name="state" defaultValue={property?.state ?? "SC"}>
              {BRAZILIAN_STATES.map((uf) => (
                <option key={uf} value={uf}>
                  {uf}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Exibição do endereço" hint="Como a localização aparece no site">
            <Select
              name="address_visibility"
              defaultValue={property?.address_visibility ?? "approximate"}
            >
              <option value="approximate">Aproximada (bairro/cidade)</option>
              <option value="full">Endereço completo</option>
              <option value="hidden">Ocultar localização</option>
            </Select>
          </Field>
          <Field label="Latitude" hint="Opcional, para mapa preciso">
            <Input name="latitude" type="number" step="any" defaultValue={property?.latitude ?? ""} />
          </Field>
          <Field label="Longitude" hint="Opcional">
            <Input name="longitude" type="number" step="any" defaultValue={property?.longitude ?? ""} />
          </Field>
        </div>
      </Section>

      <Section title="Características">
        <div className={grid}>
          <Field label="Área construída (m²)">
            <Input name="built_area" type="number" min={0} step="0.01" defaultValue={property?.built_area ?? ""} />
          </Field>
          <Field label="Área total (m²)">
            <Input name="total_area" type="number" min={0} step="0.01" defaultValue={property?.total_area ?? ""} />
          </Field>
          <Field label="Dormitórios">
            <Input name="bedrooms" type="number" min={0} max={50} defaultValue={property?.bedrooms ?? ""} />
          </Field>
          <Field label="Suítes">
            <Input name="suites" type="number" min={0} max={50} defaultValue={property?.suites ?? ""} />
          </Field>
          <Field label="Banheiros">
            <Input name="bathrooms" type="number" min={0} max={50} defaultValue={property?.bathrooms ?? ""} />
          </Field>
          <Field label="Vagas de garagem">
            <Input name="garage_spaces" type="number" min={0} max={50} defaultValue={property?.garage_spaces ?? ""} />
          </Field>
          <Field label="Andar">
            <Input name="floor" type="number" defaultValue={property?.floor ?? ""} />
          </Field>
          <Field
            label="Características adicionais"
            hint="Uma por linha. Ex: sacada, churrasqueira, mobiliado"
            className="sm:col-span-2 lg:col-span-3"
          >
            <Textarea
              name="features"
              rows={4}
              defaultValue={
                Array.isArray(property?.features)
                  ? property.features.join("\n")
                  : ""
              }
            />
          </Field>
        </div>
      </Section>

      <Section title="SEO (opcional)">
        <div className="grid gap-4">
          <Field label="Título SEO" hint="Vazio = gerado a partir do título e localização">
            <Input name="seo_title" maxLength={200} defaultValue={property?.seo_title ?? ""} />
          </Field>
          <Field label="Descrição SEO">
            <Textarea name="seo_description" rows={2} maxLength={300} defaultValue={property?.seo_description ?? ""} />
          </Field>
        </div>
      </Section>

      <div className="flex flex-wrap gap-3">
        <Button type="submit" name="intent" value="save" disabled={saving != null}>
          {saving === "save" ? (
            <Loader2 className="size-4 animate-spin" aria-hidden />
          ) : (
            <Save className="size-4" aria-hidden />
          )}
          Salvar
        </Button>
        <Button
          type="submit"
          name="intent"
          value="draft"
          variant="outline"
          disabled={saving != null}
        >
          {saving === "draft" && (
            <Loader2 className="size-4 animate-spin" aria-hidden />
          )}
          Salvar como rascunho
        </Button>
      </div>
    </form>
  );
}
