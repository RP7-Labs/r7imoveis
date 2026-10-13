"use client";

import { Button } from "@/components/ui/button";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-24 text-center">
      <h1 className="font-serif text-2xl text-petrol-800">
        Algo deu errado
      </h1>
      <p className="mt-2 max-w-md text-sm text-graphite-500">
        Ocorreu um erro inesperado. Tente novamente em instantes.
      </p>
      <Button onClick={reset} variant="outline" className="mt-8">
        Tentar novamente
      </Button>
    </div>
  );
}
