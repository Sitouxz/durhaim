import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'QR Verification Guide - DURHAIM',
  description: 'How to scan and verify Durhaim product authenticity QR codes safely.',
};

const steps = [
  {
    title: 'Scan the QR Label',
    body: 'Use your phone camera or QR scanner and open the verification link printed on the Durhaim label.',
  },
  {
    title: 'Check the Domain',
    body: 'The page should open on the official Durhaim website and show a serial number matching the product label.',
  },
  {
    title: 'Contact Support',
    body: 'If the serial is missing, revoked, or does not match the label, contact Durhaim before using the product certificate.',
  },
];

export default function QrGuidePage() {
  return (
    <main className="bg-texture flex-grow px-margin-edge py-section-gap">
      <div className="mx-auto max-w-[1000px]">
        <h1 className="font-display-xl text-headline-lg-mobile uppercase tracking-tighter text-stark-white md:text-display-xl">
          QR Verification Guide
        </h1>
        <p className="mt-stack-md max-w-3xl border-l-2 border-signal-orange pl-4 font-body-lg text-stark-white/85">
          Follow these checks to confirm a Durhaim QR certificate belongs to the product in hand.
        </p>

        <div className="mt-section-gap grid gap-gutter md:grid-cols-3">
          {steps.map((step, index) => (
            <section key={step.title} className="border border-surface-container-highest bg-charcoal-field p-stack-lg">
              <div className="font-data-mono text-signal-orange">0{index + 1}</div>
              <h2 className="mt-stack-sm font-headline-md text-headline-md uppercase text-stark-white">{step.title}</h2>
              <p className="mt-stack-md font-body-md text-on-surface-variant">{step.body}</p>
            </section>
          ))}
        </div>

        <div className="mt-stack-lg flex flex-col gap-stack-sm sm:flex-row">
          <Link href="/verify" className="btn btn-primary inline-flex justify-center">Verify a Serial</Link>
          <a
            href="https://wa.me/6282120101473"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex justify-center border border-surface-container-highest px-6 py-3 font-label-caps text-label-caps uppercase text-stark-white hover:border-signal-orange hover:text-signal-orange"
          >
            Contact Support
          </a>
        </div>
      </div>
    </main>
  );
}
