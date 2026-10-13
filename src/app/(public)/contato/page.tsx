import {
  Clock,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
} from "lucide-react";
import { InstagramIcon } from "@/components/icons/brands";
import type { Metadata } from "next";
import { Suspense } from "react";
import { LeadForm } from "@/components/site/lead-form";
import { getSiteSettings } from "@/lib/settings";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Contato",
  description:
    "Fale com a R7 Investimentos Imobiliários. Atendimento por WhatsApp, e-mail e formulário.",
  alternates: { canonical: "/contato" },
};

export default function ContatoPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <header className="mb-10">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-champagne-500">
          Contato
        </p>
        <h1 className="mt-2 font-serif text-3xl text-petrol-800 sm:text-4xl">
          Fale com a R7
        </h1>
        <p className="mt-3 max-w-xl text-graphite-500">
          Quer comprar, vender ou investir? Envie uma mensagem e nossa equipe
          retorna em breve.
        </p>
      </header>

      <div className="grid gap-10 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <div className="rounded-2xl bg-white p-6 shadow-soft sm:p-8">
            <LeadForm source="contact" title="Envie sua mensagem" />
          </div>
        </div>

        <aside className="lg:col-span-2">
          <Suspense fallback={null}>
            <ContactInfo />
          </Suspense>
        </aside>
      </div>
    </div>
  );
}

async function ContactInfo() {
  const settings = await getSiteSettings();
  const whatsappUrl = buildWhatsAppUrl(
    settings.whatsapp_number,
    settings.whatsapp_message ?? undefined,
  );

  const items = [
    whatsappUrl && {
      icon: MessageCircle,
      label: "WhatsApp",
      value: settings.phone ?? "Chamar no WhatsApp",
      href: whatsappUrl,
    },
    settings.phone && {
      icon: Phone,
      label: "Telefone",
      value: settings.phone,
      href: `tel:${settings.phone.replace(/\D/g, "")}`,
    },
    settings.email && {
      icon: Mail,
      label: "E-mail",
      value: settings.email,
      href: `mailto:${settings.email}`,
    },
    settings.instagram_url && {
      icon: InstagramIcon,
      label: "Instagram",
      value: "@r7imoveissc",
      href: settings.instagram_url,
    },
    settings.address && {
      icon: MapPin,
      label: "Endereço",
      value: settings.address,
      href: null,
    },
    settings.business_hours && {
      icon: Clock,
      label: "Horário de atendimento",
      value: settings.business_hours,
      href: null,
    },
  ].filter(Boolean) as {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    value: string;
    href: string | null;
  }[];

  return (
    <div className="rounded-2xl bg-petrol-800 p-6 text-petrol-100 shadow-card sm:p-8">
      <h2 className="font-serif text-xl text-white">Canais de atendimento</h2>
      <ul className="mt-6 space-y-5">
        {items.map((item) => (
          <li key={item.label} className="flex items-start gap-4">
            <span className="rounded-xl bg-petrol-700 p-2.5 text-champagne-300">
              <item.icon className="size-5" aria-hidden />
            </span>
            <span>
              <span className="block text-xs uppercase tracking-wide text-petrol-300">
                {item.label}
              </span>
              {item.href ? (
                <a
                  href={item.href}
                  target={item.href.startsWith("http") ? "_blank" : undefined}
                  rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
                  className="font-medium text-white hover:text-champagne-300"
                >
                  {item.value}
                </a>
              ) : (
                <span className="font-medium text-white">{item.value}</span>
              )}
            </span>
          </li>
        ))}
      </ul>
      {items.length === 0 && (
        <p className="mt-4 text-sm text-petrol-200">
          Canais de contato em configuração. Utilize o formulário ao lado.
        </p>
      )}
    </div>
  );
}
