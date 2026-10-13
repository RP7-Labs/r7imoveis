export function formatPrice(
  value: number | null | undefined,
  currency = "BRL",
  purpose?: string,
): string {
  if (value == null) return "Preço sob consulta";
  const formatted = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
  return purpose === "locacao" ? `${formatted}/mês` : formatted;
}

export function formatArea(value: number | null | undefined): string | null {
  if (value == null) return null;
  return `${new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 }).format(value)} m²`;
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" }).format(
    new Date(iso),
  );
}

export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(iso));
}
