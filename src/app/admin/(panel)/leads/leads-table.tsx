"use client";

import { ChevronDown, ChevronUp, MessageCircle, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { deleteLead, updateLead } from "../actions";
import { Badge } from "@/components/ui/badge";
import { LEAD_STATUSES, leadStatusLabel } from "@/lib/constants";
import { formatDateTime } from "@/lib/format";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import type { Lead, LeadStatus } from "@/lib/types";

const tone = (s: LeadStatus) =>
  s === "new"
    ? ("green" as const)
    : s === "closed"
      ? ("petrol" as const)
      : s === "archived"
        ? ("gray" as const)
        : ("amber" as const);

export function LeadsTable({ leads }: { leads: Lead[] }) {
  const router = useRouter();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  async function patch(id: string, data: Parameters<typeof updateLead>[1]) {
    setBusy(id);
    const result = await updateLead(id, data);
    setBusy(null);
    if (!result.ok) alert(result.error ?? "Erro ao atualizar lead.");
    router.refresh();
  }

  if (leads.length === 0) {
    return (
      <p className="mt-6 rounded-2xl bg-white px-6 py-12 text-center text-sm text-graphite-400 shadow-soft">
        Nenhum lead encontrado.
      </p>
    );
  }

  return (
    <ul className="mt-6 space-y-3">
      {leads.map((lead) => {
        const open = expanded === lead.id;
        const phoneDigits = lead.phone?.replace(/\D/g, "");
        const waUrl = phoneDigits
          ? buildWhatsAppUrl(
              phoneDigits.startsWith("55") ? phoneDigits : `55${phoneDigits}`,
              `Olá ${lead.name}! Aqui é da R7 Investimentos Imobiliários, recebemos seu contato pelo site.`,
            )
          : null;

        return (
          <li key={lead.id} className="rounded-2xl bg-white shadow-soft">
            <div className="flex flex-wrap items-center gap-3 px-4 py-4 sm:px-6">
              <button
                type="button"
                onClick={() => setExpanded(open ? null : lead.id)}
                aria-expanded={open}
                className="flex min-w-0 flex-1 items-center gap-3 text-left"
              >
                {open ? (
                  <ChevronUp className="size-4 shrink-0 text-graphite-300" aria-hidden />
                ) : (
                  <ChevronDown className="size-4 shrink-0 text-graphite-300" aria-hidden />
                )}
                <span className="min-w-0">
                  <span className="block truncate font-medium text-graphite-700">
                    {lead.name}
                  </span>
                  <span className="block truncate text-xs text-graphite-400">
                    {lead.properties?.title
                      ? `Imóvel: ${lead.properties.title} (Ref. ${lead.properties.reference_code})`
                      : "Contato geral"}
                    {" · "}
                    {formatDateTime(lead.created_at)}
                  </span>
                </span>
              </button>

              <Badge tone={tone(lead.status)}>
                {leadStatusLabel(lead.status)}
              </Badge>

              <select
                value={lead.status}
                disabled={busy === lead.id}
                onChange={(e) =>
                  void patch(lead.id, { status: e.target.value as LeadStatus })
                }
                aria-label="Alterar status do lead"
                className="rounded-lg border border-graphite-200 bg-white px-2.5 py-1.5 text-xs"
              >
                {LEAD_STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            {open && (
              <div className="border-t border-graphite-100 px-4 py-4 sm:px-6">
                <dl className="grid gap-3 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-graphite-400">
                      E-mail
                    </dt>
                    <dd className="mt-0.5">
                      {lead.email ? (
                        <a
                          href={`mailto:${lead.email}`}
                          className="text-petrol-600 hover:underline"
                        >
                          {lead.email}
                        </a>
                      ) : (
                        "—"
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-graphite-400">
                      Telefone
                    </dt>
                    <dd className="mt-0.5 flex items-center gap-2">
                      {lead.phone ?? "—"}
                      {waUrl && (
                        <a
                          href={waUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="Chamar no WhatsApp"
                          className="text-[#25D366] hover:opacity-80"
                        >
                          <MessageCircle className="size-4" aria-hidden />
                        </a>
                      )}
                    </dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-xs uppercase tracking-wide text-graphite-400">
                      Mensagem
                    </dt>
                    <dd className="mt-0.5 whitespace-pre-line text-graphite-600">
                      {lead.message}
                    </dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-xs uppercase tracking-wide text-graphite-400">
                      Origem / Observações internas
                    </dt>
                    <dd className="mt-0.5 text-xs text-graphite-400">
                      Origem: {lead.source}
                    </dd>
                    <textarea
                      defaultValue={lead.notes ?? ""}
                      rows={2}
                      maxLength={2000}
                      placeholder="Anotações da equipe (não aparece no site)"
                      onBlur={(e) => {
                        if (e.target.value !== (lead.notes ?? "")) {
                          void patch(lead.id, { notes: e.target.value });
                        }
                      }}
                      className="mt-2 w-full rounded-lg border border-graphite-200 px-3 py-2 text-sm"
                    />
                  </div>
                </dl>
                <div className="mt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`Excluir o lead de ${lead.name}?`)) {
                        setBusy(lead.id);
                        void deleteLead(lead.id).then((r) => {
                          setBusy(null);
                          if (!r.ok) alert(r.error ?? "Erro ao excluir.");
                          router.refresh();
                        });
                      }
                    }}
                    className="flex items-center gap-1.5 text-xs text-red-600 hover:underline"
                  >
                    <Trash2 className="size-3.5" aria-hidden />
                    Excluir lead
                  </button>
                </div>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
