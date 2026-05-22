import type { Metadata } from 'next';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import { headers } from 'next/headers';
import { unstable_noStore as noStore } from 'next/cache';
import { createAdminClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: { serial: string };
}

async function getSerialData(serial: string) {
  noStore();

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
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

async function recordVerificationView(data: Awaited<ReturnType<typeof getSerialData>>) {
  if (!data || data.status === 'REVOKED') return data?.verification_count;

  try {
    const supabase = createAdminClient();
    const { data: currentSerial, error: currentError } = await supabase
      .from('serial_numbers')
      .select('verification_count')
      .eq('id', data.id)
      .single();

    if (currentError) throw currentError;

    const nextCount = (currentSerial?.verification_count ?? 0) + 1;
    const requestHeaders = headers();
    const ip = requestHeaders.get('x-forwarded-for') ?? requestHeaders.get('x-real-ip') ?? 'unknown';

    await supabase
      .from('serial_numbers')
      .update({ verification_count: nextCount })
      .eq('id', data.id);

    await supabase.from('verification_logs').insert({
      serial_id: data.id,
      ip_address: ip,
      user_agent: requestHeaders.get('user-agent') ?? '',
    });

    return nextCount;
  } catch (error) {
    console.error('Failed to record verification view:', error);
    return data.verification_count;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const data = await getSerialData(params.serial);
  const productName = data?.products?.name ?? 'Unknown Product';
  return {
    title: `Authenticity Certificate — ${productName} | DURHAIM`,
    description: `Serial: ${params.serial} — Verified authentic by DURHAIM Tactical Gear`,
    openGraph: {
      title: `Durhaim Authenticity Certificate — ${productName}`,
      description: `Serial: ${params.serial} — Verified authentic by Durhaim`,
    },
  };
}

export default async function VerifyPage({ params }: PageProps) {
  const data = await getSerialData(params.serial);
  const verificationCount = await recordVerificationView(data);
  const serial = params.serial.toUpperCase();
  const status = !data ? 'UNVERIFIED' : data.status === 'REVOKED' ? 'REVOKED' : 'AUTHENTIC';

  return (
    <main className="flex-grow bg-background min-h-screen">
      <div className="max-w-2xl mx-auto px-margin-edge py-section-gap">
        {/* Certificate Header */}
        <div className="border border-surface-container-highest bg-charcoal-field p-8 text-center mb-stack-lg">
          <div className="font-display-xl text-headline-md text-stark-white tracking-tighter uppercase mb-2">DURHAIM</div>
          <div className="font-label-caps text-label-caps text-signal-orange uppercase tracking-widest mb-stack-lg">Authenticity Certificate</div>

          {/* Status Badge */}
          <div className={`inline-block px-6 py-3 mb-stack-lg font-label-caps text-label-caps uppercase tracking-wider ${
            status === 'AUTHENTIC'
              ? 'bg-operator-green/20 border border-operator-green text-operator-green'
              : 'bg-error-container border border-error text-error'
          }`}>
            {status}
          </div>

          {/* Serial Number */}
          <div className="bg-tactical-black border border-surface-container-highest p-stack-md mb-stack-lg">
            <div className="font-data-mono text-data-mono text-on-tertiary-fixed-variant uppercase mb-1">Serial Number</div>
            <div className="font-data-mono text-[24px] text-stark-white tracking-widest">{serial}</div>
          </div>

          {/* Product Info */}
          {data?.products && (
            <div className="mb-stack-lg">
              <h2 className="font-headline-md text-headline-md text-stark-white uppercase mb-2">{data.products.name}</h2>
              {data.created_at && (
                <p className="font-data-mono text-data-mono text-on-tertiary-fixed-variant">
                  Registered: {new Date(data.created_at).toLocaleDateString('id-ID')}
                </p>
              )}
              {verificationCount !== undefined && (
                <p className="font-data-mono text-data-mono text-on-tertiary-fixed-variant">
                  Verified {verificationCount} times
                </p>
              )}
            </div>
          )}

          {status === 'REVOKED' && (
            <div className="mb-stack-lg">
              <p className="font-body-md text-body-md text-error">
                This serial number exists but has been revoked by DURHAIM. Please contact support before using this product certificate.
              </p>
            </div>
          )}

          {status === 'UNVERIFIED' && (
            <div className="mb-stack-lg">
              <p className="font-body-md text-body-md text-on-surface-variant">
                This serial number is not registered in the DURHAIM system. If you believe this is an error, please contact our support team.
              </p>
            </div>
          )}

          {/* Share Actions */}
          <div className="flex flex-col sm:flex-row gap-stack-md justify-center">
            <a
              href={`https://wa.me/6282120101473?text=Saya%20ingin%20memverifikasi%20produk%20Durhaim%20dengan%20serial%20number:%20${serial}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 border border-surface-container-highest text-stark-white font-label-caps text-label-caps py-3 px-6 hover:border-signal-orange hover:text-signal-orange transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">chat</span>
              Contact Support
            </a>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 bg-signal-orange text-tactical-black font-label-caps text-label-caps py-3 px-6 hover:bg-stark-white transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">home</span>
              Back to Home
            </Link>
          </div>
        </div>

        {/* Verify Another */}
        <div className="text-center">
          <Link
            href="/"
            className="font-data-mono text-data-mono text-on-tertiary-fixed-variant hover:text-signal-orange transition-colors uppercase"
          >
            ← Verify another serial number
          </Link>
        </div>
      </div>
    </main>
  );
}
