import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function Pagination({
  page,
  pageCount,
  searchParams,
}: {
  page: number;
  pageCount: number;
  searchParams: Record<string, string>;
}) {
  if (pageCount <= 1) return null;

  const href = (p: number) => {
    const params = new URLSearchParams(searchParams);
    if (p > 1) params.set("page", String(p));
    else params.delete("page");
    const qs = params.toString();
    return `/imoveis${qs ? `?${qs}` : ""}`;
  };

  const pages: number[] = [];
  const window = 2;
  for (
    let p = Math.max(1, page - window);
    p <= Math.min(pageCount, page + window);
    p++
  ) {
    pages.push(p);
  }

  const item =
    "inline-flex min-w-10 items-center justify-center rounded-full px-3 py-2 text-sm transition-colors";

  return (
    <nav
      aria-label="Paginação"
      className="mt-10 flex items-center justify-center gap-1"
    >
      {page > 1 && (
        <Link href={href(page - 1)} className={cn(item, "text-petrol-600 hover:bg-petrol-50")} aria-label="Página anterior">
          <ChevronLeft className="size-4" aria-hidden />
        </Link>
      )}
      {!pages.includes(1) && (
        <>
          <Link href={href(1)} className={cn(item, "text-petrol-600 hover:bg-petrol-50")}>1</Link>
          <span className="px-1 text-graphite-300">…</span>
        </>
      )}
      {pages.map((p) => (
        <Link
          key={p}
          href={href(p)}
          aria-current={p === page ? "page" : undefined}
          className={cn(
            item,
            p === page
              ? "bg-petrol-500 font-medium text-white"
              : "text-petrol-600 hover:bg-petrol-50",
          )}
        >
          {p}
        </Link>
      ))}
      {!pages.includes(pageCount) && (
        <>
          <span className="px-1 text-graphite-300">…</span>
          <Link href={href(pageCount)} className={cn(item, "text-petrol-600 hover:bg-petrol-50")}>
            {pageCount}
          </Link>
        </>
      )}
      {page < pageCount && (
        <Link href={href(page + 1)} className={cn(item, "text-petrol-600 hover:bg-petrol-50")} aria-label="Próxima página">
          <ChevronRight className="size-4" aria-hidden />
        </Link>
      )}
    </nav>
  );
}
