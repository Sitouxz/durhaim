import Link from 'next/link';
import SerialChecker from '@/components/SerialChecker';
import JsonLd from '@/components/JsonLd';
import LocalizedText from '@/components/LocalizedText';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://durhaim.com';

export const metadata = {
  title: 'DURHAIM Tactical Gear - Modular Vests, Packs, Pouches, and Belts',
  description: 'DURHAIM builds battle-proven tactical gear for Indonesia and global users: modular vests, chestrigs, packs, pouches, belts, and authenticity verification.',
  alternates: {
    canonical: '/',
    languages: {
      en: '/',
      id: '/?lang=id',
      'x-default': '/',
    },
  },
};

const homeFaqs = [
  {
    question: {
      en: 'What is DURHAIM?',
      id: 'Apa itu DURHAIM?',
    },
    answer: {
      en: 'DURHAIM is an Indonesian tactical gear brand focused on durability, hard impact resistance, and modular carry systems for vests, chestrigs, packs, pouches, and belts.',
      id: 'DURHAIM adalah brand tactical gear Indonesia yang berfokus pada daya tahan, ketahanan benturan berat, dan sistem bawa modular untuk vest, chestrig, pack, pouch, dan belt.',
    },
  },
  {
    question: {
      en: 'How can buyers enquire about DURHAIM products?',
      id: 'Bagaimana pembeli dapat bertanya tentang produk DURHAIM?',
    },
    answer: {
      en: 'Buyers in Indonesia and global markets can open a product detail page and contact DURHAIM directly through WhatsApp for availability and ordering.',
      id: 'Pembeli di Indonesia dan pasar global dapat membuka halaman detail produk lalu menghubungi DURHAIM langsung melalui WhatsApp untuk ketersediaan dan pemesanan.',
    },
  },
  {
    question: {
      en: 'How can buyers verify authentic DURHAIM products?',
      id: 'Bagaimana pembeli memverifikasi produk DURHAIM asli?',
    },
    answer: {
      en: 'Buyers can enter a DURHAIM serial code in the authenticity checker to confirm whether a product serial is registered and active.',
      id: 'Pembeli dapat memasukkan kode serial DURHAIM di pemeriksa keaslian untuk memastikan serial produk terdaftar dan aktif.',
    },
  },
];

export default function HomePage() {
  const homeSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${siteUrl}/#webpage`,
        url: siteUrl,
        name: 'DURHAIM Tactical Gear',
        description: metadata.description,
        inLanguage: ['en', 'id'],
        isPartOf: { '@id': `${siteUrl}/#website` },
        about: [
          'tactical gear',
          'modular vest',
          'chestrig',
          'tactical pouch',
          'tactical belt',
          'authenticity verification',
        ],
      },
      {
        '@type': 'FAQPage',
        mainEntity: homeFaqs.map((faq) => ({
          '@type': 'Question',
          name: faq.question.en,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.answer.en,
          },
        })),
      },
    ],
  };

  return (
    <main className="flex-grow">
      <JsonLd data={homeSchema} />
      {/* Verification Section */}
      <section
        className="py-section-gap px-margin-edge border-b border-surface-container-highest relative overflow-hidden flex justify-center items-center"
        style={{
          backgroundImage: `url('/images/11_Anaconda-MCB-1.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-tactical-black/80 via-tactical-black/60 to-background/95 z-0"></div>
        <div className="relative z-10 bg-charcoal-field/80 backdrop-blur-md border border-surface-container-highest p-8 max-w-2xl w-full text-center space-y-stack-lg shadow-2xl">
          <h2 className="font-headline-md text-headline-md text-stark-white drop-shadow-md">
            <LocalizedText en="Input Serial Code Here" id="Masukkan Kode Serial di Sini" />
          </h2>
          <SerialChecker />
        </div>
      </section>

      <section className="border-b border-surface-container-highest bg-charcoal-field px-margin-edge py-section-gap">
        <div className="mx-auto max-w-[1440px]">
          <div className="max-w-3xl">
            <h1 className="font-display-xl text-headline-lg-mobile uppercase tracking-tighter text-stark-white md:text-display-xl">
              <LocalizedText en="DURHAIM Tactical Gear" id="Perlengkapan Taktis DURHAIM" />
            </h1>
            <p className="mt-stack-md border-l-2 border-signal-orange pl-4 font-body-lg text-stark-white/85">
              <LocalizedText
                en="DURHAIM builds modular tactical gear for Indonesia and global users, including vests, chestrigs, packs, pouches, belts, and serialized authenticity support."
                id="DURHAIM membuat tactical gear modular untuk pengguna Indonesia dan global, termasuk vest, chestrig, pack, pouch, belt, serta dukungan keaslian berbasis serial."
              />
            </p>
          </div>
          <div className="mt-stack-lg grid gap-gutter md:grid-cols-3">
            {homeFaqs.map((faq) => (
              <article key={faq.question.en} className="border border-surface-container-highest bg-tactical-black p-stack-md">
                <h2 className="font-label-caps text-label-caps uppercase text-signal-orange">
                  <LocalizedText en={faq.question.en} id={faq.question.id} />
                </h2>
                <p className="mt-2 font-body-md text-on-surface-variant">
                  <LocalizedText en={faq.answer.en} id={faq.answer.id} />
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Product Categories */}
      <section
        className="relative py-section-gap border-b border-surface-container-highest"
        style={{
          backgroundImage: `url('/images/11_Anaconda-MCB-1.png')`,
          backgroundAttachment: 'fixed',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-background/95 z-0 backdrop-blur-[2px]"></div>
        <div className="relative z-10 flex flex-col gap-section-gap max-w-[1440px] mx-auto px-margin-edge">
          {/* VEST & CHESTRIG */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter items-center">
            <div className="order-2 md:order-1 flex justify-center bg-charcoal-field/60 backdrop-blur-sm border border-surface-container-highest p-8 aspect-[4/3] md:aspect-auto shadow-xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt="Vest and Chestrig Product Shot"
                className="w-full h-full object-contain filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)] mix-blend-lighten max-h-[600px]"
                src="/images/29_VC-1.png"
              />
            </div>
            <div className="order-1 md:order-2 space-y-stack-md text-right drop-shadow-lg">
              <h3 className="font-display-xl text-headline-lg-mobile md:text-display-xl text-stark-white uppercase tracking-tighter">
                <LocalizedText en="Vest & Chestrig" id="Vest & Chestrig" />
              </h3>
              <p className="font-headline-md text-headline-md text-signal-orange uppercase">
                <LocalizedText en="Durability Hard Impact & Modular" id="Tahan Benturan Berat & Modular" />
              </p>
              <div className="pt-stack-md">
                <Link
                  className="inline-block bg-signal-orange text-tactical-black font-label-caps text-label-caps py-3 px-8 hover:bg-stark-white transition-colors duration-200 shadow-lg"
                  href="/catalogue?category=vest"
                >
                  <LocalizedText en="Explore Now" id="Jelajahi" />
                </Link>
              </div>
            </div>
          </div>

          {/* PACK & POUCHES */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter items-center">
            <div className="space-y-stack-md text-left drop-shadow-lg">
              <h3 className="font-display-xl text-headline-lg-mobile md:text-display-xl text-stark-white uppercase tracking-tighter">
                <LocalizedText en="Pack & Pouches" id="Pack & Pouch" />
              </h3>
              <p className="font-headline-md text-headline-md text-signal-orange uppercase">
                <LocalizedText en="Perfect For Carrying Your Equipment" id="Siap Membawa Perlengkapan Anda" />
              </p>
              <div className="pt-stack-md">
                <Link
                  className="inline-block bg-signal-orange text-tactical-black font-label-caps text-label-caps py-3 px-8 hover:bg-stark-white transition-colors duration-200 shadow-lg"
                  href="/catalogue?category=pack"
                >
                  <LocalizedText en="Explore Now" id="Jelajahi" />
                </Link>
              </div>
            </div>
            <div className="flex justify-center bg-charcoal-field/60 backdrop-blur-sm border border-surface-container-highest p-8 aspect-[4/3] md:aspect-auto relative overflow-hidden shadow-xl">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PHBhdGggZD0iTTAgMGg0MHY0MEgweiIgZmlsbD0ibm9uZSIvPjxwYXRoIGQ9Ik0wIDEwaDQwdjJIMHptMCAyMGg0MHYySDB6IiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDUpIi8+PC9zdmc+')] opacity-10"></div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt="Pack and Pouches Product Shot"
                className="w-full h-full object-contain filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)] relative z-10 max-h-[600px]"
                src="/images/31_PP-1.png"
              />
            </div>
          </div>

          {/* BELT */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter items-center">
            <div className="order-2 md:order-1 flex justify-center bg-charcoal-field/60 backdrop-blur-sm border border-surface-container-highest p-8 aspect-[4/3] md:aspect-auto shadow-xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt="Tactical Belt Product Shot"
                className="w-full h-full object-contain filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)] max-h-[600px]"
                src="/images/33_B-1.png"
              />
            </div>
            <div className="order-1 md:order-2 space-y-stack-md text-right drop-shadow-lg">
              <h3 className="font-display-xl text-headline-lg-mobile md:text-display-xl text-stark-white uppercase tracking-tighter">
                <LocalizedText en="Belt" id="Belt" />
              </h3>
              <p className="font-headline-md text-headline-md text-signal-orange uppercase">
                <LocalizedText en="It's All About The Waist" id="Fokus pada Pinggang dan Mobilitas" />
              </p>
              <div className="pt-stack-md">
                <Link
                  className="inline-block bg-signal-orange text-tactical-black font-label-caps text-label-caps py-3 px-8 hover:bg-stark-white transition-colors duration-200 shadow-lg"
                  href="/catalogue?category=belt"
                >
                  <LocalizedText en="Explore Now" id="Jelajahi" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Category Grid Showcase */}
      <section className="py-section-gap px-margin-edge border-y border-surface-container-highest bg-tactical-black relative">
        <div className="max-w-[1440px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter h-[600px]">
            {/* Item 1 */}
            <div className="group relative overflow-hidden border border-surface-container-highest flex items-end p-8 bg-charcoal-field">
              <div className="absolute inset-0 bg-gradient-to-t from-tactical-black via-transparent to-transparent z-10"></div>
              <div className="absolute inset-0 flex justify-center items-center p-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt="Vest category display"
                  className="w-full h-full object-contain opacity-50 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500 ease-out filter grayscale group-hover:grayscale-0"
                  src="/images/29_VC-1.png"
                />
              </div>
              <h4 className="relative z-20 font-display-xl text-headline-lg text-stark-white uppercase origin-bottom-left -rotate-90 translate-y-1/2 translate-x-4 opacity-80 group-hover:opacity-100 group-hover:text-signal-orange transition-colors">
                <LocalizedText en="Vest Chestrig" id="Vest Chestrig" />
              </h4>
            </div>
            {/* Item 2 */}
            <div className="group relative overflow-hidden border border-surface-container-highest flex items-end p-8 bg-charcoal-field">
              <div className="absolute inset-0 bg-gradient-to-t from-tactical-black via-transparent to-transparent z-10"></div>
              <div className="absolute inset-0 flex justify-center items-center p-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt="Pack category display"
                  className="w-full h-full object-contain opacity-50 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500 ease-out filter grayscale group-hover:grayscale-0"
                  src="/images/31_PP-1.png"
                />
              </div>
              <h4 className="relative z-20 font-display-xl text-headline-lg text-stark-white uppercase origin-bottom-left -rotate-90 translate-y-1/2 translate-x-4 opacity-80 group-hover:opacity-100 group-hover:text-signal-orange transition-colors">
                <LocalizedText en="Pack Pouch" id="Pack Pouch" />
              </h4>
            </div>
            {/* Item 3 */}
            <div className="group relative overflow-hidden border border-surface-container-highest flex items-end p-8 bg-charcoal-field">
              <div className="absolute inset-0 bg-gradient-to-t from-tactical-black via-transparent to-transparent z-10"></div>
              <div className="absolute inset-0 flex justify-center items-center p-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt="Belt category display"
                  className="w-full h-full object-contain opacity-50 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500 ease-out filter grayscale group-hover:grayscale-0"
                  src="/images/33_B-1.png"
                />
              </div>
              <h4 className="relative z-20 font-display-xl text-headline-lg text-stark-white uppercase origin-bottom-left -rotate-90 translate-y-1/2 translate-x-4 opacity-80 group-hover:opacity-100 group-hover:text-signal-orange transition-colors">
                <LocalizedText en="Belt" id="Belt" />
              </h4>
            </div>
          </div>
        </div>
      </section>

      {/* Battle Proven Hero */}
      <section
        className="relative min-h-[60vh] flex items-center bg-tactical-black overflow-hidden border-b border-surface-container-highest"
        style={{
          backgroundImage: `url('/images/11_Anaconda-MCB-1.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Scrim */}
        <div className="absolute inset-0 bg-gradient-to-r from-tactical-black/90 via-tactical-black/70 to-transparent"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PHBhdGggZD0iTTAgMGg0MHY0MEgweiIgZmlsbD0ibm9uZSIvPjxwYXRoIGQ9Ik0wIDEwaDQwdjJIMHptMCAyMGg0MHYySDB6IiBmaWxsPSJyZ2JhKDAsMCwwLDAuNCkiLz48L3N2Zz4=')] opacity-50 pointer-events-none"></div>
        <div className="relative z-10 px-margin-edge max-w-[1440px] mx-auto w-full">
          <div className="max-w-2xl space-y-stack-lg">
            <h2 className="font-display-xl text-headline-lg-mobile md:text-display-xl text-stark-white uppercase tracking-tighter drop-shadow-lg">
              <LocalizedText en="Battle Proven" id="Teruji Lapangan" />
            </h2>
            <p className="font-body-lg text-body-lg text-stark-white/90 border-l-2 border-signal-orange pl-4 shadow-sm">&quot;Rasakan Kekuatan Inovasi yang Terbukti dalam Pertempuran&quot;</p>
            <div>
              <Link
                className="inline-block border-2 border-stark-white text-stark-white font-label-caps text-label-caps py-3 px-8 hover:bg-stark-white hover:text-tactical-black transition-colors duration-200 bg-tactical-black/50 backdrop-blur-sm"
                href="/battle-proven"
              >
                <LocalizedText en="Explore Now" id="Jelajahi" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
