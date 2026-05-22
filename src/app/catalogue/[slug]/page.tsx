import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { createClient } from '@supabase/supabase-js';
import { fallbackProducts, isMissingSchemaError, normalizeProduct, type CatalogueProduct } from '@/lib/catalogue-data';
import AddToCartButton from '@/components/AddToCartButton';

interface PageProps {
  params: { slug: string };
}

function formatPrice(price: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(price);
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
  const product = await getProduct(params.slug);

  return {
    title: product ? `${product.name} - DURHAIM Catalogue` : 'Product - DURHAIM Catalogue',
    description: product?.description ?? 'Durhaim tactical gear product detail.',
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const product = await getProduct(params.slug);
  if (!product) notFound();

  const waText = encodeURIComponent(`Hi Durhaim, I would like to ask about ${product.name}. Product URL: /catalogue/${product.slug}`);

  return (
    <main className="bg-texture flex-grow px-margin-edge py-section-gap">
      <div className="mx-auto grid max-w-[1440px] gap-gutter lg:grid-cols-12">
        <div className="lg:col-span-6 border border-surface-container-highest bg-surface-container/60 p-stack-lg">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={product.images[0] || ''} alt={product.name} className="h-full max-h-[620px] w-full object-contain" />
        </div>

        <section className="lg:col-span-6 flex flex-col justify-center">
          <div className="font-data-mono text-data-mono uppercase text-signal-orange">{product.category.name}</div>
          <h1 className="mt-stack-sm font-display-xl text-headline-lg-mobile uppercase tracking-tighter text-stark-white md:text-display-xl">
            {product.name}
          </h1>
          <p className="mt-stack-md border-l-2 border-signal-orange pl-4 font-body-lg text-stark-white/85">
            {product.description}
          </p>
          <div className="mt-stack-lg font-data-mono text-headline-md text-signal-orange">
            {formatPrice(product.price)}
          </div>

          <div className="mt-stack-lg flex flex-col gap-stack-sm sm:flex-row">
            <a
              href={`https://wa.me/6282120101473?text=${waText}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary inline-flex justify-center"
            >
              Enquire on WhatsApp
            </a>
            <AddToCartButton product={{ slug: product.slug, name: product.name, price: product.price }} />
            <Link href="/catalogue" className="inline-flex justify-center border border-surface-container-highest px-6 py-3 font-label-caps text-label-caps uppercase text-stark-white hover:border-signal-orange hover:text-signal-orange">
              Back to Catalogue
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
