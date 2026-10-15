import { NextResponse } from "next/server";
import { syncDwv } from "@/lib/dwv";
import { createServiceClient } from "@/lib/supabase/service";

/**
 * Sync DWV → Supabase. Chamado pelo Vercel Cron (Authorization: Bearer
 * CRON_SECRET) ou manualmente via POST com o mesmo header.
 */
export async function GET(request: Request) {
  return run(request);
}
export async function POST(request: Request) {
  return run(request);
}

async function run(request: Request) {
  const secret = process.env.CRON_SECRET;
  const auth = request.headers.get("authorization");
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = createServiceClient();
    const result = await syncDwv(supabase);
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro desconhecido";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
