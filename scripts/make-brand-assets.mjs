import sharp from "sharp";

const SRC = "public/brand/r7-logo-1200.jpg";
const BG = [63, 89, 91];
const CHAMPAGNE = [201, 189, 171];
const PETROL = [46, 66, 68];

function keyAlpha(r, g, b) {
  const d = Math.sqrt((r - BG[0]) ** 2 + (g - BG[1]) ** 2 + (b - BG[2]) ** 2);
  const t0 = 35, t1 = 110;
  return Math.max(0, Math.min(255, Math.round(((d - t0) / (t1 - t0)) * 255)));
}

async function keyed(cropTopPct, color) {
  const img = sharp(SRC);
  const meta = await img.metadata();
  const h = Math.round(meta.height * cropTopPct);
  const raw = await img
    .extract({ left: 0, top: 0, width: meta.width, height: h })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const buf = Buffer.from(raw.data);
  for (let i = 0; i < buf.length; i += 4) {
    buf[i + 3] = keyAlpha(buf[i], buf[i + 1], buf[i + 2]);
    if (color) {
      buf[i] = color[0]; buf[i + 1] = color[1]; buf[i + 2] = color[2];
    }
  }
  return { buf, width: raw.info.width, height: raw.info.height };
}

// Corta no primeiro gap vazio real (>=6 linhas) apos o inicio do conteudo:
// esse e o espaco entre o monograma "R7" e a primeira linha de texto do lockup.
function monogramCut({ buf, width, height }) {
  const rowAlpha = new Array(height).fill(0);
  for (let y = 0; y < height; y++) {
    let sum = 0;
    for (let x = 0; x < width; x++) sum += buf[(y * width + x) * 4 + 3];
    rowAlpha[y] = sum / width / 255;
  }
  const THRESH = 0.02;
  let y = 0;
  while (y < height && rowAlpha[y] <= THRESH) y++; // pula margem superior vazia
  const firstContent = y;
  let gapStart = -1;
  for (; y < height; y++) {
    if (rowAlpha[y] <= THRESH) {
      if (gapStart < 0) gapStart = y;
      if (y - gapStart >= 6) return Math.min(height, gapStart + 3);
    } else {
      gapStart = -1;
    }
  }
  return height; // sem gap: conteudo unico
}

async function toPng({ buf, width, height }, cutY, out) {
  const png = await sharp(buf, {
    raw: { width, height, channels: 4 },
  })
    .extract({ left: 0, top: 0, width, height: cutY })
    .png()
    .toBuffer();
  const trimmed = await sharp(png).trim({ threshold: 10 }).png().toFile(out);
  console.log(out, trimmed.width + "x" + trimmed.height, Math.round(trimmed.size / 1024) + "KB");
}

const champagne = await keyed(0.62, CHAMPAGNE);
const petrol = await keyed(0.62, PETROL);
const cut = monogramCut(champagne);

await toPng(champagne, cut, "public/brand/r7-mono-champagne.png");
await toPng(petrol, cut, "public/brand/r7-mono-petrol.png");
await process_(1.0, CHAMPAGNE, "public/brand/r7-lockup-champagne.png");
await process_(1.0, PETROL, "public/brand/r7-lockup-petrol.png");

async function process_(cropTopPct, color, out) {
  const k = await keyed(cropTopPct, color);
  await toPng(k, k.height, out);
}
