"use client";

import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

/**
 * Define nova senha — usada tanto pelo link de recuperação de e-mail
 * (sessão via hash da URL) quanto pelo usuário logado trocando a senha.
 */
export default function AtualizarSenhaPage() {
  const router = useRouter();
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    const password = String(fd.get("password"));
    const confirm = String(fd.get("confirm"));

    if (password.length < 6) {
      setError("A senha precisa de pelo menos 6 caracteres.");
      return;
    }
    if (password !== confirm) {
      setError("As senhas não coincidem.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error: err } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (err) {
      setError(
        "Não foi possível atualizar. Se chegou por e-mail, peça um novo link — ele expira.",
      );
      return;
    }
    setDone(true);
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
            Definir nova senha
          </h1>
        </div>

        {done ? (
          <div className="rounded-2xl bg-white p-6 text-center shadow-card sm:p-8">
            <p className="text-sm text-graphite-600">Senha atualizada.</p>
            <Button
              className="mt-5 w-full"
              onClick={() => router.replace("/admin")}
            >
              Ir para o painel
            </Button>
          </div>
        ) : (
          <form
            onSubmit={onSubmit}
            className="rounded-2xl bg-white p-6 shadow-card sm:p-8"
          >
            <Field label="Nova senha">
              <Input
                name="password"
                type="password"
                required
                minLength={6}
                autoComplete="new-password"
                placeholder="••••••••"
              />
            </Field>
            <div className="mt-4">
              <Field label="Confirmar senha">
                <Input
                  name="confirm"
                  type="password"
                  required
                  minLength={6}
                  autoComplete="new-password"
                  placeholder="••••••••"
                />
              </Field>
            </div>
            {error && (
              <p role="alert" className="mt-4 text-sm text-red-600">
                {error}
              </p>
            )}
            <Button type="submit" disabled={loading} className="mt-6 w-full">
              {loading && <Loader2 className="size-4 animate-spin" aria-hidden />}
              {loading ? "Salvando…" : "Salvar nova senha"}
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
