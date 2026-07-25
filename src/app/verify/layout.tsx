import type { Metadata } from "next";

// page.tsx is a client component and cannot export metadata, so it lives here.
// /verify/[serial] supplies its own title via generateMetadata, which overrides this.
export const metadata: Metadata = {
  // `template` is repeated from the root layout: introducing a title at this segment
  // otherwise leaves /verify/[serial] without the brand suffix.
  title: {
    default: "Verify DURHAIM Authenticity - Check Your Serial Number",
    template: "%s | DURHAIM",
  },
  description:
    "Check whether your DURHAIM tactical gear is genuine. Enter the serial number from your product label, or scan its QR code, to verify authenticity against the official DURHAIM registry.",
  alternates: {
    canonical: "/verify",
    languages: {
      en: "/verify",
      id: "/verify?lang=id",
      "x-default": "/verify",
    },
  },
};

export default function VerifyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
