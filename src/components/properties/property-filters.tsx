"use client";

import { Filter, Search, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/input";
import { PROPERTY_PURPOSES, PROPERTY_TYPES } from "@/lib/constants";
import { cn } from "@/lib/utils";

function buildParams(current: URLSearchParams, values: Record<string, string>) {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(values)) {
    if (v) params.set(k, v);
  }
  const q = current.get("q");
  if (q && !params.has("q")) params.set("q", q);
  return params;
}

export function PropertyFilters({
  cities,
  neighborhoods,
}: {
  cities: string[];
  neighborhoods: string[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);

  const get = (k: string) => searchParams.get(k) ?? "";

  function apply(form: HTMLFormElement) {
    const fd = new FormData(form);
    const values: Record<string, string> = {};
    for (const key of [
      "q", "purpose", "property_type", "city", "neighborhood",
      "min_price", "max_price", "bedrooms", "bathrooms",
      "garage_spaces", "min_area", "max_area", "sort",
    ]) {
      values[key] = String(fd.get(key) ?? "");
    }
    const params = buildParams(searchParams, values);
    router.push(`/imoveis?${params.toString()}`);
    setOpen(false);
  }

  function clear() {
    router.push("/imoveis");
    setOpen(false);
  }

  const activeCount = [
    "purpose", "property_type", "city", "neighborhood", "min_price",
    "max_price", "bedrooms", "bathrooms", "garage_spaces", "min_area", "max_area",
  ].filter((k) => get(k)).length;

  const formContent = (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        apply(e.currentTarget);
      }}
      className="space-y-5"
    >
      <Field label="Buscar">
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-graphite-300"
            aria-hidden
          />
          <Input
            name="q"
            defaultValue={get("q")}
            placeholder="Título, bairro, cidade ou referência"
            className="pl-9"
          />
        </div>
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Finalidade">
          <Select name="purpose" defaultValue={get("purpose")}>
            <option value="">Todas</option>
            {PROPERTY_PURPOSES.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Tipo de imóvel">
          <Select name="property_type" defaultValue={get("property_type")}>
            <option value="">Todos</option>
            {PROPERTY_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Cidade">
          <Select name="city" defaultValue={get("city")}>
            <option value="">Todas</option>
            {cities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Bairro">
          <Select name="neighborhood" defaultValue={get("neighborhood")}>
            <option value="">Todos</option>
            {neighborhoods.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Preço mínimo">
          <Input
            name="min_price"
            type="number"
            min={0}
            defaultValue={get("min_price")}
            placeholder="R$"
          />
        </Field>
        <Field label="Preço máximo">
          <Input
            name="max_price"
            type="number"
            min={0}
            defaultValue={get("max_price")}
            placeholder="R$"
          />
        </Field>
        <Field label="Dormitórios">
          <Select name="bedrooms" defaultValue={get("bedrooms")}>
            <option value="">Qualquer</option>
            {[1, 2, 3, 4].map((n) => (
              <option key={n} value={n}>
                {n}+
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Banheiros">
          <Select name="bathrooms" defaultValue={get("bathrooms")}>
            <option value="">Qualquer</option>
            {[1, 2, 3, 4].map((n) => (
              <option key={n} value={n}>
                {n}+
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Vagas">
          <Select name="garage_spaces" defaultValue={get("garage_spaces")}>
            <option value="">Qualquer</option>
            {[1, 2, 3].map((n) => (
              <option key={n} value={n}>
                {n}+
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Área (m²)">
          <div className="flex items-center gap-2">
            <Input
              name="min_area"
              type="number"
              min={0}
              defaultValue={get("min_area")}
              placeholder="Mín"
              aria-label="Área mínima"
            />
            <Input
              name="max_area"
              type="number"
              min={0}
              defaultValue={get("max_area")}
              placeholder="Máx"
              aria-label="Área máxima"
            />
          </div>
        </Field>
      </div>

      <Field label="Ordenar por">
        <Select name="sort" defaultValue={get("sort") || "recent"}>
          <option value="recent">Mais recentes</option>
          <option value="price_asc">Menor preço</option>
          <option value="price_desc">Maior preço</option>
        </Select>
      </Field>

      <div className="flex gap-3 pt-2">
        <Button type="submit" className="flex-1">
          Ver resultados
        </Button>
        {activeCount > 0 && (
          <Button type="button" variant="ghost" onClick={clear}>
            Limpar
          </Button>
        )}
      </div>
    </form>
  );

  return (
    <>
      {/* Desktop — barra lateral */}
      <aside className="hidden w-72 shrink-0 lg:block">
        <div className="sticky top-24 rounded-2xl bg-white p-6 shadow-soft">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-serif text-lg text-petrol-800">Filtros</h2>
            {activeCount > 0 && (
              <span className="rounded-full bg-petrol-500 px-2 py-0.5 text-xs text-white">
                {activeCount}
              </span>
            )}
          </div>
          {formContent}
        </div>
      </aside>

      {/* Mobile — botão + drawer */}
      <div className="lg:hidden">
        <Button
          type="button"
          variant="outline"
          onClick={() => setOpen(true)}
          className="w-full"
        >
          <Filter className="size-4" aria-hidden />
          Filtros
          {activeCount > 0 && (
            <span className="rounded-full bg-petrol-500 px-2 py-0.5 text-xs text-white">
              {activeCount}
            </span>
          )}
        </Button>

        {open && (
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Filtros de busca"
            className="fixed inset-0 z-50 flex flex-col bg-offwhite"
          >
            <div className="flex items-center justify-between border-b border-sand px-4 py-4">
              <h2 className="font-serif text-lg text-petrol-800">Filtros</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Fechar filtros"
                className="rounded-full p-2 text-graphite-500 hover:bg-petrol-50"
              >
                <X className="size-6" aria-hidden />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-6">{formContent}</div>
          </div>
        )}
      </div>

      {/* Indicadores de filtros ativos */}
      {activeCount > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-2 lg:hidden">
          <span className="text-xs text-graphite-400">
            {activeCount} filtro{activeCount > 1 ? "s" : ""} ativo
            {activeCount > 1 ? "s" : ""}
          </span>
          <button
            type="button"
            onClick={clear}
            className={cn(
              "text-xs font-medium text-petrol-600 underline underline-offset-2",
            )}
          >
            Limpar todos
          </button>
        </div>
      )}
    </>
  );
}
