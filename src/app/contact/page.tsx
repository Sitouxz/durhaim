import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import LocalizedText from "@/components/LocalizedText";
import { getSiteSettings } from "@/lib/site-settings-server";
import { buildWhatsAppUrl, getSiteUrl } from "@/lib/site-settings";

export const metadata: Metadata = {
  title: "Contact DURHAIM - Tactical Gear Support Indonesia",
  description:
    "Contact DURHAIM in Bandung, Indonesia for tactical gear enquiries, authenticity support, reseller coordination, WhatsApp, and email support.",
  alternates: {
    canonical: "/contact",
    languages: {
      en: "/contact",
      id: "/contact?lang=id",
      "x-default": "/contact",
    },
  },
};

export default async function ContactPage() {
  const siteSettings = await getSiteSettings();
  const siteUrl = getSiteUrl(siteSettings);
  const contactSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${siteUrl}/contact#localbusiness`,
    name: "DURHAIM",
    url: siteUrl,
    image: `${siteUrl}/images/durhaim_image_1.png`,
    telephone: siteSettings.whatsapp_contact,
    email: siteSettings.support_email,
    address: {
      "@type": "PostalAddress",
      streetAddress: siteSettings.location,
      addressLocality: "Bandung",
      addressCountry: "ID",
    },
    areaServed: ["Indonesia", "Global"],
    availableLanguage: ["English", "Indonesian"],
  };

  return (
    <main className="bg-texture flex-grow px-margin-edge py-section-gap">
      <JsonLd data={contactSchema} />
      <div className="mx-auto max-w-[1000px]">
        <h1 className="font-display-xl text-headline-lg-mobile uppercase tracking-tighter text-stark-white md:text-display-xl">
          <LocalizedText en="Contact Durhaim" id="Kontak Durhaim" />
        </h1>
        <p className="mt-stack-md max-w-2xl border-l-2 border-signal-orange pl-4 font-body-lg text-stark-white/85">
          <LocalizedText
            en="Reach the Durhaim team for product enquiries, authenticity support, and reseller coordination."
            id="Hubungi tim Durhaim untuk pertanyaan produk, bantuan keaslian, dan koordinasi reseller."
          />
        </p>

        <div className="mt-section-gap grid gap-gutter md:grid-cols-3">
          <a
            href={buildWhatsAppUrl(siteSettings)}
            target="_blank"
            rel="noopener noreferrer"
            className="border border-surface-container-highest bg-charcoal-field p-stack-lg hover:border-signal-orange"
          >
            <div className="font-data-mono text-signal-orange">WHATSAPP</div>
            <div className="mt-2 font-headline-md text-stark-white">
              {siteSettings.whatsapp_contact}
            </div>
          </a>
          <a
            href={`mailto:${siteSettings.support_email}`}
            className="border border-surface-container-highest bg-charcoal-field p-stack-lg hover:border-signal-orange"
          >
            <div className="font-data-mono text-signal-orange">EMAIL</div>
            <div className="mt-2 font-headline-md text-stark-white">
              {siteSettings.support_email}
            </div>
          </a>
          <section className="border border-surface-container-highest bg-charcoal-field p-stack-lg">
            <div className="font-data-mono text-signal-orange">
              <LocalizedText en="LOCATION" id="LOKASI" />
            </div>
            <div className="mt-2 font-body-md text-stark-white">
              {siteSettings.location}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
