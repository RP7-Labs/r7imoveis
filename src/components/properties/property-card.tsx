import { Bath, BedDouble, Car, Ruler } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  propertyTypeLabel,
  purposeLabel,
  STORAGE_BUCKETS,
} from "@/lib/constants";
import { formatArea, formatPrice } from "@/lib/format";
import { storageUrl } from "@/lib/storage";
import type { PropertyWithImages } from "@/lib/types";

function coverImage(property: PropertyWithImages) {
  return (
    property.property_images.find((i) => i.is_cover) ??
    property.property_images[0] ??
    null
  );
}

export function PropertyCard({
  property,
  priority = false,
}: {
  property: PropertyWithImages;
  priority?: boolean;
}) {
  const cover = coverImage(property);
  const coverUrl = storageUrl(cover?.storage_path, STORAGE_BUCKETS.propertyImages);
  const href = `/imoveis/${property.slug}`;

  const statusBadge =
    property.status === "sold"
      ? { label: "Vendido", tone: "red" as const }
      : property.status === "rented"
        ? { label: "Alugado", tone: "amber" as const }
        : property.featured
          ? { label: "Destaque", tone: "champagne" as const }
          : null;

  const specs = [
    property.bedrooms != null && {
      icon: BedDouble,
      value: `${property.bedrooms}`,
      label: property.bedrooms === 1 ? "dormitório" : "dormitórios",
    },
    property.bathrooms != null && {
      icon: Bath,
      value: `${property.bathrooms}`,
      label: property.bathrooms === 1 ? "banheiro" : "banheiros",
    },
    property.garage_spaces != null && {
      icon: Car,
      value: `${property.garage_spaces}`,
      label: property.garage_spaces === 1 ? "vaga" : "vagas",
    },
    property.built_area != null && {
      icon: Ruler,
      value: formatArea(property.built_area)!,
      label: "área construída",
    },
  ].filter(Boolean) as { icon: typeof BedDouble; value: string; label: string }[];

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-soft transition-shadow hover:shadow-card">
      <Link
        href={href}
        className="absolute inset-0 z-10"
        aria-label={`Ver detalhes de ${property.title}`}
      >
        <span className="sr-only">{property.title}</span>
      </Link>

      <div className="relative aspect-[4/3] w-full overflow-hidden bg-sand">
        {coverUrl ? (
          <Image
            src={coverUrl}
            alt={cover?.alt ?? property.title}
            fill
            priority={priority}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-petrol-50 text-petrol-300">
            <span className="font-serif text-sm">Sem foto</span>
          </div>
        )}
        <div className="absolute left-3 top-3 flex gap-2">
          {statusBadge && <Badge tone={statusBadge.tone}>{statusBadge.label}</Badge>}
        </div>
        <div className="absolute right-3 top-3">
          <Badge tone="petrol" className="bg-white/90 text-petrol-700">
            {purposeLabel(property.purpose)}
          </Badge>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs uppercase tracking-wide text-graphite-400">
          {propertyTypeLabel(property.property_type)}
          {property.reference_code && ` · Ref. ${property.reference_code}`}
        </p>
        <h3 className="mt-1.5 font-serif text-lg leading-snug text-petrol-800 group-hover:text-petrol-600">
          {property.title}
        </h3>
        <p className="mt-1 text-sm text-graphite-500">
          {[property.neighborhood, property.city, property.state]
            .filter(Boolean)
            .join(", ")}
        </p>

        {specs.length > 0 && (
          <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-graphite-500">
            {specs.map((s) => (
              <li key={s.label} className="flex items-center gap-1.5">
                <s.icon className="size-4 text-champagne-500" aria-hidden />
                <span>
                  {s.value} <span className="sr-only">{s.label}</span>
                </span>
              </li>
            ))}
          </ul>
        )}

        <p className="mt-4 font-serif text-xl font-semibold text-petrol-700">
          {formatPrice(property.price, property.currency, property.purpose)}
        </p>
      </div>
    </article>
  );
}
