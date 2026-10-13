import { cacheLife, cacheTag } from "next/cache";
import { createPublicClient } from "./supabase/public";
import type { SiteSettings } from "./types";

const FALLBACK: SiteSettings = {
  id: 1,
  company_name: "R7 Investimentos Imobiliários",
  tagline: "Imóveis selecionados em Santa Catarina",
  hero_title: "Imóveis que valorizam seu patrimônio",
  hero_subtitle:
    "Curadoria de imóveis para compra, venda e investimento em Balneário Camboriú e Praia Brava.",
  hero_image_path: null,
  about_title: "R7 Investimentos Imobiliários",
  about_text: null,
  differentials: [],
  phone: null,
  whatsapp_number: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? null,
  whatsapp_message: null,
  email: null,
  address: "Rua 3100, 780 — Centro, Balneário Camboriú/SC, 88330-304",
  business_hours: null,
  instagram_url: "https://www.instagram.com/r7imoveissc/",
  facebook_url: null,
  linkedin_url: null,
  youtube_url: null,
  footer_text: "R7 Investimentos Imobiliários — imóveis em Santa Catarina.",
  logo_path: null,
  seo_title: null,
  seo_description: null,
  seo_og_image_path: null,
  updated_at: new Date(0).toISOString(),
};

export async function getSiteSettings(): Promise<SiteSettings> {
  "use cache";
  cacheTag("site-settings");
  cacheLife("minutes");

  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("site_settings")
    .select("*")
    .eq("id", 1)
    .single();

  if (error || !data) return FALLBACK;
  return { ...FALLBACK, ...data } as SiteSettings;
}
