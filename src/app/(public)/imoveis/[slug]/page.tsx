import {
  Bath,
  BedDouble,
  Building,
  Car,
  Layers,
  MapPin,
  MessageCircle,
  Ruler,
  Share2,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PropertyCard } from "@/components/properties/property-card";
import { PropertyGallery } from "@/components/properties/property-gallery";
import { LeadForm } from "@/components/site/lead-form";
import { Badge } from "@/components/ui/badge";
import { buttonClasses } from "@/components/ui/button";
import {
  propertyTypeLabel,
  purposeLabel,
  SITE_URL,
  STORAGE_BUCKETS,
} from "@/lib/constants";
import { formatArea, formatPrice } from "@/lib/format";
import {
  getPublishedPropertyBySlug,
  getRelatedProperties,
} from "@/lib/properties";
import { getSiteSettings } from "@/lib/settings";
import { storageUrl } from "@/lib/storage";
import { buildWhatsAppUrl, propertyWhatsAppMessage } from "@/lib/whatsapp";
import type { PropertyWithImages } from "@/lib/types";

// Detalhe do imóvel renderizado sob demanda: garante status 404 real para
// imóveis despublicados/inexistentes. Os dados permanecem cacheados via
// 'use cache' na camada de dados.
export const instant = false;

type Props = PageProps<"/imoveis/[slug]">;

async function loadProperty(slug: string) {
  return getPublishedPropertyBySlug(slug);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const property = await loadProperty(slug);
  if (!property) return { title: "Imóvel não encontrado" };

  const cover = property.property_images.find((i) => i.is_cover)
    ?? property.property_images[0];
  const image = storageUrl(cover?.storage_path, STORAGE_BUCKETS.propertyImages);

  const location = [property.neighborhood, property.city, property.state]
    .filter(Boolean)
    .join(", ");

  const title =
    property.seo_title ??
    `${property.title} — ${propertyTypeLabel(property.property_type)} em ${location}`;
  const description =
    property.seo_description ??
    property.excerpt ??
    `${propertyTypeLabel(property.property_type)} para ${purposeLabel(property.purpose).toLowerCase()} em ${location}. ${formatPrice(property.price, property.currency, property.purpose)}.`;

  return {
    title,
    description,
    alternates: { canonical: `/imoveis/${property.slug}` },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/imoveis/${property.slug}`,
      type: "website",
      images: image ? [{ url: image }] : undefined,
    },
  };
}

export default async function ImovelPage({ params }: Props) {
  const { slug } = await params;
  const [property, settings] = await Promise.all([
    loadProperty(slug),
    getSiteSettings(),
  ]);
  if (!property) notFound();

  const location = [property.neighborhood, property.city, property.state]
    .filter(Boolean)
    .join(", ");

  const fullAddress =
    property.address_visibility === "full" && property.street
      ? [
          `${property.street}${property.street_number ? `, ${property.street_number}` : ""}`,
          property.complement,
          property.neighborhood,
          `${property.city}/${property.state}`,
        ]
          .filter(Boolean)
          .join(" — ")
      : null;

  const whatsappUrl = buildWhatsAppUrl(
    settings.whatsapp_number,
    propertyWhatsAppMessage({
      title: property.title,
      referenceCode: property.reference_code,
    }),
  );

  const mapQuery =
    property.latitude != null && property.longitude != null
      ? `${property.latitude},${property.longitude}`
      : property.address_visibility !== "hidden"
        ? encodeURIComponent(`${location}`)
        : null;

  const specs = [
    { icon: BedDouble, value: property.bedrooms, singular: "Dormitório", plural: "Dormitórios" },
    { icon: BedDouble, value: property.suites, singular: "Suíte", plural: "Suítes" },
    { icon: Bath, value: property.bathrooms, singular: "Banheiro", plural: "Banheiros" },
    { icon: Car, value: property.garage_spaces, singular: "Vaga", plural: "Vagas" },
    { icon: Layers, value: property.floor, singular: "Andar", plural: "Andar" },
  ].filter((s) => s.value != null);

  const features = Array.isArray(property.features) ? property.features : [];

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      {
        "@type": "ListItem",
        position: 2,
        name: "Imóveis",
        item: `${SITE_URL}/imoveis`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: property.title,
        item: `${SITE_URL}/imoveis/${property.slug}`,
      },
    ],
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: property.title,
    description: property.excerpt ?? property.description ?? undefined,
    url: `${SITE_URL}/imoveis/${property.slug}`,
    ...(property.price != null && {
      offers: {
        "@type": "Offer",
        price: property.price,
        priceCurrency: property.currency,
      },
    }),
    address: {
      "@type": "PostalAddress",
      addressLocality: property.city,
      addressRegion: property.state,
      addressCountry: "BR",
      ...(property.address_visibility === "full" && property.street
        ? {
            streetAddress: `${property.street}${property.street_number ? `, ${property.street_number}` : ""}`,
          }
        : {}),
    },
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex flex-wrap items-center gap-1.5 text-sm text-graphite-400">
          <li>
            <Link href="/" className="hover:text-petrol-600">
              Home
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li>
            <Link href="/imoveis" className="hover:text-petrol-600">
              Imóveis
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li className="truncate text-graphite-600">{property.title}</li>
        </ol>
      </nav>

      <div className="grid gap-10 lg:grid-cols-3">
        <div className="min-w-0 lg:col-span-2">
          <PropertyGallery
            images={property.property_images}
            title={property.title}
          />

          <div className="mt-8">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="petrol">
                {purposeLabel(property.purpose)}
              </Badge>
              <Badge tone="champagne">
                {propertyTypeLabel(property.property_type)}
              </Badge>
              {property.is_launch && <Badge tone="amber">Lançamento</Badge>}
              {property.featured && <Badge tone="amber">Destaque</Badge>}
            </div>

            <h1 className="mt-3 font-display text-3xl font-light tracking-tight text-petrol-900 sm:text-4xl">
              {property.title}
            </h1>
            <p className="mt-2 flex items-center gap-1.5 text-graphite-500">
              <MapPin className="size-4 text-champagne-500" aria-hidden />
              {fullAddress ?? location}
              {property.address_visibility === "approximate" &&
                " (localização aproximada)"}
            </p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-[0.2em] text-graphite-400">
              Ref. {property.reference_code}
            </p>
          </div>

          {specs.length > 0 && (
            <dl className="mt-8 grid grid-cols-2 gap-4 rounded-3xl bg-white p-6 shadow-soft sm:grid-cols-3 lg:grid-cols-5">
              {specs.map((s) => (
                <div key={s.singular}>
                  <dt className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-graphite-400">
                    <s.icon className="size-4 text-champagne-500" aria-hidden />
                    {s.value === 1 ? s.singular : s.plural}
                  </dt>
                  <dd className="mt-1 font-display text-2xl text-petrol-800">
                    {s.value}
                  </dd>
                </div>
              ))}
            </dl>
          )}

          {(property.built_area != null || property.total_area != null) && (
            <dl className="mt-4 grid grid-cols-2 gap-4 rounded-3xl bg-white p-6 shadow-soft">
              {property.built_area != null && (
                <div>
                  <dt className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-graphite-400">
                    <Ruler className="size-4 text-champagne-500" aria-hidden />
                    Área construída
                  </dt>
                  <dd className="mt-1 font-display text-2xl text-petrol-800">
                    {formatArea(property.built_area)}
                  </dd>
                </div>
              )}
              {property.total_area != null && (
                <div>
                  <dt className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-graphite-400">
                    <Ruler className="size-4 text-champagne-500" aria-hidden />
                    Área total
                  </dt>
                  <dd className="mt-1 font-display text-2xl text-petrol-800">
                    {formatArea(property.total_area)}
                  </dd>
                </div>
              )}
            </dl>
          )}

          {(property.condo_fee != null || property.iptu != null) && (
            <dl className="mt-4 grid grid-cols-2 gap-4 rounded-3xl bg-white p-6 shadow-soft">
              {property.condo_fee != null && (
                <div>
                  <dt className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-graphite-400">
                    <Building className="size-4 text-champagne-500" aria-hidden />
                    Condomínio
                  </dt>
                  <dd className="mt-1 font-display text-2xl text-petrol-800">
                    {formatPrice(property.condo_fee)}/mês
                  </dd>
                </div>
              )}
              {property.iptu != null && (
                <div>
                  <dt className="text-xs uppercase tracking-wide text-graphite-400">
                    IPTU
                  </dt>
                  <dd className="mt-1 font-display text-2xl text-petrol-800">
                    {formatPrice(property.iptu)}
                    {property.iptu_periodicity &&
                      `/${property.iptu_periodicity === "mensal" ? "mês" : "ano"}`}
                  </dd>
                </div>
              )}
            </dl>
          )}

          {property.description && (
            <section className="mt-10">
              <h2 className="font-display text-2xl font-light tracking-tight text-petrol-800">Descrição</h2>
              <div className="mt-4 whitespace-pre-line leading-relaxed text-graphite-600">
                {property.description}
              </div>
            </section>
          )}

          {features.length > 0 && (
            <section className="mt-10">
              <h2 className="font-display text-2xl font-light tracking-tight text-petrol-800">
                Características e comodidades
              </h2>
              <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                {features.map((f) => (
                  <li
                    key={f}
                    className="flex items-center gap-2 text-sm text-graphite-600"
                  >
                    <span className="size-1.5 rounded-full bg-champagne-400" />
                    {f}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {mapQuery && (
            <section className="mt-10">
              <h2 className="font-display text-2xl font-light tracking-tight text-petrol-800">Localização</h2>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 flex items-center gap-3 rounded-3xl border border-sand bg-white p-5 text-petrol-700 shadow-soft transition-colors hover:border-champagne-400"
              >
                <MapPin className="size-6 text-champagne-500" aria-hidden />
                <span>
                  <span className="block font-medium">
                    {fullAddress ?? location}
                  </span>
                  <span className="text-sm text-graphite-400">
                    Ver no Google Maps
                  </span>
                </span>
              </a>
            </section>
          )}
        </div>

        {/* Coluna lateral — preço e contato */}
        <aside className="lg:col-span-1">
          <div className="sticky top-24 space-y-5">
            <div className="rounded-3xl bg-white p-6 shadow-card">
              <p className="text-xs uppercase tracking-wide text-graphite-400">
                {purposeLabel(property.purpose)}
              </p>
              <p className="mt-1 font-display text-3xl font-semibold text-petrol-700">
                {formatPrice(property.price, property.currency, property.purpose)}
              </p>

              <div className="mt-5 flex flex-col gap-3">
                {whatsappUrl && (
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={buttonClasses("whatsapp", "md", "w-full")}
                  >
                    <MessageCircle className="size-5" aria-hidden />
                    Chamar no WhatsApp
                  </a>
                )}
                <a
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`${property.title} — ${SITE_URL}/imoveis/${property.slug}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={buttonClasses("outline", "md", "w-full")}
                >
                  <Share2 className="size-4" aria-hidden />
                  Compartilhar
                </a>
              </div>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-soft">
              <LeadForm
                propertyId={property.id}
                propertyTitle={property.title}
                title="Tenho interesse neste imóvel"
              />
            </div>
          </div>
        </aside>
      </div>

      {/* Relacionados */}
      <Suspense fallback={null}>
        <RelatedProperties property={property} />
      </Suspense>
    </div>
  );
}

async function RelatedProperties({
  property,
}: {
  property: PropertyWithImages;
}) {
  const related = await getRelatedProperties(property, 3);
  if (related.length === 0) return null;

  return (
    <section className="mt-16 border-t border-sand pt-12">
      <div className="flex items-center gap-3">
        <span className="h-px w-8 bg-champagne-500" aria-hidden />
        <p className="eyebrow text-champagne-700">Continue explorando</p>
      </div>
      <h2 className="mt-4 font-display text-2xl font-light tracking-tight text-petrol-800 sm:text-3xl">
        Imóveis relacionados
      </h2>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {related.map((p) => (
          <PropertyCard key={p.id} property={p} />
        ))}
      </div>
    </section>
  );
}
