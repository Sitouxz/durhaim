import type { Metadata } from "next";

// page.tsx is a client component and cannot export metadata, so it lives here.
export const metadata: Metadata = {
  title: "Tactical Gear Catalogue - Vests, Chestrigs, Packs, Pouches & Belts",
  description:
    "Browse the full DURHAIM tactical gear catalogue: modular vests and chestrigs, packs and pouches, and operator belts. Indonesian and global pricing, serial-verified authenticity.",
  alternates: {
    canonical: "/catalogue",
    languages: {
      en: "/catalogue",
      id: "/catalogue?lang=id",
      "x-default": "/catalogue",
    },
  },
};

export default function CatalogueLayout({ children }: { children: React.ReactNode }) {
  return children;
}
