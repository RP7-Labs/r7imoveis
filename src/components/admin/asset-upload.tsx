"use client";

import { Loader2, Upload } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { ACCEPTED_IMAGE_TYPES, MAX_IMAGE_SIZE_MB, STORAGE_BUCKETS } from "@/lib/constants";
import { storageUrl } from "@/lib/storage";
import { createClient } from "@/lib/supabase/client";

/**
 * Upload de asset institucional para o bucket site-assets (somente admin).
 * Grava o caminho no input hidden `name`.
 */
export function AssetUpload({
  name,
  defaultValue,
  label,
}: {
  name: string;
  defaultValue?: string | null;
  label: string;
}) {
  const [path, setPath] = useState(defaultValue ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function upload(file: File | undefined) {
    if (!file) return;
    setError(null);

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type) && file.type !== "image/svg+xml") {
      setError("Formato não suportado. Use SVG, JPG, PNG, WebP ou AVIF.");
      return;
    }
    if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
      setError(`Arquivo excede ${MAX_IMAGE_SIZE_MB} MB.`);
      return;
    }

    setBusy(true);
    const supabase = createClient();
    const ext = file.name.split(".").pop() ?? "png";
    const storagePath = `${name}/${crypto.randomUUID()}.${ext}`;

    const { error: upErr } = await supabase.storage
      .from(STORAGE_BUCKETS.siteAssets)
      .upload(storagePath, file, { cacheControl: "31536000" });

    setBusy(false);
    if (upErr) {
      setError(upErr.message);
      return;
    }
    setPath(storagePath);
  }

  const url = storageUrl(path, STORAGE_BUCKETS.siteAssets);

  return (
    <div>
      <input type="hidden" name={name} value={path} />
      <div className="flex items-center gap-4">
        <div className="relative flex h-20 w-36 items-center justify-center overflow-hidden rounded-lg border border-dashed border-sand-dark bg-offwhite">
          {url ? (
            <Image
              src={url}
              alt={label}
              fill
              sizes="144px"
              className="object-contain"
              unoptimized={path.endsWith(".svg")}
            />
          ) : (
            <Upload className="size-5 text-graphite-300" aria-hidden />
          )}
        </div>
        <label className="cursor-pointer rounded-full border border-petrol-500/30 px-4 py-2 text-sm font-medium text-petrol-600 hover:border-petrol-500 hover:bg-petrol-50">
          {busy ? (
            <span className="flex items-center gap-2">
              <Loader2 className="size-4 animate-spin" aria-hidden />
              Enviando…
            </span>
          ) : path ? (
            "Trocar imagem"
          ) : (
            "Enviar imagem"
          )}
          <input
            type="file"
            accept={[...ACCEPTED_IMAGE_TYPES, "image/svg+xml"].join(",")}
            className="hidden"
            disabled={busy}
            onChange={(e) => {
              void upload(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
        </label>
      </div>
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  );
}
