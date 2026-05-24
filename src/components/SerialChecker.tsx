'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCommerce } from '@/components/CommerceProvider';

type VerifyResult = {
  found: boolean;
  serial?: string;
  product?: {
    name: string;
    status: string;
  };
  message?: string;
};

export default function SerialChecker() {
  const { language, t } = useCommerce();
  const [serial, setSerial] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerifyResult | null>(null);

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    if (!serial.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serial: serial.trim().toUpperCase() }),
      });
      const data = await res.json();
      setResult(data);
    } catch {
      setResult({ found: false, message: t.serialChecker.connectionError });
    } finally {
      setLoading(false);
    }
  }

  const localizedResultMessage = (() => {
    if (!result?.message) return t.serialChecker.notRegistered;
    if (language !== 'id') return result.message;

    return {
      'Invalid serial number': 'Nomor serial tidak valid.',
      'Invalid serial number format': 'Format nomor serial tidak valid.',
      'Too many verification attempts. Please try again later.': 'Terlalu banyak percobaan verifikasi. Silakan coba lagi nanti.',
      'Database schema is not installed. Apply supabase/schema.sql.': 'Skema database belum terpasang. Hubungi admin Durhaim.',
      'Serial number not found in our system.': 'Nomor serial tidak ditemukan di sistem kami.',
      'This serial number has been revoked.': 'Nomor serial ini telah dicabut.',
      'This serial number is registered but not active yet.': 'Nomor serial ini terdaftar, tetapi belum aktif.',
      'Unable to record verification attempt.': 'Percobaan verifikasi belum dapat dicatat.',
      'Server error. Please try again.': 'Server bermasalah. Silakan coba lagi.',
    }[result.message] ?? result.message;
  })();

  return (
    <div className="flex flex-col items-center gap-stack-md">
      {loading && (
        <span className="font-data-mono text-data-mono text-signal-orange">{t.serialChecker.loading}</span>
      )}
      {!loading && !result && (
        <span className="font-data-mono text-data-mono text-signal-orange">{t.serialChecker.prompt}</span>
      )}
      {result && (
        <div className={`w-full max-w-md p-4 border ${
          result.found
            ? 'border-signal-orange bg-operator-green/20'
            : 'border-error bg-error-container/20'
        }`}>
          {result.found ? (
            <div className="text-center">
              <div className="font-label-caps text-label-caps text-signal-orange mb-2">{t.serialChecker.authentic}</div>
              <p className="font-data-mono text-data-mono text-stark-white">{result.product?.name}</p>
              <Link
                href={`/verify/${result.serial}`}
                className="inline-block mt-3 border border-signal-orange text-signal-orange font-label-caps text-label-caps py-2 px-4 hover:bg-signal-orange hover:text-tactical-black transition-colors"
              >
                {t.serialChecker.viewCertificate}
              </Link>
            </div>
          ) : (
            <div className="text-center">
              <div className="font-label-caps text-label-caps text-error mb-2">{t.serialChecker.notFound}</div>
              <p className="font-body-md text-body-md text-on-surface-variant">
                {localizedResultMessage}
              </p>
            </div>
          )}
        </div>
      )}
      <p className="font-body-md text-body-md text-on-surface-variant max-w-lg mx-auto opacity-90 drop-shadow">
        {t.serialChecker.instructions}
      </p>
      <form onSubmit={handleVerify} className="w-full max-w-md mt-4">
        <input
          className="w-full bg-tactical-black/70 border border-surface-container-highest text-stark-white font-data-mono text-center py-3 focus:border-signal-orange focus:ring-1 focus:ring-signal-orange transition-colors duration-200 uppercase"
          placeholder="XXXX-XXXX-XXXX"
          type="text"
          value={serial}
          onChange={(e) => setSerial(e.target.value.toUpperCase())}
          maxLength={20}
        />
        <button
          type="submit"
          className="w-full mt-3 bg-signal-orange text-tactical-black font-label-caps text-label-caps py-3 hover:bg-stark-white transition-colors duration-200 uppercase"
          disabled={loading}
        >
          {loading ? t.serialChecker.verifying : t.serialChecker.verify}
        </button>
      </form>
      <Link
        className="inline-block mt-2 border border-surface-container-highest text-stark-white font-label-caps text-label-caps py-2 px-6 hover:bg-signal-orange hover:border-signal-orange hover:text-tactical-black transition-colors duration-200 backdrop-blur-sm bg-tactical-black/50"
        href="/qr-guide"
      >
        {t.serialChecker.qrGuide}
      </Link>
    </div>
  );
}
