import { PropertyForm } from "@/components/admin/property-form";

export const metadata = { title: "Novo imóvel" };

export default function NovoImovelPage() {
  return (
    <div>
      <h1 className="font-serif text-2xl text-petrol-900">Novo imóvel</h1>
      <p className="mb-6 mt-1 text-sm text-graphite-500">
        Preencha os dados e salve. As fotos podem ser enviadas após o primeiro
        salvamento.
      </p>
      <PropertyForm />
    </div>
  );
}
