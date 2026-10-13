"use client";

import { Menu, MessageCircle, X } from "lucide-react";
import { InstagramIcon } from "@/components/icons/brands";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Logo } from "@/components/brand/logo";
import { buttonClasses } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Início" },
  { href: "/imoveis", label: "Imóveis" },
  { href: "/sobre", label: "A R7" },
  { href: "/contato", label: "Contato" },
];

export function SiteHeader({
  logoSrc,
  whatsappUrl,
  instagramUrl,
}: {
  logoSrc?: string | null;
  whatsappUrl?: string | null;
  instagramUrl?: string | null;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-40 border-b border-sand bg-offwhite/95 backdrop-blur">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          aria-label="R7 Investimentos Imobiliários — início"
          className="shrink-0"
        >
          <Logo src={logoSrc} />
        </Link>

        <nav aria-label="Navegação principal" className="hidden lg:block">
          <ul className="flex items-center gap-8">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-[13px] font-semibold uppercase tracking-[0.14em] text-graphite-600 transition-colors hover:text-petrol-600"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          {instagramUrl && (
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram da R7"
              className="hidden rounded-full p-2 text-graphite-500 transition-colors hover:bg-petrol-50 hover:text-petrol-600 sm:inline-flex"
            >
              <InstagramIcon className="size-5" aria-hidden />
            </a>
          )}
          {whatsappUrl && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                buttonClasses("primary", "sm"),
                "hidden sm:inline-flex",
              )}
            >
              <MessageCircle className="size-4" aria-hidden />
              Fale conosco
            </a>
          )}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? "Fechar menu" : "Abrir menu"}
            className="inline-flex rounded-full p-2 text-petrol-700 hover:bg-petrol-50 lg:hidden"
          >
            {open ? (
              <X className="size-6" aria-hidden />
            ) : (
              <Menu className="size-6" aria-hidden />
            )}
          </button>
        </div>
      </div>

      {/* Menu mobile */}
      {open && (
        <div className="fixed inset-x-0 top-18 bottom-0 z-40 overflow-y-auto bg-offwhite lg:hidden">
          <nav aria-label="Menu mobile" className="px-4 py-6">
            <ul className="flex flex-col divide-y divide-sand">
              {NAV.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="block py-4 font-display text-xl text-petrol-800"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-col gap-3">
              {whatsappUrl && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={buttonClasses("whatsapp", "lg")}
                >
                  <MessageCircle className="size-5" aria-hidden />
                  Falar no WhatsApp
                </a>
              )}
              {instagramUrl && (
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={buttonClasses("outline", "lg")}
                >
                  <InstagramIcon className="size-5" aria-hidden />
                  Instagram
                </a>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
