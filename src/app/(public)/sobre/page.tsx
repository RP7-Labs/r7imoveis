import { ArrowRight, TrendingUp } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import { Suspense } from "react";
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
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-champagne-500">
          Institucional
        </p>
        <h1 className="mt-2 font-display text-3xl text-petrol-800 sm:text-4xl">
          {settings.about_title ?? settings.company_name}
        </h1>
      </header>

      <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-3xl shadow-card">
        <Image
          src="/images/institucional/interior-vista-mar.jpg"
          alt="Imóveis para viver, investir e crescer — composição institucional R7"
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 66vw"
          className="object-cover"
        />
      </div>

      {settings.about_text && (
        <div className="mt-6 space-y-4 leading-relaxed text-graphite-600">
          {settings.about_text.split(/\n{2,}/).map((p) => (
            <p key={p.slice(0, 40)}>{p}</p>
          ))}
        </div>
      )}

      {settings.differentials.length > 0 && (
        <section className="mt-12">
          <h2 className="font-display text-2xl text-petrol-800">
            Nossos diferenciais
          </h2>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2">
            {settings.differentials.map((d) => (
              <li key={d.title} className="rounded-2xl bg-white p-6 shadow-soft">
                <TrendingUp className="size-6 text-champagne-500" aria-hidden />
                <h3 className="mt-3 font-medium text-petrol-800">{d.title}</h3>
                <p className="mt-1.5 text-sm text-graphite-500">
                  {d.description}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="mt-12 rounded-2xl bg-petrol-800 p-8 text-center">
        <h2 className="font-display text-2xl text-white">
          Veja os imóveis disponíveis
        </h2>
        <ButtonLink
          href="/imoveis"
          variant="champagne"
          size="lg"
          className="mt-5"
        >
          Explorar catálogo
          <ArrowRight className="size-5" aria-hidden />
        </ButtonLink>
      </div>
    </>
  );
}
