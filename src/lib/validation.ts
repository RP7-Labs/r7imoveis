import { z } from "zod";

export const leadSchema = z.object({
  name: z.string().trim().min(2, "Informe seu nome").max(120),
  email: z
    .string()
    .trim()
    .email("E-mail inválido")
    .max(160)
    .optional()
    .or(z.literal("")),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  message: z.string().trim().min(5, "Escreva uma mensagem").max(2000),
  property_id: z.string().uuid().optional().or(z.literal("")),
  source: z.enum(["form", "whatsapp", "contact", "other"]).default("form"),
  // Honeypot — deve permanecer vazio
  website: z.string().max(0).optional().or(z.literal("")),
});

export type LeadInput = z.infer<typeof leadSchema>;

const optionalNumber = (max: number) =>
  z
    .union([z.literal(""), z.coerce.number().min(0).max(max)])
    .transform((v) => (v === "" ? null : v))
    .nullable()
    .optional();

const optionalInt = (max: number) =>
  z
    .union([z.literal(""), z.coerce.number().int().min(0).max(max)])
    .transform((v) => (v === "" ? null : v))
    .nullable()
    .optional();

const optionalString = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .or(z.literal(""))
    .transform((v) => (v === "" ? null : v));

export const propertySchema = z.object({
  title: z.string().trim().min(4, "Título muito curto").max(160),
  slug: z
    .string()
    .trim()
    .max(180)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug inválido")
    .optional()
    .or(z.literal("")),
  reference_code: z.string().trim().min(2, "Informe a referência").max(40),
  excerpt: optionalString(300),
  description: optionalString(10000),
  property_type: z.enum([
    "apartamento", "casa", "cobertura", "terreno", "studio", "outro",
  ]),
  purpose: z.enum(["venda", "locacao", "venda_locacao"]),
  status: z.enum(["draft", "published", "sold", "rented", "archived"]),
  featured: z.coerce.boolean().default(false),
  price: optionalNumber(10_000_000_000),
  currency: z.string().trim().max(3).default("BRL"),
  condo_fee: optionalNumber(1_000_000),
  iptu: optionalNumber(1_000_000),
  iptu_periodicity: z
    .enum(["mensal", "anual"])
    .optional()
    .nullable()
    .or(z.literal(""))
    .transform((v) => (v === "" ? null : v)),
  zip_code: optionalString(12),
  street: optionalString(160),
  street_number: optionalString(20),
  complement: optionalString(80),
  neighborhood: optionalString(120),
  city: z.string().trim().min(2, "Informe a cidade").max(120),
  state: z.string().trim().length(2).default("SC"),
  latitude: z
    .union([z.literal(""), z.coerce.number().min(-90).max(90)])
    .transform((v) => (v === "" ? null : v))
    .nullable()
    .optional(),
  longitude: z
    .union([z.literal(""), z.coerce.number().min(-180).max(180)])
    .transform((v) => (v === "" ? null : v))
    .nullable()
    .optional(),
  address_visibility: z
    .enum(["full", "approximate", "hidden"])
    .default("approximate"),
  built_area: optionalNumber(1_000_000),
  total_area: optionalNumber(10_000_000),
  bedrooms: optionalInt(50),
  suites: optionalInt(50),
  bathrooms: optionalInt(50),
  garage_spaces: optionalInt(50),
  floor: z
    .union([z.literal(""), z.coerce.number().int().min(-10).max(200)])
    .transform((v) => (v === "" ? null : v))
    .nullable()
    .optional(),
  features: z
    .union([z.string(), z.array(z.string())])
    .transform((v) =>
      (Array.isArray(v) ? v : v.split("\n"))
        .map((f) => f.trim())
        .filter(Boolean)
        .slice(0, 40),
    )
    .default([]),
  seo_title: optionalString(200),
  seo_description: optionalString(300),
});

export type PropertyInput = z.infer<typeof propertySchema>;

export const settingsSchema = z.object({
  company_name: z.string().trim().min(2).max(160),
  tagline: optionalString(200),
  hero_title: optionalString(200),
  hero_subtitle: optionalString(400),
  hero_image_path: optionalString(400),
  about_title: optionalString(200),
  about_text: optionalString(5000),
  differentials: z
    .union([z.string(), z.array(z.object({ title: z.string(), description: z.string() }))])
    .transform((v) => {
      if (Array.isArray(v)) return v.slice(0, 12);
      try {
        const parsed = JSON.parse(v);
        return Array.isArray(parsed) ? parsed.slice(0, 12) : [];
      } catch {
        return [];
      }
    })
    .default([]),
  phone: optionalString(30),
  whatsapp_number: z
    .string()
    .trim()
    .regex(/^[\d\s()+.-]*$/, "Número inválido")
    .max(20)
    .optional()
    .or(z.literal(""))
    .transform((v) => (v === "" ? null : v)),
  whatsapp_message: optionalString(400),
  email: z
    .string()
    .trim()
    .email("E-mail inválido")
    .max(160)
    .optional()
    .or(z.literal("")),
  address: optionalString(240),
  business_hours: optionalString(160),
  instagram_url: optionalString(240),
  facebook_url: optionalString(240),
  linkedin_url: optionalString(240),
  youtube_url: optionalString(240),
  footer_text: optionalString(400),
  logo_path: optionalString(400),
  seo_title: optionalString(200),
  seo_description: optionalString(300),
  seo_og_image_path: optionalString(400),
});

export type SettingsInput = z.infer<typeof settingsSchema>;
