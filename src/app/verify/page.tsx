"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import JsonLd from "@/components/JsonLd";

export default function VerificationPage() {
  const [serial, setSerial] = useState("");
  const router = useRouter();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://durhaim.com";

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedSerial = serial.trim().toUpperCase();
    if (normalizedSerial) {
      router.push(`/verify/${encodeURIComponent(normalizedSerial)}`);
    }
  };

  return (
    <main className="flex-grow flex flex-col min-h-[80vh] bg-tactical-black">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: [
            {
              "@type": "Question",
              name: "How do I verify a DURHAIM product?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Enter the product serial number in the DURHAIM authenticity checker. The system confirms whether the serial is registered, active, or revoked.",
              },
            },
            {
              "@type": "Question",
              name: "Where is the DURHAIM authenticity checker?",
              acceptedAnswer: {
                "@type": "Answer",
                text: `The DURHAIM authenticity checker is available at ${siteUrl}/verify.`,
              },
            },
          ],
        }}
      />
      {/* Header/Hero Section */}
      <section
        className="relative py-section-gap px-margin-edge border-b border-surface-container-highest flex-grow flex flex-col justify-center items-center"
        style={{
          backgroundImage: "url('/images/durhaim_image_2.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Scrim Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-tactical-black/90 via-tactical-black/80 to-tactical-black z-0"></div>
        
        {/* Verification Container */}
        <div className="relative z-10 w-full max-w-2xl bg-charcoal-field/90 backdrop-blur-md border border-surface-container-highest p-8 md:p-12 shadow-2xl">
          <div className="text-center flex flex-col gap-md mb-stack-lg">
            <h1 className="font-display-xl text-headline-lg md:text-display-xl text-stark-white uppercase tracking-tighter drop-shadow-md">
              AUTHENTICITY CHECKER
            </h1>
            <p className="font-body-md text-on-surface-variant max-w-lg mx-auto">
              Enter your product&apos;s unique serial number below to verify its authenticity and view the digital certificate. Include any hyphens (e.g., DRH-XXXX-XXXX).
            </p>
          </div>

          <form onSubmit={handleVerify} className="flex flex-col gap-md items-center">
            <div className="w-full relative">
              <input
                type="text"
                value={serial}
                onChange={(e) => setSerial(e.target.value.toUpperCase())}
                placeholder="XXXX-XXXX-XXXX"
                className="w-full bg-tactical-black border-2 border-surface-container-highest text-stark-white font-data-mono text-center py-stack-md text-lg focus:border-signal-orange focus:outline-none transition-colors duration-200 uppercase"
                required
              />
              {/* Tactical corners embellishment */}
              <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-surface-container-highest pointer-events-none"></div>
              <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-surface-container-highest pointer-events-none"></div>
              <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-surface-container-highest pointer-events-none"></div>
              <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-surface-container-highest pointer-events-none"></div>
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full font-label-caps"
            >
              VERIFY PRODUCT
            </button>
          </form>
          
          <div className="mt-stack-lg pt-stack-md border-t border-surface-container-highest text-center">
            <p className="font-data-mono text-data-mono text-signal-orange/80">
              SECURE SYSTEM // DO NOT SHARE YOUR SERIAL CODE EXTERNALLY
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
