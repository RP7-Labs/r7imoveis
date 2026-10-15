"use client";

import { useEffect, useRef } from "react";

/**
 * Vídeo do hero — escolhe a fonte via matchMedia para que o browser baixe
 * apenas UMA versão (mobile OU desktop). Múltiplos <source> com media
 * causam download duplo em alguns cenários (~23MB de payload).
 */
export function HeroVideo({ poster }: { poster: string }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const mobile = window.matchMedia("(max-width: 767px)").matches;
    v.src = mobile ? "/video/hero-bc-mobile.mp4" : "/video/hero-bc-desktop.mp4";
    void v.play().catch(() => {
      /* autoplay bloqueado — o poster segue visível */
    });
  }, []);

  return (
    <video
      ref={ref}
      aria-hidden
      autoPlay
      muted
      loop
      playsInline
      preload="none"
      poster={poster}
      className="absolute inset-0 h-full w-full object-cover object-center"
    />
  );
}
