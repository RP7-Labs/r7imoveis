import { SearchX } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";

export function EmptyState({
  title = "Nenhum imóvel encontrado",
  description = "Ajuste os filtros ou entre em contato — podemos ajudar a encontrar o imóvel ideal.",
  showClear = true,
}: {
  title?: string;
  description?: string;
  showClear?: boolean;
}) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-sand-dark bg-white/60 px-6 py-16 text-center">
      <SearchX className="size-10 text-champagne-400" aria-hidden />
      <h2 className="mt-4 font-serif text-xl text-petrol-800">{title}</h2>
      <p className="mt-2 max-w-md text-sm text-graphite-500">{description}</p>
      {showClear && (
        <ButtonLink href="/imoveis" variant="outline" size="sm" className="mt-6">
          Limpar filtros
        </ButtonLink>
      )}
    </div>
  );
}
