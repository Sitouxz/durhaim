'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useCommerce } from '@/components/CommerceProvider';
import type { RegionalPrices } from '@/lib/commerce';

type CartItem = {
  slug: string;
  name: string;
  price?: number;
  regional_prices?: RegionalPrices;
};

export default function CartPage() {
  const { t, formatPrice } = useCommerce();
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const stored = window.localStorage.getItem('durhaimCart');
    if (stored) setItems(JSON.parse(stored));
  }, []);

  const enquiryUrl = useMemo(() => {
    const text = items.length
      ? t.cart.enquiry(items.map((item) => item.name).join(', '))
      : t.cart.genericEnquiry;
    return `https://wa.me/6282120101473?text=${encodeURIComponent(text)}`;
  }, [items, t]);

  const clearCart = () => {
    window.localStorage.removeItem('durhaimCart');
    setItems([]);
  };

  return (
    <main className="bg-texture flex-grow px-margin-edge py-section-gap">
      <div className="mx-auto max-w-[1000px]">
        <h1 className="font-display-xl text-headline-lg-mobile uppercase tracking-tighter text-stark-white md:text-display-xl">{t.cart.title}</h1>
        <p className="mt-stack-md max-w-2xl border-l-2 border-signal-orange pl-4 font-body-lg text-stark-white/85">
          {t.cart.intro}
        </p>

        <div className="mt-stack-lg border border-surface-container-highest bg-charcoal-field p-stack-lg">
          {items.length === 0 ? (
            <p className="font-body-md text-on-surface-variant">{t.cart.empty}</p>
          ) : (
            <ul className="space-y-stack-sm">
              {items.map((item) => (
                <li key={item.slug} className="flex items-center justify-between border-b border-surface-container-highest pb-3">
                  <span className="font-data-mono text-signal-orange">{item.name}</span>
                  <div className="flex items-center gap-4">
                    {typeof item.price === 'number' && (
                      <span className="font-data-mono text-on-surface-variant">{formatPrice(item.price, item.regional_prices)}</span>
                    )}
                    <Link href={`/catalogue/${item.slug}`} className="font-label-caps text-label-caps uppercase text-stark-white hover:text-signal-orange">{t.cart.view}</Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mt-stack-lg flex flex-col gap-stack-sm sm:flex-row">
          <a href={enquiryUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary inline-flex justify-center">{t.cart.send}</a>
          <Link href="/catalogue" className="inline-flex justify-center border border-surface-container-highest px-6 py-3 font-label-caps text-label-caps uppercase text-stark-white hover:border-signal-orange hover:text-signal-orange">{t.cart.browse}</Link>
          {items.length > 0 && (
            <button type="button" onClick={clearCart} className="inline-flex justify-center border border-error px-6 py-3 font-label-caps text-label-caps uppercase text-error hover:bg-error hover:text-stark-white">{t.cart.clear}</button>
          )}
        </div>
      </div>
    </main>
  );
}
