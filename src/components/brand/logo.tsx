import { cn } from "@/lib/utils";

/**
 * Logomarca oficial da R7 — monograma "R7" extraído do Manual de Marca
 * com fundo transparente, em duas tonalidades:
 * - "petrol": para fundos claros (header, superfícies brancas)
 * - "champagne": para fundos escuros (footer, hero, blocos verdes)
 *
 * O nome "INVESTIMENTOS IMOBILIÁRIOS" é renderizado em HTML ao lado,
 * seguindo o tracking espaçado do manual — mais legível que o raster.
 */
export function Logo({
  src,
  tone = "petrol",
  variant = "mono",
  withName = true,
  size = "md",
  className,
}: {
  src?: string | null;
  tone?: "petrol" | "champagne";
  variant?: "mono" | "lockup";
  withName?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const imageSrc =
    src ??
    (variant === "lockup"
      ? `/brand/r7-lockup-${tone}.png`
      : `/brand/r7-mono-${tone}.png`);
  const box =
    size === "lg" ? "h-16" : size === "sm" ? "h-8" : "h-11";

  return (
    <span className={cn("inline-flex items-center gap-3", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageSrc}
        alt="R7 Investimentos Imobiliários"
        width={variant === "lockup" ? 239 : 174}
        height={variant === "lockup" ? 280 : 120}
        className={cn(
          box,
          "w-auto",
          src ? "rounded-lg object-cover" : "object-contain",
        )}
      />
      {withName && variant === "mono" && (
        <span
          className={cn(
            "flex flex-col text-left font-display font-semibold leading-[1.15]",
            size === "sm" && "text-[9px] tracking-[0.22em]",
            size === "md" && "text-[10px] tracking-[0.26em]",
            size === "lg" && "text-xs tracking-[0.3em]",
            tone === "petrol" ? "text-petrol-700" : "text-champagne-300",
          )}
        >
          <span>INVESTIMENTOS</span>
          <span>IMOBILIÁRIOS</span>
        </span>
      )}
    </span>
  );
}
