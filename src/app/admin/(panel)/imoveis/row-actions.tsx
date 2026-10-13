"use client";

import { Archive, CheckCircle2, EyeOff, MoreVertical, Tag, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { deleteProperty, setPropertyStatus } from "../actions";

export function PropertyRowActions({
  id,
  title,
}: {
  id: string;
  title: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  async function run(fn: () => Promise<{ ok: boolean; error?: string }>) {
    setBusy(true);
    const result = await fn();
    setBusy(false);
    setOpen(false);
    if (!result.ok) alert(result.error ?? "Erro ao executar ação.");
    router.refresh();
  }

  const item =
    "flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-graphite-600 hover:bg-petrol-50 disabled:opacity-50";

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={`Ações para ${title}`}
        className="rounded-lg p-2 text-graphite-400 hover:bg-petrol-50 hover:text-petrol-600"
      >
        <MoreVertical className="size-4.5" aria-hidden />
      </button>
      {open && (
        <div className="absolute right-0 z-30 mt-1 w-52 overflow-hidden rounded-xl border border-graphite-100 bg-white py-1 shadow-card">
          <button
            type="button"
            disabled={busy}
            className={item}
            onClick={() => run(() => setPropertyStatus(id, "published"))}
          >
            <CheckCircle2 className="size-4 text-emerald-600" aria-hidden />
            Publicar
          </button>
          <button
            type="button"
            disabled={busy}
            className={item}
            onClick={() => run(() => setPropertyStatus(id, "draft"))}
          >
            <EyeOff className="size-4 text-graphite-400" aria-hidden />
            Despublicar
          </button>
          <button
            type="button"
            disabled={busy}
            className={item}
            onClick={() => run(() => setPropertyStatus(id, "sold"))}
          >
            <Tag className="size-4 text-amber-600" aria-hidden />
            Marcar vendido
          </button>
          <button
            type="button"
            disabled={busy}
            className={item}
            onClick={() => run(() => setPropertyStatus(id, "rented"))}
          >
            <Tag className="size-4 text-amber-600" aria-hidden />
            Marcar alugado
          </button>
          <button
            type="button"
            disabled={busy}
            className={item}
            onClick={() => run(() => setPropertyStatus(id, "archived"))}
          >
            <Archive className="size-4 text-graphite-400" aria-hidden />
            Arquivar
          </button>
          <button
            type="button"
            disabled={busy}
            className={`${item} text-red-600 hover:bg-red-50`}
            onClick={() => {
              if (
                confirm(
                  `Excluir "${title}" permanentemente? As fotos também serão removidas.`,
                )
              ) {
                void run(() => deleteProperty(id));
              }
            }}
          >
            <Trash2 className="size-4" aria-hidden />
            Excluir
          </button>
        </div>
      )}
    </div>
  );
}
