'use client';

import Link from 'next/link';
import type { CatalogueProduct } from '@/lib/catalogue-data';
import { useCommerce } from '@/components/CommerceProvider';
import AddToCartButton from '@/components/AddToCartButton';

export default function ProductDetailClient({ product }: { product: CatalogueProduct }) {
  const { t, formatPrice } = useCommerce();
  const waText = encodeURIComponent(`Hi Durhaim, I would like to ask about ${product.name}. Product URL: /catalogue/${product.slug}`);

  return (
    <section className="lg:col-span-6 flex flex-col justify-center">
      <div className="font-data-mono text-data-mono uppercase text-signal-orange">{product.category.name}</div>
      <h1 className="mt-stack-sm font-display-xl text-headline-lg-mobile uppercase tracking-tighter text-stark-white md:text-display-xl">
        {product.name}
      </h1>
      <p className="mt-stack-md border-l-2 border-signal-orange pl-4 font-body-lg text-stark-white/85">
        {product.description}
      </p>
      <div className="mt-stack-lg font-data-mono text-headline-md text-signal-orange">
        {formatPrice(product.price, product.regional_prices)}
      </div>

      <div className="mt-stack-lg flex flex-col gap-stack-sm sm:flex-row">
        <a
          href={`https://wa.me/6282120101473?text=${waText}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary inline-flex justify-center"
        >
          {t.product.enquire}
        </a>
        <AddToCartButton product={{ slug: product.slug, name: product.name, price: product.price, regional_prices: product.regional_prices }} />
        <Link href="/catalogue" className="inline-flex justify-center border border-surface-container-highest px-6 py-3 font-label-caps text-label-caps uppercase text-stark-white hover:border-signal-orange hover:text-signal-orange">
          {t.product.back}
        </Link>
      </div>
    </section>
  );
}
