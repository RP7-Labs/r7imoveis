import { ExternalLink, ImageOff, Pencil, Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { buttonClasses } from "@/components/ui/button";
import {
  propertyStatusLabel,
  propertyTypeLabel,
  purposeLabel,
  STORAGE_BUCKETS,
} from "@/lib/constants";
import { formatPrice } from "@/lib/format";
import { storageUrl } from "@/lib/storage";
import { createClient } from "@/lib/supabase/server";
import { PropertyRowActions } from "./row-actions";
import { SyncDwvButton } from "./sync-button";

export const metadata = { title: "Imóveis" };

const PAGE_SIZE = 20;

export default async function AdminImoveisPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const supabase = await createClient();

  const page = Math.max(1, Number(sp.page) || 1);
  const q = sp.q?.trim();
  const status = sp.status;

  let query = supabase
    .from("properties")
    .select(
      "id, title, slug, reference_code, property_type, purpose, status, featured, price, currency, city, neighborhood, updated_at, property_images(storage_path, is_cover, position)",
      { count: "exact" },
    )
    .order("updated_at", { ascending: false });

  if (q) {
    const term = q.replace(/[%,()]/g, " ");
    query = query.or(
      `title.ilike.%${term}%,reference_code.ilike.%${term}%,city.ilike.%${term}%,neighborhood.ilike.%${term}%`,
    );
  }
  if (status) query = query.eq("status", status);

  const from = (page - 1) * PAGE_SIZE;
  const { data, count } = await query.range(from, from + PAGE_SIZE - 1);
  const pageCount = Math.ceil((count ?? 0) / PAGE_SIZE);

  const statusTone = (s: string) =>
    s === "published"
      ? ("green" as const)
      : s === "draft"
        ? ("gray" as const)
        : s === "sold" || s === "rented"
          ? ("amber" as const)
          : ("red" as const);

  const pageHref = (p: number) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (status) params.set("status", status);
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return `/admin/imoveis${qs ? `?${qs}` : ""}`;
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl text-petrol-900">Imóveis</h1>
          <p className="mt-1 text-sm text-graphite-500">
            {count ?? 0} imóve{(count ?? 0) === 1 ? "l" : "is"} cadastrado
            {(count ?? 0) === 1 ? "" : "s"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <SyncDwvButton />
          <Link
            href="/admin/imoveis/novo"
            className={buttonClasses("primary", "md")}
          >
            <Plus className="size-4" aria-hidden />
            Novo imóvel
          </Link>
        </div>
      </div>

      <form className="mt-6 flex flex-wrap gap-3" action="/admin/imoveis">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Buscar por título, referência, cidade…"
          className="min-w-64 flex-1 rounded-lg border border-graphite-200 bg-white px-4 py-2.5 text-sm focus:border-petrol-500 focus:outline-2 focus:outline-petrol-500/20"
        />
        <select
          name="status"
          defaultValue={status ?? ""}
          className="rounded-lg border border-graphite-200 bg-white px-4 py-2.5 text-sm"
          aria-label="Filtrar por status"
        >
          <option value="">Todos os status</option>
          <option value="draft">Rascunho</option>
          <option value="published">Publicado</option>
          <option value="sold">Vendido</option>
          <option value="rented">Alugado</option>
          <option value="archived">Arquivado</option>
        </select>
        <button type="submit" className={buttonClasses("outline", "md")}>
          Filtrar
        </button>
      </form>

      <div className="mt-6 overflow-hidden rounded-2xl bg-white shadow-soft">
        {(!data || data.length === 0) && (
          <p className="px-6 py-12 text-center text-sm text-graphite-400">
            Nenhum imóvel encontrado.
          </p>
        )}
        <ul className="divide-y divide-graphite-100">
          {(data ?? []).map((p) => {
            const images = (p.property_images ?? []).sort(
              (a: { position: number }, b: { position: number }) =>
                a.position - b.position,
            );
            const cover =
              images.find((i: { is_cover: boolean }) => i.is_cover) ?? images[0];
            const coverUrl = storageUrl(
              cover?.storage_path,
              STORAGE_BUCKETS.propertyImages,
            );
            return (
              <li key={p.id} className="flex items-center gap-4 px-4 py-4 sm:px-6">
                <div className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-sand">
                  {coverUrl ? (
                    <Image
                      src={coverUrl}
                      alt=""
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  ) : (
                    <ImageOff className="absolute inset-0 m-auto size-5 text-graphite-300" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/admin/imoveis/${p.id}`}
                      className="truncate font-medium text-petrol-800 hover:underline"
                    >
                      {p.title}
                    </Link>
                    {p.featured && <Badge tone="champagne">Destaque</Badge>}
                    <Badge tone={statusTone(p.status)}>
                      {propertyStatusLabel(p.status)}
                    </Badge>
                  </div>
                  <p className="mt-0.5 truncate text-xs text-graphite-400">
                    Ref. {p.reference_code} ·{" "}
                    {propertyTypeLabel(p.property_type)} ·{" "}
                    {purposeLabel(p.purpose)} ·{" "}
                    {[p.neighborhood, p.city].filter(Boolean).join(", ")} ·{" "}
                    {formatPrice(p.price, p.currency, p.purpose)}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  {p.status === "published" && (
                    <Link
                      href={`/imoveis/${p.slug}`}
                      target="_blank"
                      aria-label="Ver página pública"
                      className="rounded-lg p-2 text-graphite-400 hover:bg-petrol-50 hover:text-petrol-600"
                    >
                      <ExternalLink className="size-4.5" aria-hidden />
                    </Link>
                  )}
                  <Link
                    href={`/admin/imoveis/${p.id}`}
                    aria-label={`Editar ${p.title}`}
                    className="rounded-lg p-2 text-graphite-400 hover:bg-petrol-50 hover:text-petrol-600"
                  >
                    <Pencil className="size-4.5" aria-hidden />
                  </Link>
                  <PropertyRowActions id={p.id} title={p.title} />
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {pageCount > 1 && (
        <nav
          aria-label="Paginação"
          className="mt-6 flex items-center justify-center gap-2"
        >
          {Array.from({ length: pageCount }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={pageHref(p)}
              aria-current={p === page ? "page" : undefined}
              className={
                p === page
                  ? "rounded-full bg-petrol-500 px-3.5 py-1.5 text-sm text-white"
                  : "rounded-full px-3.5 py-1.5 text-sm text-petrol-600 hover:bg-petrol-50"
              }
            >
              {p}
            </Link>
          ))}
        </nav>
      )}
    </div>
  );
}
