'use client';

import { useState } from 'react';
import { useCommerce } from '@/components/CommerceProvider';
import type { RegionalPrices } from '@/lib/commerce';

type CartProduct = {
  slug: string;
  name: string;
  price?: number;
  regional_prices?: RegionalPrices;
};

function readCart(): CartProduct[] {
  try {
    const stored = window.localStorage.getItem('durhaimCart');
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default function AddToCartButton({ product }: { product: CartProduct }) {
  const { t } = useCommerce();
  const [added, setAdded] = useState(false);

  const addToCart = () => {
    const cart = readCart();
    const nextCart = cart.some((item) => item.slug === product.slug)
      ? cart
      : [...cart, product];

    window.localStorage.setItem('durhaimCart', JSON.stringify(nextCart));
    setAdded(true);
  };

  return (
    <button
      type="button"
      onClick={addToCart}
      className="inline-flex justify-center border border-surface-container-highest px-6 py-3 font-label-caps text-label-caps uppercase text-stark-white hover:border-signal-orange hover:text-signal-orange"
    >
      {added ? t.cart.added : t.cart.add}
    </button>
  );
}
