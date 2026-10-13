import { ButtonLink } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-24 text-center">
      <p className="font-serif text-6xl text-champagne-400">404</p>
      <h1 className="mt-4 font-serif text-2xl text-petrol-800">
        Página não encontrada
      </h1>
      <p className="mt-2 max-w-md text-sm text-graphite-500">
        O endereço que você acessou não existe ou o imóvel foi despublicado.
      </p>
      <div className="mt-8 flex gap-3">
        <ButtonLink href="/" variant="outline">
          Voltar ao início
        </ButtonLink>
        <ButtonLink href="/imoveis">Ver imóveis</ButtonLink>
      </div>
    </div>
  );
}
