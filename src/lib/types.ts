export type PropertyType =
  | "apartamento"
  | "casa"
  | "cobertura"
  | "sobrado"
  | "terreno"
  | "comercial"
  | "sala_comercial"
  | "galpao"
  | "studio"
  | "rural"
  | "outro";

export type PropertyPurpose = "venda" | "locacao" | "venda_locacao";

export type PropertyStatus =
  | "draft"
  | "published"
  | "sold"
  | "rented"
  | "archived";

export type AddressVisibility = "full" | "approximate" | "hidden";

export type LeadSource = "form" | "whatsapp" | "contact" | "other";

export type LeadStatus =
  | "new"
  | "contacted"
  | "qualified"
  | "visit_scheduled"
  | "closed"
  | "archived";

export interface Property {
  id: string;
  title: string;
  slug: string;
  reference_code: string;
  excerpt: string | null;
  description: string | null;
  property_type: PropertyType;
  purpose: PropertyPurpose;
  status: PropertyStatus;
  featured: boolean;
  published_at: string | null;
  price: number | null;
  currency: string;
  condo_fee: number | null;
  iptu: number | null;
  iptu_periodicity: "mensal" | "anual" | null;
  zip_code: string | null;
  street: string | null;
  street_number: string | null;
  complement: string | null;
  neighborhood: string | null;
  city: string;
  state: string;
  latitude: number | null;
  longitude: number | null;
  address_visibility: AddressVisibility;
  built_area: number | null;
  total_area: number | null;
  bedrooms: number | null;
  suites: number | null;
  bathrooms: number | null;
  garage_spaces: number | null;
  floor: number | null;
  features: string[];
  seo_title: string | null;
  seo_description: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface PropertyImage {
  id: string;
  property_id: string;
  storage_path: string;
  alt: string | null;
  position: number;
  is_cover: boolean;
  created_at: string;
}

export type PropertyWithImages = Property & {
  property_images: PropertyImage[];
};

export interface Lead {
  id: string;
  property_id: string | null;
  name: string;
  email: string | null;
  phone: string | null;
  message: string;
  source: LeadSource;
  status: LeadStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
  properties?: { title: string; reference_code: string } | null;
}

export interface SiteSettings {
  id: number;
  company_name: string;
  tagline: string | null;
  hero_title: string | null;
  hero_subtitle: string | null;
  hero_image_path: string | null;
  about_title: string | null;
  about_text: string | null;
  differentials: { title: string; description: string }[];
  phone: string | null;
  whatsapp_number: string | null;
  whatsapp_message: string | null;
  email: string | null;
  address: string | null;
  business_hours: string | null;
  instagram_url: string | null;
  facebook_url: string | null;
  linkedin_url: string | null;
  youtube_url: string | null;
  footer_text: string | null;
  logo_path: string | null;
  seo_title: string | null;
  seo_description: string | null;
  seo_og_image_path: string | null;
  updated_at: string;
}

export interface Profile {
  id: string;
  full_name: string | null;
  role: "admin" | "editor";
  created_at: string;
  updated_at: string;
}

export interface PropertyFilters {
  q?: string;
  purpose?: PropertyPurpose;
  property_type?: PropertyType;
  city?: string;
  neighborhood?: string;
  min_price?: number;
  max_price?: number;
  bedrooms?: number;
  bathrooms?: number;
  garage_spaces?: number;
  min_area?: number;
  max_area?: number;
  sort?: "recent" | "price_asc" | "price_desc";
  page?: number;
}
