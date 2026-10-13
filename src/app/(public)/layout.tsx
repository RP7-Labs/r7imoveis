import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { WhatsAppFloat } from "@/components/site/whatsapp-float";
import { STORAGE_BUCKETS } from "@/lib/constants";
import { getSiteSettings } from "@/lib/settings";
import { storageUrl } from "@/lib/storage";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSiteSettings();
  const whatsappUrl = buildWhatsAppUrl(
    settings.whatsapp_number,
    settings.whatsapp_message ?? undefined,
  );

  return (
    <>
      <SiteHeader
        logoSrc={storageUrl(settings.logo_path, STORAGE_BUCKETS.siteAssets)}
        whatsappUrl={whatsappUrl}
        instagramUrl={settings.instagram_url}
      />
      <main className="flex-1">{children}</main>
      <SiteFooter settings={settings} whatsappUrl={whatsappUrl} />
      <WhatsAppFloat url={whatsappUrl} />
    </>
  );
}
