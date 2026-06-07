'use client';

import Link from 'next/link';
import type { CatalogueProduct } from '@/lib/catalogue-data';
import { useCommerce } from '@/components/CommerceProvider';
import AddToCartButton from '@/components/AddToCartButton';
import { localizeCategoryName, localizeProductDescription } from '@/lib/product-localization';

export default function ProductDetailClient({ product }: { product: CatalogueProduct }) {
  const { language, t } = useCommerce();
  const waText = encodeURIComponent(t.product.enquiry(product.name, product.slug));
  const categoryName = localizeCategoryName(product.category.slug, product.category.name, language);
  const description = localizeProductDescription(product.description, language);

  return (
    <section className="lg:col-span-6 flex flex-col justify-center">
      <div className="font-data-mono text-data-mono uppercase text-signal-orange">{categoryName}</div>
      <h1 className="mt-stack-sm font-display-xl text-headline-lg-mobile uppercase tracking-tighter text-stark-white md:text-display-xl">
        {product.name}
      </h1>
      <p className="mt-stack-md border-l-2 border-signal-orange pl-4 font-body-lg text-stark-white/85">
        {description}
      </p>
      <div className="mt-stack-lg flex flex-col gap-stack-sm sm:flex-row">
        <a
          href={`https://wa.me/6282120101473?text=${waText}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary inline-flex justify-center"
        >
          {t.product.enquire}
        </a>
        <AddToCartButton product={{ slug: product.slug, name: product.name }} />
        <Link href="/catalogue" className="inline-flex justify-center border border-surface-container-highest px-6 py-3 font-label-caps text-label-caps uppercase text-stark-white hover:border-signal-orange hover:text-signal-orange">
          {t.product.back}
        </Link>
      </div>
    </section>
  );
}
