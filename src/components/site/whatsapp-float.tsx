import { MessageCircle } from "lucide-react";

/**
 * Atalho flutuante de WhatsApp — posicionado para não cobrir CTAs nem
 * conteúdo (canto inferior direito, acima do conteúdo).
 */
export function WhatsAppFloat({ url }: { url: string | null }) {
  if (!url) return null;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Conversar no WhatsApp"
      className="fixed bottom-5 right-5 z-30 inline-flex size-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-card transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-petrol-500"
    >
      <MessageCircle className="size-7" aria-hidden />
    </a>
  );
}
