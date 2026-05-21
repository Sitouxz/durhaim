import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Latest Projects - DURHAIM',
  description: 'Recent Durhaim tactical gear projects and field updates.',
};

const projects = [
  'Battle proven vest platform refinements',
  'Pack and pouch loadout updates',
  'Operator belt field configuration notes',
];

export default function LatestProjectsPage() {
  return (
    <main className="bg-texture flex-grow px-margin-edge py-section-gap">
      <div className="mx-auto max-w-[1000px]">
        <h1 className="font-display-xl text-headline-lg-mobile uppercase tracking-tighter text-stark-white md:text-display-xl">Latest Projects</h1>
        <p className="mt-stack-md max-w-2xl border-l-2 border-signal-orange pl-4 font-body-lg text-stark-white/85">
          Current Durhaim build notes, project drops, and field-facing updates.
        </p>
        <div className="mt-section-gap space-y-stack-md">
          {projects.map((project, index) => (
            <section key={project} className="border border-surface-container-highest bg-charcoal-field p-stack-lg">
              <div className="font-data-mono text-signal-orange">PROJECT 0{index + 1}</div>
              <h2 className="mt-2 font-headline-md text-headline-md uppercase text-stark-white">{project}</h2>
            </section>
          ))}
        </div>
        <Link href="/social-engagement" className="btn btn-primary mt-stack-lg inline-flex">Follow Social Updates</Link>
      </div>
    </main>
  );
}
