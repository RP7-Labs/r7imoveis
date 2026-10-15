-- ============================================================================
-- Integração DWV — vincula imóveis importados da plataforma ao catálogo local
-- ============================================================================

-- Identificador da propriedade no DWV (nulo = cadastro manual)
alter table public.properties
  add column if not exists dwv_id text;

-- Unicidade parcial: manuais (dwv_id nulo) não conflitam entre si
create unique index if not exists properties_dwv_id_key
  on public.properties (dwv_id)
  where dwv_id is not null;

-- Timestamp da última sincronização com o DWV
alter table public.properties
  add column if not exists dwv_synced_at timestamptz;
