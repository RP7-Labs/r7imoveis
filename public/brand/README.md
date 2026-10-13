# Assets da marca R7

Arquivos oficiais extraídos do kit `R7_Kit_Visual_v2` (Manual de Marca R7).

## Arquivos

| Arquivo | Uso |
|---|---|
| `r7-logo.jpg` (800×800) | Lockup oficial — header, footer, admin |
| `r7-logo-1200.jpg` (1200×1200) | Versão maior para usos futuros |
| `r7-logo-fonte-original.jpg` (640×640) | Arte de origem (backup) |

## Favicons

Os ícones oficiais do kit estão aplicados via convenção do Next.js:

- `src/app/favicon.ico` — ICO multirresolução
- `src/app/icon.png` — 192×192
- `src/app/apple-icon.png` — 180×180 (apple touch)

O conjunto completo de tamanhos PNG fica em `public/icons/`.

## Regras

- **Não redesenhar nem distorcer o monograma.** A arte é raster (JPG quadrado
  sobre verde petróleo) — exibir em moldura quadrada/arredondada mantendo a
  proporção 1:1.
- A logo também pode ser substituída pelo backoffice em
  **Configurações → Identidade** (bucket `site-assets`), que tem prioridade
  sobre este arquivo — usar apenas com arte oficial.
- Paleta oficial (Manual, p. 6): verde `#3F595B`, champagne `#C9BDAB`,
  branco `#FFFFFF`, preto `#000000` — tokens em `src/app/globals.css`.
- Tipografia oficial (Manual, p. 5): Montserrat (títulos) e Helvetica (textos).
