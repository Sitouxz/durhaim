import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Our Story - DURHAIM',
  description: 'The Durhaim story: tactical gear engineered around durability, hard impact, and modular field use.',
};

const principles = [
  'Durability under repeated hard use',
  'Modular layouts for mission-specific loadouts',
  'Repairable construction and practical materials',
];

export default function OurStoryPage() {
  return (
    <main className="bg-tactical-black flex-grow">
      <section
        className="relative min-h-[72vh] border-b border-surface-container-highest px-margin-edge py-section-gap"
        style={{
          backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuA9WRPaRf92KnmMSn2PydhFmfWCJ8fPHdTcDRRdCyu-S0YcvZbJmoDtOrBWfdavpgscmTjjLNdHO0RppcTMLcKkrcu_zgTJCv0_9zih9zxts8LXgHnLUSxncK5YLhxCtHsyNV4CkOBqOHVVgYlqYlE_OfphyUWHXjT3bbVNyhSF6q9aPjhOlse-7pr5Hz9EvCIka-gfGUW6A4oMfPn7cfXl7Hs-cR3y0AWf_gQCRk4YSFVkXRt-dvaUjP9G8wAXrFGVE0eLG8MGuLre')",
          backgroundPosition: 'center',
          backgroundSize: 'cover',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-tactical-black via-tactical-black/85 to-tactical-black/30" />
        <div className="relative z-10 mx-auto flex min-h-[56vh] max-w-[1440px] flex-col justify-end">
          <h1 className="max-w-4xl font-display-xl text-headline-lg-mobile uppercase tracking-tighter text-stark-white md:text-display-xl">
            Built Around Hard Impact
          </h1>
          <p className="mt-stack-md max-w-2xl border-l-2 border-signal-orange pl-4 font-body-lg text-stark-white/90">
            Durhaim designs tactical equipment for users who need dependable carry systems, field-ready materials, and modularity that stays practical under pressure.
          </p>
        </div>
      </section>

      <section className="px-margin-edge py-section-gap">
        <div className="mx-auto grid max-w-[1440px] gap-gutter lg:grid-cols-12">
          <div className="lg:col-span-5">
            <h2 className="font-headline-md text-headline-lg uppercase text-stark-white">Design Principles</h2>
            <p className="mt-stack-md font-body-md text-on-surface-variant">
              Every piece starts from the same field logic: carry what matters, keep it accessible, and make the platform tough enough for repeat deployment.
            </p>
          </div>
          <div className="space-y-stack-md lg:col-span-7">
            {principles.map((principle, index) => (
              <div key={principle} className="flex items-center gap-4 border border-surface-container-highest bg-charcoal-field p-stack-md">
                <span className="font-data-mono text-signal-orange">0{index + 1}</span>
                <span className="font-label-caps text-label-caps uppercase text-stark-white">{principle}</span>
              </div>
            ))}
            <Link href="/battle-proven" className="btn btn-primary inline-flex">
              Battle Proven
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
