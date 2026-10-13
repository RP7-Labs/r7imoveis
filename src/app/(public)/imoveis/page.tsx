import type { Metadata } from "next";
import { Suspense } from "react";
import { EmptyState } from "@/components/properties/empty-state";
import { Pagination } from "@/components/properties/pagination";
import { PropertyCard } from "@/components/properties/property-card";
import { PropertyFilters } from "@/components/properties/property-filters";
import {
  getLocationFacets,
  listPublishedProperties,
} from "@/lib/properties";
import type {
  PropertyFilters as Filters,
  PropertyPurpose,
  PropertyType,
} from "@/lib/types";

export const metadata: Metadata = {
  title: "Imóveis",
  description:
    "Catálogo de imóveis da R7 Investimentos Imobiliários em Santa Catarina. Apartamentos, casas, terrenos e mais, para venda e locação.",
  alternates: { canonical: "/imoveis" },
};

const VALID_PURPOSES: PropertyPurpose[] = ["venda", "locacao", "venda_locacao"];
const VALID_TYPES: PropertyType[] = [
  "apartamento", "casa", "cobertura", "sobrado", "terreno",
  "comercial", "sala_comercial", "galpao", "studio", "rural", "outro",
];

function num(v: string | string[] | undefined): number | undefined {
  const s = Array.isArray(v) ? v[0] : v;
  if (!s) return undefined;
  const n = Number(s);
  return Number.isFinite(n) && n >= 0 ? n : undefined;
}

function str(v: string | string[] | undefined): string | undefined {
  const s = Array.isArray(v) ? v[0] : v;
  return s?.trim() || undefined;
}

export default async function ImoveisPage({
  searchParams,
}: PageProps<"/imoveis">) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <header className="mb-8">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-champagne-500">
          Catálogo
        </p>
        <h1 className="mt-2 font-display text-3xl text-petrol-800 sm:text-4xl">
          Imóveis
        </h1>
      </header>

      <div className="lg:flex lg:gap-0">
        <Suspense fallback={null}>
          <FacetsAndFilters />
        </Suspense>

        <Suspense
          fallback={
            <div className="mt-8 grid flex-1 gap-6 sm:grid-cols-2 xl:grid-cols-3 lg:mt-0 lg:pl-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-[4/5] animate-pulse rounded-2xl bg-sand"
                />
              ))}
            </div>
          }
        >
          <Results searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  );
}

async function FacetsAndFilters() {
  const facets = await getLocationFacets();
  return (
    <PropertyFilters
      cities={facets.cities}
      neighborhoods={facets.neighborhoods}
    />
  );
}

async function Results({
  searchParams,
}: {
  searchParams: PageProps<"/imoveis">["searchParams"];
}) {
  const sp = await searchParams;

  const purpose = str(sp.purpose);
  const type = str(sp.property_type);
  const sort = str(sp.sort);

  const filters: Filters = {
    q: str(sp.q),
    purpose: VALID_PURPOSES.includes(purpose as PropertyPurpose)
      ? (purpose as PropertyPurpose)
      : undefined,
    property_type: VALID_TYPES.includes(type as PropertyType)
      ? (type as PropertyType)
      : undefined,
    city: str(sp.city),
    neighborhood: str(sp.neighborhood),
    min_price: num(sp.min_price),
    max_price: num(sp.max_price),
    bedrooms: num(sp.bedrooms),
    bathrooms: num(sp.bathrooms),
    garage_spaces: num(sp.garage_spaces),
    min_area: num(sp.min_area),
    max_area: num(sp.max_area),
    sort:
      sort === "price_asc" || sort === "price_desc" || sort === "recent"
        ? sort
        : undefined,
    page: num(sp.page) ?? 1,
  };

  const result = await listPublishedProperties(filters);
  const flatParams = Object.fromEntries(
    Object.entries(sp).flatMap(([k, v]) =>
      typeof v === "string" ? [[k, v]] : [],
    ),
  );

  return (
    <div className="mt-6 flex-1 lg:mt-0 lg:pl-8">
      <p className="mb-5 text-sm text-graphite-500" aria-live="polite">
        {result.total}{" "}
        {result.total === 1 ? "imóvel encontrado" : "imóveis encontrados"}
      </p>

      {result.items.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {result.items.map((p) => (
            <PropertyCard key={p.id} property={p} />
          ))}
        </div>
      )}

      <Pagination
        page={result.page}
        pageCount={result.pageCount}
        searchParams={flatParams}
      />
    </div>
  );
}
