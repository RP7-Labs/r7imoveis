/**
 * Integração DWV (api.dwvapp.com.br) — catálogo de imóveis selecionados
 * pela imobiliária para publicação no site.
 * Auth: header `token` gerado no sistema de Integração DWV.
 * Rate limit: 100 req/min.
 */

const DWV_BASE_URL = "https://api.dwvapp.com.br";

// ---------------------------------------------------------------------------
// Tipos (subset do que a API retorna — campos que usamos)
// ---------------------------------------------------------------------------

interface DwvAddress {
  street_name?: string | null;
  street_number?: string | null;
  neighborhood?: string | null;
  complement?: string | null;
  zip_code?: string | null;
  city?: string | null;
  state?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

interface DwvImage {
  url?: string | null;
  sizes?: Record<string, string | undefined> | null;
}

interface DwvUnit {
  title?: string | null;
  price?: string | null;
  parking_spaces?: number | null;
  dorms?: number | null;
  suites?: number | null;
  bathroom?: number | null;
  private_area?: string | null;
  total_area?: string | null;
  rent?: boolean | null;
  floor_plan?: { category?: { title?: string; tag?: string } | null } | null;
}

interface DwvBuilding {
  title?: string | null;
  gallery?: DwvImage[] | DwvImage | null;
  cover?: DwvImage | null;
  address?: DwvAddress | null;
  features?: { type?: string; tags?: string[] }[] | null;
}

interface DwvThirdParty {
  title?: string | null;
  price?: string | null;
  dorms?: number | null;
  suites?: number | null;
  bathroom?: number | null;
  parking_spaces?: number | null;
  private_area?: string | null;
  total_area?: string | null;
  rent?: boolean | null;
  property_type?: string | null;
  category?: { title?: string; tag?: string } | null;
  gallery?: DwvImage[] | DwvImage | null;
  cover?: DwvImage | null;
  address?: DwvAddress | null;
  features?: { type?: string; tags?: string[] }[] | null;
}

export interface DwvProperty {
  id: number;
  title?: string | null;
  description?: string | null;
  status?: string | null;
  address_display_type?: string | null;
  construction_stage?: string | null;
  unit?: DwvUnit | null;
  building?: DwvBuilding | null;
  third_party_property?: DwvThirdParty | null;
}

interface DwvListResponse {
  total: number;
  perPage: number;
  page: number;
  lastPage: number;
  data: DwvProperty[];
}

// ---------------------------------------------------------------------------
// Fetch
// ---------------------------------------------------------------------------

function getToken(): string {
  const token = process.env.DWV_API_TOKEN;
  if (!token) throw new Error("DWV_API_TOKEN não configurado.");
  return token;
}

async function dwvFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${DWV_BASE_URL}${path}`, {
    headers: { token: getToken() },
    cache: "no-store",
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`DWV ${path} → ${res.status}: ${body.slice(0, 200)}`);
  }
  return res.json() as Promise<T>;
}

/** Busca todas as propriedades selecionadas para integração (paginado). */
export async function fetchAllDwvProperties(): Promise<DwvProperty[]> {
  const all: DwvProperty[] = [];
  let page = 1;
  for (;;) {
    const res = await dwvFetch<DwvListResponse>(
      `/integration/properties?limit=50&page=${page}`,
    );
    all.push(...(res.data ?? []));
    if (page >= (res.lastPage ?? 1)) break;
    page++;
    if (page > 50) break; // safety
  }
  return all;
}

// ---------------------------------------------------------------------------
// Mapeamento DWV → properties (nosso schema)
// ---------------------------------------------------------------------------

const TYPE_MAP: Record<string, string> = {
  apartment: "apartamento",
  apartamento: "apartamento",
  house: "casa",
  casa: "casa",
  penthouse: "cobertura",
  cobertura: "cobertura",
  coverage: "cobertura",
  land: "terreno",
  terreno: "terreno",
  studio: "studio",
  kitnet: "studio",
};

function num(v: string | number | null | undefined): number | null {
  if (v == null || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function imageUrl(img: DwvImage | null | undefined): string | null {
  if (!img) return null;
  return img.sizes?.xfullhd ?? img.sizes?.large ?? img.url ?? null;
}

function galleryUrls(
  gallery: DwvImage[] | DwvImage | null | undefined,
): string[] {
  if (!gallery) return [];
  const list = Array.isArray(gallery) ? gallery : [gallery];
  return list.map(imageUrl).filter((u): u is string => Boolean(u));
}

export interface MappedDwvProperty {
  row: Record<string, unknown>;
  imageUrls: string[];
}

export function mapDwvProperty(item: DwvProperty): MappedDwvProperty | null {
  const tpp = item.third_party_property;
  const unit = item.unit;
  const building = item.building;

  const subject = tpp ?? unit;
  const host = tpp ?? building;
  if (!subject && !host) return null;

  const address = host?.address ?? null;
  const city = address?.city?.trim();
  const state = address?.state?.trim().toUpperCase();

  const typeTag =
    tpp?.category?.tag ??
    tpp?.category?.title ??
    unit?.floor_plan?.category?.tag ??
    unit?.floor_plan?.category?.title ??
    "outro";
  const propertyType =
    TYPE_MAP[typeTag.toLowerCase()] ??
    TYPE_MAP[typeTag.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")] ??
    "outro";

  const rent = subject?.rent === true;
  const price = num(subject?.price);

  const title =
    [building?.title, unit?.title].filter(Boolean).join(" — ").trim() ||
    tpp?.title?.trim() ||
    item.title?.trim() ||
    `Imóvel DWV ${item.id}`;

  const features = (host?.features ?? [])
    .flatMap((f) => f.tags ?? [])
    .filter(Boolean) as string[];

  const imageUrls = [
    imageUrl(host?.cover ?? null),
    ...galleryUrls(host?.gallery),
  ].filter((u): u is string => Boolean(u));
  const uniqueImages = [...new Set(imageUrls)];

  const description = item.description?.replace(/\\n/g, "\n").trim() || null;

  return {
    imageUrls: uniqueImages,
    row: {
      dwv_id: String(item.id),
      dwv_synced_at: new Date().toISOString(),
      title,
      reference_code: `DWV-${item.id}`,
      excerpt: description ? description.slice(0, 300) : null,
      description,
      property_type: propertyType,
      purpose: rent ? "locacao" : "venda",
      status: item.status === "active" ? "published" : "draft",
      is_launch: Boolean(unit),
      price,
      currency: "BRL",
      zip_code: address?.zip_code ?? null,
      street: address?.street_name ?? null,
      street_number: address?.street_number ?? null,
      complement:
        address?.complement && address.complement !== "S/ Complemento"
          ? address.complement
          : null,
      neighborhood: address?.neighborhood ?? null,
      city: city || "Balneário Camboriú",
      state: state || "SC",
      latitude: address?.latitude ?? null,
      longitude: address?.longitude ?? null,
      address_visibility:
        item.address_display_type === "full_address" ? "full" : "approximate",
      built_area: num(subject?.private_area),
      total_area: num(subject?.total_area),
      bedrooms: subject?.dorms ?? null,
      suites: subject?.suites ?? null,
      bathrooms: subject?.bathroom ?? null,
      garage_spaces: subject?.parking_spaces ?? null,
      features,
      published_at:
        item.status === "active" ? new Date().toISOString() : null,
    },
  };
}

// ---------------------------------------------------------------------------
// Sync
// ---------------------------------------------------------------------------

export interface DwvSyncResult {
  total: number;
  upserted: number;
  imagesLinked: number;
  archived: number;
  errors: string[];
}

import type { SupabaseClient } from "@supabase/supabase-js";
import { slugify } from "@/lib/utils";

type ServiceClient = SupabaseClient;

/**
 * Sincroniza o catálogo DWV → Supabase.
 * - Upsert por dwv_id (idempotente)
 * - Fotos remotas do DWV gravadas como URLs (servidas direto do CDN)
 * - Fotos enviadas manualmente (path sem http) são preservadas
 * - Imóveis DWV que sumiram da integração são arquivados
 */
export async function syncDwv(supabase: ServiceClient): Promise<DwvSyncResult> {
  const items = await fetchAllDwvProperties();

  const result: DwvSyncResult = {
    total: items.length,
    upserted: 0,
    imagesLinked: 0,
    archived: 0,
    errors: [],
  };

  const seenDwvIds = new Set<string>();

  for (const item of items) {
    const dwvId = String(item.id);
    seenDwvIds.add(dwvId);

    const mapped = mapDwvProperty(item);
    if (!mapped) {
      result.errors.push(`DWV ${dwvId}: dados insuficientes, ignorado`);
      continue;
    }

    // Busca existente (preserva slug/edições manuais de SEO)
    const { data: existing } = await supabase
      .from("properties")
      .select("id, slug")
      .eq("dwv_id", dwvId)
      .maybeSingle();

    let slug = existing?.slug as string | undefined;
    if (!slug) {
      slug = slugify(
        [mapped.row.title as string, mapped.row.city as string]
          .filter(Boolean)
          .join("-"),
      );
      // Garante unicidade
      const { data: clash } = await supabase
        .from("properties")
        .select("id")
        .eq("slug", slug)
        .maybeSingle();
      if (clash) slug = `${slug}-${dwvId}`;
    }

    const payload = { ...mapped.row, slug };

    const q = existing
      ? supabase.from("properties").update(payload).eq("id", existing.id)
      : supabase.from("properties").insert(payload);
    const { data: upserted, error } = await q.select("id").single();

    if (error || !upserted) {
      result.errors.push(`DWV ${dwvId}: ${error?.message ?? "upsert falhou"}`);
      continue;
    }
    result.upserted++;

    // Regrava fotos remotas (remove as antigas do DWV, preserva manuais)
    const { data: manual } = await supabase
      .from("property_images")
      .select("id")
      .eq("property_id", upserted.id)
      .not("storage_path", "like", "http%");

    await supabase
      .from("property_images")
      .delete()
      .eq("property_id", upserted.id)
      .like("storage_path", "http%");

    const startPos = manual?.length ?? 0;
    const rows = mapped.imageUrls.map((url, i) => ({
      property_id: upserted.id,
      storage_path: url,
      alt: `${mapped.row.title} — foto`,
      position: startPos + i,
      is_cover: i === 0 && startPos === 0,
    }));
    if (rows.length) {
      const { error: imgErr } = await supabase
        .from("property_images")
        .insert(rows);
      if (imgErr) {
        result.errors.push(`DWV ${dwvId} imagens: ${imgErr.message}`);
      } else {
        result.imagesLinked += rows.length;
      }
    }
  }

  // Arquiva imóveis DWV que saíram da integração (exceto vendidos/alugados manuais)
  const { data: stale } = await supabase
    .from("properties")
    .select("id, dwv_id")
    .not("dwv_id", "is", null)
    .eq("status", "published");

  for (const p of stale ?? []) {
    if (!seenDwvIds.has(p.dwv_id as string)) {
      await supabase
        .from("properties")
        .update({ status: "archived" })
        .eq("id", p.id);
      result.archived++;
    }
  }

  return result;
}
