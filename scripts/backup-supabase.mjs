/**
 * Backup completo do Supabase → backups/YYYY-MM-DD-HHmm/
 *
 * Exporta:
 *  - Todas as tabelas public.* em JSON (via PostgREST, service role)
 *  - Todos os objetos dos buckets de storage
 *  - schema.sql (referência) + manifest.json
 *
 * Uso: npm run backup
 * Restauração: veja DEPLOY.md — os JSONs são arrays prontos para upsert.
 */

import fs from "node:fs";
import path from "node:path";

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
  console.error("Faltam NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY em .env.local");
  process.exit(1);
}

const TABLES = ["profiles", "properties", "property_images", "leads", "site_settings"];
const BUCKETS = ["property-images", "site-assets"];

const stamp = new Date().toISOString().slice(0, 16).replace(/[:T]/g, "-");
const OUT = path.join("backups", stamp);
fs.mkdirSync(OUT, { recursive: true });

const headers = { apikey: KEY, Authorization: `Bearer ${KEY}` };

const manifest = { created_at: new Date().toISOString(), tables: {}, storage: {} };

for (const table of TABLES) {
  const r = await fetch(`${URL}/rest/v1/${table}?select=*`, { headers });
  if (!r.ok) {
    console.error(`tabela ${table}: HTTP ${r.status}`);
    manifest.tables[table] = { error: r.status };
    continue;
  }
  const rows = await r.json();
  fs.writeFileSync(path.join(OUT, `${table}.json`), JSON.stringify(rows, null, 2));
  manifest.tables[table] = { rows: rows.length };
  console.log(`${table}: ${rows.length} linhas`);
}

for (const bucket of BUCKETS) {
  const dir = path.join(OUT, "storage", bucket);
  fs.mkdirSync(dir, { recursive: true });
  const list = await fetch(`${URL}/storage/v1/object/list/${bucket}`, {
    method: "POST",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify({ limit: 1000, offset: 0 }),
  });
  const items = list.ok ? await list.json() : [];
  let n = 0;
  for (const item of items) {
    if (!item.id) continue; // pasta virtual
    const file = await fetch(`${URL}/storage/v1/object/public/${bucket}/${item.name}`);
    if (file.ok) {
      fs.writeFileSync(path.join(dir, item.name), Buffer.from(await file.arrayBuffer()));
      n++;
    }
  }
  manifest.storage[bucket] = { files: n };
  console.log(`bucket ${bucket}: ${n} arquivos`);
}

fs.copyFileSync("supabase/migrations/0001_initial.sql", path.join(OUT, "schema.sql"));
fs.writeFileSync(path.join(OUT, "manifest.json"), JSON.stringify(manifest, null, 2));
console.log(`\nBackup completo em ${OUT}`);
