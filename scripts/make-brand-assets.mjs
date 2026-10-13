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

async function process_(cropTopPct, color, out) {
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
  const png = await sharp(buf, {
    raw: { width: raw.info.width, height: raw.info.height, channels: 4 },
  }).png().toBuffer();
  const trimmed = await sharp(png).trim({ threshold: 10 }).png().toFile(out);
  console.log(out, trimmed.width + "x" + trimmed.height, Math.round(trimmed.size / 1024) + "KB");
}

await process_(0.56, CHAMPAGNE, "public/brand/r7-mono-champagne.png");
await process_(0.56, PETROL, "public/brand/r7-mono-petrol.png");
await process_(1.0, CHAMPAGNE, "public/brand/r7-lockup-champagne.png");
await process_(1.0, PETROL, "public/brand/r7-lockup-petrol.png");
