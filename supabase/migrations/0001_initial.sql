-- ============================================================================
-- R7 Investimentos Imobiliários — Schema inicial
-- Aplicar via Supabase SQL Editor ou `supabase db push`.
-- ============================================================================

create extension if not exists pgcrypto;

-- ----------------------------------------------------------------------------
-- Tipos e helpers
-- ----------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ----------------------------------------------------------------------------
-- profiles — usuários do backoffice
-- ----------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  role text not null default 'editor' check (role in ('admin', 'editor')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Cria profile automaticamente quando um usuário é criado no Auth.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    'editor'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.has_role(roles text[])
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = any (roles)
  );
$$;

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.has_role(array['admin', 'editor']);
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.has_role(array['admin']);
$$;

-- ----------------------------------------------------------------------------
-- properties — catálogo de imóveis
-- ----------------------------------------------------------------------------

create table public.properties (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  reference_code text not null unique,
  excerpt text,
  description text,
  property_type text not null check (property_type in (
    'apartamento', 'casa', 'cobertura', 'terreno', 'studio', 'outro'
  )),
  purpose text not null default 'venda'
    check (purpose in ('venda', 'locacao', 'venda_locacao')),
  status text not null default 'draft'
    check (status in ('draft', 'published', 'sold', 'rented', 'archived')),
  featured boolean not null default false,
  published_at timestamptz,

  -- Comercial
  price numeric(14, 2),
  currency text not null default 'BRL',
  condo_fee numeric(12, 2),
  iptu numeric(12, 2),
  iptu_periodicity text check (iptu_periodicity in ('mensal', 'anual')),

  -- Localização
  zip_code text,
  street text,
  street_number text,
  complement text,
  neighborhood text,
  city text not null,
  state char(2) not null default 'SC',
  latitude double precision,
  longitude double precision,
  address_visibility text not null default 'approximate'
    check (address_visibility in ('full', 'approximate', 'hidden')),

  -- Características
  built_area numeric(10, 2),
  total_area numeric(10, 2),
  bedrooms integer,
  suites integer,
  bathrooms integer,
  garage_spaces integer,
  floor integer,
  features jsonb not null default '[]'::jsonb,

  -- SEO
  seo_title text,
  seo_description text,

  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index properties_status_idx on public.properties (status);
create index properties_purpose_idx on public.properties (purpose);
create index properties_type_idx on public.properties (property_type);
create index properties_city_idx on public.properties (city);
create index properties_neighborhood_idx on public.properties (neighborhood);
create index properties_price_idx on public.properties (price);
create index properties_published_at_idx on public.properties (published_at desc);
create index properties_featured_idx on public.properties (featured)
  where status = 'published' and featured = true;

create trigger properties_set_updated_at
  before update on public.properties
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- property_images — fotografias
-- ----------------------------------------------------------------------------

create table public.property_images (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties (id) on delete cascade,
  storage_path text not null,
  alt text,
  position integer not null default 0,
  is_cover boolean not null default false,
  created_at timestamptz not null default now()
);

create index property_images_property_idx
  on public.property_images (property_id, position);

-- No máximo uma capa por imóvel.
create unique index property_images_one_cover_idx
  on public.property_images (property_id)
  where is_cover = true;

-- ----------------------------------------------------------------------------
-- leads — interessados
-- ----------------------------------------------------------------------------

create table public.leads (
  id uuid primary key default gen_random_uuid(),
  property_id uuid references public.properties (id) on delete set null,
  name text not null,
  email text,
  phone text,
  message text not null,
  source text not null default 'form'
    check (source in ('form', 'whatsapp', 'contact', 'other')),
  status text not null default 'new' check (status in (
    'new', 'contacted', 'qualified', 'visit_scheduled', 'closed', 'archived'
  )),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index leads_status_idx on public.leads (status);
create index leads_created_at_idx on public.leads (created_at desc);
create index leads_property_idx on public.leads (property_id);

create trigger leads_set_updated_at
  before update on public.leads
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- site_settings — configurações institucionais (linha única, id = 1)
-- ----------------------------------------------------------------------------

create table public.site_settings (
  id smallint primary key default 1 check (id = 1),
  company_name text not null default 'R7 Investimentos Imobiliários',
  tagline text,
  hero_title text,
  hero_subtitle text,
  hero_image_path text,
  about_title text,
  about_text text,
  differentials jsonb not null default '[]'::jsonb,
  phone text,
  whatsapp_number text,
  whatsapp_message text,
  email text,
  address text,
  business_hours text,
  instagram_url text,
  facebook_url text,
  linkedin_url text,
  youtube_url text,
  footer_text text,
  logo_path text,
  seo_title text,
  seo_description text,
  seo_og_image_path text,
  updated_at timestamptz not null default now()
);

create trigger site_settings_set_updated_at
  before update on public.site_settings
  for each row execute function public.set_updated_at();

-- Conteúdo institucional neutro — revisar pelo backoffice.
insert into public.site_settings (
  id, company_name, tagline, hero_title, hero_subtitle,
  about_title, about_text, differentials, footer_text, instagram_url, address,
  phone, whatsapp_number, email,
  seo_title, seo_description
) values (
  1,
  'R7 Investimentos Imobiliários',
  'Imóveis selecionados em Santa Catarina',
  'Imóveis que valorizam seu patrimônio',
  'Curadoria de imóveis para compra, venda e investimento em Balneário Camboriú e Praia Brava.',
  'R7 Investimentos Imobiliários',
  E'A R7 Investimentos Imobiliários é especializada na intermediação de imóveis de alto padrão em Balneário Camboriú e Praia Brava, conectando pessoas a oportunidades imobiliárias selecionadas com visão estratégica e foco na valorização patrimonial.\n\nNosso trabalho é pautado pela transparência, pelo atendimento personalizado e pela análise criteriosa de cada oportunidade, oferecendo segurança e suporte em todas as etapas da jornada imobiliária.\n\nMais do que intermediar imóveis, buscamos construir relações de confiança e contribuir para decisões inteligentes, alinhadas aos objetivos e ao patrimônio de cada cliente.',
  '[
    {"title": "Atendimento personalizado", "description": "Conexão direta com a equipe R7, do primeiro contato à entrega das chaves."},
    {"title": "Curadoria de imóveis", "description": "Seleção criteriosa de oportunidades em Balneário Camboriú e Praia Brava."},
    {"title": "Conhecimento local", "description": "Atuação focada no mercado imobiliário do litoral catarinense."},
    {"title": "Transparência", "description": "Informações claras em todas as etapas da negociação."}
  ]'::jsonb,
  'R7 Investimentos Imobiliários — imóveis em Santa Catarina.',
  'https://www.instagram.com/r7imoveissc/',
  'Rua 3100, 780 — Centro, Balneário Camboriú/SC, 88330-304',
  '(47) 99634-6864',
  '5547996346864',
  'daianyrezende7@gmail.com',
  'R7 Investimentos Imobiliários | Imóveis em Balneário Camboriú',
  'Compre, venda e invista em imóveis em Balneário Camboriú e Praia Brava com a R7 Investimentos Imobiliários.'
)
on conflict (id) do nothing;

-- ============================================================================
-- Row Level Security
-- ============================================================================

alter table public.profiles enable row level security;
alter table public.properties enable row level security;
alter table public.property_images enable row level security;
alter table public.leads enable row level security;
alter table public.site_settings enable row level security;

-- profiles: cada usuário lê o próprio; admin lê todos. Somente admin altera papéis.
create policy profiles_select_own on public.profiles
  for select using (auth.uid() = id or public.is_admin());

create policy profiles_update_admin on public.profiles
  for update using (public.is_admin());

create policy profiles_insert_admin on public.profiles
  for insert with check (public.is_admin());

-- properties: público lê apenas publicados; staff gerencia tudo.
create policy properties_public_read on public.properties
  for select using (status = 'published' or public.is_staff());

create policy properties_staff_insert on public.properties
  for insert with check (public.is_staff());

create policy properties_staff_update on public.properties
  for update using (public.is_staff());

create policy properties_staff_delete on public.properties
  for delete using (public.is_staff());

-- property_images: público lê imagens de imóveis publicados; staff gerencia.
create policy property_images_public_read on public.property_images
  for select using (
    public.is_staff()
    or exists (
      select 1 from public.properties p
      where p.id = property_id and p.status = 'published'
    )
  );

create policy property_images_staff_insert on public.property_images
  for insert with check (public.is_staff());

create policy property_images_staff_update on public.property_images
  for update using (public.is_staff());

create policy property_images_staff_delete on public.property_images
  for delete using (public.is_staff());

-- leads: qualquer visitante pode registrar interesse; somente staff lê/edita.
create policy leads_public_insert on public.leads
  for insert with check (true);

create policy leads_staff_read on public.leads
  for select using (public.is_staff());

create policy leads_staff_update on public.leads
  for update using (public.is_staff());

create policy leads_admin_delete on public.leads
  for delete using (public.is_admin());

-- site_settings: leitura pública; somente admin edita.
create policy site_settings_public_read on public.site_settings
  for select using (true);

create policy site_settings_admin_update on public.site_settings
  for update using (public.is_admin());

-- ----------------------------------------------------------------------------
-- Storage — bucket público de fotos dos imóveis
-- ----------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('property-images', 'property-images', true)
on conflict (id) do nothing;

create policy property_images_storage_public_read
  on storage.objects for select
  using (bucket_id = 'property-images');

create policy property_images_storage_staff_insert
  on storage.objects for insert
  with check (bucket_id = 'property-images' and public.is_staff());

create policy property_images_storage_staff_update
  on storage.objects for update
  using (bucket_id = 'property-images' and public.is_staff());

create policy property_images_storage_staff_delete
  on storage.objects for delete
  using (bucket_id = 'property-images' and public.is_staff());

-- Assets institucionais (logo, hero, OG image) — público.
insert into storage.buckets (id, name, public)
values ('site-assets', 'site-assets', true)
on conflict (id) do nothing;

create policy site_assets_storage_public_read
  on storage.objects for select
  using (bucket_id = 'site-assets');

create policy site_assets_storage_admin_insert
  on storage.objects for insert
  with check (bucket_id = 'site-assets' and public.is_admin());

create policy site_assets_storage_admin_update
  on storage.objects for update
  using (bucket_id = 'site-assets' and public.is_admin());

create policy site_assets_storage_admin_delete
  on storage.objects for delete
  using (bucket_id = 'site-assets' and public.is_admin());
