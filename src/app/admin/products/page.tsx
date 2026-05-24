'use client';

import { Archive, Boxes, CheckCircle2, Edit, ImageUp, Plus, QrCode, Search, Trash2 } from 'lucide-react';
import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { defaultRegionalPrices, regionConfigs, supportedRegions, type RegionCode, type RegionalPrices } from '@/lib/commerce';

type CategoryRelation = { name: string; slug: string } | { name: string; slug: string }[] | null;

type Product = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price?: number;
  regional_prices?: RegionalPrices;
  images?: string[];
  is_published?: boolean;
  serial_count?: number;
  categories: CategoryRelation;
};

type Category = {
  id: string;
  name: string;
  slug: string;
  icon?: string | null;
};

type ProductForm = {
  id?: string;
  name: string;
  slug: string;
  description: string;
  price: string;
  regionalPrices: Record<RegionCode, string>;
  categorySlug: string;
  imageUrls: string;
  is_published: boolean;
};

const emptyForm: ProductForm = {
  name: '',
  slug: '',
  description: '',
  price: '0',
  regionalPrices: {
    ID: '0',
    GLOBAL: '0',
  },
  categorySlug: 'vest',
  imageUrls: '',
  is_published: true,
};

const MAX_PRODUCT_IMAGE_SIZE = 3 * 1024 * 1024;
const ALLOWED_PRODUCT_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

function getCategory(category: CategoryRelation) {
  if (Array.isArray(category)) return category[0] ?? null;
  return category;
}

function getCategoryName(category: CategoryRelation) {
  return getCategory(category)?.name ?? 'Unassigned';
}

function getCategorySlug(category: CategoryRelation) {
  return getCategory(category)?.slug ?? 'vest';
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function productToForm(product: Product): ProductForm {
  const regionalPrices = product.regional_prices ?? defaultRegionalPrices(Number(product.price ?? 0));

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description ?? '',
    price: String(product.price ?? 0),
    regionalPrices: supportedRegions.reduce<Record<RegionCode, string>>((prices, region) => {
      prices[region] = String(regionalPrices[region] ?? 0);
      return prices;
    }, { ...emptyForm.regionalPrices }),
    categorySlug: getCategorySlug(product.categories),
    imageUrls: (product.images ?? []).join('\n'),
    is_published: product.is_published !== false,
  };
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [showProductForm, setShowProductForm] = useState(false);
  const [form, setForm] = useState<ProductForm>(emptyForm);

  const fetchProducts = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/products');
      if (res.ok) {
        setProducts(await res.json());
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || 'Failed to load products.');
      }
    } catch (fetchError) {
      console.error('Failed to load products:', fetchError);
      setError('Failed to connect to products API.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/admin/categories');
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error || 'Failed to load categories.');
        return;
      }

      setCategories(data);
      setForm((current) => {
        if (current.id || data.some((category: Category) => category.slug === current.categorySlug)) return current;
        return { ...current, categorySlug: data[0]?.slug ?? '' };
      });
    } catch (fetchError) {
      console.error('Failed to load categories:', fetchError);
      setError('Failed to connect to categories API.');
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
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

  const openNewProductForm = () => {
    setForm({ ...emptyForm, categorySlug: categories[0]?.slug ?? '' });
    setMessage('');
    setShowProductForm(true);
  };

  const openEditProductForm = (product: Product) => {
    setForm(productToForm(product));
    setMessage('');
    setShowProductForm(true);
  };

  const setField = (field: keyof ProductForm, value: string | boolean) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleNameChange = (value: string) => {
    setForm((current) => ({
      ...current,
      name: value,
      slug: current.id ? current.slug : slugify(value),
    }));
  };

  const setRegionalPrice = (region: RegionCode, value: string) => {
    setForm((current) => ({
      ...current,
      regionalPrices: {
        ...current.regionalPrices,
        [region]: value,
      },
    }));
  };

  const handleBasePriceChange = (value: string) => {
    const generatedPrices = defaultRegionalPrices(Number(value || 0));
    setForm((current) => ({
      ...current,
      price: value,
      regionalPrices: supportedRegions.reduce<Record<RegionCode, string>>((prices, region) => {
        prices[region] = String(generatedPrices[region] ?? 0);
        return prices;
      }, { ...current.regionalPrices }),
    }));
  };

  const saveProductPayload = (nextForm: ProductForm) => ({
    id: nextForm.id,
    name: nextForm.name,
    slug: nextForm.slug,
    description: nextForm.description,
    price: Number(nextForm.price),
    regional_prices: supportedRegions.reduce<RegionalPrices>((prices, region) => {
      prices[region] = Number(nextForm.regionalPrices[region] || 0);
      return prices;
    }, {}),
    categorySlug: nextForm.categorySlug,
    images: nextForm.imageUrls.split(/\r?\n|,/).map((image) => image.trim()).filter(Boolean),
    is_published: nextForm.is_published,
  });

  const appendImageUrl = (url: string) => {
    setForm((current) => ({
      ...current,
      imageUrls: [current.imageUrls.trim(), url].filter(Boolean).join('\n'),
    }));
  };

  const handleProductImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setError('');
    setMessage('');

    if (!ALLOWED_PRODUCT_IMAGE_TYPES.includes(file.type)) {
      setError('Only JPG, PNG, or WEBP images are allowed.');
      return;
    }

    if (file.size > MAX_PRODUCT_IMAGE_SIZE) {
      setError('Image must be 3 MB or smaller.');
      return;
    }

    setUploadingImage(true);
    try {
      const uploadBody = new FormData();
      uploadBody.append('image', file);

      const res = await fetch('/api/admin/product-images', {
        method: 'POST',
        body: uploadBody,
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error || 'Failed to upload image.');
        return;
      }

      appendImageUrl(data.url);
      setMessage('Image uploaded and added to product.');
    } catch (uploadError) {
      console.error('Failed to upload product image:', uploadError);
      setError('Failed to connect to product image upload API.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveProduct = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');

    try {
      const res = await fetch('/api/admin/products', {
        method: form.id ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(saveProductPayload(form)),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error || 'Failed to save product.');
        return;
      }

      setMessage('Product saved.');
      setShowProductForm(false);
      await fetchProducts();
    } catch (saveError) {
      console.error('Failed to save product:', saveError);
      setError('Failed to connect to products API.');
    } finally {
      setSaving(false);
    }
  };

  const togglePublished = async (product: Product) => {
    const nextForm = productToForm(product);
    nextForm.is_published = product.is_published === false;
    setSaving(true);
    setError('');
    setMessage('');

    try {
      const res = await fetch('/api/admin/products', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(saveProductPayload(nextForm)),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error || 'Failed to update product.');
        return;
      }

      setMessage(nextForm.is_published ? 'Product published.' : 'Product unpublished.');
      await fetchProducts();
    } catch (saveError) {
      console.error('Failed to update product:', saveError);
      setError('Failed to connect to products API.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProduct = async (product: Product) => {
    if ((product.serial_count ?? 0) > 0) return;
    if (!confirm(`Delete ${product.name}? This cannot be undone.`)) return;

    setSaving(true);
    setError('');
    setMessage('');

    try {
      const res = await fetch(`/api/admin/products?id=${encodeURIComponent(product.id)}`, {
        method: 'DELETE',
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error || 'Failed to delete product.');
        return;
      }

      setMessage('Product deleted.');
      await fetchProducts();
    } catch (deleteError) {
      console.error('Failed to delete product:', deleteError);
      setError('Failed to connect to products API.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-stack-lg animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="font-display-xl text-headline-lg text-stark-white uppercase">Products</h1>
          <p className="font-body-md text-on-surface-variant">Create, edit, publish, and prepare catalogue records for serial generation.</p>
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
              <span className="font-data-mono text-data-mono">{products.filter((product) => product.is_published !== false).length}</span>
            </div>
            <div className="font-label-caps text-xs uppercase text-on-surface-variant">Published</div>
          </div>
        </div>
      </div>

      <div className="bg-charcoal-field border border-surface-container-highest">
        {error && (
          <div className="border-b border-error bg-error-container/20 p-4 font-body-md text-error">
            {error}
          </div>
        )}
        {message && (
          <div className="border-b border-operator-green bg-operator-green/10 p-4 font-body-md text-operator-green">
            {message}
          </div>
        )}
        <div className="border-b border-surface-container-highest p-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
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
          <button
            type="button"
            onClick={openNewProductForm}
            className="inline-flex items-center justify-center gap-2 bg-signal-orange px-4 py-2 font-label-caps text-tactical-black hover:bg-stark-white"
          >
            <Plus className="h-4 w-4" />
            New Product
          </button>
        </div>

        {showProductForm && (
          <form onSubmit={handleSaveProduct} className="grid gap-4 border-b border-surface-container-highest p-4 lg:grid-cols-2">
            <div>
              <label className="block font-label-caps text-on-surface-variant mb-2">Name</label>
              <input value={form.name} onChange={(event) => handleNameChange(event.target.value)} className="w-full bg-tactical-black border border-surface-container-highest p-3 text-stark-white" required />
            </div>
            <div>
              <label className="block font-label-caps text-on-surface-variant mb-2">Slug</label>
              <input value={form.slug} onChange={(event) => setField('slug', slugify(event.target.value))} className="w-full bg-tactical-black border border-surface-container-highest p-3 text-stark-white" required />
            </div>
            <div>
              <label className="block font-label-caps text-on-surface-variant mb-2">Category</label>
              <select value={form.categorySlug} onChange={(event) => setField('categorySlug', event.target.value)} className="w-full bg-tactical-black border border-surface-container-highest p-3 text-stark-white">
                <option value="">Unassigned</option>
                {categories.map((category) => <option key={category.id} value={category.slug}>{category.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block font-label-caps text-on-surface-variant mb-2">Base Price (IDR)</label>
              <input type="number" min="0" value={form.price} onChange={(event) => handleBasePriceChange(event.target.value)} className="w-full bg-tactical-black border border-surface-container-highest p-3 text-stark-white" required />
            </div>
            <div className="lg:col-span-2">
              <label className="block font-label-caps text-on-surface-variant mb-2">Regional Prices</label>
              <div className="grid gap-3 sm:grid-cols-2">
                {supportedRegions.map((region) => (
                  <label key={region} className="block border border-surface-container-highest bg-tactical-black p-3">
                    <span className="mb-2 block font-data-mono text-data-mono text-on-surface-variant">
                      {regionConfigs[region].label} ({regionConfigs[region].currency})
                    </span>
                    <input
                      type="number"
                      min="0"
                      value={form.regionalPrices[region]}
                      onChange={(event) => setRegionalPrice(region, event.target.value)}
                      className="w-full border border-surface-container-highest bg-charcoal-field p-2 text-stark-white"
                    />
                  </label>
                ))}
              </div>
            </div>
            <div className="lg:col-span-2">
              <label className="block font-label-caps text-on-surface-variant mb-2">Description</label>
              <textarea value={form.description} onChange={(event) => setField('description', event.target.value)} className="min-h-24 w-full bg-tactical-black border border-surface-container-highest p-3 text-stark-white" />
            </div>
            <div className="lg:col-span-2">
              <label className="block font-label-caps text-on-surface-variant mb-2">Image URLs</label>
              <textarea value={form.imageUrls} onChange={(event) => setField('imageUrls', event.target.value)} className="min-h-24 w-full bg-tactical-black border border-surface-container-highest p-3 text-stark-white" placeholder="One URL per line" />
            </div>
            <div className="lg:col-span-2">
              <label className="block font-label-caps text-on-surface-variant mb-2">Upload Product Image</label>
              <div className="flex flex-col gap-2 border border-surface-container-highest bg-tactical-black p-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="font-body-md text-on-surface-variant">
                  JPG, PNG, or WEBP. Max 3 MB.
                </div>
                <label className="inline-flex cursor-pointer items-center justify-center gap-2 border border-surface-container-highest px-4 py-2 font-label-caps text-stark-white hover:text-signal-orange">
                  <ImageUp className="h-4 w-4" />
                  {uploadingImage ? 'Uploading...' : 'Choose Image'}
                  <input
                    type="file"
                    accept={ALLOWED_PRODUCT_IMAGE_TYPES.join(',')}
                    onChange={handleProductImageUpload}
                    disabled={uploadingImage || saving}
                    className="sr-only"
                  />
                </label>
              </div>
            </div>
            <label className="flex items-center gap-3 font-label-caps text-stark-white">
              <input type="checkbox" checked={form.is_published} onChange={(event) => setField('is_published', event.target.checked)} />
              Published
            </label>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setShowProductForm(false)} className="border border-surface-container-highest px-4 py-2 font-label-caps text-stark-white hover:text-signal-orange">Cancel</button>
              <button type="submit" disabled={saving} className="bg-signal-orange px-4 py-2 font-label-caps text-tactical-black hover:bg-stark-white disabled:opacity-60">
                {saving ? 'Saving...' : 'Save Product'}
              </button>
            </div>
          </form>
        )}

        <div className="overflow-x-auto">
          <table className="w-full table-fixed border-collapse text-left">
            <colgroup>
              <col className="w-[18%]" />
              <col className="w-[14%]" />
              <col className="w-[13%]" />
              <col className="w-[20%]" />
              <col className="w-[35%]" />
            </colgroup>
            <thead>
              <tr className="border-b border-surface-container-highest bg-surface-container-lowest">
                <th className="px-3 py-3 font-label-caps uppercase text-on-surface-variant">Product</th>
                <th className="px-3 py-3 font-label-caps uppercase text-on-surface-variant">Category</th>
                <th className="px-3 py-3 font-label-caps uppercase text-on-surface-variant">Price</th>
                <th className="px-3 py-3 font-label-caps uppercase text-on-surface-variant">Slug</th>
                <th className="px-3 py-3 text-right font-label-caps uppercase text-on-surface-variant">Readiness</th>
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
                    <td className="break-words px-3 py-4 align-top text-signal-orange">
                      <Link href={`/catalogue/${product.slug}`} className="hover:underline">{product.name}</Link>
                    </td>
                    <td className="break-words px-3 py-4 align-top">{getCategoryName(product.categories)}</td>
                    <td className="whitespace-nowrap px-3 py-4 align-top text-on-surface-variant">
                      {product.price ? `IDR ${Number(product.price).toLocaleString('id-ID')}` : '-'}
                      <div className="mt-1 text-xs text-on-surface-variant/80">
                        Global {Number(product.regional_prices?.GLOBAL ?? defaultRegionalPrices(Number(product.price ?? 0)).GLOBAL).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                      </div>
                    </td>
                    <td className="break-words px-3 py-4 align-top text-on-surface-variant">{product.slug}</td>
                    <td className="px-3 py-4 align-top text-right">
                      <div className="ml-auto grid max-w-[340px] grid-cols-[minmax(0,1fr)_auto] items-center gap-x-2 gap-y-2">
                        <span className={`inline-flex min-w-0 items-center gap-2 justify-self-end whitespace-nowrap px-2 py-1 text-xs ${product.is_published === false ? 'bg-surface-container-highest text-on-surface-variant' : 'bg-operator-green/15 text-operator-green'}`}>
                            <Archive className="h-3 w-3" />
                            {product.is_published === false ? 'DRAFT' : 'SERIAL READY'}
                          </span>
                          {(product.serial_count ?? 0) > 0 ? (
                            <span className="inline-flex items-center gap-1 justify-self-end whitespace-nowrap bg-signal-orange/15 px-2 py-1 text-xs text-signal-orange" title="This product is tied to QR serials and cannot be deleted.">
                              <QrCode className="h-3 w-3" />
                              Tied to QR ({product.serial_count})
                            </span>
                          ) : (
                            <span aria-hidden="true" />
                          )}
                        <div className="col-span-2 flex justify-end gap-x-3 gap-y-1">
                          <button type="button" onClick={() => openEditProductForm(product)} className="inline-flex items-center gap-1 whitespace-nowrap text-on-surface-variant underline hover:text-signal-orange">
                            <Edit className="h-3 w-3" />
                            Edit
                          </button>
                          <button type="button" onClick={() => togglePublished(product)} className="whitespace-nowrap text-on-surface-variant underline hover:text-signal-orange">
                            {product.is_published === false ? 'Publish' : 'Unpublish'}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteProduct(product)}
                            disabled={(product.serial_count ?? 0) > 0 || saving}
                            title={(product.serial_count ?? 0) > 0 ? 'This product is tied to QR serials and cannot be deleted.' : 'Delete product'}
                            className="inline-flex items-center gap-1 whitespace-nowrap text-error underline hover:text-error/80 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            <Trash2 className="h-3 w-3" />
                            Delete
                          </button>
                        </div>
                      </div>
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
