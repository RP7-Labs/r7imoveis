/**
 * Restaura um backup gerado por `npm run backup` em um projeto Supabase novo.
 *
 * Uso:
 *   1. No .env.local do projeto NOVO (ou aponte SUPABASE_URL/KEY manualmente)
 *   2. Aplique a migration 0001_initial.sql antes (schema precisa existir)
 *   3. npm run restore -- backups/AAAA-MM-DD-HHMM
 *
 * Faz upsert por PK em cada tabela. Não restaura usuários do auth.users —
 * recrie contas no painel e atualize profiles manualmente se trocar de projeto.
 */

import fs from "node:fs";
import path from "node:path";

const dir = process.argv[2];
if (!dir || !fs.existsSync(dir)) {
  console.error("Uso: npm run restore -- backups/<pasta-do-backup>");
  process.exit(1);
}

const env = Object.fromEntries(
  fs
    .readFileSync(".env.local", "utf8")
    .split("\n")
    .filter((l) => l.includes("=") && !l.startsWith("#"))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    }),
);

const URL = env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL || !KEY) {
  console.error("Configure .env.local do projeto destino.");
  process.exit(1);
}

const headers = {
  apikey: KEY,
  Authorization: `Bearer ${KEY}`,
  "Content-Type": "application/json",
  Prefer: "resolution=merge-duplicates",
};

// Ordem respeita FKs: site_settings -> profiles -> properties -> property_images -> leads
const ORDER = ["site_settings", "profiles", "properties", "property_images", "leads"];

for (const table of ORDER) {
  const file = path.join(dir, `${table}.json`);
  if (!fs.existsSync(file)) continue;
  const rows = JSON.parse(fs.readFileSync(file, "utf8"));
  if (!rows.length) {
    console.log(`${table}: 0 linhas (vazio, pulando)`);
    continue;
  }
  const r = await fetch(`${URL}/rest/v1/${table}`, {
    method: "POST",
    headers,
    body: JSON.stringify(rows),
  });
  if (!r.ok) {
    console.error(`${table}: HTTP ${r.status} — ${(await r.text()).slice(0, 300)}`);
    continue;
  }
  console.log(`${table}: ${rows.length} linhas restauradas`);
}
console.log("Concluído.");
