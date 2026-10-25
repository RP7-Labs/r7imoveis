"use client";

import {
  Check,
  Link2,
  Mail,
  MessageCircle,
  Send,
  Share2,
} from "lucide-react";
import { useState } from "react";

interface ShareButtonsProps {
  url: string;
  text: string;
  emailSubject: string;
  emailBody: string;
}

const iconBtn =
  "inline-flex size-10 items-center justify-center rounded-full border border-petrol-500/25 text-petrol-600 transition-colors hover:border-petrol-500 hover:bg-petrol-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-petrol-500";

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M13.5 9H16l.5-3h-3V4.5c0-.9.3-1.5 1.6-1.5h1.5V.17C16.3.11 15.3 0 14.1 0 11.4 0 9.6 1.49 9.6 4.24V6H7v3h2.6v9h3.9V9z" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M18.9 1.15h3.68l-8.04 9.19L24 22.85h-7.41l-5.8-7.58-6.64 7.58H.47l8.6-9.83L0 1.15h7.59l5.24 6.93 6.07-6.93zm-1.29 19.5h2.04L6.49 3.24H4.3l13.31 17.41z" />
    </svg>
  );
}

export function ShareButtons({
  url,
  text,
  emailSubject,
  emailBody,
}: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const encodedUrl = encodeURIComponent(url);
  const encodedText = encodeURIComponent(text);

  const links = [
    {
      label: "Compartilhar no WhatsApp",
      href: `https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`,
      Icon: MessageCircle,
    },
    {
      label: "Compartilhar no Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      Icon: FacebookIcon,
    },
    {
      label: "Compartilhar no X",
      href: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
      Icon: XIcon,
    },
    {
      label: "Compartilhar no Telegram",
      href: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`,
      Icon: Send,
    },
    {
      label: "Compartilhar por e-mail",
      href: `mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`,
      Icon: Mail,
    },
  ];

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard indisponível — ignora silenciosamente
    }
  }

  const canNativeShare =
    typeof navigator !== "undefined" && typeof navigator.share === "function";

  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-graphite-400">
        Compartilhar este imóvel
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {links.map(({ label, href, Icon }) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            title={label}
            className={iconBtn}
          >
            <Icon className="size-4" aria-hidden />
          </a>
        ))}
        <button
          type="button"
          onClick={copyLink}
          aria-label="Copiar link do imóvel"
          title="Copiar link"
          className={iconBtn}
        >
          {copied ? (
            <Check className="size-4 text-green-600" aria-hidden />
          ) : (
            <Link2 className="size-4" aria-hidden />
          )}
        </button>
        {canNativeShare && (
          <button
            type="button"
            onClick={() =>
              navigator.share({ title: text, url }).catch(() => {})
            }
            aria-label="Mais opções de compartilhamento"
            title="Mais opções"
            className={iconBtn}
          >
            <Share2 className="size-4" aria-hidden />
          </button>
        )}
        {copied && (
          <span className="text-xs font-medium text-green-600">
            Link copiado!
          </span>
        )}
      </div>
    </div>
  );
}
