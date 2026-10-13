# R7 Investimentos Imobiliários — Plataforma Web

Site institucional + catálogo de imóveis + backoffice administrativo da
**R7 Investimentos Imobiliários** — [r7imoveissc.com.br](https://r7imoveissc.com.br).

## Stack

- **Next.js 16** (App Router, Cache Components, Partial Prerendering)
- **React 19** + **TypeScript** (strict)
- **Tailwind CSS 4** (design tokens da marca)
- **Supabase** — PostgreSQL, Auth, Storage, RLS
- **Vercel** — hospedagem

## Estrutura

```
├── public/brand/            # Logo e assets oficiais da marca
├── src/
│   ├── app/
│   │   ├── (public)/        # Site público
│   │   │   ├── page.tsx             # Home
│   │   │   ├── imoveis/             # Catálogo + detalhe do imóvel
│   │   │   ├── contato/  sobre/     # Institucional
│   │   │   └── layout.tsx           # Header, footer, WhatsApp flutuante
│   │   ├── admin/
│   │   │   ├── login/               # Login do backoffice
│   │   │   └── (panel)/             # Área protegida (dashboard, imóveis,
│   │   │                            #   leads, conteúdo, configurações)
│   │   ├── api/leads/               # Captura de leads (rate limit + honeypot)
│   │   ├── sitemap.ts  robots.ts    # SEO
│   │   └── icon.svg                 # Favicon (placeholder da marca)
│   ├── components/          # ui/, layout/, site/, properties/, admin/, icons/
│   ├── lib/                 # supabase/, queries, validação, auth, formatters
│   └── proxy.ts             # Renovação de sessão + proteção /admin (ex-middleware)
├── supabase/migrations/     # Fonte de verdade do schema + RLS + storage
├── .env.example             # Variáveis necessárias (sem segredos)
└── DEPLOY.md                # Deploy na Vercel + domínio + Supabase
```

## Executando localmente

```bash
npm install
cp .env.example .env.local   # preencha com as credenciais do Supabase
npm run dev                  # http://localhost:3000
```

Scripts: `npm run dev` · `npm run build` · `npm run lint` · `npx tsc --noEmit`

## Configuração do Supabase

1. Crie um projeto em [supabase.com](https://supabase.com) (ou use o projeto
   compartilhado da organização, se for o caso).
2. Em **SQL Editor**, execute o conteúdo de
   `supabase/migrations/0001_initial.sql`. Isso cria as tabelas
   (`profiles`, `properties`, `property_images`, `leads`, `site_settings`),
   políticas de RLS e os buckets `property-images` e `site-assets`.
3. Copie **Project URL** e **anon key** em
   _Project Settings → API_ para o `.env.local` e para as variáveis da Vercel.

### Criando o primeiro administrador

O cadastro público de usuários está desabilitado por padrão — crie o primeiro
admin pelo painel do Supabase:

1. **Authentication → Users → Add user** — e-mail e senha do administrador.
   Marque _Auto Confirm User_.
2. Um `profile` é criado automaticamente com papel `editor`. Promova a admin:

```sql
update public.profiles set role = 'admin'
where id = (select id from auth.users where email = 'EMAIL_DO_ADMIN');
```

3. Acesse `/admin/login` no site.

Novos membros da equipe seguem o mesmo fluxo (deixar como `editor` permite
gerenciar imóveis e leads, mas não as configurações).

## Modelo de dados

| Tabela | Conteúdo |
|---|---|
| `profiles` | Usuários do backoffice (`admin`, `editor`) |
| `properties` | Imóveis: dados comerciais, localização, características, SEO, status (`draft`, `published`, `sold`, `rented`, `archived`) |
| `property_images` | Fotos por imóvel, ordenação, capa |
| `leads` | Interessados captados nos formulários |
| `site_settings` | Linha única: textos, contato, WhatsApp, redes sociais, logo, SEO |

Leitura pública: apenas imóveis `published` (RLS). Leads aceitam INSERT
público; leitura/edição só para equipe. Settings: leitura pública, edição só
admin.

## WhatsApp e Instagram

- O número comercial fica em **Admin → Configurações → WhatsApp** (formato
  `55DDDNUMERO`) com fallback na env `NEXT_PUBLIC_WHATSAPP_NUMBER`.
- Os links usam `https://wa.me/NUMERO?text=MENSAGEM` — o usuário sempre
  confirma o envio no próprio WhatsApp.
- Instagram configurável em **Configurações → Redes sociais**. A migração do
  perfil `@r7imoveisbalneariocamboriu` → `@r7imoveissc` deve ser feita no
  próprio Instagram; o site aponta para a URL cadastrada.

## Pendências do proprietário

- [ ] Arquivo oficial da logo → `public/brand/logo.svg` (ou upload em
      Configurações → Identidade visual)
- [ ] Número oficial de WhatsApp
- [ ] Telefone, e-mail, endereço, horário de atendimento
- [ ] Foto do hero da home (mín. 1920px)
- [ ] Imagem Open Graph (1200×630)
- [ ] Revisão dos textos institucionais (conteúdo neutro/placeholder hoje)
- [ ] Confirmar handle `@r7imoveissc` no Instagram e atualizar a URL
- [ ] CRECI / razão social para o rodapé, se desejado
