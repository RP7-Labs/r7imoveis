"use server";

import { updateTag } from "next/cache";
import { requireAdmin, requireStaff } from "@/lib/auth";
import { STORAGE_BUCKETS } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils";
import {
  propertySchema,
  settingsSchema,
  type PropertyInput,
  type SettingsInput,
} from "@/lib/validation";
import type { LeadStatus } from "@/lib/types";

type ActionResult =
  | { ok: true; id?: string }
  | { ok: false; error: string };

// ---------------------------------------------------------------------------
// Imóveis
// ---------------------------------------------------------------------------

async function uniqueSlug(
  supabase: Awaited<ReturnType<typeof createClient>>,
  base: string,
  excludeId?: string,
): Promise<string> {
  let candidate = base;
  for (let i = 2; i <= 20; i++) {
    let q = supabase.from("properties").select("id").eq("slug", candidate);
    if (excludeId) q = q.neq("id", excludeId);
    const { data } = await q.maybeSingle();
    if (!data) return candidate;
    candidate = `${base}-${i}`;
  }
  return `${base}-${Date.now().toString(36)}`;
}

export async function saveProperty(
  raw: PropertyInput & { id?: string },
): Promise<ActionResult> {
  const session = await requireStaff();
  const supabase = await createClient();

  const parsed = propertySchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Dados inválidos.",
    };
  }
  const data = parsed.data;

  const baseSlug =
    data.slug ||
    slugify(
      [data.title, data.neighborhood ?? data.city].filter(Boolean).join("-"),
    );
  const slug = await uniqueSlug(supabase, baseSlug, raw.id);

  const payload = {
    title: data.title,
    slug,
    reference_code: data.reference_code,
    excerpt: data.excerpt ?? null,
    description: data.description ?? null,
    property_type: data.property_type,
    purpose: data.purpose,
    status: data.status,
    featured: data.featured,
    is_launch: data.is_launch,
    price: data.price ?? null,
    currency: data.currency || "BRL",
    condo_fee: data.condo_fee ?? null,
    iptu: data.iptu ?? null,
    iptu_periodicity: data.iptu_periodicity ?? null,
    zip_code: data.zip_code ?? null,
    street: data.street ?? null,
    street_number: data.street_number ?? null,
    complement: data.complement ?? null,
    neighborhood: data.neighborhood ?? null,
    city: data.city,
    state: data.state.toUpperCase(),
    latitude: data.latitude ?? null,
    longitude: data.longitude ?? null,
    address_visibility: data.address_visibility,
    built_area: data.built_area ?? null,
    total_area: data.total_area ?? null,
    bedrooms: data.bedrooms ?? null,
    suites: data.suites ?? null,
    bathrooms: data.bathrooms ?? null,
    garage_spaces: data.garage_spaces ?? null,
    floor: data.floor ?? null,
    features: data.features,
    seo_title: data.seo_title ?? null,
    seo_description: data.seo_description ?? null,
  };

  if (raw.id) {
    const { data: current } = await supabase
      .from("properties")
      .select("status, published_at")
      .eq("id", raw.id)
      .single();

    const published_at =
      data.status === "published" && !current?.published_at
        ? new Date().toISOString()
        : current?.published_at ?? null;

    const { error } = await supabase
      .from("properties")
      .update({ ...payload, published_at })
      .eq("id", raw.id);

    if (error) return { ok: false, error: translateDbError(error.message) };
    updateTag("properties");
    updateTag(`property-${slug}`);
    return { ok: true, id: raw.id };
  }

  const { data: inserted, error } = await supabase
    .from("properties")
    .insert({
      ...payload,
      created_by: session.userId,
      published_at:
        data.status === "published" ? new Date().toISOString() : null,
    })
    .select("id")
    .single();

  if (error) return { ok: false, error: translateDbError(error.message) };
  updateTag("properties");
  return { ok: true, id: inserted.id };
}

export async function setPropertyStatus(
  id: string,
  status: "draft" | "published" | "sold" | "rented" | "archived",
): Promise<ActionResult> {
  await requireStaff();
  const supabase = await createClient();

  const patch: Record<string, unknown> = { status };
  if (status === "published") {
    const { data: current } = await supabase
      .from("properties")
      .select("published_at, slug")
      .eq("id", id)
      .single();
    if (!current?.published_at) {
      patch.published_at = new Date().toISOString();
    }
  }

  const { error } = await supabase
    .from("properties")
    .update(patch)
    .eq("id", id);

  if (error) return { ok: false, error: error.message };
  updateTag("properties");
  return { ok: true };
}

export async function deleteProperty(id: string): Promise<ActionResult> {
  await requireAdmin();
  const supabase = await createClient();

  const { data: images } = await supabase
    .from("property_images")
    .select("storage_path")
    .eq("property_id", id);

  if (images?.length) {
    await supabase.storage
      .from(STORAGE_BUCKETS.propertyImages)
      .remove(images.map((i) => i.storage_path));
  }

  const { error } = await supabase.from("properties").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  updateTag("properties");
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Imagens
// ---------------------------------------------------------------------------

export async function registerPropertyImage(
  propertyId: string,
  storagePath: string,
  alt?: string,
): Promise<ActionResult> {
  await requireStaff();
  const supabase = await createClient();

  const { data: last } = await supabase
    .from("property_images")
    .select("position")
    .eq("property_id", propertyId)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: anyImage } = await supabase
    .from("property_images")
    .select("id")
    .eq("property_id", propertyId)
    .limit(1);

  const { data: inserted, error } = await supabase
    .from("property_images")
    .insert({
      property_id: propertyId,
      storage_path: storagePath,
      alt: alt ?? null,
      position: (last?.position ?? -1) + 1,
      is_cover: (anyImage?.length ?? 0) === 0,
    })
    .select("id")
    .single();

  if (error) return { ok: false, error: error.message };
  updateTag("properties");
  return { ok: true, id: inserted.id };
}

export async function deletePropertyImage(
  imageId: string,
): Promise<ActionResult> {
  await requireStaff();
  const supabase = await createClient();

  const { data: image } = await supabase
    .from("property_images")
    .select("storage_path, is_cover, property_id")
    .eq("id", imageId)
    .single();
  if (!image) return { ok: false, error: "Imagem não encontrada." };

  await supabase.storage
    .from(STORAGE_BUCKETS.propertyImages)
    .remove([image.storage_path]);

  const { error } = await supabase
    .from("property_images")
    .delete()
    .eq("id", imageId);
  if (error) return { ok: false, error: error.message };

  // Se era a capa, promove a primeira restante.
  if (image.is_cover) {
    const { data: next } = await supabase
      .from("property_images")
      .select("id")
      .eq("property_id", image.property_id)
      .order("position")
      .limit(1)
      .maybeSingle();
    if (next) {
      await supabase
        .from("property_images")
        .update({ is_cover: true })
        .eq("id", next.id);
    }
  }

  updateTag("properties");
  return { ok: true };
}

export async function setCoverImage(imageId: string): Promise<ActionResult> {
  await requireStaff();
  const supabase = await createClient();

  const { data: image } = await supabase
    .from("property_images")
    .select("property_id")
    .eq("id", imageId)
    .single();
  if (!image) return { ok: false, error: "Imagem não encontrada." };

  await supabase
    .from("property_images")
    .update({ is_cover: false })
    .eq("property_id", image.property_id)
    .eq("is_cover", true);

  const { error } = await supabase
    .from("property_images")
    .update({ is_cover: true })
    .eq("id", imageId);

  if (error) return { ok: false, error: error.message };
  updateTag("properties");
  return { ok: true };
}

export async function movePropertyImage(
  imageId: string,
  direction: "up" | "down",
): Promise<ActionResult> {
  await requireStaff();
  const supabase = await createClient();

  const { data: image } = await supabase
    .from("property_images")
    .select("property_id, position")
    .eq("id", imageId)
    .single();
  if (!image) return { ok: false, error: "Imagem não encontrada." };

  const { data: siblings } = await supabase
    .from("property_images")
    .select("id, position")
    .eq("property_id", image.property_id)
    .order("position");

  const ordered = siblings ?? [];
  const idx = ordered.findIndex((i) => i.id === imageId);
  const swapIdx = direction === "up" ? idx - 1 : idx + 1;
  if (idx < 0 || swapIdx < 0 || swapIdx >= ordered.length) {
    return { ok: true };
  }

  const a = ordered[idx];
  const b = ordered[swapIdx];
  await supabase
    .from("property_images")
    .update({ position: b.position })
    .eq("id", a.id);
  await supabase
    .from("property_images")
    .update({ position: a.position })
    .eq("id", b.id);

  updateTag("properties");
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Integração DWV
// ---------------------------------------------------------------------------

export async function syncDwvNow(): Promise<
  { ok: true; summary: string } | { ok: false; error: string }
> {
  await requireStaff();
  try {
    const { createServiceClient } = await import("@/lib/supabase/service");
    const { syncDwv } = await import("@/lib/dwv");
    const r = await syncDwv(createServiceClient());
    updateTag("properties");
    return {
      ok: true,
      summary: `${r.upserted} de ${r.total} imóveis sincronizados, ${r.imagesLinked} fotos vinculadas, ${r.archived} arquivados`,
    };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Erro ao sincronizar.",
    };
  }
}

// ---------------------------------------------------------------------------
// Leads
// ---------------------------------------------------------------------------

export async function updateLead(
  id: string,
  patch: { status?: LeadStatus; notes?: string },
): Promise<ActionResult> {
  await requireStaff();
  const supabase = await createClient();

  const { error } = await supabase.from("leads").update(patch).eq("id", id);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function deleteLead(id: string): Promise<ActionResult> {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("leads").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Configurações
// ---------------------------------------------------------------------------

export async function saveSettings(raw: SettingsInput): Promise<ActionResult> {
  await requireAdmin();
  const supabase = await createClient();

  const parsed = settingsSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Dados inválidos.",
    };
  }

  const { error } = await supabase
    .from("site_settings")
    .update(parsed.data)
    .eq("id", 1);

  if (error) return { ok: false, error: error.message };
  updateTag("site-settings");
  return { ok: true };
}

// ---------------------------------------------------------------------------

function translateDbError(message: string): string {
  if (message.includes("properties_slug_key")) {
    return "Já existe um imóvel com este slug.";
  }
  if (message.includes("properties_reference_code_key")) {
    return "Já existe um imóvel com este código de referência.";
  }
  return `Erro ao salvar: ${message}`;
}
