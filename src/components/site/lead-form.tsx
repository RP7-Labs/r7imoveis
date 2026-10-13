"use client";

import { CheckCircle2, Loader2, Send } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/input";

interface LeadFormProps {
  propertyId?: string;
  propertyTitle?: string;
  source?: "form" | "contact";
  title?: string;
  compact?: boolean;
}

export function LeadForm({
  propertyId,
  propertyTitle,
  source = "form",
  title = "Solicite mais informações",
  compact = false,
}: LeadFormProps) {
  const [state, setState] = useState<
    { status: "idle" } | { status: "sending" } | { status: "sent" } | { status: "error"; message: string }
  >({ status: "idle" });

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);

    setState({ status: "sending" });
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fd.get("name"),
          email: fd.get("email"),
          phone: fd.get("phone"),
          message: fd.get("message"),
          website: fd.get("website"),
          property_id: propertyId ?? "",
          source,
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setState({
          status: "error",
          message:
            body?.error ??
            "Não foi possível enviar. Tente novamente ou fale pelo WhatsApp.",
        });
        return;
      }
      setState({ status: "sent" });
      form.reset();
    } catch {
      setState({
        status: "error",
        message: "Falha de conexão. Tente novamente.",
      });
    }
  }

  if (state.status === "sent") {
    return (
      <div className="rounded-2xl bg-petrol-50 p-6 text-center">
        <CheckCircle2 className="mx-auto size-10 text-petrol-500" aria-hidden />
        <p className="mt-3 font-display text-lg text-petrol-800">
          Recebemos seu contato!
        </p>
        <p className="mt-1 text-sm text-graphite-500">
          Nossa equipe retornará em breve.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {!compact && (
        <h3 className="font-display text-lg text-petrol-800">{title}</h3>
      )}

      <Field label="Nome">
        <Input name="name" required minLength={2} maxLength={120} autoComplete="name" />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="E-mail">
          <Input name="email" type="email" maxLength={160} autoComplete="email" />
        </Field>
        <Field label="Telefone / WhatsApp">
          <Input name="phone" type="tel" maxLength={30} autoComplete="tel" />
        </Field>
      </div>
      <Field label="Mensagem">
        <Textarea
          name="message"
          required
          minLength={5}
          maxLength={2000}
          rows={compact ? 3 : 4}
          defaultValue={
            propertyTitle
              ? `Olá! Tenho interesse no imóvel "${propertyTitle}". Gostaria de mais informações.`
              : ""
          }
        />
      </Field>

      {/* Honeypot — invisível para humanos */}
      <div className="hidden" aria-hidden="true">
        <label>
          Website
          <input name="website" type="text" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      {state.status === "error" && (
        <p role="alert" className="text-sm text-red-600">
          {state.message}
        </p>
      )}

      <Button
        type="submit"
        disabled={state.status === "sending"}
        className="w-full"
      >
        {state.status === "sending" ? (
          <Loader2 className="size-4 animate-spin" aria-hidden />
        ) : (
          <Send className="size-4" aria-hidden />
        )}
        {state.status === "sending" ? "Enviando…" : "Enviar mensagem"}
      </Button>
      <p className="text-center text-xs text-graphite-400">
        Ao enviar, você concorda em ser contatado pela R7.
      </p>
    </form>
  );
}
