import Link from "next/link";
import SerialChecker from "@/components/SerialChecker";
import JsonLd from "@/components/JsonLd";
import LocalizedText from "@/components/LocalizedText";
import { getSiteSettings } from "@/lib/site-settings-server";
import { getSiteUrl } from "@/lib/site-settings";

export const metadata = {
  title: "DURHAIM Tactical Gear - Modular Vests, Packs, Pouches, and Belts",
  description: "DURHAIM builds battle-proven tactical gear for Indonesia and global users: modular vests, chestrigs, packs, pouches, belts, and authenticity verification.",
  alternates: {
    canonical: "/",
    languages: { en: "/", id: "/?lang=id", "x-default": "/" },
  },
};

const homeFaqs = [
  {
    title: { en: "What is DURHAIM?", id: "Apa itu DURHAIM?" },
    text: {
      en: "DURHAIM is an Indonesian tactical gear brand focused on durability, hard impact resistance, and modular carry systems for vests, chestrigs, packs, pouches, and belts.",
      id: "DURHAIM adalah brand tactical gear Indonesia yang berfokus pada daya tahan, ketahanan benturan berat, dan sistem bawa modular untuk vest, chestrig, pack, pouch, dan belt.",
    },
  },
  {
    title: { en: "How can buyers enquire about DURHAIM products?", id: "Bagaimana pembeli menanyakan produk DURHAIM?" },
    text: {
      en: "Buyers in Indonesia and global markets can open a product detail page and contact DURHAIM directly through WhatsApp for availability and ordering.",
      id: "Pembeli di Indonesia dan pasar global dapat membuka halaman detail produk dan menghubungi DURHAIM langsung melalui WhatsApp untuk ketersediaan dan pemesanan.",
    },
  },
  {
    title: { en: "How can buyers verify authentic DURHAIM products?", id: "Bagaimana pembeli memverifikasi produk DURHAIM asli?" },
    text: {
      en: "Buyers can enter a DURHAIM serial code in the authenticity checker to confirm whether a product serial is registered and active.",
      id: "Pembeli dapat memasukkan kode serial DURHAIM pada pemeriksa keaslian untuk memastikan serial produk terdaftar dan aktif.",
    },
  },
];

const features = [
  {
    title: { en: "Bodyvest & Chestrig", id: "Bodyvest & Chestrig" },
    subtitle: { en: "Durability hard impact and modular", id: "Tahan Benturan Berat dan modular" },
    href: "/catalogue?category=vest",
    image: "/storefront/figma/homepage/page-3/bv-nccopy-1.png",
    align: "right",
  },
  {
    title: { en: "Pack & Pouch", id: "Pack & Pouch" },
    subtitle: { en: "Perfect for carrying your equipment", id: "Ideal untuk membawa Perlengkapan Anda" },
    href: "/catalogue?category=pack",
    image: "/storefront/figma/homepage/page-3/bg-pack-and-pouch-copy-1.png",
    align: "left",
  },
  {
    title: { en: "Belt", id: "Belt" },
    subtitle: { en: "It’s all about the waist", id: "Semua bertumpu pada pinggang" },
    href: "/catalogue?category=belt",
    image: "/storefront/figma/homepage/page-3/bg-belt-copy-1.png",
    align: "right",
  },
] as const;

const categoryStrip = [
  ["Bodyvest Chestrig", "/catalogue?category=vest", "/storefront/figma/homepage/page-4/bv-nccopy-1.png"],
  ["Pack & Pouch", "/catalogue?category=pack", "/storefront/figma/homepage/page-4/bg-pack-and-pouch-copy-1.png"],
  ["Belt", "/catalogue?category=belt", "/storefront/figma/homepage/page-4/bg-belt-copy-2.png"],
] as const;

export default async function HomePage() {
  const siteSettings = await getSiteSettings();
  const siteUrl = getSiteUrl(siteSettings);
  const homeSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${siteUrl}/#webpage`,
        url: siteUrl,
        name: "DURHAIM Tactical Gear",
        description: metadata.description,
        inLanguage: ["en", "id"],
        isPartOf: { "@id": `${siteUrl}/#website` },
        about: ["tactical gear", "modular vest", "chestrig", "tactical pouch", "tactical belt", "authenticity verification"],
      },
      {
        "@type": "FAQPage",
        mainEntity: homeFaqs.map((item) => ({
          "@type": "Question",
          name: item.title.en,
          acceptedAnswer: { "@type": "Answer", text: item.text.en },
        })),
      },
    ],
  };

  return (
    <main id="main-content" className="store-home">
      <JsonLd data={homeSchema} />

      <section className="home-verify" data-figma-node="34:116" aria-labelledby="verification-heading">
        <div className="home-verify__panel">
          <h1 id="verification-heading">
            <LocalizedText en="Input serial code here" id="Masukkan kode serial di sini" />
          </h1>
          <SerialChecker />
        </div>
      </section>

      <section className="home-intro" data-figma-node="27:19" aria-labelledby="intro-heading">
        <div className="home-intro__copy">
          <h2 id="intro-heading">DURHAIM TACTICAL GEAR</h2>
          <p>
            <LocalizedText
              en="DURHAIM builds modular tactical gear for Indonesia and global users, including vests, chestrigs, packs, pouches, belts, and serialized authenticity support."
              id="DURHAIM membuat tactical gear modular untuk pengguna Indonesia dan global, termasuk vest, chestrig, pack, pouch, belt, serta dukungan keaslian berbasis serial."
            />
          </p>
        </div>
        <div className="home-intro__panels">
          {homeFaqs.map((item) => (
            <article key={item.title.en}>
              <h3><LocalizedText en={item.title.en} id={item.title.id} /></h3>
              <p><LocalizedText en={item.text.en} id={item.text.id} /></p>
            </article>
          ))}
        </div>
      </section>

      <section className="home-features" data-figma-node="29:44" aria-label="Equipment categories">
        {features.map((feature) => (
          <article className={`home-feature home-feature--${feature.align}`} key={feature.title.en}>
            <div className="home-feature__image">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={feature.image} alt="" />
              <span><LocalizedText en={feature.title.en} id={feature.title.id} /></span>
            </div>
            <div className="home-feature__copy">
              <h2><LocalizedText en={feature.title.en} id={feature.title.id} /></h2>
              <p><LocalizedText en={feature.subtitle.en} id={feature.subtitle.id} /></p>
              <Link className="store-outline-button" href={feature.href}>
                <LocalizedText en="Explore now" id="Jelajahi" />
              </Link>
            </div>
          </article>
        ))}
      </section>

      <section className="home-category-strip" data-figma-node="29:79" aria-label="Browse categories">
        {categoryStrip.map(([label, href, image]) => (
          <Link href={href} key={label}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={image} alt="" />
            <span>{label}</span>
          </Link>
        ))}
      </section>

      <section className="home-battle" data-figma-node="34:110" aria-labelledby="battle-heading">
        <div>
          <h2 id="battle-heading"><LocalizedText en="Battle Proven" id="Teruji di Lapangan" /></h2>
          <p>
            <LocalizedText
              en="“Experience the power of innovation proven in battle.”"
              id="“Rasakan kekuatan inovasi yang teruji di lapangan.”"
            />
          </p>
          <Link className="store-outline-button" href="/battle-proven">
            <LocalizedText en="Explore now" id="Jelajahi" />
          </Link>
        </div>
      </section>
    </main>
  );
}
