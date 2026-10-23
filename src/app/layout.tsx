import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  display: "swap",
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://r7imoveissc.com.br";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "R7 Investimentos Imobiliários",
    template: "%s | R7 Investimentos Imobiliários",
  },
  description:
    "Compre, venda ou invista em apartamentos, casas, coberturas e lançamentos em Balneário Camboriú e Praia Brava. Curadoria imobiliária da R7. Fale com um especialista.",
  openGraph: {
    siteName: "R7 Investimentos Imobiliários",
    locale: "pt_BR",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${montserrat.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">{children}</body>
    </html>
  );
}
