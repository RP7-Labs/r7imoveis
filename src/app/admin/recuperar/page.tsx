"use client";

import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

/**
 * Recuperação de senha — envia o link de reset do Supabase para o e-mail.
 * O link redireciona para /admin/atualizar-senha (liberada no proxy).
 */
export default function RecuperarPage() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const email = String(new FormData(e.currentTarget).get("email"));
    const supabase = createClient();
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/admin/atualizar-senha`,
    });
    setLoading(false);
    if (err) {
      setError("Não foi possível enviar o link. Tente novamente.");
      return;
    }
    setSent(true);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-petrol-900 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/r7-lockup-champagne.png"
            alt="R7 Investimentos Imobiliários"
            className="mx-auto h-28 w-auto"
          />
          <h1 className="mt-4 font-display text-xl text-white">
            Recuperar senha
          </h1>
        </div>

        {sent ? (
          <div className="rounded-2xl bg-white p-6 text-center shadow-card sm:p-8">
            <p className="text-sm text-graphite-600">
              Se o e-mail estiver cadastrado, você receberá um link para
              redefinir a senha. Verifique também o spam.
            </p>
            <Link
              href="/admin/login"
              className="mt-5 inline-block text-sm font-medium text-petrol-600 underline"
            >
              Voltar ao login
            </Link>
          </div>
        ) : (
          <form
            onSubmit={onSubmit}
            className="rounded-2xl bg-white p-6 shadow-card sm:p-8"
          >
            <Field label="E-mail cadastrado">
              <Input
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="seu@email.com"
              />
            </Field>
            {error && (
              <p role="alert" className="mt-4 text-sm text-red-600">
                {error}
              </p>
            )}
            <Button type="submit" disabled={loading} className="mt-6 w-full">
              {loading && <Loader2 className="size-4 animate-spin" aria-hidden />}
              {loading ? "Enviando…" : "Enviar link de recuperação"}
            </Button>
            <p className="mt-4 text-center">
              <Link
                href="/admin/login"
                className="text-sm text-graphite-500 underline hover:text-petrol-600"
              >
                Voltar ao login
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
