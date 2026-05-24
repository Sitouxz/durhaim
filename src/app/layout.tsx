/* eslint-disable @next/next/no-page-custom-font */
import type { Metadata } from 'next';
import './globals.css';
import TopNavBar from '@/components/TopNavBar';
import Footer from '@/components/Footer';
import WhatsAppFAB from '@/components/WhatsAppFAB';
import { CommerceProvider } from '@/components/CommerceProvider';
import JsonLd from '@/components/JsonLd';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://durhaim.com';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'DURHAIM - Tactical Gear',
    template: '%s | DURHAIM',
  },
  description: 'DURABILITY HARD IMPACT & MODULAR - tactical gear engineered for frontline use. Battle-proven, modular, and uncompromising.',
  alternates: {
    canonical: '/',
    languages: {
      en: '/',
      id: '/?lang=id',
      'x-default': '/',
    },
  },
  openGraph: {
    type: 'website',
    url: '/',
    siteName: 'DURHAIM',
    title: 'DURHAIM - Tactical Gear',
    description: 'Battle-proven tactical gear engineered for durability, hard impact, and modular deployment.',
    images: [
      {
        url: '/images/durhaim_image_1.png',
        width: 1200,
        height: 630,
        alt: 'DURHAIM tactical gear',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DURHAIM - Tactical Gear',
    description: 'Battle-proven tactical gear engineered for durability, hard impact, and modular deployment.',
    images: ['/images/durhaim_image_1.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${siteUrl}/#organization`,
        name: 'DURHAIM',
        url: siteUrl,
        logo: `${siteUrl}/images/35_LOGO-HITAM-PUTIHR-1024x1024-1.png`,
        email: 'durhaimgear@gmail.com',
        contactPoint: [
          {
            '@type': 'ContactPoint',
            telephone: '+62-821-2010-1473',
            contactType: 'customer support',
            areaServed: ['ID', 'GLOBAL'],
            availableLanguage: ['English', 'Indonesian'],
          },
        ],
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'Komp. Mitra Dago Parahyangan Jl. Anyelir No. C8',
          addressLocality: 'Bandung',
          addressCountry: 'ID',
        },
      },
      {
        '@type': 'WebSite',
        '@id': `${siteUrl}/#website`,
        name: 'DURHAIM',
        url: siteUrl,
        inLanguage: ['en', 'id'],
        publisher: { '@id': `${siteUrl}/#organization` },
        potentialAction: {
          '@type': 'SearchAction',
          target: `${siteUrl}/catalogue?search={search_term_string}`,
          'query-input': 'required name=search_term_string',
        },
      },
    ],
  };

  return (
    <html lang="en" className="dark">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link
          href="https://fonts.googleapis.com/css2?family=Archivo+Narrow:ital,wght@0,400..700;1,400..700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700;800&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-background text-on-background font-body-md min-h-screen flex flex-col antialiased">
        <JsonLd data={organizationSchema} />
        <CommerceProvider>
          <TopNavBar />
          {children}
          <Footer />
          <WhatsAppFAB />
        </CommerceProvider>
      </body>
    </html>
  );
}
