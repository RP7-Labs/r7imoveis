import { CheckCircle2, ExternalLink } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ImageManager } from "@/components/admin/image-manager";
import { PropertyForm } from "@/components/admin/property-form";
import { buttonClasses } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import type { PropertyImage } from "@/lib/types";

export const metadata = { title: "Editar imóvel" };

export default async function EditarImovelPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const { id } = await params;
  const { saved } = await searchParams;
  const supabase = await createClient();

  const [{ data: property }, { data: images }] = await Promise.all([
    supabase.from("properties").select("*").eq("id", id).maybeSingle(),
    supabase
      .from("property_images")
      .select("*")
      .eq("property_id", id)
      .order("position"),
  ]);

  if (!property) notFound();

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl text-petrol-900">
            Editar imóvel
          </h1>
          <p className="mt-1 text-sm text-graphite-500">
            Ref. {property.reference_code} · {property.title}
          </p>
        </div>
        {property.status === "published" && (
          <Link
            href={`/imoveis/${property.slug}`}
            target="_blank"
            className={buttonClasses("outline", "sm")}
          >
            <ExternalLink className="size-4" aria-hidden />
            Ver página pública
          </Link>
        )}
      </div>

      {saved && (
        <p className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          <CheckCircle2 className="size-4" aria-hidden />
          Imóvel salvo com sucesso.
        </p>
      )}

      <div className="mt-6 space-y-6">
        <PropertyForm property={property} />
        <ImageManager
          propertyId={property.id}
          propertyTitle={property.title}
          images={(images ?? []) as PropertyImage[]}
        />
      </div>
    </div>
  );
}
