/* eslint-disable @next/next/no-page-custom-font */
import type { Metadata } from 'next';
import './globals.css';
import TopNavBar from '@/components/TopNavBar';
import Footer from '@/components/Footer';
import WhatsAppFAB from '@/components/WhatsAppFAB';

export const metadata: Metadata = {
  title: 'DURHAIM - Tactical Gear',
  description: 'DURABILITY HARD IMPACT & MODULAR — Tactical gear engineered for the frontline. Battle-proven, modular, and uncompromising.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
        <TopNavBar />
        {children}
        <Footer />
        <WhatsAppFAB />
      </body>
    </html>
  );
}
