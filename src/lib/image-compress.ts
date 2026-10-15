const MAX_DIMENSION = 2048;
const WEBP_QUALITY = 0.82;

export interface CompressedImage {
  blob: Blob;
  name: string;
  type: string;
  originalSize: number;
  finalSize: number;
}

/**
 * Comprime uma imagem no browser: redimensiona para no máx. 2048px no lado
 * maior e re-encoda em WebP q0.82. Se o resultado não for menor que o
 * original (ex.: imagem já otimizada), devolve o arquivo original.
 * Fotos de celular (8-20MB) costumam sair com 300-800KB.
 */
export async function compressImage(file: File): Promise<CompressedImage> {
  const fallback: CompressedImage = {
    blob: file,
    name: file.name,
    type: file.type,
    originalSize: file.size,
    finalSize: file.size,
  };

  try {
    const bitmap = await createImageBitmap(file);
    const { width, height } = bitmap;
    const scale = Math.min(1, MAX_DIMENSION / Math.max(width, height));
    const w = Math.round(width * scale);
    const h = Math.round(height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return fallback;
    ctx.drawImage(bitmap, 0, 0, w, h);
    bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob((b) => resolve(b), "image/webp", WEBP_QUALITY),
    );
    if (!blob || blob.size >= file.size) return fallback;

    return {
      blob,
      name: file.name.replace(/\.[^.]+$/, "") + ".webp",
      type: "image/webp",
      originalSize: file.size,
      finalSize: blob.size,
    };
  } catch {
    return fallback;
  }
}
