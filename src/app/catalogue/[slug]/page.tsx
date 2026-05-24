import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { createClient } from '@supabase/supabase-js';
import { fallbackProducts, isMissingSchemaError, normalizeProduct, type CatalogueProduct } from '@/lib/catalogue-data';
import ProductDetailClient from '@/components/ProductDetailClient';
import JsonLd from '@/components/JsonLd';
import { formatRegionalPrice, getRegionalPrice } from '@/lib/commerce';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://durhaim.com';

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getProduct(slug: string): Promise<CatalogueProduct | null> {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );

    const { data, error } = await supabase
      .from('products')
      .select('*, categories(name, slug)')
      .eq('slug', slug)
      .eq('is_published', true)
      .single();

    if (error) {
      if (isMissingSchemaError(error)) {
        return fallbackProducts.find((product) => product.slug === slug) ?? null;
      }

      return null;
    }

    return normalizeProduct(data as Record<string, unknown>);
  } catch {
    return fallbackProducts.find((product) => product.slug === slug) ?? null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);

  return {
    title: product ? `${product.name} Tactical Gear` : 'Tactical Gear Product',
    description: product
      ? `${product.name} by DURHAIM: ${product.description}. View regional pricing, product category, and authenticity support.`
      : 'Durhaim tactical gear product detail with regional pricing and authenticity support.',
    alternates: {
      canonical: `/catalogue/${slug}`,
      languages: {
        en: `/catalogue/${slug}`,
        id: `/catalogue/${slug}?lang=id`,
        'x-default': `/catalogue/${slug}`,
      },
    },
    openGraph: product
      ? {
          title: `${product.name} - DURHAIM`,
          description: product.description,
          url: `/catalogue/${product.slug}`,
          images: product.images[0] ? [{ url: product.images[0], alt: product.name }] : undefined,
          type: 'website',
        }
      : undefined,
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  const productImage = product.images[0] ? `${siteUrl}${product.images[0]}` : `${siteUrl}/images/durhaim_image_1.png`;
  const productSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
          { '@type': 'ListItem', position: 2, name: 'Catalogue', item: `${siteUrl}/catalogue` },
          { '@type': 'ListItem', position: 3, name: product.name, item: `${siteUrl}/catalogue/${product.slug}` },
        ],
      },
      {
        '@type': 'Product',
        '@id': `${siteUrl}/catalogue/${product.slug}#product`,
        name: product.name,
        description: product.description,
        image: [productImage],
        brand: {
          '@type': 'Brand',
          name: 'DURHAIM',
        },
        category: product.category.name,
        offers: [
          {
            '@type': 'Offer',
            price: getRegionalPrice(product.price, product.regional_prices, 'ID'),
            priceCurrency: 'IDR',
            availability: 'https://schema.org/InStock',
            url: `${siteUrl}/catalogue/${product.slug}?region=ID`,
            areaServed: 'ID',
          },
          {
            '@type': 'Offer',
            price: getRegionalPrice(product.price, product.regional_prices, 'GLOBAL'),
            priceCurrency: 'USD',
            availability: 'https://schema.org/InStock',
            url: `${siteUrl}/catalogue/${product.slug}?region=GLOBAL`,
            areaServed: 'GLOBAL',
          },
        ],
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: `What is ${product.name}?`,
            acceptedAnswer: {
              '@type': 'Answer',
              text: `${product.name} is a DURHAIM ${product.category.name.toLowerCase()} product built for tactical loadouts. ${product.description}`,
            },
          },
          {
            '@type': 'Question',
            name: `How much does ${product.name} cost?`,
            acceptedAnswer: {
              '@type': 'Answer',
              text: `${product.name} is listed from ${formatRegionalPrice(product.price, product.regional_prices, 'ID')} in Indonesia and ${formatRegionalPrice(product.price, product.regional_prices, 'GLOBAL')} globally.`,
            },
          },
        ],
      },
    ],
  };

  return (
    <main className="bg-texture flex-grow px-margin-edge py-section-gap">
      <JsonLd data={productSchema} />
      <div className="mx-auto grid max-w-[1440px] gap-gutter lg:grid-cols-12">
        <div className="lg:col-span-6 border border-surface-container-highest bg-surface-container/60 p-stack-lg">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={product.images[0] || ''} alt={product.name} className="h-full max-h-[620px] w-full object-contain" />
        </div>

        <ProductDetailClient product={product} />
        <section className="lg:col-span-12 border border-surface-container-highest bg-charcoal-field/80 p-stack-lg">
          <h2 className="font-headline-md text-headline-md uppercase text-stark-white">Product Answers</h2>
          <div className="mt-stack-md grid gap-stack-md md:grid-cols-2">
            <article>
              <h3 className="font-label-caps text-label-caps uppercase text-signal-orange">What is this product used for?</h3>
              <p className="mt-2 font-body-md text-on-surface-variant">
                {product.name} is a DURHAIM {product.category.name.toLowerCase()} item for modular tactical carry setups, equipment organization, and field-ready loadout planning.
              </p>
            </article>
            <article>
              <h3 className="font-label-caps text-label-caps uppercase text-signal-orange">Which regions are priced?</h3>
              <p className="mt-2 font-body-md text-on-surface-variant">
                DURHAIM displays Indonesia pricing in IDR and global pricing in USD, with regional detection used to show the most relevant currency first.
              </p>
            </article>
          </div>
        </section>
      </div>
    </main>
  );
}
