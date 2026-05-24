import Link from 'next/link';
import type { Metadata } from 'next';
import LocalizedText from '@/components/LocalizedText';

export const metadata: Metadata = {
  title: 'Our Story - DURHAIM',
  description: 'The Durhaim story: tactical gear engineered around durability, hard impact, and modular field use.',
};

const principles = [
  {
    en: 'Durability under repeated hard use',
    id: 'Daya tahan untuk pemakaian berat berulang',
  },
  {
    en: 'Modular layouts for mission-specific loadouts',
    id: 'Layout modular untuk loadout sesuai misi',
  },
  {
    en: 'Repairable construction and practical materials',
    id: 'Konstruksi mudah dirawat dengan material praktis',
  },
];

export default function OurStoryPage() {
  return (
    <main className="bg-tactical-black flex-grow">
      <section
        className="relative min-h-[72vh] border-b border-surface-container-highest px-margin-edge py-section-gap"
        style={{
          backgroundImage: "url('/images/durhaim_image_1.png')",
          backgroundPosition: 'center',
          backgroundSize: 'cover',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-tactical-black via-tactical-black/85 to-tactical-black/30" />
        <div className="relative z-10 mx-auto flex min-h-[56vh] max-w-[1440px] flex-col justify-end">
          <h1 className="max-w-4xl font-display-xl text-headline-lg-mobile uppercase tracking-tighter text-stark-white md:text-display-xl">
            <LocalizedText en="Built Around Hard Impact" id="Dibangun untuk Benturan Berat" />
          </h1>
          <p className="mt-stack-md max-w-2xl border-l-2 border-signal-orange pl-4 font-body-lg text-stark-white/90">
            <LocalizedText
              en="Durhaim designs tactical equipment for users who need dependable carry systems, field-ready materials, and modularity that stays practical under pressure."
              id="Durhaim merancang perlengkapan taktis untuk pengguna yang membutuhkan sistem bawa yang andal, material siap lapangan, dan modularitas yang tetap praktis di bawah tekanan."
            />
          </p>
        </div>
      </section>

      <section className="px-margin-edge py-section-gap">
        <div className="mx-auto grid max-w-[1440px] gap-gutter lg:grid-cols-12">
          <div className="lg:col-span-5">
            <h2 className="font-headline-md text-headline-lg uppercase text-stark-white">
              <LocalizedText en="Design Principles" id="Prinsip Desain" />
            </h2>
            <p className="mt-stack-md font-body-md text-on-surface-variant">
              <LocalizedText
                en="Every piece starts from the same field logic: carry what matters, keep it accessible, and make the platform tough enough for repeat deployment."
                id="Setiap produk dimulai dari logika lapangan yang sama: bawa yang penting, jaga agar tetap mudah diakses, dan buat platform cukup kuat untuk penggunaan berulang."
              />
            </p>
          </div>
          <div className="space-y-stack-md lg:col-span-7">
            {principles.map((principle, index) => (
              <div key={principle.en} className="flex items-center gap-4 border border-surface-container-highest bg-charcoal-field p-stack-md">
                <span className="font-data-mono text-signal-orange">0{index + 1}</span>
                <span className="font-label-caps text-label-caps uppercase text-stark-white">
                  <LocalizedText en={principle.en} id={principle.id} />
                </span>
              </div>
            ))}
            <Link href="/battle-proven" className="btn btn-primary inline-flex">
              <LocalizedText en="Battle Proven" id="Teruji Lapangan" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
