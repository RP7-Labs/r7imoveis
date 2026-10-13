/**
 * Monta link oficial do WhatsApp (wa.me) com mensagem codificada.
 * O usuário sempre confirma e envia a mensagem no próprio WhatsApp.
 */
export function buildWhatsAppUrl(
  number: string | null | undefined,
  message?: string,
): string | null {
  const digits = number?.replace(/\D/g, "");
  if (!digits) return null;
  const base = `https://wa.me/${digits}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export function propertyWhatsAppMessage(input: {
  title: string;
  referenceCode: string;
}): string {
  return `Olá! Tenho interesse no imóvel ${input.title}, referência ${input.referenceCode}. Gostaria de receber mais informações.`;
}
