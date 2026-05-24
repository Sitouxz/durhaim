import Link from 'next/link';
import type { Metadata } from 'next';
import LocalizedText from '@/components/LocalizedText';

export const metadata: Metadata = {
  title: 'Latest Projects - DURHAIM',
  description: 'Recent Durhaim tactical gear projects and field updates.',
};

const projects = [
  {
    en: 'Battle proven vest platform refinements',
    id: 'Penyempurnaan platform vest teruji lapangan',
  },
  {
    en: 'Pack and pouch loadout updates',
    id: 'Pembaruan loadout pack dan pouch',
  },
  {
    en: 'Operator belt field configuration notes',
    id: 'Catatan konfigurasi lapangan operator belt',
  },
];

export default function LatestProjectsPage() {
  return (
    <main className="bg-texture flex-grow px-margin-edge py-section-gap">
      <div className="mx-auto max-w-[1000px]">
        <h1 className="font-display-xl text-headline-lg-mobile uppercase tracking-tighter text-stark-white md:text-display-xl">
          <LocalizedText en="Latest Projects" id="Proyek Terbaru" />
        </h1>
        <p className="mt-stack-md max-w-2xl border-l-2 border-signal-orange pl-4 font-body-lg text-stark-white/85">
          <LocalizedText
            en="Current Durhaim build notes, project drops, and field-facing updates."
            id="Catatan build, rilis proyek, dan pembaruan lapangan terbaru dari Durhaim."
          />
        </p>
        <div className="mt-section-gap space-y-stack-md">
          {projects.map((project, index) => (
            <section key={project.en} className="border border-surface-container-highest bg-charcoal-field p-stack-lg">
              <div className="font-data-mono text-signal-orange">
                <LocalizedText en={`PROJECT 0${index + 1}`} id={`PROYEK 0${index + 1}`} />
              </div>
              <h2 className="mt-2 font-headline-md text-headline-md uppercase text-stark-white">
                <LocalizedText en={project.en} id={project.id} />
              </h2>
            </section>
          ))}
        </div>
        <Link href="/social-engagement" className="btn btn-primary mt-stack-lg inline-flex">
          <LocalizedText en="Follow Social Updates" id="Ikuti Kabar Sosial" />
        </Link>
      </div>
    </main>
  );
}
