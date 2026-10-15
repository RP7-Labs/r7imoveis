import {
  ArrowRight,
  ArrowUpRight,
  MapPin,
  MessageCircle,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { PropertyCard } from "@/components/properties/property-card";
import { differentialIcon } from "@/components/site/differential-icon";
import { HeroVideo } from "@/components/site/hero-video";
import { HomeSearch } from "@/components/site/home-search";
import { ButtonLink, buttonClasses } from "@/components/ui/button";
import { SITE_NAME, SITE_URL, STORAGE_BUCKETS } from "@/lib/constants";
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
  const heroPoster =
    storageUrl(settings.hero_image_path, STORAGE_BUCKETS.siteAssets) ??
    "/images/hero/r7-hero-poster.webp";

  const organizationLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    name: settings.company_name || SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/brand/r7-lockup-petrol.png`,
    ...(settings.email && { email: settings.email }),
    ...(settings.phone && { telephone: settings.phone }),
    ...(settings.address && {
      address: {
        "@type": "PostalAddress",
        streetAddress: settings.address,
        addressCountry: "BR",
      },
    }),
    areaServed: ["Balneário Camboriú", "Praia Brava", "Santa Catarina"],
    sameAs: [
      settings.instagram_url,
      settings.facebook_url,
      settings.linkedin_url,
      settings.youtube_url,
    ].filter(Boolean),
  };

  const websiteLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: settings.company_name || SITE_NAME,
    url: SITE_URL,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteLd) }}
      />
      {/* Hero — vídeo drone de BC + Joel & Daiany recortados, linguagem do manual */}
      <section className="relative overflow-hidden bg-petrol-900">
        <HeroVideo poster={heroPoster} />
        <div className="absolute inset-0 bg-gradient-to-r from-petrol-950/85 via-petrol-900/55 to-petrol-950/30" />
        <div className="absolute inset-0 bg-gradient-to-b from-petrol-950/40 via-transparent to-petrol-950/80" />

        {/* Joel & Daiany — recorte sobre o vídeo, como no rascunho da Daiany */}
        <div
          aria-hidden
          className="pointer-events-none absolute bottom-0 right-0 aspect-[682/1024] h-[44%] sm:h-[58%] lg:h-[80%]"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/equipe/joel-daiany.webp"
            width={682}
            height={1024}
            alt=""
            className="h-full w-full object-contain object-bottom drop-shadow-[0_20px_40px_rgba(0,0,0,0.45)]"
          />
        </div>

        <div className="relative mx-auto flex min-h-[92svh] max-w-7xl flex-col justify-center px-4 pb-40 pt-28 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <div className="flex items-center gap-4">
              <span className="h-px w-10 bg-champagne-400" aria-hidden />
              <p className="eyebrow text-champagne-300">
                R7 Investimentos Imobiliários
              </p>
            </div>
            <h1 className="mt-7 font-display text-4xl font-light leading-[1.06] tracking-tight text-white sm:text-6xl lg:text-7xl">
              {settings.hero_title}
            </h1>
            {settings.hero_subtitle && (
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-petrol-100">
                {settings.hero_subtitle}
              </p>
            )}
            <div className="mt-10 flex flex-wrap gap-3">
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
          </div>
        </div>
      </section>

      {/* Busca — cartão flutuante sobrepondo o hero */}
      <section className="relative z-10 mx-auto -mt-24 max-w-5xl px-4 sm:px-6 lg:px-8">
        <Suspense fallback={null}>
          <HomeSearchWrapper />
        </Suspense>
      </section>

      {/* Imóveis em destaque */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="h-px w-8 bg-champagne-500" aria-hidden />
              <p className="eyebrow text-champagne-700">Seleção R7</p>
            </div>
            <h2 className="mt-4 font-display text-3xl font-light tracking-tight text-petrol-800 sm:text-4xl">
              Imóveis em destaque
            </h2>
          </div>
          <Link
            href="/imoveis"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-petrol-600 transition-colors hover:text-champagne-600"
          >
            Ver todos os imóveis
            <ArrowUpRight className="size-4" aria-hidden />
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

      {/* Categorias — tiles com cantos amplos e label sobre gradiente */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <span className="h-px w-8 bg-champagne-500" aria-hidden />
            <p className="eyebrow text-champagne-700">Portfólio</p>
          </div>
          <h2 className="mt-4 font-display text-3xl font-light tracking-tight text-petrol-800 sm:text-4xl">
            Explore por categoria
          </h2>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                label: "Apartamentos",
                href: "/imoveis?property_type=apartamento",
                img: "/images/categorias/cat-apartamentos.jpg",
              },
              {
                label: "Casas",
                href: "/imoveis?property_type=casa",
                img: "/images/categorias/cat-casas.jpg",
              },
              {
                label: "Lançamentos",
                href: "/imoveis?sort=recent",
                img: "/images/categorias/cat-lancamentos.jpg",
              },
              {
                label: "Terrenos",
                href: "/imoveis?property_type=terreno",
                img: "/images/categorias/cat-terrenos.jpg",
              },
            ].map((c) => (
              <Link
                key={c.label}
                href={c.href}
                aria-label={`Ver imóveis: ${c.label}`}
                className="group relative block overflow-hidden rounded-[1.75rem]"
              >
                <span className="relative block aspect-[4/5]">
                  <Image
                    src={c.img}
                    alt=""
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </span>
                <span className="absolute inset-0 bg-gradient-to-t from-petrol-950/75 via-petrol-950/10 to-transparent" />
                <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-5">
                  <span className="font-display text-xl font-medium text-white">
                    {c.label}
                  </span>
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-white/50 text-white transition-colors group-hover:border-champagne-300 group-hover:bg-champagne-300 group-hover:text-petrol-900">
                    <ArrowUpRight className="size-4" aria-hidden />
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Banner editorial — headline HTML sobre foto (indexável e responsivo) */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <Link
          href="/imoveis"
          aria-label="Explorar imóveis"
          className="group relative block overflow-hidden rounded-[2rem] bg-petrol-900 shadow-card"
        >
          <span className="relative block aspect-[16/10] sm:aspect-[21/9]">
            <Image
              src="/images/banners/banner-bc.jpg"
              alt="Praia Central de Balneário Camboriú vista aérea, com a Ilha das Cabras"
              fill
              sizes="100vw"
              className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
            />
          </span>
          <span className="absolute inset-0 bg-gradient-to-r from-petrol-950/85 via-petrol-950/45 to-transparent" />
          <span className="absolute inset-0 flex flex-col justify-center gap-5 p-8 sm:p-14">
            <span className="eyebrow text-champagne-300">R7 · Santa Catarina</span>
            <span className="max-w-md font-display text-3xl font-light leading-tight text-white sm:text-4xl lg:text-5xl">
              Investimentos que constroem o seu futuro
            </span>
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-champagne-300/60 px-6 py-3 text-sm font-medium text-champagne-200 transition-colors group-hover:bg-champagne-300 group-hover:text-petrol-900">
              Explorar imóveis
              <ArrowUpRight className="size-4" aria-hidden />
            </span>
          </span>
        </Link>
      </section>

      {/* Institucional — imagem em formato de arco, assinatura do manual */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="order-2 lg:order-1">
            <div className="flex items-center gap-3">
              <span className="h-px w-8 bg-champagne-500" aria-hidden />
              <p className="eyebrow text-champagne-700">A R7</p>
            </div>
            <h2 className="mt-4 font-display text-3xl font-light tracking-tight text-petrol-800 sm:text-4xl">
              {settings.about_title}
            </h2>
            {settings.about_text && (
              <p className="mt-6 leading-relaxed text-graphite-600">
                {settings.about_text}
              </p>
            )}
            <ButtonLink href="/sobre" variant="outline" className="mt-8">
              Conheça a R7
            </ButtonLink>
          </div>

          {/* Arco com moldura champagne deslocada — linguagem do manual */}
          <div className="relative order-1 mx-auto w-full max-w-md lg:order-2">
            <div
              aria-hidden
              className="absolute -right-4 -top-4 h-full w-full rounded-arch border border-champagne-400"
            />
            <div className="rounded-arch relative aspect-[4/5] overflow-hidden">
              <Image
                src="/images/institucional/escritorio-conceitual.jpg"
                alt="Recepção de escritório imobiliário contemporâneo — composição ilustrativa"
                fill
                sizes="(max-width: 1024px) 100vw, 45vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>

        {settings.differentials.length > 0 && (
          <ul className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {settings.differentials.map((d) => {
              const Icon = differentialIcon(d.title);
              return (
              <li
                key={d.title}
                className="rounded-3xl bg-white p-7 shadow-soft"
              >
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
        )}
      </section>

      {/* CTA final — bloco verde com a linha de marca espaçada do manual */}
      <section className="relative overflow-hidden bg-petrol-800">
        <div
          aria-hidden
          className="arch-outline pointer-events-none absolute -bottom-24 -left-16 h-96 w-64 opacity-70"
        />
        <div
          aria-hidden
          className="arch-outline pointer-events-none absolute -bottom-16 -right-24 h-[420px] w-72 opacity-50"
        />
        <div className="relative mx-auto flex max-w-7xl flex-col items-center gap-6 px-4 py-20 text-center sm:px-6 lg:px-8">
          <span className="flex size-14 items-center justify-center rounded-full border border-champagne-300/60 text-champagne-300">
            <MapPin className="size-6" aria-hidden />
          </span>
          <p className="eyebrow text-champagne-300">Fale com a R7</p>
          <h2 className="max-w-2xl font-display text-3xl font-light tracking-tight text-white sm:text-4xl">
            Quer comprar, vender ou investir em um imóvel?
          </h2>
          <p className="max-w-xl text-petrol-100">
            Fale com a equipe da R7 e receba atendimento personalizado.
          </p>
          <div className="mt-2 flex flex-wrap justify-center gap-3">
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
          <p className="mt-12 text-[10px] font-semibold uppercase tracking-[0.55em] text-petrol-300">
            R 7 · Investimentos Imobiliários
          </p>
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
