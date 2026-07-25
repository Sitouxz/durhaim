import type { Metadata } from 'next';
import Link from 'next/link';
import { cache } from 'react';
import { createClient } from '@supabase/supabase-js';
import { unstable_noStore as noStore } from 'next/cache';
import { headers } from 'next/headers';
import LocalizedText from '@/components/LocalizedText';
import { getSiteSettings } from '@/lib/site-settings-server';
import { buildWhatsAppUrl } from '@/lib/site-settings';
import { checkRateLimit } from '@/lib/rate-limit';
import { parseSerialVerification, type SerialVerification } from '@/lib/serial-verification';

export const dynamic = 'force-dynamic';

const SCAN_WINDOW_MS = 10 * 60 * 1000;
const SCAN_MAX_ATTEMPTS = 20;

interface PageProps {
  params: Promise<{ serial: string }>;
}

// Viewing the certificate page (e.g. via a scanned QR code) counts as a verification,
// same as the manual /verify form submission, so scan analytics reflect real-world scans.
//
// serial_numbers is not readable by the anon role — the anon key is public, and a
// table-level grant would expose the whole registry — so the lookup and the
// recording both happen inside the constrained RPC.
//
// Wrapped in cache() because generateMetadata and the page body both need this
// data: without deduping, a single scan would be counted twice.
const getSerialVerification = cache(async (rawSerial: string): Promise<SerialVerification | null> => {
  noStore();

  const serial = rawSerial.trim().toUpperCase();

  try {
    const headersList = await headers();
    const ip = headersList.get('x-forwarded-for')?.split(',')[0]?.trim()
      || headersList.get('x-real-ip')
      || 'unknown';
    const userAgent = headersList.get('user-agent') ?? '';

    const rateLimit = checkRateLimit({
      key: `verify-scan:${ip}:${serial}`,
      limit: SCAN_MAX_ATTEMPTS,
      windowMs: SCAN_WINDOW_MS,
    });

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );
    const { data, error } = await supabase.rpc('record_serial_verification', {
      p_serial: serial,
      p_ip_address: ip,
      p_user_agent: userAgent,
      // Past the rate limit the certificate is still shown, it just stops counting.
      p_count: !rateLimit.limited,
    });
    if (error) return null;
    return parseSerialVerification(data);
  } catch {
    return null;
  }
});

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { serial } = await params;
  const data = await getSerialVerification(serial);
  const productName = data?.productName ?? 'Durhaim Product';
  const authentic = Boolean(data) && data?.status !== 'REVOKED';

  // Never claim authenticity in the title, description or link preview for a serial that did
  // not verify — this text is what appears in search results and chat unfurls, where the
  // status panel on the page is not visible.
  if (!authentic) {
    const revoked = data?.status === 'REVOKED';
    const summary = revoked
      ? `Serial ${serial} has been revoked by DURHAIM.`
      : `Serial ${serial} is not registered with DURHAIM.`;
    return {
      title: revoked ? 'Certificate Revoked' : 'Serial Not Registered',
      description: summary,
      openGraph: { title: revoked ? 'DURHAIM - Certificate Revoked' : 'DURHAIM - Serial Not Registered', description: summary },
      // Arbitrary /verify/<anything> URLs must not accumulate in the index.
      robots: { index: false, follow: false },
    };
  }

  return {
    // The root layout's title template already appends "| DURHAIM".
    title: `Authenticity Certificate - ${productName}`,
    description: `Serial: ${serial} - Verified authentic by DURHAIM Tactical Gear`,
    openGraph: {
      title: `Durhaim Authenticity Certificate - ${productName}`,
      description: `Serial: ${serial} - Verified authentic by Durhaim`,
    },
  };
}

export default async function VerifyPage({ params }: PageProps) {
  const { serial: rawSerial } = await params;
  const siteSettings = await getSiteSettings();
  const data = await getSerialVerification(rawSerial);
  const serial = rawSerial.toUpperCase();
  const verificationCount = data?.verificationCount ?? undefined;
  const status = !data ? 'UNVERIFIED' : data.status === 'REVOKED' ? 'REVOKED' : 'AUTHENTIC';
  const productName = data?.productName ?? null;
  const productImage = data?.productImage ?? null;
  const registeredDate = data?.createdAt
    ? new Date(data.createdAt).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : 'N/A';
  const issuedDate = new Date().toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  // Only a genuine, non-revoked serial gets certificate framing. Presenting the seal,
  // a certificate ID and an issue date around an unregistered serial makes a counterfeit
  // look endorsed — every signal on the page said "genuine" except one panel of text.
  const isAuthentic = status === 'AUTHENTIC';
  const certificateId = isAuthentic
    ? `DRH-CERT-${serial.replace(/[^A-Z0-9]/g, '').slice(-8) || 'UNKNOWN'}`
    : null;
  const statusStyles = status === 'AUTHENTIC'
    ? {
        panel: 'border-[#9FE870]/50 bg-[#9FE870]/10 text-[#9FE870]',
        icon: 'verified',
        label: { en: 'AUTHENTIC', id: 'ASLI' },
        headline: { en: 'Verified Authentic', id: 'Keaslian Terverifikasi' },
        body: {
          en: 'This product serial is registered in the official DURHAIM verification system.',
          id: 'Nomor serial produk ini terdaftar di sistem verifikasi resmi DURHAIM.',
        },
      }
    : status === 'REVOKED'
      ? {
          panel: 'border-error/60 bg-error-container/25 text-error',
          icon: 'gpp_bad',
          label: { en: 'REVOKED', id: 'DICABUT' },
          headline: { en: 'Certificate Revoked', id: 'Sertifikat Dicabut' },
          body: {
            en: 'This serial number exists but has been revoked by DURHAIM. Please contact support before using this product certificate.',
            id: 'Nomor serial ini ada, tetapi telah dicabut oleh DURHAIM. Hubungi bantuan sebelum menggunakan sertifikat produk ini.',
          },
        }
      : {
          panel: 'border-signal-orange/60 bg-signal-orange/10 text-signal-orange',
          icon: 'report',
          label: { en: 'UNVERIFIED', id: 'BELUM TERVERIFIKASI' },
          headline: { en: 'Serial Not Registered', id: 'Serial Tidak Terdaftar' },
          body: {
            en: 'This serial number is not registered in the DURHAIM system. If you believe this is an error, please contact support.',
            id: 'Nomor serial ini tidak terdaftar di sistem DURHAIM. Jika Anda yakin ini kesalahan, silakan hubungi bantuan.',
          },
        };
  // An unregistered serial has no registration date, no scan history and no certificate id —
  // showing "N/A" rows under a certificate heading still reads as a partly-filled certificate.
  const certificateFacts = isAuthentic
    ? [
        { label: { en: 'Certificate ID', id: 'ID Sertifikat' }, value: certificateId as string },
        { label: { en: 'Registered', id: 'Terdaftar' }, value: registeredDate },
        { label: { en: 'Verification Count', id: 'Jumlah Verifikasi' }, value: verificationCount !== undefined ? `${verificationCount}` : 'N/A' },
      ]
    : status === 'REVOKED'
      ? [
          { label: { en: 'Registered', id: 'Terdaftar' }, value: registeredDate },
          { label: { en: 'Status', id: 'Status' }, value: 'REVOKED' },
        ]
      : [];

  return (
    <main id="main-content" className="flex-grow bg-texture min-h-screen">
      <div className="mx-auto max-w-[1180px] px-margin-edge py-section-gap">
        <section className="relative overflow-hidden border border-surface-container-highest bg-charcoal-field/95 shadow-2xl">
          <div className="absolute inset-x-0 top-0 h-1 bg-signal-orange" />
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 border border-signal-orange/20" />
          <div className="pointer-events-none absolute -bottom-28 -left-28 h-80 w-80 border border-surface-container-highest/70" />

          <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div className="relative p-6 md:p-10 lg:p-12">
              <div className="mb-stack-lg flex flex-col gap-stack-md border-b border-surface-container-highest pb-stack-lg md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="font-display-xl text-headline-lg text-stark-white tracking-tighter uppercase">DURHAIM</div>
                  <div className="mt-1 font-label-caps text-label-caps text-signal-orange uppercase">
                    {isAuthentic
                      ? <LocalizedText en="Authenticity Certificate" id="Sertifikat Keaslian" />
                      : <LocalizedText en="Verification Result" id="Hasil Verifikasi" />}
                  </div>
                </div>
                <div className={`inline-flex items-center gap-2 self-start border px-4 py-3 font-label-caps text-label-caps uppercase ${statusStyles.panel}`}>
                  <span className="material-symbols-outlined text-[20px]">{statusStyles.icon}</span>
                  <LocalizedText en={statusStyles.label.en} id={statusStyles.label.id} />
                </div>
              </div>

              <div className="grid gap-gutter lg:grid-cols-[220px_minmax(0,1fr)]">
                <div className="border border-surface-container-highest bg-tactical-black p-stack-md">
                  <div className="flex aspect-square items-center justify-center bg-surface-container-lowest">
                    {productImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                    <img src={productImage} alt={productName ?? 'Produk Durhaim'} className="h-full w-full object-contain p-4" />
                    ) : (
                      <div className="flex h-32 w-32 items-center justify-center border border-signal-orange/40 text-signal-orange">
                        <span className="material-symbols-outlined text-[56px]">military_tech</span>
                      </div>
                    )}
                  </div>
                  <div className="mt-stack-md border-t border-surface-container-highest pt-stack-sm text-center font-data-mono text-data-mono uppercase text-on-surface-variant">
                    {isAuthentic
                      ? <LocalizedText en="Official Registry" id="Registri Resmi" />
                      : status === 'REVOKED'
                        // A revoked serial was in the registry; it is the certificate that
                        // was withdrawn. Saying "not in registry" would misstate that.
                        ? <LocalizedText en="Withdrawn from registry" id="Ditarik dari registri" />
                        : <LocalizedText en="Not in registry" id="Tidak ada di registri" />}
                  </div>
                </div>

                <div>
                  <div className="mb-stack-md font-data-mono text-data-mono uppercase text-on-surface-variant">
                    {isAuthentic
                      ? <LocalizedText en="Certified product" id="Produk tersertifikasi" />
                      : <LocalizedText en="Checked serial" id="Serial diperiksa" />}
                  </div>
                  <h1 className="font-display-xl text-headline-lg-mobile uppercase tracking-tighter text-stark-white md:text-display-xl">
                    {/* An unregistered serial has no product, so the generic "Durhaim Product"
                        fallback would headline the page with a product that does not exist. */}
                    {productName ?? (status === 'UNVERIFIED'
                      ? <LocalizedText en="Unrecognised Serial" id="Serial Tidak Dikenal" />
                      : <LocalizedText en="Durhaim Product" id="Produk Durhaim" />)}
                  </h1>

                  <div className={`mt-stack-lg border p-stack-md ${statusStyles.panel}`}>
                    <div className="mb-2 flex items-center gap-2 font-headline-md text-headline-md uppercase">
                      <span className="material-symbols-outlined">{statusStyles.icon}</span>
                      <LocalizedText en={statusStyles.headline.en} id={statusStyles.headline.id} />
                    </div>
                    <p className="font-body-md text-body-md text-stark-white/85">
                      <LocalizedText en={statusStyles.body.en} id={statusStyles.body.id} />
                    </p>
                  </div>

                  <div className="mt-stack-lg border border-surface-container-highest bg-tactical-black p-stack-md">
                    <div className="mb-2 font-data-mono text-data-mono uppercase text-on-surface-variant">
                      <LocalizedText en="Serial Number" id="Nomor Serial" />
                    </div>
                    <div className="break-all font-data-mono text-[28px] font-bold uppercase tracking-widest text-stark-white md:text-[34px]">
                      {serial}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-stack-lg grid gap-stack-sm md:grid-cols-3">
                {certificateFacts.map((fact) => (
                  <div key={fact.label.en} className="border border-surface-container-highest bg-surface-container/50 p-stack-md">
                    <div className="mb-1 font-data-mono text-data-mono uppercase text-on-surface-variant">
                      <LocalizedText en={fact.label.en} id={fact.label.id} />
                    </div>
                    <div className="font-data-mono text-data-mono uppercase text-stark-white">{fact.value}</div>
                  </div>
                ))}
              </div>
            </div>

            <aside className="border-t border-surface-container-highest bg-tactical-black/80 p-6 md:p-10 lg:border-l lg:border-t-0">
              {/* The seal is an assertion of authenticity, so it is shown only when the
                  serial actually verifies. Revoked and unregistered serials get the neutral
                  status mark instead. */}
              <div className={`mx-auto flex h-36 w-36 items-center justify-center border-2 text-center ${isAuthentic ? 'border-signal-orange' : 'border-surface-container-highest'}`}>
                <div>
                  <div className={`font-display-xl text-headline-md uppercase tracking-tighter ${isAuthentic ? 'text-stark-white' : 'text-on-surface-variant'}`}>DRH</div>
                  <div className={`mt-1 font-data-mono text-[10px] uppercase ${isAuthentic ? 'text-signal-orange' : 'text-on-surface-variant'}`}>
                    {isAuthentic
                      ? <LocalizedText en="Verified" id="Terverifikasi" />
                      : status === 'REVOKED'
                        ? <LocalizedText en="Revoked" id="Dicabut" />
                        : <LocalizedText en="Not registered" id="Tidak terdaftar" />}
                  </div>
                </div>
              </div>

              <div className="mt-stack-lg space-y-stack-md">
                {isAuthentic && (
                  <div className="border border-surface-container-highest p-stack-md">
                    <div className="font-data-mono text-data-mono uppercase text-on-surface-variant">
                      <LocalizedText en="Issued" id="Diterbitkan" />
                    </div>
                    <div className="mt-1 font-data-mono text-data-mono uppercase text-stark-white">{issuedDate}</div>
                  </div>
                )}
                <div className="border border-surface-container-highest p-stack-md">
                  <div className="font-data-mono text-data-mono uppercase text-on-surface-variant">
                    <LocalizedText en="Authority" id="Otoritas" />
                  </div>
                  <div className="mt-1 font-data-mono text-data-mono uppercase text-stark-white">DURHAIM Tactical</div>
                </div>
              </div>

              <div className="mt-stack-lg border-t border-surface-container-highest pt-stack-md">
                <p className="font-body-md text-body-md text-on-surface-variant">
                  <LocalizedText
                    en="Match this serial with the label on your product. If anything looks different, contact Durhaim support before use."
                    id="Cocokkan serial ini dengan label pada produk Anda. Jika ada perbedaan, hubungi bantuan Durhaim sebelum digunakan."
                  />
                </p>
              </div>

              <div className="mt-stack-lg flex flex-col gap-stack-sm">
                <a
                  href={buildWhatsAppUrl(siteSettings, `Saya ingin memverifikasi produk Durhaim dengan serial number: ${serial}`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 border border-surface-container-highest px-6 py-3 font-label-caps text-label-caps text-stark-white transition-colors hover:border-signal-orange hover:text-signal-orange"
                >
                  <span className="material-symbols-outlined text-[18px]">chat</span>
                  <LocalizedText en="Contact Support" id="Hubungi Bantuan" />
                </a>
                <Link
                  href="/"
                  className="inline-flex items-center justify-center gap-2 bg-signal-orange px-6 py-3 font-label-caps text-label-caps text-tactical-black transition-colors hover:bg-stark-white"
                >
                  <span className="material-symbols-outlined text-[18px]">home</span>
                  <LocalizedText en="Back to Home" id="Kembali ke Beranda" />
                </Link>
              </div>
            </aside>
          </div>
        </section>

        <div className="mt-stack-lg text-center">
          <Link
            href="/verify"
            className="font-data-mono text-data-mono uppercase text-on-surface-variant transition-colors hover:text-signal-orange"
          >
            <LocalizedText en="Verify another serial number" id="Verifikasi nomor serial lain" />
          </Link>
        </div>
      </div>
    </main>
  );
}
