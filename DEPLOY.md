# Deploy — Vercel + domínio r7imoveissc.com.br

> **Estado atual (2026-10-14)**
> - Repo: `https://github.com/RP7-Labs/r7imoveis` (**público** — plano Hobby
>   da Vercel não conecta repos privados de organização; avaliar voltar a
>   privar se migrar para conta pessoal ou Vercel Pro)
> - Vercel: projeto `sukces/r7imoveis`, produção em
>   `https://r7imoveis-ten.vercel.app` — push na `main` faz deploy automático
> - Domínio `r7imoveissc.com.br` + `www` adicionados ao projeto — **falta
>   configurar o DNS no Registro.br** (ver §4)
> - Supabase: **ainda não provisionado** — env vars na Vercel estão com
>   placeholders; o site roda com dados de fallback (catálogo vazio, admin
>   indisponível) até as credenciais reais serem configuradas
> - Deploy manual alternativo: `vercel deploy --prod` (CLI já autenticado)

## 1. Repositório GitHub

Repositório já criado: `https://github.com/RP7-Labs/r7imoveis` (público,
necessário para a integração Git→Vercel no plano Hobby).

## 2. Supabase (produção)

O banco é compartilhado no Supabase da organização. Antes do deploy:

1. Aplique `supabase/migrations/0001_initial.sql` no **SQL Editor** do projeto
   de produção (ou `supabase db push` se o projeto estiver linkado via CLI).
2. Confirme em **Storage** que os buckets `property-images` e `site-assets`
   existem e estão públicos.
3. Crie o usuário admin em **Authentication → Users** e promova via SQL
   (ver README → "Criando o primeiro administrador").
4. Em **Authentication → URL Configuration**, configure:
   - Site URL: `https://r7imoveissc.com.br`
   - Redirect URLs: `https://r7imoveissc.com.br/**` e
     `http://localhost:3000/**` (desenvolvimento)

## 3. Projeto na Vercel

1. **Add New → Project** → importe o repositório GitHub.
2. Framework detectado automaticamente (Next.js). Não é necessário
   `vercel.json`.
3. Configure as variáveis de ambiente (Production + Preview):

| Variável | Valor |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://<projeto>.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon public key |
| `SUPABASE_SERVICE_ROLE_KEY` | service role key — **apenas se alguma operação futura exigir**; nunca em `NEXT_PUBLIC_*` |
| `NEXT_PUBLIC_SITE_URL` | `https://r7imoveissc.com.br` |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | fallback do WhatsApp comercial (opcional) |

4. Deploy.

## 4. Domínio

Os domínios `r7imoveissc.com.br` e `www.r7imoveissc.com.br` **já estão
adicionados ao projeto Vercel**. Falta configurar o DNS no Registro.br
(nameservers atuais: `*.auto.dns.br`). Escolha uma opção:

**Opção A — Nameservers Vercel (recomendado, gerenciamento total):**

| Alterar nameservers para |
|---|
| `ns1.vercel-dns.com` |
| `ns2.vercel-dns.com` |

**Opção B — Manter DNS no Registro.br:**

| Tipo | Nome | Valor |
|---|---|---|
| `A` | `@` | `76.76.21.21` (IP da Vercel) |
| `CNAME` | `www` | `cname.vercel-dns.com` |

Após configurar: aguarde a propagação (até 24–48h; normalmente minutos).
O HTTPS é emitido automaticamente pela Vercel. Recomendado: redirecionar
`www` → raiz em **Domains → Redirect**.

## 5. Pós-deploy — checklist

- [ ] `https://r7imoveissc.com.br` carrega com HTTPS válido
- [ ] `/admin/login` autentica o admin criado
- [ ] Cadastrar um imóvel de teste, publicar e verificar a página pública
- [ ] Upload de fotos funciona (bucket `property-images`)
- [ ] Formulário de contato cria registro em `leads`
- [ ] Botões de WhatsApp abrem `wa.me` com o número real configurado
- [ ] `/sitemap.xml` e `/robots.txt` respondem
- [ ] Enviar sitemap no Google Search Console
- [ ] Remover imóvel de teste e revisar textos placeholder

## Ambientes

- **Produção**: branch `main` → `r7imoveissc.com.br`
- **Preview**: cada PR/branch gera URL de preview na Vercel usando o mesmo
  Supabase. Se quiser isolar, crie um segundo projeto Supabase e configure
  as mesmas envs apenas para o ambiente **Preview**.

## Não fazer

- Não rodar `npm audit fix --force` cegamente (pode quebrar majors).
- Não alterar o schema de produção direto no painel — sempre via migration
  nova em `supabase/migrations/`.
- Não commitar `.env.local` nem chaves — o `.gitignore` já protege.

## Backup do banco (Supabase)

O plano Free do Supabase não faz backup automático diário — por isso o
projeto tem exportação própria:

```bash
npm run backup
```

Gera `backups/AAAA-MM-DD-HHMM/` com todas as tabelas em JSON, os arquivos
dos buckets de storage e o `schema.sql`. A pasta `backups/` está no
`.gitignore` — nunca commitar (leads contêm dados pessoais).

### Restore em outro projeto

```bash
# 1. Novo projeto Supabase: rode a migration 0001_initial.sql no SQL Editor
# 2. Aponte .env.local para o projeto NOVO
# 3. Execute:
npm run restore -- backups/AAAA-MM-DD-HHMM
```

Faz upsert por PK em ordem que respeita FKs. Contas de `auth.users` não
são exportadas — recrie os usuários no projeto novo e promova a role em
`profiles`.

### Backup agendado (opções)

- **Agendador de Tarefas do Windows**: tarefa `R7-Backup-Supabase` já
  criada — roda `scripts/backup-daily.bat` todo dia às 08h. Copie
  `backups/` para nuvem/HD externo para redundância.
- **GitHub Action → repo privado**: agendar um workflow que exporta e
  commita num repositório privado (ex.: `r7imoveis-backups`). Não usar
  artifacts em repo público — artifacts de repo público são públicos.
- **Supabase Pro** (~US$25/mês): backups diários nativos + point-in-time
  recovery — o caminho quando o projeto crescer.

## Integração DWV (catálogo de imóveis)

O site pode importar automaticamente os imóveis selecionados na
plataforma DWV (api.dwvapp.com.br):

1. A imobiliária gera o token em: DWV → Integrações → token para site
2. Configurar `DWV_API_TOKEN` no `.env.local` e na Vercel (Production)
3. `CRON_SECRET` protege `/api/cron/sync-dwv` — Vercel Cron roda diário
   às 11h UTC (08h BRT) via `vercel.json`
4. Manual: botão **"Sincronizar DWV"** em `/admin/imoveis`

Comportamento do sync (`src/lib/dwv.ts`):
- Upsert por `dwv_id` — edições manuais de SEO/slug são preservadas
- Fotos são vinculadas como URLs do CDN da DWV (não copiadas);
  fotos enviadas manualmente pelo admin são preservadas
- Imóveis que saem da integração são arquivados automaticamente
- Tipos mapeados: apartment→apartamento, house→casa, penthouse→cobertura,
  land→terreno, studio/kitnet→studio, demais→outro
