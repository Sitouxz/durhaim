import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact - DURHAIM',
  description: 'Contact Durhaim support and product enquiries.',
};

export default function ContactPage() {
  return (
    <main className="bg-texture flex-grow px-margin-edge py-section-gap">
      <div className="mx-auto max-w-[1000px]">
        <h1 className="font-display-xl text-headline-lg-mobile uppercase tracking-tighter text-stark-white md:text-display-xl">Contact Durhaim</h1>
        <p className="mt-stack-md max-w-2xl border-l-2 border-signal-orange pl-4 font-body-lg text-stark-white/85">
          Reach the Durhaim team for product enquiries, authenticity support, and reseller coordination.
        </p>

        <div className="mt-section-gap grid gap-gutter md:grid-cols-3">
          <a href="https://wa.me/6282120101473" target="_blank" rel="noopener noreferrer" className="border border-surface-container-highest bg-charcoal-field p-stack-lg hover:border-signal-orange">
            <div className="font-data-mono text-signal-orange">WHATSAPP</div>
            <div className="mt-2 font-headline-md text-stark-white">0821-2010-1473</div>
          </a>
          <a href="mailto:durhaimgear@gmail.com" className="border border-surface-container-highest bg-charcoal-field p-stack-lg hover:border-signal-orange">
            <div className="font-data-mono text-signal-orange">EMAIL</div>
            <div className="mt-2 font-headline-md text-stark-white">durhaimgear@gmail.com</div>
          </a>
          <section className="border border-surface-container-highest bg-charcoal-field p-stack-lg">
            <div className="font-data-mono text-signal-orange">LOCATION</div>
            <div className="mt-2 font-body-md text-stark-white">Komp. Mitra Dago Parahyangan Jl. Anyelir No. C8 Bandung</div>
          </section>
        </div>
      </div>
    </main>
  );
}
