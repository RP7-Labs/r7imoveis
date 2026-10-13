import {
  ArrowRight,
  MapPin,
  MessageCircle,
  TrendingUp,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { PropertyCard } from "@/components/properties/property-card";
import { HomeSearch } from "@/components/site/home-search";
import { ButtonLink, buttonClasses } from "@/components/ui/button";
import { STORAGE_BUCKETS } from "@/lib/constants";
import {
  getFeaturedProperties,
  getLocationFacets,
} from "@/lib/properties";
import { getSiteSettings } from "@/lib/settings";
import { storageUrl } from "@/lib/storage";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

export default async function HomePage() {
  const settings = await getSiteSettings();
  const whatsappUrl = buildWhatsAppUrl(
    settings.whatsapp_number,
    settings.whatsapp_message ?? undefined,
  );
  const heroImage =
    storageUrl(settings.hero_image_path, STORAGE_BUCKETS.siteAssets) ??
    "/images/hero/r7-hero-skyline.jpg";

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-petrol-900">
        <Image
          src={heroImage}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-petrol-950/70 via-petrol-900/55 to-petrol-950/80" />
        <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-20 sm:px-6 sm:pt-28 lg:px-8">
          <p className="text-sm font-medium uppercase tracking-[0.22em] text-champagne-300">
            {settings.tagline}
          </p>
          <h1 className="mt-4 max-w-3xl font-display text-4xl leading-tight text-white sm:text-5xl lg:text-6xl">
            {settings.hero_title}
          </h1>
          {settings.hero_subtitle && (
            <p className="mt-5 max-w-xl text-lg text-petrol-100">
              {settings.hero_subtitle}
            </p>
          )}
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/imoveis" variant="champagne" size="lg">
              Explorar imóveis
              <ArrowRight className="size-5" aria-hidden />
            </ButtonLink>
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
          </div>

          <div className="mt-12 max-w-4xl">
            <Suspense fallback={null}>
              <HomeSearchWrapper />
            </Suspense>
          </div>
        </div>
      </section>

      {/* Imóveis em destaque */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-champagne-500">
              Seleção R7
            </p>
            <h2 className="mt-2 font-display text-3xl text-petrol-800 sm:text-4xl">
              Imóveis em destaque
            </h2>
          </div>
          <Link
            href="/imoveis"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-petrol-600 hover:text-petrol-700"
          >
            Ver todos os imóveis
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
        <Suspense
          fallback={
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-[4/5] animate-pulse rounded-2xl bg-sand"
                />
              ))}
            </div>
          }
        >
          <FeaturedProperties />
        </Suspense>
      </section>

      {/* Categorias — tiles oficiais do manual de marca */}
      <section className="border-y border-sand bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-champagne-500">
            Portfólio
          </p>
          <h2 className="mt-2 font-display text-3xl text-petrol-800 sm:text-4xl">
            Explore por categoria
          </h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                label: "Apartamentos",
                href: "/imoveis?property_type=apartamento",
                img: "/images/categorias/apartamentos.jpg",
              },
              {
                label: "Casas",
                href: "/imoveis?property_type=casa",
                img: "/images/categorias/casas.jpg",
              },
              {
                label: "Comerciais",
                href: "/imoveis?property_type=comercial",
                img: "/images/categorias/comerciais.jpg",
              },
              {
                label: "Terrenos",
                href: "/imoveis?property_type=terreno",
                img: "/images/categorias/terrenos.jpg",
              },
            ].map((c) => (
              <Link
                key={c.label}
                href={c.href}
                aria-label={`Ver imóveis: ${c.label}`}
                className="group relative block overflow-hidden rounded-2xl shadow-soft transition-shadow hover:shadow-card"
              >
                <span className="relative block aspect-[8/7]">
                  <Image
                    src={c.img}
                    alt={c.label}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </span>
                <span className="absolute bottom-3 right-3 flex size-9 items-center justify-center rounded-full bg-white/90 text-petrol-700 opacity-0 transition-opacity group-hover:opacity-100">
                  <ArrowRight className="size-4" aria-hidden />
                </span>
                <span className="sr-only">{c.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Banner editorial do manual de marca */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <Link
          href="/imoveis"
          aria-label="Explorar imóveis"
          className="group relative block overflow-hidden rounded-3xl shadow-card"
        >
          <span className="relative block aspect-[16/10] sm:aspect-[21/9]">
            <Image
              src="/images/banners/hero-litoral.jpg"
              alt="Investimentos que constroem o seu futuro — R7 Investimentos Imobiliários"
              fill
              sizes="100vw"
              className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
            />
          </span>
        </Link>
      </section>

      {/* Institucional */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-champagne-500">
              A R7
            </p>
            <h2 className="mt-2 font-display text-3xl text-petrol-800 sm:text-4xl">
              {settings.about_title}
            </h2>
            {settings.about_text && (
              <p className="mt-5 leading-relaxed text-graphite-600">
                {settings.about_text}
              </p>
            )}
            <ButtonLink href="/sobre" variant="outline" className="mt-7">
              Conheça a R7
            </ButtonLink>
          </div>

          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl shadow-card">
            <Image
              src="/images/institucional/casa-contemporanea.jpg"
              alt="Residência contemporânea com piscina — composição institucional R7"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        </div>

        {settings.differentials.length > 0 && (
          <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {settings.differentials.map((d) => (
              <li
                key={d.title}
                className="rounded-2xl bg-white p-6 shadow-soft"
              >
                <TrendingUp
                  className="size-6 text-champagne-500"
                  aria-hidden
                />
                <h3 className="mt-3 font-medium text-petrol-800">{d.title}</h3>
                <p className="mt-1.5 text-sm text-graphite-500">
                  {d.description}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* CTA final */}
      <section className="bg-petrol-800">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 px-4 py-16 text-center sm:px-6 lg:px-8">
          <MapPin className="size-8 text-champagne-300" aria-hidden />
          <h2 className="max-w-2xl font-display text-3xl text-white sm:text-4xl">
            Quer comprar, vender ou investir em um imóvel?
          </h2>
          <p className="max-w-xl text-petrol-100">
            Fale com a equipe da R7 e receba atendimento personalizado.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {whatsappUrl && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonClasses("whatsapp", "lg")}
              >
                <MessageCircle className="size-5" aria-hidden />
                WhatsApp
              </a>
            )}
            <ButtonLink href="/contato" variant="champagne" size="lg">
              Entrar em contato
            </ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}

async function HomeSearchWrapper() {
  const facets = await getLocationFacets();
  return <HomeSearch cities={facets.cities} />;
}

async function FeaturedProperties() {
  const properties = await getFeaturedProperties(6);
  if (properties.length === 0) {
    return (
      <p className="mt-10 rounded-2xl border border-dashed border-sand-dark bg-white/60 px-6 py-12 text-center text-sm text-graphite-500">
        Nenhum imóvel em destaque no momento.{" "}
        <Link href="/imoveis" className="font-medium text-petrol-600 underline">
          Ver catálogo completo
        </Link>
      </p>
    );
  }
  return (
    <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {properties.map((p, i) => (
        <PropertyCard key={p.id} property={p} priority={i < 3} />
      ))}
    </div>
  );
}
