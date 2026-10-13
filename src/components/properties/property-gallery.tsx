"use client";

import { ChevronLeft, ChevronRight, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { STORAGE_BUCKETS } from "@/lib/constants";
import { storageUrl } from "@/lib/storage";
import { cn } from "@/lib/utils";
import type { PropertyImage as PropertyImageType } from "@/lib/types";

export function PropertyGallery({
  images,
  title,
}: {
  images: PropertyImageType[];
  title: string;
}) {
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  const urls = images.map((i) => ({
    src: storageUrl(i.storage_path, STORAGE_BUCKETS.propertyImages)!,
    alt: i.alt ?? title,
  }));

  const prev = useCallback(
    () => setActive((i) => (i - 1 + urls.length) % urls.length),
    [urls.length],
  );
  const next = useCallback(
    () => setActive((i) => (i + 1) % urls.length),
    [urls.length],
  );

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(false);
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox, prev, next]);

  if (urls.length === 0) {
    return (
      <div className="flex aspect-[16/10] items-center justify-center rounded-2xl bg-petrol-50 text-petrol-300">
        <span className="font-display">Fotos em breve</span>
      </div>
    );
  }

  const current = urls[active];

  return (
    <div>
      <div
        className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-sand"
        onTouchStart={(e) => setTouchStart(e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (touchStart == null) return;
          const delta = e.changedTouches[0].clientX - touchStart;
          if (Math.abs(delta) > 40) (delta > 0 ? prev : next)();
          setTouchStart(null);
        }}
      >
        <button
          type="button"
          onClick={() => setLightbox(true)}
          className="absolute inset-0 z-10 cursor-zoom-in"
          aria-label="Ampliar foto"
        />
        <Image
          src={current.src}
          alt={current.alt}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 66vw"
          className="object-cover"
        />
        {urls.length > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              aria-label="Foto anterior"
              className="absolute left-3 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/90 p-2 text-petrol-700 shadow-soft hover:bg-white"
            >
              <ChevronLeft className="size-5" aria-hidden />
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Próxima foto"
              className="absolute right-3 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/90 p-2 text-petrol-700 shadow-soft hover:bg-white"
            >
              <ChevronRight className="size-5" aria-hidden />
            </button>
            <span className="absolute bottom-3 right-3 z-20 rounded-full bg-graphite-900/70 px-3 py-1 text-xs text-white">
              {active + 1} / {urls.length}
            </span>
          </>
        )}
      </div>

      {urls.length > 1 && (
        <div className="mt-3 flex gap-3 overflow-x-auto pb-1">
          {urls.map((img, i) => (
            <button
              key={img.src}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Ver foto ${i + 1}`}
              aria-current={i === active}
              className={cn(
                "relative h-20 w-28 shrink-0 overflow-hidden rounded-lg ring-2 transition",
                i === active
                  ? "ring-petrol-500"
                  : "ring-transparent opacity-70 hover:opacity-100",
              )}
            >
              <Image
                src={img.src}
                alt=""
                fill
                sizes="112px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Galeria ampliada"
          className="fixed inset-0 z-50 flex items-center justify-center bg-graphite-950/95 p-4"
          onClick={() => setLightbox(false)}
        >
          <button
            type="button"
            onClick={() => setLightbox(false)}
            aria-label="Fechar galeria"
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
          >
            <X className="size-6" aria-hidden />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              prev();
            }}
            aria-label="Foto anterior"
            className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white hover:bg-white/20"
          >
            <ChevronLeft className="size-6" aria-hidden />
          </button>
          <div
            className="relative h-[80vh] w-full max-w-5xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={current.src}
              alt={current.alt}
              fill
              sizes="100vw"
              className="object-contain"
            />
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              next();
            }}
            aria-label="Próxima foto"
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white hover:bg-white/20"
          >
            <ChevronRight className="size-6" aria-hidden />
          </button>
        </div>
      )}
    </div>
  );
}
