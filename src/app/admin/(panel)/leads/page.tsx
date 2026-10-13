import { LeadsTable } from "./leads-table";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Leads" };

const PAGE_SIZE = 20;

export default async function AdminLeadsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const supabase = await createClient();

  const page = Math.max(1, Number(sp.page) || 1);
  const q = sp.q?.trim();
  const status = sp.status;

  let query = supabase
    .from("leads")
    .select("*, properties(title, reference_code)", { count: "exact" })
    .order("created_at", { ascending: false });

  if (status) query = query.eq("status", status);
  if (q) {
    const term = q.replace(/[%,()]/g, " ");
    query = query.or(
      `name.ilike.%${term}%,email.ilike.%${term}%,phone.ilike.%${term}%,message.ilike.%${term}%`,
    );
  }

  const from = (page - 1) * PAGE_SIZE;
  const { data, count } = await query.range(from, from + PAGE_SIZE - 1);
  const pageCount = Math.ceil((count ?? 0) / PAGE_SIZE);

  const leads = (data ?? []).map((l) => ({
    ...l,
    properties: Array.isArray(l.properties)
      ? (l.properties[0] ?? null)
      : l.properties,
  }));

  const pageHref = (p: number) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (status) params.set("status", status);
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return `/admin/leads${qs ? `?${qs}` : ""}`;
  };

  return (
    <div>
      <h1 className="font-serif text-2xl text-petrol-900">Leads</h1>
      <p className="mt-1 text-sm text-graphite-500">
        {count ?? 0} contato{(count ?? 0) === 1 ? "" : "s"} recebido
        {(count ?? 0) === 1 ? "" : "s"} pelo site.
      </p>

      <form className="mt-6 flex flex-wrap gap-3" action="/admin/leads">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Buscar por nome, e-mail, telefone…"
          className="min-w-64 flex-1 rounded-lg border border-graphite-200 bg-white px-4 py-2.5 text-sm focus:border-petrol-500 focus:outline-2 focus:outline-petrol-500/20"
        />
        <select
          name="status"
          defaultValue={status ?? ""}
          aria-label="Filtrar por status"
          className="rounded-lg border border-graphite-200 bg-white px-4 py-2.5 text-sm"
        >
          <option value="">Todos os status</option>
          <option value="new">Novo</option>
          <option value="contacted">Contatado</option>
          <option value="qualified">Qualificado</option>
          <option value="visit_scheduled">Visita agendada</option>
          <option value="closed">Fechado</option>
          <option value="archived">Arquivado</option>
        </select>
        <button
          type="submit"
          className="rounded-full border border-petrol-500/30 px-6 py-2.5 text-sm font-medium text-petrol-600 hover:border-petrol-500 hover:bg-petrol-50"
        >
          Filtrar
        </button>
      </form>

      <LeadsTable leads={leads} />

      {pageCount > 1 && (
        <nav
          aria-label="Paginação"
          className="mt-6 flex items-center justify-center gap-2"
        >
          {Array.from({ length: pageCount }, (_, i) => i + 1).map((p) => (
            <a
              key={p}
              href={pageHref(p)}
              aria-current={p === page ? "page" : undefined}
              className={
                p === page
                  ? "rounded-full bg-petrol-500 px-3.5 py-1.5 text-sm text-white"
                  : "rounded-full px-3.5 py-1.5 text-sm text-petrol-600 hover:bg-petrol-50"
              }
            >
              {p}
            </a>
          ))}
        </nav>
      )}
    </div>
  );
}
