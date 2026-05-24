import type { Metadata } from 'next';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import { unstable_noStore as noStore } from 'next/cache';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ serial: string }>;
}

async function getSerialData(serial: string) {
  noStore();

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );
    const { data } = await supabase
      .from('serial_numbers')
      .select('*, products(*)')
      .eq('serial', serial.toUpperCase())
      .single();
    return data;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { serial } = await params;
  const data = await getSerialData(serial);
  const productName = data?.products?.name ?? 'Unknown Product';
  return {
    title: `Authenticity Certificate - ${productName} | DURHAIM`,
    description: `Serial: ${serial} - Verified authentic by DURHAIM Tactical Gear`,
    openGraph: {
      title: `Durhaim Authenticity Certificate - ${productName}`,
      description: `Serial: ${serial} - Verified authentic by Durhaim`,
    },
  };
}

export default async function VerifyPage({ params }: PageProps) {
  const { serial: rawSerial } = await params;
  const data = await getSerialData(rawSerial);
  const verificationCount = data?.verification_count;
  const serial = rawSerial.toUpperCase();
  const status = !data ? 'UNVERIFIED' : data.status === 'REVOKED' ? 'REVOKED' : 'AUTHENTIC';
  const product = data?.products;
  const productImage = Array.isArray(product?.images) ? product.images[0] : null;
  const registeredDate = data?.created_at
    ? new Date(data.created_at).toLocaleDateString('id-ID', {
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
  const certificateId = `DRH-CERT-${serial.replace(/[^A-Z0-9]/g, '').slice(-8) || 'UNKNOWN'}`;
  const statusStyles = status === 'AUTHENTIC'
    ? {
        panel: 'border-[#9FE870]/50 bg-[#9FE870]/10 text-[#9FE870]',
        icon: 'verified',
        headline: 'Verified Authentic',
        body: 'This product serial is registered in the official DURHAIM verification system.',
      }
    : status === 'REVOKED'
      ? {
          panel: 'border-error/60 bg-error-container/25 text-error',
          icon: 'gpp_bad',
          headline: 'Certificate Revoked',
          body: 'This serial number exists but has been revoked by DURHAIM. Please contact support before using this product certificate.',
        }
      : {
          panel: 'border-signal-orange/60 bg-signal-orange/10 text-signal-orange',
          icon: 'report',
          headline: 'Serial Not Registered',
          body: 'This serial number is not registered in the DURHAIM system. If you believe this is an error, please contact support.',
        };

  return (
    <main className="flex-grow bg-texture min-h-screen">
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
                  <div className="mt-1 font-label-caps text-label-caps text-signal-orange uppercase">Authenticity Certificate</div>
                </div>
                <div className={`inline-flex items-center gap-2 self-start border px-4 py-3 font-label-caps text-label-caps uppercase ${statusStyles.panel}`}>
                  <span className="material-symbols-outlined text-[20px]">{statusStyles.icon}</span>
                  {status}
                </div>
              </div>

              <div className="grid gap-gutter lg:grid-cols-[220px_minmax(0,1fr)]">
                <div className="border border-surface-container-highest bg-tactical-black p-stack-md">
                  <div className="flex aspect-square items-center justify-center bg-surface-container-lowest">
                    {productImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={productImage} alt={product?.name ?? 'Durhaim product'} className="h-full w-full object-contain p-4" />
                    ) : (
                      <div className="flex h-32 w-32 items-center justify-center border border-signal-orange/40 text-signal-orange">
                        <span className="material-symbols-outlined text-[56px]">military_tech</span>
                      </div>
                    )}
                  </div>
                  <div className="mt-stack-md border-t border-surface-container-highest pt-stack-sm text-center font-data-mono text-data-mono uppercase text-on-surface-variant">
                    Official Registry
                  </div>
                </div>

                <div>
                  <div className="mb-stack-md font-data-mono text-data-mono uppercase text-on-surface-variant">Certified product</div>
                  <h1 className="font-display-xl text-headline-lg-mobile uppercase tracking-tighter text-stark-white md:text-display-xl">
                    {product?.name ?? 'Product Not Found'}
                  </h1>

                  <div className={`mt-stack-lg border p-stack-md ${statusStyles.panel}`}>
                    <div className="mb-2 flex items-center gap-2 font-headline-md text-headline-md uppercase">
                      <span className="material-symbols-outlined">{statusStyles.icon}</span>
                      {statusStyles.headline}
                    </div>
                    <p className="font-body-md text-body-md text-stark-white/85">{statusStyles.body}</p>
                  </div>

                  <div className="mt-stack-lg border border-surface-container-highest bg-tactical-black p-stack-md">
                    <div className="mb-2 font-data-mono text-data-mono uppercase text-on-surface-variant">Serial Number</div>
                    <div className="break-all font-data-mono text-[28px] font-bold uppercase tracking-widest text-stark-white md:text-[34px]">
                      {serial}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-stack-lg grid gap-stack-sm md:grid-cols-3">
                {[
                  ['Certificate ID', certificateId],
                  ['Registered', registeredDate],
                  ['Verification Count', verificationCount !== undefined ? `${verificationCount}` : 'N/A'],
                ].map(([label, value]) => (
                  <div key={label} className="border border-surface-container-highest bg-surface-container/50 p-stack-md">
                    <div className="mb-1 font-data-mono text-data-mono uppercase text-on-surface-variant">{label}</div>
                    <div className="font-data-mono text-data-mono uppercase text-stark-white">{value}</div>
                  </div>
                ))}
              </div>
            </div>

            <aside className="border-t border-surface-container-highest bg-tactical-black/80 p-6 md:p-10 lg:border-l lg:border-t-0">
              <div className="mx-auto flex h-36 w-36 items-center justify-center border-2 border-signal-orange text-center">
                <div>
                  <div className="font-display-xl text-headline-md uppercase tracking-tighter text-stark-white">DRH</div>
                  <div className="mt-1 font-data-mono text-[10px] uppercase text-signal-orange">Verified</div>
                </div>
              </div>

              <div className="mt-stack-lg space-y-stack-md">
                <div className="border border-surface-container-highest p-stack-md">
                  <div className="font-data-mono text-data-mono uppercase text-on-surface-variant">Issued</div>
                  <div className="mt-1 font-data-mono text-data-mono uppercase text-stark-white">{issuedDate}</div>
                </div>
                <div className="border border-surface-container-highest p-stack-md">
                  <div className="font-data-mono text-data-mono uppercase text-on-surface-variant">Authority</div>
                  <div className="mt-1 font-data-mono text-data-mono uppercase text-stark-white">DURHAIM Tactical</div>
                </div>
              </div>

              <div className="mt-stack-lg border-t border-surface-container-highest pt-stack-md">
                <p className="font-body-md text-body-md text-on-surface-variant">
                  Match this serial with the label on your product. If anything looks different, contact Durhaim support before use.
                </p>
              </div>

              <div className="mt-stack-lg flex flex-col gap-stack-sm">
                <a
                  href={`https://wa.me/6282120101473?text=Saya%20ingin%20memverifikasi%20produk%20Durhaim%20dengan%20serial%20number:%20${serial}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 border border-surface-container-highest px-6 py-3 font-label-caps text-label-caps text-stark-white transition-colors hover:border-signal-orange hover:text-signal-orange"
                >
                  <span className="material-symbols-outlined text-[18px]">chat</span>
                  Contact Support
                </a>
                <Link
                  href="/"
                  className="inline-flex items-center justify-center gap-2 bg-signal-orange px-6 py-3 font-label-caps text-label-caps text-tactical-black transition-colors hover:bg-stark-white"
                >
                  <span className="material-symbols-outlined text-[18px]">home</span>
                  Back to Home
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
            Verify another serial number
          </Link>
        </div>
      </div>
    </main>
  );
}
