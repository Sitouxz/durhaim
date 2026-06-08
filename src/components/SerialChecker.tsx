'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Camera, Keyboard, RefreshCw } from 'lucide-react';
import { useCommerce } from '@/components/CommerceProvider';
import jsQR from 'jsqr';

type VerifyResult = {
  found: boolean;
  serial?: string;
  product?: {
    name: string;
    status: string;
  };
  message?: string;
};

type InputMode = 'scan' | 'manual';
type ScannerState = 'starting' | 'scanning' | 'detected' | 'error';

type BarcodeDetection = {
  rawValue?: string;
};

type BarcodeDetectorInstance = {
  detect: (source: HTMLVideoElement) => Promise<BarcodeDetection[]>;
};

type BarcodeDetectorConstructor = new (options?: { formats?: string[] }) => BarcodeDetectorInstance;

type BarcodeDetectorWindow = Window & typeof globalThis & {
  BarcodeDetector?: BarcodeDetectorConstructor;
};

export default function SerialChecker() {
  const { language, t } = useCommerce();
  const [serial, setSerial] = useState('');
  const [inputMode, setInputMode] = useState<InputMode>('scan');
  const [scannerState, setScannerState] = useState<ScannerState>('starting');
  const [scannerMessage, setScannerMessage] = useState('');
  const [scanAttempt, setScanAttempt] = useState(0);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerifyResult | null>(null);
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanTimeoutRef = useRef<number | null>(null);

  const stopScanner = useCallback(() => {
    if (scanTimeoutRef.current) {
      window.clearTimeout(scanTimeoutRef.current);
      scanTimeoutRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const extractSerialFromScan = useCallback((rawValue: string) => {
    const trimmedValue = rawValue.trim();
    if (!trimmedValue) return '';

    try {
      const scannedUrl = new URL(trimmedValue, window.location.origin);
      const pathSegments = scannedUrl.pathname.split('/').filter(Boolean);
      const verifySegmentIndex = pathSegments.findIndex((segment) => segment.toLowerCase() === 'verify');
      const serialFromUrl = verifySegmentIndex >= 0 ? pathSegments[verifySegmentIndex + 1] : null;

      if (serialFromUrl) {
        return decodeURIComponent(serialFromUrl).trim().toUpperCase();
      }
    } catch {
      // Non-URL QR codes are treated as raw serial codes.
    }

    const parts = trimmedValue.split(/[\s\t]+/);
    if (parts.length > 0) {
      const possibleSerial = parts.find(p => /^[A-Za-z0-9-]{6,40}$/.test(p));
      if (possibleSerial) {
        return possibleSerial.toUpperCase();
      }
    }

    return trimmedValue.toUpperCase();
  }, []);

  const verifySerial = useCallback(async (serialToVerify: string) => {
    const normalizedSerial = serialToVerify.trim().toUpperCase();
    if (!normalizedSerial) return;

    setLoading(true);
    setResult(null);
    setSerial(normalizedSerial);

    try {
      const res = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serial: normalizedSerial }),
      });
      const data = await res.json();
      
      if (data.found) {
        router.push(`/verify/${data.serial}`);
      } else {
        setResult(data);
        setLoading(false);
      }
    } catch {
      setResult({ found: false, message: t.serialChecker.connectionError });
      setLoading(false);
    }
  }, [router, t.serialChecker.connectionError]);

  const handleScannedValue = useCallback(async (rawValue: string) => {
    const scannedSerial = extractSerialFromScan(rawValue);
    if (!scannedSerial) return;

    setScannerState('detected');
    setScannerMessage(t.serialChecker.scanDetected);
    stopScanner();
    await verifySerial(scannedSerial);
  }, [extractSerialFromScan, stopScanner, t.serialChecker.scanDetected, verifySerial]);

  useEffect(() => {
    if (inputMode !== 'scan') {
      stopScanner();
      return undefined;
    }

    let active = true;

    async function startScanner() {
      setScannerState('starting');
      setScannerMessage(t.serialChecker.scanStarting);

      if (!navigator.mediaDevices?.getUserMedia) {
        setScannerState('error');
        setScannerMessage(t.serialChecker.scanUnsupported);
        return;
      }

      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } },
          audio: false,
        });

        if (!active) {
          mediaStream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = mediaStream;

        if (!videoRef.current) return;
        videoRef.current.srcObject = mediaStream;
        // play() might not return a promise in all browsers
        await videoRef.current.play().catch(() => {});

        setScannerState('scanning');
        setScannerMessage(t.serialChecker.scanActive);

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d', { willReadFrequently: true });

        const scanFrame = () => {
          if (!active || !videoRef.current) return;

          try {
            if (videoRef.current.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
              const video = videoRef.current;
              
              if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
              }

              if (context && canvas.width > 0 && canvas.height > 0) {
                context.drawImage(video, 0, 0, canvas.width, canvas.height);
                const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
                
                const code = jsQR(imageData.data, imageData.width, imageData.height, {
                  inversionAttempts: 'dontInvert',
                });

                if (code && code.data) {
                  active = false;
                  handleScannedValue(code.data);
                  return;
                }
              }
            }
          } catch {
            if (!active) return;
            setScannerState('error');
            setScannerMessage(t.serialChecker.scanError);
            stopScanner();
            return;
          }

          scanTimeoutRef.current = window.setTimeout(scanFrame, 350);
        };

        scanFrame();
      } catch {
        if (!active) return;
        setScannerState('error');
        setScannerMessage(t.serialChecker.scanBlocked);
        stopScanner();
      }
    }

    startScanner();

    return () => {
      active = false;
      stopScanner();
    };
  }, [
    handleScannedValue,
    inputMode,
    scanAttempt,
    stopScanner,
    t.serialChecker.scanActive,
    t.serialChecker.scanBlocked,
    t.serialChecker.scanError,
    t.serialChecker.scanStarting,
    t.serialChecker.scanUnsupported,
  ]);

  useEffect(() => stopScanner, [stopScanner]);

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    await verifySerial(serial);
  }

  function showManualEntry() {
    stopScanner();
    setInputMode('manual');
    setScannerMessage('');
  }

  function showScanner() {
    setResult(null);
    setInputMode('scan');
    setScannerState('starting');
    setScannerMessage('');
    setScanAttempt((currentAttempt) => currentAttempt + 1);
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
      {!loading && !result && inputMode === 'manual' && (
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
              {result.product?.name && (
                <p className="font-data-mono text-data-mono text-stark-white">{result.product.name}</p>
              )}
              <Link
                href={`/verify/${result.serial}`}
                className="inline-block mt-3 border border-signal-orange text-signal-orange font-label-caps text-label-caps py-2 px-4 hover:bg-signal-orange hover:text-tactical-black transition-colors"
              >
                {t.serialChecker.viewCertificate}
              </Link>
            </div>
          ) : (
            <div className="text-center">
              <div className="font-label-caps text-label-caps text-error mb-2">
                {result.message === 'This serial number has been revoked.' ? t.serialChecker.revokedTitle : t.serialChecker.notFound}
              </div>
              <p className="font-body-md text-body-md text-on-surface-variant">
                {localizedResultMessage}
              </p>
            </div>
          )}
        </div>
      )}

      {inputMode === 'scan' ? (
        <div className="mx-auto w-full max-w-sm">
          <span className="font-data-mono text-data-mono text-signal-orange">{t.serialChecker.scanPrompt}</span>
          <div className="relative mt-4 aspect-video overflow-hidden border border-surface-container-highest bg-tactical-black shadow-inner">
            <video
              ref={videoRef}
              aria-label={t.serialChecker.scanVideoLabel}
              className={`h-full w-full object-cover transition-opacity duration-200 ${
                scannerState === 'scanning' ? 'opacity-100' : 'opacity-35'
              }`}
              muted
              playsInline
            />
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute inset-6 border border-signal-orange/80 shadow-[0_0_24px_rgba(255,86,34,0.22)]" />
              <div className="absolute left-6 top-6 h-6 w-6 border-l-2 border-t-2 border-signal-orange" />
              <div className="absolute right-6 top-6 h-6 w-6 border-r-2 border-t-2 border-signal-orange" />
              <div className="absolute bottom-6 left-6 h-6 w-6 border-b-2 border-l-2 border-signal-orange" />
              <div className="absolute bottom-6 right-6 h-6 w-6 border-b-2 border-r-2 border-signal-orange" />
            </div>
            {scannerState !== 'scanning' && (
              <div className="absolute inset-0 flex items-center justify-center bg-tactical-black/70 p-4">
                <p className="font-data-mono text-data-mono text-on-surface-variant" aria-live="polite">
                  {scannerMessage || t.serialChecker.scanStarting}
                </p>
              </div>
            )}
          </div>
          {scannerState === 'scanning' && (
            <p className="mt-3 font-data-mono text-data-mono text-on-surface-variant" aria-live="polite">
              {scannerMessage}
            </p>
          )}
          <div className={`mt-4 grid gap-3 ${scannerState === 'error' ? 'sm:grid-cols-2' : ''}`}>
            <button
              type="button"
              onClick={showManualEntry}
              className="inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap border border-surface-container-highest bg-tactical-black/50 px-4 py-3 font-label-caps text-[12px] leading-none tracking-[0.05em] text-stark-white transition-colors duration-200 hover:border-signal-orange hover:bg-signal-orange hover:text-tactical-black"
            >
              <Keyboard aria-hidden="true" size={16} />
              {t.serialChecker.manualEntry}
            </button>
            {scannerState === 'error' && (
              <button
                type="button"
                onClick={showScanner}
                className="inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap border border-surface-container-highest bg-tactical-black/50 px-4 py-3 font-label-caps text-[12px] leading-none tracking-[0.05em] text-stark-white transition-colors duration-200 hover:border-signal-orange hover:bg-signal-orange hover:text-tactical-black"
              >
                <RefreshCw aria-hidden="true" size={16} />
                {t.serialChecker.tryScanAgain}
              </button>
            )}
          </div>
        </div>
      ) : (
        <>
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
          <button
            type="button"
            onClick={showScanner}
            className="inline-flex items-center justify-center gap-2 border border-surface-container-highest bg-tactical-black/50 px-6 py-2 font-label-caps text-label-caps text-stark-white backdrop-blur-sm transition-colors duration-200 hover:border-signal-orange hover:bg-signal-orange hover:text-tactical-black"
          >
            <Camera aria-hidden="true" size={16} />
            {t.serialChecker.scanQrCode}
          </button>
        </>
      )}

      <Link
        className="inline-block mt-2 border border-surface-container-highest text-stark-white font-label-caps text-label-caps py-2 px-6 hover:bg-signal-orange hover:border-signal-orange hover:text-tactical-black transition-colors duration-200 backdrop-blur-sm bg-tactical-black/50"
        href="/qr-guide"
      >
        {t.serialChecker.qrGuide}
      </Link>
    </div>
  );
}
