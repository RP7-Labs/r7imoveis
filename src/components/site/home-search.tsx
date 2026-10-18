"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/input";
import { PROPERTY_PURPOSES, PROPERTY_TYPES } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function HomeSearch({ cities }: { cities: string[] }) {
  const router = useRouter();
  const [purpose, setPurpose] = useState("venda");

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const params = new URLSearchParams();
    if (purpose) params.set("purpose", purpose);
    for (const k of ["property_type", "city", "max_price"]) {
      const v = String(fd.get(k) ?? "");
      if (v) params.set(k, v);
    }
    router.push(`/imoveis?${params.toString()}`);
  }

  return (
    <form
      action="/imoveis"
      method="get"
      onSubmit={submit}
      className="rounded-[1.75rem] bg-white/95 p-5 shadow-card backdrop-blur sm:p-6"
    >
      <input type="hidden" name="purpose" value={purpose} />
      <div
        role="tablist"
        aria-label="Finalidade"
        className="mb-4 inline-flex rounded-full bg-petrol-50 p-1"
      >
        {PROPERTY_PURPOSES.slice(0, 2).map((p) => (
          <button
            key={p.value}
            type="button"
            role="tab"
            aria-selected={purpose === p.value}
            onClick={() => setPurpose(p.value)}
            className={cn(
              "rounded-full px-5 py-2 text-sm font-medium transition-colors",
              purpose === p.value
                ? "bg-petrol-500 text-white"
                : "text-petrol-600 hover:text-petrol-700",
            )}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Select name="property_type" aria-label="Tipo de imóvel">
          <option value="">Tipo de imóvel</option>
          {PROPERTY_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </Select>
        <Select name="city" aria-label="Cidade">
          <option value="">Cidade</option>
          {cities.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Select>
        <Select name="max_price" aria-label="Preço máximo">
          <option value="">Preço máximo</option>
          <option value="300000">Até R$ 300 mil</option>
          <option value="600000">Até R$ 600 mil</option>
          <option value="1000000">Até R$ 1 milhão</option>
          <option value="2000000">Até R$ 2 milhões</option>
          <option value="5000000">Até R$ 5 milhões</option>
        </Select>
        <Button type="submit" className="w-full">
          <Search className="size-4" aria-hidden />
          Buscar imóveis
        </Button>
      </div>
    </form>
  );
}
