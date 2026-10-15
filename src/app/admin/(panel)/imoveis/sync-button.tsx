"use client";

import { Loader2, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { syncDwvNow } from "@/app/admin/(panel)/actions";

export function SyncDwvButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  async function onClick() {
    setLoading(true);
    setMessage(null);
    const result = await syncDwvNow();
    setLoading(false);
    setIsError(!result.ok);
    setMessage(result.ok ? result.summary : result.error);
    if (result.ok) router.refresh();
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={onClick}
        disabled={loading}
        className="flex items-center gap-2 rounded-lg border border-petrol-300 bg-white px-4 py-2.5 text-sm font-medium text-petrol-700 hover:bg-petrol-50 disabled:opacity-50"
        title="Puxa os imóveis selecionados na integração DWV"
      >
        {loading ? (
          <Loader2 className="size-4 animate-spin" aria-hidden />
        ) : (
          <RefreshCw className="size-4" aria-hidden />
        )}
        {loading ? "Sincronizando…" : "Sincronizar DWV"}
      </button>
      {message && (
        <p
          role="status"
          className={`max-w-xs text-right text-xs ${isError ? "text-red-600" : "text-emerald-600"}`}
        >
          {message}
        </p>
      )}
    </div>
  );
}
