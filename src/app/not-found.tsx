import Link from 'next/link';
import LocalizedText from '@/components/LocalizedText';

export default function NotFoundPage() {
  return (
    <main className="flex min-h-[70vh] flex-grow items-center justify-center bg-tactical-black px-margin-edge py-section-gap">
      <section className="max-w-2xl border border-surface-container-highest bg-charcoal-field/85 p-stack-lg text-center shadow-2xl">
        <p className="font-data-mono text-data-mono text-signal-orange">404 // DURHAIM</p>
        <h1 className="mt-stack-sm font-display-xl text-headline-lg uppercase text-stark-white">
          <LocalizedText en="Page not found" id="Halaman tidak ditemukan" />
        </h1>
        <p className="mt-stack-md font-body-md text-on-surface-variant">
          <LocalizedText
            en="The requested Durhaim page could not be found."
            id="Halaman Durhaim yang diminta tidak ditemukan."
          />
        </p>
        <Link
          href="/"
          className="mt-stack-lg inline-flex bg-signal-orange px-6 py-3 font-label-caps text-label-caps text-tactical-black transition-colors hover:bg-stark-white"
        >
          <LocalizedText en="Back to home" id="Kembali ke beranda" />
        </Link>
      </section>
    </main>
  );
}
