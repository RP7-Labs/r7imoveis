import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import { Suspense } from "react";
import { differentialIcon } from "@/components/site/differential-icon";
import { ButtonLink } from "@/components/ui/button";
import { getSiteSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "A R7",
  description:
    "Conheça a R7 Investimentos Imobiliários — intermediação de imóveis em Santa Catarina.",
  alternates: { canonical: "/sobre" },
};

export default function SobrePage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <Suspense fallback={null}>
        <AboutContent />
      </Suspense>
    </div>
  );
}

async function AboutContent() {
  const settings = await getSiteSettings();

  return (
    <>
      <header>
        <div className="flex items-center gap-3">
          <span className="h-px w-8 bg-champagne-500" aria-hidden />
          <p className="eyebrow text-champagne-700">Institucional</p>
        </div>
        <h1 className="mt-4 font-display text-3xl font-light tracking-tight text-petrol-800 sm:text-4xl">
          {settings.about_title ?? settings.company_name}
        </h1>
      </header>

      <div className="relative mt-10 aspect-[16/9] overflow-hidden rounded-[2rem] shadow-card">
        <Image
          src="/images/institucional/bc-panorama.jpg"
          alt="Panorama aéreo de Balneário Camboriú — Praia Central e Ilha das Cabras"
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 66vw"
          className="object-cover"
        />
      </div>

      {/* Propósito — do Manual de Marca */}
      <blockquote className="mt-12 border-l-2 border-champagne-400 pl-6">
        <p className="eyebrow text-champagne-700">Propósito</p>
        <p className="mt-3 max-w-2xl font-display text-2xl font-light leading-snug text-petrol-800">
          Conectar o imóvel ideal para cada cliente, com atendimento
          personalizado.
        </p>
      </blockquote>

      {settings.about_text && (
        <div className="mt-10 space-y-4 leading-relaxed text-graphite-600">
          {settings.about_text.split(/\n{2,}/).map((p) => (
            <p key={p.slice(0, 40)}>{p}</p>
          ))}
        </div>
      )}

      {settings.differentials.length > 0 && (
        <section className="mt-14">
          <div className="flex items-center gap-3">
            <span className="h-px w-8 bg-champagne-500" aria-hidden />
            <p className="eyebrow text-champagne-700">Diferenciais</p>
          </div>
          <h2 className="mt-4 font-display text-2xl font-light tracking-tight text-petrol-800">
            Nossos diferenciais
          </h2>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2">
            {settings.differentials.map((d) => {
              const Icon = differentialIcon(d.title);
              return (
              <li key={d.title} className="rounded-3xl bg-white p-7 shadow-soft">
                <span className="flex size-12 items-center justify-center rounded-full border border-champagne-400 text-champagne-600">
                  <Icon className="size-5" aria-hidden />
                </span>
                <h3 className="mt-4 font-medium text-petrol-800">{d.title}</h3>
                <p className="mt-1.5 text-sm text-graphite-500">
                  {d.description}
                </p>
              </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* Onde atuamos — regiões de cobertura (imagens ilustrativas) */}
      <section className="mt-14">
        <div className="flex items-center gap-3">
          <span className="h-px w-8 bg-champagne-500" aria-hidden />
          <p className="eyebrow text-champagne-700">Onde atuamos</p>
        </div>
        <h2 className="mt-4 font-display text-2xl font-light tracking-tight text-petrol-800">
          Litoral de Santa Catarina
        </h2>
        <ul className="mt-8 grid gap-4 sm:grid-cols-3">
          {[
            {
              img: "/images/regioes/balneario-camboriu.jpg",
              label: "Balneário Camboriú",
            },
            {
              img: "/images/regioes/praia-brava.jpg",
              label: "Praia Brava",
            },
            {
              img: "/images/regioes/costa-litoral.jpg",
              label: "Costa catarinense",
            },
          ].map((r) => (
            <li
              key={r.label}
              className="group relative block overflow-hidden rounded-3xl"
            >
              <span className="relative block aspect-[4/5]">
                <Image
                  src={r.img}
                  alt={`Vista aérea ilustrativa — ${r.label}`}
                  fill
                  sizes="(max-width: 640px) 100vw, 30vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </span>
              <span className="absolute inset-0 bg-gradient-to-t from-petrol-950/70 via-petrol-950/10 to-transparent" />
              <span className="absolute inset-x-0 bottom-0 p-5">
                <span className="eyebrow text-champagne-200">{r.label}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      <div className="relative mt-14 overflow-hidden rounded-[2rem] bg-petrol-800 p-10 text-center">
        <div
          aria-hidden
          className="arch-outline pointer-events-none absolute -right-12 -top-20 h-64 w-44 opacity-60"
        />
        <p className="eyebrow text-champagne-300">Catálogo</p>
        <h2 className="mt-3 font-display text-2xl font-light text-white">
          Veja os imóveis disponíveis
        </h2>
        <ButtonLink
          href="/imoveis"
          variant="champagne"
          size="lg"
          className="mt-6"
        >
          Explorar catálogo
          <ArrowRight className="size-5" aria-hidden />
        </ButtonLink>
      </div>
    </>
  );
}
