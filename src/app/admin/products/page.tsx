'use client';

import { Archive, Boxes, CheckCircle2, Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

type CategoryRelation = { name: string; slug: string } | { name: string; slug: string }[] | null;

type Product = {
  id: string;
  name: string;
  slug: string;
  price?: number;
  is_published?: boolean;
  categories: CategoryRelation;
};

function getCategoryName(category: CategoryRelation) {
  if (Array.isArray(category)) return category[0]?.name ?? 'Unassigned';
  return category?.name ?? 'Unassigned';
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch('/api/admin/products');
        if (res.ok) {
          setProducts(await res.json());
        } else {
          const data = await res.json().catch(() => ({}));
          setError(data.error || 'Failed to load products.');
        }
      } catch (error) {
        console.error('Failed to load products:', error);
        setError('Failed to connect to products API.');
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return products;

    return products.filter((product) => {
      const category = getCategoryName(product.categories).toLowerCase();
      return product.name.toLowerCase().includes(normalizedQuery)
        || product.slug.toLowerCase().includes(normalizedQuery)
        || category.includes(normalizedQuery);
    });
  }, [products, query]);

  return (
    <div className="space-y-stack-lg animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="font-display-xl text-headline-lg text-stark-white uppercase">Products</h1>
          <p className="font-body-md text-on-surface-variant">Catalogue records available for serial generation and storefront publishing.</p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:flex">
          <div className="border border-surface-container-highest bg-charcoal-field px-4 py-3">
            <div className="flex items-center gap-2 text-signal-orange">
              <Boxes className="h-4 w-4" />
              <span className="font-data-mono text-data-mono">{products.length}</span>
            </div>
            <div className="font-label-caps text-xs uppercase text-on-surface-variant">Total</div>
          </div>
          <div className="border border-surface-container-highest bg-charcoal-field px-4 py-3">
            <div className="flex items-center gap-2 text-operator-green">
              <CheckCircle2 className="h-4 w-4" />
              <span className="font-data-mono text-data-mono">Live</span>
            </div>
            <div className="font-label-caps text-xs uppercase text-on-surface-variant">Status</div>
          </div>
        </div>
      </div>

      <div className="bg-charcoal-field border border-surface-container-highest">
        {error && (
          <div className="border-b border-error bg-error-container/20 p-4 font-body-md text-error">
            {error}
          </div>
        )}
        <div className="border-b border-surface-container-highest p-4">
          <form className="flex max-w-md items-center border border-surface-container-highest bg-tactical-black px-3 py-2">
            <Search className="mr-2 h-5 w-5 text-on-surface-variant" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="w-full border-none bg-transparent font-data-mono text-stark-white placeholder:text-on-surface-variant focus:outline-none"
              placeholder="Search products..."
              type="search"
            />
          </form>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-surface-container-highest bg-surface-container-lowest">
                <th className="px-4 py-3 font-label-caps uppercase text-on-surface-variant">Product</th>
                <th className="px-4 py-3 font-label-caps uppercase text-on-surface-variant">Category</th>
                <th className="px-4 py-3 font-label-caps uppercase text-on-surface-variant">Price</th>
                <th className="px-4 py-3 font-label-caps uppercase text-on-surface-variant">Slug</th>
                <th className="px-4 py-3 text-right font-label-caps uppercase text-on-surface-variant">Readiness</th>
              </tr>
            </thead>
            <tbody className="font-data-mono text-sm text-stark-white">
              {loading ? (
                <tr>
                  <td className="px-4 py-8 text-center text-on-surface-variant" colSpan={5}>Loading products...</td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td className="px-4 py-8 text-center text-on-surface-variant" colSpan={5}>No products found.</td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="border-b border-surface-container-highest/50 hover:bg-surface-container-highest/30">
                    <td className="px-4 py-3 text-signal-orange">
                      <Link href={`/catalogue/${product.slug}`} className="hover:underline">{product.name}</Link>
                    </td>
                    <td className="px-4 py-3">{getCategoryName(product.categories)}</td>
                    <td className="px-4 py-3 text-on-surface-variant">{product.price ? `IDR ${Number(product.price).toLocaleString('id-ID')}` : '-'}</td>
                    <td className="px-4 py-3 text-on-surface-variant">{product.slug}</td>
                    <td className="px-4 py-3 text-right">
                      <span className="inline-flex items-center gap-2 bg-operator-green/15 px-2 py-1 text-xs text-operator-green">
                        <Archive className="h-3 w-3" />
                        SERIAL READY
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
