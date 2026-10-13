# Deploy — Vercel + domínio r7imoveissc.com.br

## 1. Repositório GitHub

Crie um repositório **privado** no GitHub (sugestão de nome: `r7imoveis` ou
`r7imoveissc`, na conta/organização da TagenTech ou do proprietário) e faça o
push:

```bash
git remote add origin git@github.com:ORG/r7imoveis.git
git push -u origin main
```

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

1. Em **Project → Settings → Domains**, adicione `r7imoveissc.com.br` e
   `www.r7imoveissc.com.br`.
2. No provedor de DNS do domínio (Registro.br ou similar):

   | Tipo | Nome | Valor |
   |---|---|---|
   | `A` | `@` | `76.76.21.21` (IP da Vercel) |
   | `CNAME` | `www` | `cname.vercel-dns.com` |

3. Aguarde a propagação (até 24–48h; normalmente minutos). O HTTPS é emitido
   automaticamente pela Vercel.
4. Recomendado: redirecionar `www` → raiz em **Domains → Redirect**.

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
