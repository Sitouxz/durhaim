import Link from 'next/link';
import type { Metadata } from 'next';
import LocalizedText from '@/components/LocalizedText';

export const metadata: Metadata = {
  title: 'QR Verification Guide - DURHAIM',
  description: 'How to scan and verify Durhaim product authenticity QR codes safely.',
};

const steps = [
  {
    title: { en: 'Scan the QR Label', id: 'Pindai Label QR' },
    body: {
      en: 'Use your phone camera or QR scanner and open the verification link printed on the Durhaim label.',
      id: 'Gunakan kamera ponsel atau pemindai QR, lalu buka tautan verifikasi yang tercetak pada label Durhaim.',
    },
  },
  {
    title: { en: 'Check the Domain', id: 'Periksa Domain' },
    body: {
      en: 'The page should open on the official Durhaim website and show a serial number matching the product label.',
      id: 'Halaman harus terbuka di website resmi Durhaim dan menampilkan nomor serial yang sama dengan label produk.',
    },
  },
  {
    title: { en: 'Contact Support', id: 'Hubungi Bantuan' },
    body: {
      en: 'If the serial is missing, revoked, or does not match the label, contact Durhaim before using the product certificate.',
      id: 'Jika serial tidak ada, dicabut, atau tidak sesuai dengan label, hubungi Durhaim sebelum menggunakan sertifikat produk.',
    },
  },
];

export default function QrGuidePage() {
  return (
    <main className="bg-texture flex-grow px-margin-edge py-section-gap">
      <div className="mx-auto max-w-[1000px]">
        <h1 className="font-display-xl text-headline-lg-mobile uppercase tracking-tighter text-stark-white md:text-display-xl">
          <LocalizedText en="QR Verification Guide" id="Panduan Verifikasi QR" />
        </h1>
        <p className="mt-stack-md max-w-3xl border-l-2 border-signal-orange pl-4 font-body-lg text-stark-white/85">
          <LocalizedText
            en="Follow these checks to confirm a Durhaim QR certificate belongs to the product in hand."
            id="Ikuti pemeriksaan berikut untuk memastikan sertifikat QR Durhaim sesuai dengan produk yang Anda pegang."
          />
        </p>

        <div className="mt-section-gap grid gap-gutter md:grid-cols-3">
          {steps.map((step, index) => (
            <section key={step.title.en} className="border border-surface-container-highest bg-charcoal-field p-stack-lg">
              <div className="font-data-mono text-signal-orange">0{index + 1}</div>
              <h2 className="mt-stack-sm font-headline-md text-headline-md uppercase text-stark-white">
                <LocalizedText en={step.title.en} id={step.title.id} />
              </h2>
              <p className="mt-stack-md font-body-md text-on-surface-variant">
                <LocalizedText en={step.body.en} id={step.body.id} />
              </p>
            </section>
          ))}
        </div>

        <div className="mt-stack-lg flex flex-col gap-stack-sm sm:flex-row">
          <Link href="/verify" className="btn btn-primary inline-flex justify-center">
            <LocalizedText en="Verify a Serial" id="Verifikasi Serial" />
          </Link>
          <a
            href="https://wa.me/6282120101473"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex justify-center border border-surface-container-highest px-6 py-3 font-label-caps text-label-caps uppercase text-stark-white hover:border-signal-orange hover:text-signal-orange"
          >
            <LocalizedText en="Contact Support" id="Hubungi Bantuan" />
          </a>
        </div>
      </div>
    </main>
  );
}
