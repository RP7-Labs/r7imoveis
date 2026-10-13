"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

export function LoginForm({ next }: { next: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const fd = new FormData(e.currentTarget);
    const supabase = createClient();

    const { error: authError } = await supabase.auth.signInWithPassword({
      email: String(fd.get("email")),
      password: String(fd.get("password")),
    });

    if (authError) {
      setLoading(false);
      setError("E-mail ou senha incorretos.");
      return;
    }

    router.replace(next.startsWith("/admin") ? next : "/admin");
    router.refresh();
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-2xl bg-white p-6 shadow-card sm:p-8"
    >
      <Field label="E-mail">
        <Input
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="seu@email.com"
        />
      </Field>
      <div className="mt-4">
        <Field label="Senha">
          <Input
            name="password"
            type="password"
            required
            autoComplete="current-password"
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
        {loading ? "Entrando…" : "Entrar"}
      </Button>
    </form>
  );
}
