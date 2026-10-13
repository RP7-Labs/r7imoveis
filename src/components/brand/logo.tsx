import { cn } from "@/lib/utils";

/**
 * Renderiza a marca R7. Prioriza a logo enviada pelo backoffice
 * (site_settings.logo_path); caso contrário usa o arquivo oficial em
 * /public/brand. Substitua /public/brand/logo.svg pela arte original.
 */
export function Logo({
  src,
  variant = "dark",
  compact = false,
  className,
}: {
  src?: string | null;
  variant?: "dark" | "light";
  compact?: boolean;
  className?: string;
}) {
  const logoSrc = src ?? "/brand/logo.svg";

  return (
    <span className={cn("inline-flex items-center gap-3", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={logoSrc}
        alt="R7 Investimentos Imobiliários"
        className={cn("h-10 w-auto", compact && "h-9")}
        width={120}
        height={40}
      />
      {!compact && (
        <span
          className={cn(
            "hidden flex-col leading-tight sm:flex",
            variant === "light" ? "text-white" : "text-petrol-700",
          )}
        >
          <span className="font-serif text-sm font-semibold tracking-wide">
            R7 Investimentos
          </span>
          <span className="text-[11px] uppercase tracking-[0.18em] opacity-80">
            Imobiliários
          </span>
        </span>
      )}
    </span>
  );
}
