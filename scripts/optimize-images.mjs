import sharp from "sharp";

const PUB = "public";

// Poster do hero → WebP (poster do <video> aceita webp em todos os browsers)
await sharp(`${PUB}/images/hero/r7-hero-poster.jpg`)
  .resize({ width: 1920, withoutEnlargement: true })
  .webp({ quality: 68 })
  .toFile(`${PUB}/images/hero/r7-hero-poster.webp`);

// Casal recortado → WebP com alpha (mantém 1024px — só troca o codec)
await sharp(`${PUB}/images/equipe/joel-daiany.png`)
  .webp({ quality: 85 })
  .toFile(`${PUB}/images/equipe/joel-daiany.webp`);

// Logos → redimensiona pra ~2x o maior tamanho de exibição (mantém PNG p/ OG/schema)
for (const tone of ["champagne", "petrol"]) {
  await sharp(`${PUB}/brand/r7-lockup-${tone}.png`)
    .resize({ height: 280, withoutEnlargement: true })
    .png({ compressionLevel: 9, palette: true })
    .toFile(`${PUB}/brand/r7-lockup-${tone}-opt.png`);
  await sharp(`${PUB}/brand/r7-mono-${tone}.png`)
    .resize({ height: 120, withoutEnlargement: true })
    .png({ compressionLevel: 9, palette: true })
    .toFile(`${PUB}/brand/r7-mono-${tone}-opt.png`);
}

// Substitui originais pelos otimizados (mesmo nome = zero mudança de refs)
import { renameSync, statSync } from "node:fs";
for (const tone of ["champagne", "petrol"]) {
  for (const kind of ["lockup", "mono"]) {
    const opt = `${PUB}/brand/r7-${kind}-${tone}-opt.png`;
    const orig = `${PUB}/brand/r7-${kind}-${tone}.png`;
    renameSync(opt, orig);
  }
}

for (const f of [
  `${PUB}/images/hero/r7-hero-poster.webp`,
  `${PUB}/images/equipe/joel-daiany.webp`,
  `${PUB}/brand/r7-lockup-champagne.png`,
  `${PUB}/brand/r7-mono-champagne.png`,
]) {
  console.log(f, `${(statSync(f).size / 1024).toFixed(1)}KB`);
}
