import { cacheLife, cacheTag } from "next/cache";
import { PAGE_SIZE } from "./constants";
import { createPublicClient } from "./supabase/public";
import type { PropertyFilters, PropertyWithImages } from "./types";

const PROPERTY_SELECT =
  "*, property_images(id, property_id, storage_path, alt, position, is_cover, created_at)";

type PublicClient = ReturnType<typeof createPublicClient>;

function buildListQuery(supabase: PublicClient, f: PropertyFilters) {
  let query = supabase
    .from("properties")
    .select(PROPERTY_SELECT, { count: "exact" })
    .eq("status", "published");

  if (f.q) {
    const term = f.q.replace(/[%,()]/g, " ").trim();
    if (term) {
      query = query.or(
        `title.ilike.%${term}%,reference_code.ilike.%${term}%,neighborhood.ilike.%${term}%,city.ilike.%${term}%,description.ilike.%${term}%`,
      );
    }
  }
  if (f.purpose) {
    query = query.in(
      "purpose",
      f.purpose === "venda" ? ["venda", "venda_locacao"] : ["locacao", "venda_locacao"],
    );
  }
  if (f.property_type) query = query.eq("property_type", f.property_type);
  if (f.city) query = query.ilike("city", f.city);
  if (f.neighborhood) query = query.ilike("neighborhood", f.neighborhood);
  if (f.min_price != null) query = query.gte("price", f.min_price);
  if (f.max_price != null) query = query.lte("price", f.max_price);
  if (f.bedrooms != null) query = query.gte("bedrooms", f.bedrooms);
  if (f.bathrooms != null) query = query.gte("bathrooms", f.bathrooms);
  if (f.garage_spaces != null) query = query.gte("garage_spaces", f.garage_spaces);
  if (f.min_area != null) query = query.gte("built_area", f.min_area);
  if (f.max_area != null) query = query.lte("built_area", f.max_area);

  switch (f.sort) {
    case "price_asc":
      query = query.order("price", { ascending: true, nullsFirst: false });
      break;
    case "price_desc":
      query = query.order("price", { ascending: false, nullsFirst: false });
      break;
    default:
      query = query
        .order("featured", { ascending: false })
        .order("published_at", { ascending: false, nullsFirst: false })
        .order("created_at", { ascending: false });
  }
  return query;
}

export interface PropertyListResult {
  items: PropertyWithImages[];
  total: number;
  page: number;
  pageCount: number;
}

export async function listPublishedProperties(
  filters: PropertyFilters,
): Promise<PropertyListResult> {
  "use cache";
  cacheTag("properties");
  cacheLife("minutes");

  const supabase = createPublicClient();
  const page = Math.max(1, filters.page ?? 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data, count, error } = await buildListQuery(supabase, filters).range(
    from,
    to,
  );

  if (error) return { items: [], total: 0, page, pageCount: 0 };

  const items = (data ?? []) as PropertyWithImages[];
  for (const item of items) {
    item.property_images.sort((a, b) => a.position - b.position);
  }

  const total = count ?? 0;
  return {
    items,
    total,
    page,
    pageCount: Math.ceil(total / PAGE_SIZE),
  };
}

export async function getFeaturedProperties(
  limit = 6,
): Promise<PropertyWithImages[]> {
  "use cache";
  cacheTag("properties", "properties-featured");
  cacheLife("minutes");

  const supabase = createPublicClient();
  const { data } = await supabase
    .from("properties")
    .select(PROPERTY_SELECT)
    .eq("status", "published")
    .eq("featured", true)
    .order("published_at", { ascending: false, nullsFirst: false })
    .limit(limit);

  const items = (data ?? []) as PropertyWithImages[];
  for (const item of items) {
    item.property_images.sort((a, b) => a.position - b.position);
  }
  return items;
}

export async function getPublishedPropertyBySlug(
  slug: string,
): Promise<PropertyWithImages | null> {
  "use cache";
  cacheTag("properties", `property-${slug}`);
  cacheLife("minutes");

  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("properties")
    .select(PROPERTY_SELECT)
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error || !data) return null;
  const property = data as PropertyWithImages;
  property.property_images.sort((a, b) => a.position - b.position);
  return property;
}

export async function getRelatedProperties(
  property: PropertyWithImages,
  limit = 3,
): Promise<PropertyWithImages[]> {
  "use cache";
  cacheTag("properties");
  cacheLife("minutes");

  const supabase = createPublicClient();
  const { data } = await supabase
    .from("properties")
    .select(PROPERTY_SELECT)
    .eq("status", "published")
    .eq("property_type", property.property_type)
    .neq("id", property.id)
    .order("published_at", { ascending: false, nullsFirst: false })
    .limit(limit);

  const items = (data ?? []) as PropertyWithImages[];

  if (items.length < limit) {
    const { data: fill } = await supabase
      .from("properties")
      .select(PROPERTY_SELECT)
      .eq("status", "published")
      .neq("id", property.id)
      .order("published_at", { ascending: false, nullsFirst: false })
      .limit(limit);
    const existing = new Set(items.map((i) => i.id));
    for (const p of (fill ?? []) as PropertyWithImages[]) {
      if (!existing.has(p.id) && items.length < limit) items.push(p);
    }
  }

  for (const item of items) {
    item.property_images.sort((a, b) => a.position - b.position);
  }
  return items;
}

export interface Facets {
  cities: string[];
  neighborhoods: string[];
}

export async function getLocationFacets(): Promise<Facets> {
  "use cache";
  cacheTag("properties", "property-facets");
  cacheLife("minutes");

  const supabase = createPublicClient();
  const { data } = await supabase
    .from("properties")
    .select("city, neighborhood")
    .eq("status", "published");

  const cities = new Set<string>();
  const neighborhoods = new Set<string>();
  for (const row of data ?? []) {
    if (row.city) cities.add(row.city);
    if (row.neighborhood) neighborhoods.add(row.neighborhood);
  }
  return {
    cities: [...cities].sort((a, b) => a.localeCompare(b, "pt-BR")),
    neighborhoods: [...neighborhoods].sort((a, b) =>
      a.localeCompare(b, "pt-BR"),
    ),
  };
}

export async function listPublishedSlugs(): Promise<
  { slug: string; updated_at: string }[]
> {
  "use cache";
  cacheTag("properties");
  cacheLife("minutes");

  const supabase = createPublicClient();
  const { data } = await supabase
    .from("properties")
    .select("slug, updated_at")
    .eq("status", "published");
  return data ?? [];
}
