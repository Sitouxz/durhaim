'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { useCommerce } from '@/components/CommerceProvider';

export default function Footer() {
  const { language } = useCommerce();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const copy = language === 'id'
    ? {
        contacts: 'Kontak',
        navigation: 'Navigasi',
        subscribe: 'Berlangganan',
        newsletter: 'Ikuti newsletter kami untuk mendapatkan kabar terbaru.',
        email: 'MASUKKAN EMAIL',
      }
    : {
        contacts: 'Contacts',
        navigation: 'Navigation',
        subscribe: 'Subscribe',
        newsletter: 'Follow our newsletter to stay updated about agency.',
        email: 'ENTER EMAIL',
      };

  const submitNewsletter = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage('');

    const res = await fetch('/api/newsletter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await res.json().catch(() => ({}));
    setMessage(data.message || (res.ok ? 'Subscribed.' : 'Subscription failed.'));
    if (res.ok) setEmail('');
  };

  return (
    <footer className="bg-tactical-black w-full mt-section-gap border-t border-surface-container-highest">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-gutter px-margin-edge py-section-gap max-w-[1440px] mx-auto">
        {/* Brand Column */}
        <div className="flex flex-col">
          <Link href="/" className="font-display-xl text-headline-md text-stark-white mb-stack-md">
            DURHAIM
          </Link>
          <p className="font-label-caps text-label-caps text-signal-orange mb-stack-lg uppercase">
            &quot;Always Forward&quot;
          </p>
          <div className="flex space-x-stack-sm">
            <a
              className="w-10 h-10 border border-surface-container-highest flex items-center justify-center text-on-tertiary-fixed-variant hover:text-signal-orange hover:border-signal-orange transition-colors duration-200"
              href="https://www.facebook.com/durhaimarmygear/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="font-data-mono text-data-mono">Fb</span>
            </a>
            <a
              className="w-10 h-10 border border-surface-container-highest flex items-center justify-center text-on-tertiary-fixed-variant hover:text-signal-orange hover:border-signal-orange transition-colors duration-200"
              href="https://wa.me/6282120101473"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="font-data-mono text-data-mono">Wa</span>
            </a>
            <a
              className="w-10 h-10 border border-surface-container-highest flex items-center justify-center text-on-tertiary-fixed-variant hover:text-signal-orange hover:border-signal-orange transition-colors duration-200"
              href="https://www.youtube.com/channel/UCRQa9l9_warxaVLGWLPVsXw"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="font-data-mono text-data-mono">Yt</span>
            </a>
            <a
              className="w-10 h-10 border border-surface-container-highest flex items-center justify-center text-on-tertiary-fixed-variant hover:text-signal-orange hover:border-signal-orange transition-colors duration-200"
              href="https://www.instagram.com/durhaimgear/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="font-data-mono text-data-mono">Ig</span>
            </a>
          </div>
        </div>

        {/* Contacts Column */}
        <div className="flex flex-col">
          <h4 className="font-label-caps text-label-caps text-stark-white uppercase mb-stack-md">{copy.contacts}</h4>
          <ul className="space-y-stack-sm font-body-md text-body-md text-on-tertiary-fixed-variant">
            <li className="flex items-start gap-2">
              <span className="material-symbols-outlined text-sm mt-1">location_on</span>
              <span>Komp. Mitra Dago Parahyangan Jl. Anyelir No. C8 Bandung</span>
            </li>
            <li className="flex items-center gap-2 hover:text-signal-orange transition-colors">
              <span className="material-symbols-outlined text-sm">mail</span>
              <a href="mailto:durhaimgear@gmail.com">durhaimgear@gmail.com</a>
            </li>
            <li className="flex items-center gap-2 hover:text-signal-orange transition-colors">
              <span className="material-symbols-outlined text-sm">phone</span>
              <a href="tel:+6282120101473">0821-2010-1473</a>
            </li>
          </ul>
        </div>

        {/* Links Column */}
        <div className="flex flex-col">
          <h4 className="font-label-caps text-label-caps text-stark-white uppercase mb-stack-md">{copy.navigation}</h4>
          <ul className="space-y-stack-sm font-body-md text-body-md text-on-tertiary-fixed-variant flex flex-col">
            <Link className="hover:text-signal-orange hover:underline w-fit" href="/catalogue?category=vest">Vest &amp; Chestrig</Link>
            <Link className="hover:text-signal-orange hover:underline w-fit" href="/catalogue?category=pack">Pack &amp; Pouches</Link>
            <Link className="hover:text-signal-orange hover:underline w-fit" href="/catalogue?category=belt">Belt</Link>
            <Link className="hover:text-signal-orange hover:underline w-fit" href="/contact">Contact</Link>
            <Link className="hover:text-signal-orange hover:underline w-fit" href="/latest-projects">Latest Projects</Link>
          </ul>
        </div>

        {/* Subscribe Column */}
        <div className="flex flex-col">
          <h4 className="font-label-caps text-label-caps text-stark-white uppercase mb-stack-md">{copy.subscribe}</h4>
          <p className="font-body-md text-body-md text-on-tertiary-fixed-variant mb-stack-md">
            {copy.newsletter}
          </p>
          <form onSubmit={submitNewsletter} className="flex">
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="bg-charcoal-field border border-surface-container-highest text-stark-white font-data-mono text-data-mono p-3 w-full focus:outline-none focus:border-signal-orange rounded-none placeholder-on-tertiary-fixed-variant"
              placeholder={copy.email}
              type="email"
              required
            />
            <button type="submit" className="bg-signal-orange text-tactical-black px-4 flex items-center justify-center hover:bg-stark-white transition-colors duration-200" aria-label="Subscribe to newsletter">
              <span className="material-symbols-outlined">arrow_upward</span>
            </button>
          </form>
          {message && <p className="mt-2 font-data-mono text-data-mono text-signal-orange">{message}</p>}
        </div>
      </div>

      {/* Copyright Bottom Bar */}
      <div className="w-full border-t border-surface-container-highest py-stack-md text-center">
        <span className="font-data-mono text-data-mono text-on-tertiary-fixed-variant uppercase">
          2024 DURHAIM TACTICAL. ALWAYS FORWARD.
        </span>
      </div>
    </footer>
  );
}
