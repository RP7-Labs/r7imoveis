import {
  ArrowRight,
  Building2,
  CheckCircle2,
  FileEdit,
  MessageSquareText,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { buttonClasses } from "@/components/ui/button";
import { formatDateTime } from "@/lib/format";
import { leadStatusLabel } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Dashboard" };

async function count(
  supabase: Awaited<ReturnType<typeof createClient>>,
  table: string,
  filter?: Record<string, string>,
) {
  let q = supabase
    .from(table)
    .select("id", { count: "exact", head: true });
  if (filter) {
    for (const [k, v] of Object.entries(filter)) q = q.eq(k, v);
  }
  const { count: c } = await q;
  return c ?? 0;
}

export default async function AdminDashboard() {
  const supabase = await createClient();

  const [
    total,
    published,
    drafts,
    soldOrRented,
    leadsTotal,
    leadsNew,
    recentLeads,
  ] = await Promise.all([
    count(supabase, "properties"),
    count(supabase, "properties", { status: "published" }),
    count(supabase, "properties", { status: "draft" }),
    supabase
      .from("properties")
      .select("id", { count: "exact", head: true })
      .in("status", ["sold", "rented"])
      .then((r) => r.count ?? 0),
    count(supabase, "leads"),
    count(supabase, "leads", { status: "new" }),
    supabase
      .from("leads")
      .select("id, name, message, status, created_at, properties(title)")
      .order("created_at", { ascending: false })
      .limit(5)
      .then((r) =>
        (r.data ?? []).map((l) => ({
          ...l,
          properties: Array.isArray(l.properties)
            ? (l.properties[0] ?? null)
            : l.properties,
        })),
      ),
  ]);

  const stats = [
    { label: "Total de imóveis", value: total, icon: Building2 },
    { label: "Publicados", value: published, icon: CheckCircle2 },
    { label: "Rascunhos", value: drafts, icon: FileEdit },
    { label: "Vendidos/Alugados", value: soldOrRented, icon: CheckCircle2 },
    { label: "Leads recebidos", value: leadsTotal, icon: MessageSquareText },
    { label: "Leads novos", value: leadsNew, icon: MessageSquareText },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl text-petrol-900">Dashboard</h1>
          <p className="mt-1 text-sm text-graphite-500">
            Visão geral do catálogo e dos contatos recebidos.
          </p>
        </div>
        <Link
          href="/admin/imoveis/novo"
          className={buttonClasses("primary", "md")}
        >
          <Plus className="size-4" aria-hidden />
          Cadastrar imóvel
        </Link>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-2xl bg-white p-5 shadow-soft"
          >
            <div className="flex items-center gap-3">
              <span className="rounded-xl bg-petrol-50 p-2.5 text-petrol-600">
                <s.icon className="size-5" aria-hidden />
              </span>
              <span className="text-sm text-graphite-500">{s.label}</span>
            </div>
            <p className="mt-3 font-display text-3xl text-petrol-900">
              {s.value}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl bg-white p-6 shadow-soft">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg text-petrol-900">
              Leads recentes
            </h2>
            <Link
              href="/admin/leads"
              className="inline-flex items-center gap-1 text-sm font-medium text-petrol-600 hover:text-petrol-700"
            >
              Ver todos <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
          {recentLeads.length === 0 ? (
            <p className="mt-6 text-sm text-graphite-400">
              Nenhum lead recebido ainda.
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-graphite-100">
              {recentLeads.map((lead) => (
                <li key={lead.id} className="flex items-start justify-between gap-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-graphite-700">
                      {lead.name}
                    </p>
                    <p className="truncate text-xs text-graphite-400">
                      {lead.properties?.title
                        ? `Imóvel: ${lead.properties.title}`
                        : "Contato geral"}
                      {" · "}
                      {formatDateTime(lead.created_at)}
                    </p>
                  </div>
                  <Badge tone={lead.status === "new" ? "green" : "gray"}>
                    {leadStatusLabel(lead.status)}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl bg-white p-6 shadow-soft">
          <h2 className="font-display text-lg text-petrol-900">Atalhos</h2>
          <ul className="mt-4 space-y-2.5">
            {[
              { href: "/admin/imoveis/novo", label: "Cadastrar novo imóvel" },
              { href: "/admin/imoveis", label: "Gerenciar imóveis" },
              { href: "/admin/leads", label: "Atender leads" },
              { href: "/admin/paginas", label: "Editar textos do site" },
              { href: "/admin/configuracoes", label: "WhatsApp, contato e redes sociais" },
            ].map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="flex items-center justify-between rounded-xl border border-graphite-100 px-4 py-3 text-sm font-medium text-graphite-600 transition-colors hover:border-champagne-400 hover:bg-champagne-50"
                >
                  {l.label}
                  <ArrowRight className="size-4 text-graphite-300" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
