"use client";

import {
  ArrowDown,
  ArrowUp,
  ImageOff,
  Loader2,
  Star,
  Trash2,
  Upload,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import {
  deletePropertyImage,
  movePropertyImage,
  registerPropertyImage,
  setCoverImage,
} from "@/app/admin/(panel)/actions";
import {
  ACCEPTED_IMAGE_TYPES,
  MAX_IMAGE_SIZE_MB,
  STORAGE_BUCKETS,
} from "@/lib/constants";
import { storageUrl } from "@/lib/storage";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import type { PropertyImage } from "@/lib/types";

export function ImageManager({
  propertyId,
  images: initialImages,
}: {
  propertyId: string;
  images: PropertyImage[];
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState(initialImages);
  const [uploading, setUploading] = useState(0);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function uploadFiles(files: FileList | null) {
    if (!files?.length) return;
    setError(null);
    const supabase = createClient();

    for (const file of Array.from(files)) {
      if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        setError(`Formato não suportado: ${file.name}. Use JPG, PNG, WebP ou AVIF.`);
        continue;
      }
      if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
        setError(`${file.name} excede ${MAX_IMAGE_SIZE_MB} MB.`);
        continue;
      }

      setUploading((n) => n + 1);
      try {
        const ext = file.name.split(".").pop() ?? "jpg";
        const path = `${propertyId}/${crypto.randomUUID()}.${ext}`;

        const { error: upErr } = await supabase.storage
          .from(STORAGE_BUCKETS.propertyImages)
          .upload(path, file, { cacheControl: "31536000", upsert: false });

        if (upErr) {
          setError(`Falha no upload de ${file.name}: ${upErr.message}`);
          continue;
        }

        const result = await registerPropertyImage(propertyId, path, file.name);
        if (!result.ok) {
          setError(result.error ?? "Erro ao registrar imagem.");
          continue;
        }
        router.refresh();
      } finally {
        setUploading((n) => n - 1);
      }
    }
    // Recarrega lista do servidor
    const supabase2 = createClient();
    const { data } = await supabase2
      .from("property_images")
      .select("*")
      .eq("property_id", propertyId)
      .order("position");
    if (data) setImages(data);
  }

  async function act(id: string, fn: () => Promise<{ ok: boolean; error?: string }>) {
    setBusyId(id);
    setError(null);
    const result = await fn();
    setBusyId(null);
    if (!result.ok) {
      setError(result.error ?? "Erro na operação.");
      return;
    }
    router.refresh();
    const supabase = createClient();
    const { data } = await supabase
      .from("property_images")
      .select("*")
      .eq("property_id", propertyId)
      .order("position");
    if (data) setImages(data);
  }

  return (
    <section className="rounded-2xl bg-white p-6 shadow-soft">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="font-serif text-lg text-petrol-900">Fotografias</h2>
        <span className="text-xs text-graphite-400">
          JPG, PNG, WebP ou AVIF · até {MAX_IMAGE_SIZE_MB} MB cada
        </span>
      </div>

      <div
        className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-sand-dark bg-offwhite px-6 py-10 text-center"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          void uploadFiles(e.dataTransfer.files);
        }}
      >
        <Upload className="size-8 text-champagne-500" aria-hidden />
        <p className="mt-3 text-sm text-graphite-500">
          Arraste fotos aqui ou
        </p>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading > 0}
          className="mt-2 rounded-full bg-petrol-500 px-5 py-2 text-sm font-medium text-white hover:bg-petrol-600 disabled:opacity-50"
        >
          {uploading > 0 ? `Enviando ${uploading}…` : "Selecionar arquivos"}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_IMAGE_TYPES.join(",")}
          multiple
          className="hidden"
          onChange={(e) => {
            void uploadFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {error && (
        <p role="alert" className="mt-4 rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-700">
          {error}
        </p>
      )}

      {images.length === 0 ? (
        <p className="mt-6 flex items-center justify-center gap-2 text-sm text-graphite-400">
          <ImageOff className="size-4" aria-hidden />
          Nenhuma foto enviada ainda.
        </p>
      ) : (
        <ul className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {images.map((img, i) => (
            <li
              key={img.id}
              className={cn(
                "group relative overflow-hidden rounded-xl bg-sand",
                img.is_cover && "ring-2 ring-champagne-400",
              )}
            >
              <div className="relative aspect-[4/3]">
                <Image
                  src={storageUrl(img.storage_path)!}
                  alt={img.alt ?? ""}
                  fill
                  sizes="(max-width: 640px) 50vw, 25vw"
                  className="object-cover"
                />
              </div>

              {img.is_cover && (
                <span className="absolute left-2 top-2 rounded-full bg-champagne-300 px-2.5 py-0.5 text-xs font-medium text-petrol-900">
                  Capa
                </span>
              )}

              <div className="absolute inset-x-0 bottom-0 flex justify-center gap-1 bg-gradient-to-t from-graphite-950/80 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                <IconBtn
                  label="Mover para cima"
                  disabled={i === 0 || busyId === img.id}
                  onClick={() => act(img.id, () => movePropertyImage(img.id, "up"))}
                >
                  <ArrowUp className="size-4" aria-hidden />
                </IconBtn>
                <IconBtn
                  label="Mover para baixo"
                  disabled={i === images.length - 1 || busyId === img.id}
                  onClick={() => act(img.id, () => movePropertyImage(img.id, "down"))}
                >
                  <ArrowDown className="size-4" aria-hidden />
                </IconBtn>
                <IconBtn
                  label="Definir como capa"
                  disabled={img.is_cover || busyId === img.id}
                  onClick={() => act(img.id, () => setCoverImage(img.id))}
                >
                  <Star className="size-4" aria-hidden />
                </IconBtn>
                <IconBtn
                  label="Excluir foto"
                  disabled={busyId === img.id}
                  danger
                  onClick={() => {
                    if (confirm("Excluir esta foto?")) {
                      void act(img.id, () => deletePropertyImage(img.id));
                    }
                  }}
                >
                  <Trash2 className="size-4" aria-hidden />
                </IconBtn>
              </div>

              {busyId === img.id && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/60">
                  <Loader2 className="size-5 animate-spin text-petrol-600" aria-hidden />
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function IconBtn({
  label,
  onClick,
  disabled,
  danger,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={cn(
        "rounded-full bg-white/90 p-1.5 text-graphite-600 hover:bg-white disabled:opacity-40",
        danger && "text-red-600",
      )}
    >
      {children}
    </button>
  );
}
