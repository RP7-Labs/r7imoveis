import {
  Clock,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
} from "lucide-react";
import {
  FacebookIcon,
  InstagramIcon,
  LinkedinIcon,
  YoutubeIcon,
} from "@/components/icons/brands";
import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { CopyrightYear } from "@/components/layout/copyright-year";
import { storageUrl } from "@/lib/storage";
import { STORAGE_BUCKETS } from "@/lib/constants";
import type { SiteSettings } from "@/lib/types";

export function SiteFooter({
  settings,
  whatsappUrl,
}: {
  settings: SiteSettings;
  whatsappUrl: string | null;
}) {
  const socials = [
    { url: settings.instagram_url, icon: InstagramIcon, label: "Instagram" },
    { url: settings.facebook_url, icon: FacebookIcon, label: "Facebook" },
    { url: settings.linkedin_url, icon: LinkedinIcon, label: "LinkedIn" },
    { url: settings.youtube_url, icon: YoutubeIcon, label: "YouTube" },
  ].filter((s) => s.url);

  return (
    <footer className="bg-petrol-900 text-petrol-100">
      {/* Linha de marca espaçada — como no manual (p. 8) */}
      <div className="border-b border-petrol-800">
        <p className="mx-auto max-w-7xl px-4 py-7 text-center text-[11px] font-semibold uppercase tracking-[0.55em] text-petrol-300 sm:px-6 lg:px-8">
          R 7 · Investimentos Imobiliários
        </p>
      </div>
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div>
          <Logo
            src={storageUrl(settings.logo_path, STORAGE_BUCKETS.siteAssets)}
            tone="champagne"
            variant="lockup"
            withName={false}
            size="lg"
          />
          {settings.tagline && (
            <p className="mt-4 text-sm text-petrol-200">{settings.tagline}</p>
          )}
          {socials.length > 0 && (
            <div className="mt-5 flex gap-2">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.url!}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="rounded-full border border-petrol-700 p-2 text-petrol-200 transition-colors hover:border-champagne-300 hover:text-champagne-300"
                >
                  <s.icon className="size-4" aria-hidden />
                </a>
              ))}
            </div>
          )}
        </div>

        <nav aria-label="Links do rodapé">
          <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-champagne-300">
            Navegação
          </h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li><Link className="hover:text-champagne-300" href="/imoveis">Imóveis</Link></li>
            <li><Link className="hover:text-champagne-300" href="/imoveis?purpose=venda">Comprar</Link></li>
            <li><Link className="hover:text-champagne-300" href="/imoveis?purpose=locacao">Alugar</Link></li>
            <li><Link className="hover:text-champagne-300" href="/sobre">A R7</Link></li>
            <li><Link className="hover:text-champagne-300" href="/contato">Contato</Link></li>
          </ul>
        </nav>

        <div>
          <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-champagne-300">
            Contato
          </h2>
          <ul className="mt-4 space-y-3 text-sm">
            {settings.phone && (
              <li className="flex items-start gap-2.5">
                <Phone className="mt-0.5 size-4 shrink-0 text-champagne-300" aria-hidden />
                <span>{settings.phone}</span>
              </li>
            )}
            {whatsappUrl && (
              <li>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-2.5 hover:text-champagne-300"
                >
                  <MessageCircle className="mt-0.5 size-4 shrink-0 text-champagne-300" aria-hidden />
                  WhatsApp
                </a>
              </li>
            )}
            {settings.email && (
              <li className="flex items-start gap-2.5">
                <Mail className="mt-0.5 size-4 shrink-0 text-champagne-300" aria-hidden />
                <a href={`mailto:${settings.email}`} className="hover:text-champagne-300">
                  {settings.email}
                </a>
              </li>
            )}
          </ul>
        </div>

        <div>
          <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-champagne-300">
            Escritório
          </h2>
          <ul className="mt-4 space-y-3 text-sm">
            {settings.address && (
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 size-4 shrink-0 text-champagne-300" aria-hidden />
                <span>{settings.address}</span>
              </li>
            )}
            {settings.business_hours && (
              <li className="flex items-start gap-2.5">
                <Clock className="mt-0.5 size-4 shrink-0 text-champagne-300" aria-hidden />
                <span>{settings.business_hours}</span>
              </li>
            )}
          </ul>
        </div>
      </div>

      <div className="border-t border-petrol-800">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-petrol-300 sm:flex-row sm:px-6 lg:px-8">
          <p>
            © <CopyrightYear /> {settings.company_name}. Todos os
            direitos reservados.
          </p>
          {settings.footer_text && <p>{settings.footer_text}</p>}
        </div>
        <p className="mx-auto mt-3 max-w-7xl px-4 pb-4 text-center text-[11px] text-petrol-300 sm:px-6 sm:text-right lg:px-8">
          Desenvolvido por{" "}
          <a
            href="https://rp7.tech"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-petrol-200 underline-offset-2 hover:text-champagne-300 hover:underline"
          >
            rp7.tech
          </a>
        </p>
      </div>
    </footer>
  );
}
