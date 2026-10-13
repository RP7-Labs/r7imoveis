import { cn } from "@/lib/utils";

/**
 * Logomarca oficial da R7 (lockup raster do Manual de Marca).
 * Prioriza a logo enviada pelo backoffice (site_settings.logo_path);
 * caso contrário usa o arquivo oficial em /public/brand/r7-logo.jpg.
 * A arte é quadrada e exibida sem distorção, em moldura arredondada.
 */
export function Logo({
  src,
  size = "md",
  className,
}: {
  src?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const logoSrc = src ?? "/brand/r7-logo.jpg";
  const box =
    size === "lg" ? "size-16" : size === "sm" ? "size-9" : "size-12";

  return (
    <span className={cn("inline-flex items-center", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={logoSrc}
        alt="R7 Investimentos Imobiliários"
        width={96}
        height={96}
        className={cn(box, "rounded-lg object-cover")}
      />
    </span>
  );
}
