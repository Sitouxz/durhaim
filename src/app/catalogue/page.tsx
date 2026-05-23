'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import type { CatalogueProduct } from '@/lib/catalogue-data';

const categoryOptions = [
  { label: 'ALL GEAR', value: 'all' },
  { label: 'VESTS & CHESTRIG', value: 'vest' },
  { label: 'PACKS & POUCHES', value: 'pack' },
  { label: 'BELTS', value: 'belt' },
  { label: 'ACCESSORIES', value: 'accessories' },
];

function formatPrice(price: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(price);
}

export default function CataloguePage() {
  const [category, setCategory] = useState('all');
  const [queryInput, setQueryInput] = useState('');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [products, setProducts] = useState<CatalogueProduct[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [warning, setWarning] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const initialCategory = params.get('category');
    const initialSearch = params.get('search');
    if (initialCategory) setCategory(initialCategory);
    if (initialSearch) {
      setQueryInput(initialSearch);
      setQuery(initialSearch);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchProducts() {
      setLoading(true);
      setError('');
      setWarning('');

      try {
        const params = new URLSearchParams();
        if (category !== 'all') params.set('category', category);
        if (query.trim()) params.set('search', query.trim());
        params.set('sort', sort);
        params.set('page', String(page));
        params.set('limit', '6');

        const res = await fetch(`/api/products?${params.toString()}`, {
          signal: controller.signal,
          cache: 'no-store',
        });
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Unable to load catalogue.');
        }

        setProducts(data.products ?? []);
        setTotalPages(data.totalPages ?? 1);
        setTotal(data.total ?? 0);
        setWarning(data.warning ?? '');
      } catch (fetchError) {
        if (fetchError instanceof DOMException && fetchError.name === 'AbortError') return;
        setError(fetchError instanceof Error ? fetchError.message : 'Unable to load catalogue.');
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();

    return () => controller.abort();
  }, [category, query, sort, page]);

  const pages = useMemo(() => {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }, [totalPages]);

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPage(1);
    setQuery(queryInput);
  };

  const handleCategoryChange = (value: string) => {
    setCategory(value);
    setPage(1);
  };

  return (
    <div className="bg-texture selection:bg-signal-orange selection:text-stark-white relative">
      <main className="max-w-[1440px] mx-auto px-margin-edge py-section-gap grid grid-cols-1 lg:grid-cols-12 gap-gutter relative z-10">
        <aside className="lg:col-span-3 space-y-stack-lg">
          <div className="bg-surface-container/50 backdrop-blur p-stack-md border border-surface-container-highest">
            <h2 className="font-headline-md text-headline-md text-stark-white uppercase tracking-wider mb-stack-md border-b border-surface-container-highest pb-unit">
              Equipment Categories
            </h2>
            <ul className="space-y-stack-sm font-label-caps text-label-caps">
              {categoryOptions.map((option) => (
                <li key={option.value} className={option.value === 'all' ? '' : 'border-t border-surface-container-highest/50 pt-stack-sm'}>
                  <label className="flex items-center space-x-3 cursor-pointer group">
                    <input
                      checked={category === option.value}
                      onChange={() => handleCategoryChange(option.value)}
                      className="form-radio bg-surface-container-lowest border-surface-container-highest text-signal-orange focus:ring-signal-orange focus:ring-offset-background w-5 h-5 rounded-none"
                      type="radio"
                    />
                    <span className={`${category === option.value ? 'text-signal-orange' : 'text-stark-white opacity-80'} group-hover:text-signal-orange transition-colors`}>
                      {option.label}
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-surface-container/50 backdrop-blur p-stack-md border border-surface-container-highest">
            <h3 className="font-headline-md text-stark-white uppercase mb-stack-sm">Search Catalog</h3>
            <form onSubmit={handleSearch} className="relative">
              <input
                value={queryInput}
                onChange={(event) => setQueryInput(event.target.value)}
                className="w-full bg-surface-container-lowest border border-surface-container-highest text-stark-white font-data-mono text-data-mono p-3 focus:border-signal-orange focus:ring-0 rounded-none placeholder-on-tertiary-fixed-variant"
                placeholder="ENTER KEYWORD"
                type="search"
              />
              <button type="submit" className="absolute right-0 top-0 h-full px-3 text-signal-orange hover:bg-signal-orange hover:text-tactical-black transition-colors" aria-label="Search catalogue">
                <span className="material-symbols-outlined text-[20px] translate-y-[2px]">search</span>
              </button>
            </form>
          </div>
        </aside>

        <section className="lg:col-span-9">
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-end mb-stack-lg border-b border-surface-container-highest pb-stack-md">
            <div>
              <h1 className="font-display-xl text-headline-lg lg:text-display-xl text-stark-white uppercase tracking-tighter">Tactical Arsenal</h1>
              <p className="font-data-mono text-data-mono text-signal-orange mt-2">{total} ITEMS // DURABILITY HARD IMPACT &amp; MODULAR</p>
            </div>
            <div className="flex items-center space-x-2 font-data-mono text-data-mono text-stark-white opacity-80">
              <span>SORT BY:</span>
              <select
                value={sort}
                onChange={(event) => {
                  setSort(event.target.value);
                  setPage(1);
                }}
                className="bg-transparent border border-surface-container-highest text-signal-orange focus:ring-0 uppercase cursor-pointer p-2"
              >
                <option className="bg-surface-container" value="newest">NEWEST DEPLOYMENT</option>
                <option className="bg-surface-container" value="price-high">PRICE: HIGH TO LOW</option>
                <option className="bg-surface-container" value="price-low">PRICE: LOW TO HIGH</option>
              </select>
            </div>
          </div>

          {warning && (
            <div className="mb-stack-md border border-signal-orange/50 bg-signal-orange/10 p-3 font-data-mono text-data-mono text-signal-orange">
              {warning}
            </div>
          )}

          {error && (
            <div className="mb-stack-md border border-error bg-error-container/20 p-4 font-body-md text-error">
              {error}
            </div>
          )}

          {loading ? (
            <div className="border border-surface-container-highest bg-surface-container/50 p-stack-lg text-center font-data-mono text-signal-orange">
              LOADING CATALOGUE...
            </div>
          ) : products.length === 0 ? (
            <div className="border border-surface-container-highest bg-surface-container/50 p-stack-lg text-center font-data-mono text-on-surface-variant">
              NO PRODUCTS MATCH THIS FILTER.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-gutter">
              {products.map((product) => (
                <article key={product.id} className="bg-surface-container/80 backdrop-blur border border-surface-container-highest group flex flex-col hover:border-signal-orange transition-colors duration-300">
                  <div className="relative aspect-[4/5] bg-surface-container-lowest/50 p-stack-md flex items-center justify-center overflow-hidden">
                    {product.tags[0] && (
                      <div className="absolute top-4 left-4 bg-signal-orange text-tactical-black font-data-mono text-data-mono px-2 py-1 uppercase z-10">
                        {product.tags[0]}
                      </div>
                    )}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      alt={product.name}
                      className="object-contain w-full h-full max-h-[300px] group-hover:scale-105 transition-transform duration-500 z-0"
                      src={product.images[0] ? `${product.images[0]}?v=2` : ''}
                    />
                  </div>
                  <div className="p-stack-md flex flex-col flex-grow border-t border-surface-container-highest">
                    <div className="font-data-mono text-data-mono text-signal-orange mb-2 uppercase">{product.category.name}</div>
                    <h3 className="font-headline-md text-headline-md text-stark-white uppercase tracking-tight mb-2">{product.name}</h3>
                    <p className="font-data-mono text-data-mono text-on-surface-variant mb-4 flex-grow">{product.description}</p>
                    <div className="font-data-mono text-data-mono text-stark-white mb-4">{formatPrice(product.price)}</div>
                    <Link
                      href={`/catalogue/${product.slug}`}
                      className="w-full bg-signal-orange text-tactical-black font-label-caps text-label-caps py-3 uppercase hover:bg-stark-white transition-colors duration-200 mt-auto flex items-center justify-center space-x-2"
                    >
                      <span>VIEW DETAILS</span>
                      <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}

          <div className="flex justify-center items-center space-x-2 mt-stack-lg pt-stack-lg border-t border-surface-container-highest">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              className="w-10 h-10 flex items-center justify-center border border-surface-container-highest text-stark-white hover:border-signal-orange hover:text-signal-orange transition-colors disabled:opacity-40"
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            {pages.map((pageNumber) => (
              <button
                key={pageNumber}
                type="button"
                onClick={() => setPage(pageNumber)}
                className={`w-10 h-10 flex items-center justify-center border font-data-mono text-data-mono transition-colors ${
                  pageNumber === page
                    ? 'bg-signal-orange text-tactical-black border-signal-orange'
                    : 'border-surface-container-highest bg-surface-container/50 text-stark-white hover:border-signal-orange hover:text-signal-orange'
                }`}
              >
                {pageNumber}
              </button>
            ))}
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
              className="w-10 h-10 flex items-center justify-center border border-surface-container-highest text-stark-white hover:border-signal-orange hover:text-signal-orange transition-colors disabled:opacity-40"
            >
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
