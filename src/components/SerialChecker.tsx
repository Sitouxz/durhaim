"use client";

import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Camera, Keyboard, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import jsQR from "jsqr";
import LocalizedText from "@/components/LocalizedText";
import { useCommerce } from "@/components/CommerceProvider";

type FailureKind = "not-registered" | "revoked" | "invalid-input" | "service";
type VerifyResult = {
  found: boolean;
  serial?: string;
  product?: { name: string; status: string };
  message?: string;
  failure?: FailureKind;
};
type ScannerState = "idle" | "starting" | "scanning" | "detected" | "error";

const REVOKED_MESSAGE = "This serial number has been revoked.";

function classifyFailure(status: number, message?: string): FailureKind {
  if (message === REVOKED_MESSAGE) return "revoked";
  if (status === 400) return "invalid-input";
  if (status !== 200) return "service";
  return "not-registered";
}

export default function SerialChecker() {
  const { language, t } = useCommerce();
  const router = useRouter();
  const [serial, setSerial] = useState("");
  const [mode, setMode] = useState<"scan" | "manual">("scan");
  const [scannerState, setScannerState] = useState<ScannerState>("idle");
  const [scannerMessage, setScannerMessage] = useState("");
  const [scanAttempt, setScanAttempt] = useState(0);
  const [scannerEnabled, setScannerEnabled] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerifyResult | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanTimeoutRef = useRef<number | null>(null);

  useEffect(() => setHydrated(true), []);

  const stopScanner = useCallback(() => {
    if (scanTimeoutRef.current) window.clearTimeout(scanTimeoutRef.current);
    scanTimeoutRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  const extractSerial = useCallback((value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return "";
    try {
      const scannedUrl = new URL(trimmed, window.location.origin);
      const segments = scannedUrl.pathname.split("/").filter(Boolean);
      const verifyIndex = segments.findIndex((segment) => segment.toLowerCase() === "verify");
      const fromPath = verifyIndex >= 0 ? segments[verifyIndex + 1] : null;
      if (fromPath) return decodeURIComponent(fromPath).trim().toUpperCase();
      const legacyCode = scannedUrl.searchParams.get("code");
      if (legacyCode?.trim()) return legacyCode.trim().toUpperCase();
    } catch {
      // Raw serial QR codes are valid.
    }
    return trimmed.toUpperCase();
  }, []);

  const verifySerial = useCallback(async (value: string) => {
    const normalized = value.trim().toUpperCase();
    if (!normalized) return;
    setSerial(normalized);
    setLoading(true);
    setResult(null);
    try {
      const response = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serial: normalized }),
      });
      const data: VerifyResult = await response.json();
      if (data.found && data.serial) {
        router.push(`/verify/${data.serial}`);
        return;
      }
      setResult({ ...data, failure: classifyFailure(response.status, data.message) });
    } catch {
      setResult({ found: false, failure: "service", message: t.serialChecker.connectionError });
    } finally {
      setLoading(false);
    }
  }, [router, t.serialChecker.connectionError]);

  const handleScan = useCallback((rawValue: string) => {
    const nextSerial = extractSerial(rawValue);
    if (!nextSerial) return;
    setScannerState("detected");
    setScannerMessage(t.serialChecker.scanDetected);
    setScannerEnabled(false);
    stopScanner();
    void verifySerial(nextSerial);
  }, [extractSerial, stopScanner, t.serialChecker.scanDetected, verifySerial]);

  useEffect(() => {
    if (mode !== "scan" || !scannerEnabled) {
      stopScanner();
      return;
    }

    let active = true;
    async function startScanner() {
      setScannerState("starting");
      setScannerMessage(t.serialChecker.scanStarting);
      if (!navigator.mediaDevices?.getUserMedia) {
        setScannerState("error");
        setScannerMessage(t.serialChecker.scanUnsupported);
        setScannerEnabled(false);
        return;
      }
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
          audio: false,
        });
        if (!active) {
          mediaStream.getTracks().forEach((track) => track.stop());
          return;
        }
        streamRef.current = mediaStream;
        if (!videoRef.current) return;
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play().catch(() => undefined);
        setScannerState("scanning");
        setScannerMessage(t.serialChecker.scanActive);

        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d", { willReadFrequently: true });
        const scanFrame = () => {
          if (!active || !videoRef.current) return;
          try {
            const video = videoRef.current;
            if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA && context) {
              canvas.width = video.videoWidth;
              canvas.height = video.videoHeight;
              if (canvas.width && canvas.height) {
                context.drawImage(video, 0, 0, canvas.width, canvas.height);
                const frame = context.getImageData(0, 0, canvas.width, canvas.height);
                const code = jsQR(frame.data, frame.width, frame.height, { inversionAttempts: "dontInvert" });
                if (code?.data) {
                  active = false;
                  handleScan(code.data);
                  return;
                }
              }
            }
            scanTimeoutRef.current = window.setTimeout(scanFrame, 350);
          } catch {
            if (!active) return;
            setScannerState("error");
            setScannerMessage(t.serialChecker.scanError);
            setScannerEnabled(false);
            stopScanner();
          }
        };
        scanFrame();
      } catch {
        if (!active) return;
        setScannerState("error");
        setScannerMessage(t.serialChecker.scanBlocked);
        setScannerEnabled(false);
        stopScanner();
      }
    }
    void startScanner();
    return () => {
      active = false;
      stopScanner();
    };
  }, [handleScan, mode, scanAttempt, scannerEnabled, stopScanner, t.serialChecker]);

  useEffect(() => stopScanner, [stopScanner]);

  function beginScan() {
    setResult(null);
    setMode("scan");
    setScannerState("starting");
    setScannerMessage(t.serialChecker.scanStarting);
    setScanAttempt((attempt) => attempt + 1);
    setScannerEnabled(true);
  }

  function showManual() {
    setScannerEnabled(false);
    stopScanner();
    setMode("manual");
    setScannerState("idle");
  }

  async function submitManual(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await verifySerial(serial);
  }

  const failure = result?.found === false ? result.failure ?? "not-registered" : null;
  const title = failure ? {
    "not-registered": t.serialChecker.notFound,
    revoked: t.serialChecker.revokedTitle,
    "invalid-input": t.serialChecker.invalidInputTitle,
    service: t.serialChecker.serviceErrorTitle,
  }[failure] : "";
  const translatedMessage = language === "id" && result?.message ? {
    "Invalid serial number": "Nomor serial tidak valid.",
    "Invalid serial number format": "Format nomor serial tidak valid.",
    "Too many verification attempts. Please try again later.": "Terlalu banyak percobaan verifikasi. Silakan coba lagi nanti.",
    "Serial number not found in our system.": "Nomor serial tidak ditemukan di sistem kami.",
    "This serial number has been revoked.": "Nomor serial ini telah dicabut.",
    "Server error. Please try again.": "Server bermasalah. Silakan coba lagi.",
  }[result.message] ?? result.message : result?.message;

  return (
    <div className="store-serial-checker" data-hydrated={hydrated}>
      {result && (
        <div className="store-serial-result" role="status">
          <strong>{title}</strong>
          <p>{translatedMessage || t.serialChecker.notRegistered}</p>
        </div>
      )}

      {mode === "scan" ? (
        <>
          <p className="store-scan-prompt" aria-live="polite">
            {scannerState === "idle" ? t.serialChecker.scanPrompt : scannerMessage}
          </p>
          <div className="store-scanner">
            <video ref={videoRef} muted playsInline aria-label={t.serialChecker.scanVideoLabel} />
            <div className="store-scanner__frame" aria-hidden="true" />
            <span className="store-scanner__cross" aria-hidden="true" />
          </div>
          <div className="store-serial-actions">
            <button type="button" onClick={showManual}>
              <Keyboard aria-hidden="true" />
              {t.serialChecker.manualEntry}
            </button>
            <button type="button" onClick={beginScan}>
              {scannerState === "error" ? <RefreshCw aria-hidden="true" /> : <Camera aria-hidden="true" />}
              {t.serialChecker.tryScanAgain}
            </button>
          </div>
        </>
      ) : (
        <>
          <p className="store-serial-instructions">{t.serialChecker.instructions}</p>
          <form className="store-serial-form" onSubmit={submitManual}>
            <label htmlFor="serial-input">
              <LocalizedText en="Serial number" id="Nomor serial" />
            </label>
            <input
              id="serial-input"
              type="text"
              autoComplete="off"
              value={serial}
              onChange={(event) => setSerial(event.target.value.toUpperCase())}
              placeholder="XXXX-XXXX-XXXX"
              maxLength={40}
            />
            <button type="submit" disabled={loading}>
              {loading ? t.serialChecker.verifying : t.serialChecker.verify}
            </button>
          </form>
          <button className="store-serial-switch" type="button" onClick={beginScan}>
            <Camera aria-hidden="true" />
            {t.serialChecker.scanQrCode}
          </button>
        </>
      )}

      <Link className="store-qr-guide" href="/qr-guide">{t.serialChecker.qrGuide}</Link>
    </div>
  );
}
