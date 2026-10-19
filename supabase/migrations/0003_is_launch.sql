-- Marca imóveis como lançamento (empreendimento novo).
-- Alimenta o filtro público /imoveis?launch=1 e o tile "Lançamentos" da home.

alter table public.properties
  add column if not exists is_launch boolean not null default false;

create index if not exists properties_is_launch_idx
  on public.properties (is_launch)
  where is_launch;
