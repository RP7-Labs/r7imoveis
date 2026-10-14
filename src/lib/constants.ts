import type {
  LeadStatus,
  PropertyPurpose,
  PropertyStatus,
  PropertyType,
} from "./types";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://r7imoveissc.com.br";

export const SITE_NAME = "R7 Investimentos Imobiliários";

export const STORAGE_BUCKETS = {
  propertyImages: "property-images",
  siteAssets: "site-assets",
} as const;

export const PAGE_SIZE = 12;

export const PROPERTY_TYPES: { value: PropertyType; label: string }[] = [
  { value: "apartamento", label: "Apartamento" },
  { value: "casa", label: "Casa" },
  { value: "cobertura", label: "Cobertura" },
  { value: "terreno", label: "Terreno" },
  { value: "studio", label: "Studio" },
  { value: "outro", label: "Outro" },
];

export const PROPERTY_PURPOSES: { value: PropertyPurpose; label: string }[] = [
  { value: "venda", label: "Venda" },
  { value: "locacao", label: "Locação" },
  { value: "venda_locacao", label: "Venda e locação" },
];

export const PROPERTY_STATUSES: { value: PropertyStatus; label: string }[] = [
  { value: "draft", label: "Rascunho" },
  { value: "published", label: "Publicado" },
  { value: "sold", label: "Vendido" },
  { value: "rented", label: "Alugado" },
  { value: "archived", label: "Arquivado" },
];

export const LEAD_STATUSES: { value: LeadStatus; label: string }[] = [
  { value: "new", label: "Novo" },
  { value: "contacted", label: "Contatado" },
  { value: "qualified", label: "Qualificado" },
  { value: "visit_scheduled", label: "Visita agendada" },
  { value: "closed", label: "Fechado" },
  { value: "archived", label: "Arquivado" },
];

export const BRAZILIAN_STATES = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS",
  "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC",
  "SP", "SE", "TO",
];

export const MAX_IMAGE_SIZE_MB = 8;
export const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
];

export function propertyTypeLabel(type: PropertyType): string {
  return PROPERTY_TYPES.find((t) => t.value === type)?.label ?? type;
}

export function purposeLabel(purpose: PropertyPurpose): string {
  return PROPERTY_PURPOSES.find((p) => p.value === purpose)?.label ?? purpose;
}

export function propertyStatusLabel(status: PropertyStatus): string {
  return PROPERTY_STATUSES.find((s) => s.value === status)?.label ?? status;
}

export function leadStatusLabel(status: LeadStatus): string {
  return LEAD_STATUSES.find((s) => s.value === status)?.label ?? status;
}
