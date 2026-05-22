'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

type CartItem = {
  slug: string;
  name: string;
  price?: number;
};

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const stored = window.localStorage.getItem('durhaimCart');
    if (stored) setItems(JSON.parse(stored));
  }, []);

  const enquiryUrl = useMemo(() => {
    const text = items.length
      ? `Hi Durhaim, I would like to ask about: ${items.map((item) => item.name).join(', ')}`
      : 'Hi Durhaim, I would like to ask about your products.';
    return `https://wa.me/6282120101473?text=${encodeURIComponent(text)}`;
  }, [items]);

  const clearCart = () => {
    window.localStorage.removeItem('durhaimCart');
    setItems([]);
  };

  return (
    <main className="bg-texture flex-grow px-margin-edge py-section-gap">
      <div className="mx-auto max-w-[1000px]">
        <h1 className="font-display-xl text-headline-lg-mobile uppercase tracking-tighter text-stark-white md:text-display-xl">Enquiry Cart</h1>
        <p className="mt-stack-md max-w-2xl border-l-2 border-signal-orange pl-4 font-body-lg text-stark-white/85">
          Collect products from catalogue detail pages and send them to Durhaim in one WhatsApp enquiry.
        </p>

        <div className="mt-stack-lg border border-surface-container-highest bg-charcoal-field p-stack-lg">
          {items.length === 0 ? (
            <p className="font-body-md text-on-surface-variant">Your enquiry cart is empty.</p>
          ) : (
            <ul className="space-y-stack-sm">
              {items.map((item) => (
                <li key={item.slug} className="flex items-center justify-between border-b border-surface-container-highest pb-3">
                  <span className="font-data-mono text-signal-orange">{item.name}</span>
                  <Link href={`/catalogue/${item.slug}`} className="font-label-caps text-label-caps uppercase text-stark-white hover:text-signal-orange">View</Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mt-stack-lg flex flex-col gap-stack-sm sm:flex-row">
          <a href={enquiryUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary inline-flex justify-center">Send WhatsApp Enquiry</a>
          <Link href="/catalogue" className="inline-flex justify-center border border-surface-container-highest px-6 py-3 font-label-caps text-label-caps uppercase text-stark-white hover:border-signal-orange hover:text-signal-orange">Browse Catalogue</Link>
          {items.length > 0 && (
            <button type="button" onClick={clearCart} className="inline-flex justify-center border border-error px-6 py-3 font-label-caps text-label-caps uppercase text-error hover:bg-error hover:text-stark-white">Clear</button>
          )}
        </div>
      </div>
    </main>
  );
}
