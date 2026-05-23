'use client';

import { Edit, FolderTree, Plus, Search, Trash2 } from 'lucide-react';
import { FormEvent, useEffect, useMemo, useState } from 'react';

type Category = {
  id: string;
  name: string;
  slug: string;
  icon?: string | null;
};

type CategoryForm = {
  id?: string;
  name: string;
  slug: string;
  icon: string;
};

const emptyForm: CategoryForm = {
  name: '',
  slug: '',
  icon: '',
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function categoryToForm(category: Category): CategoryForm {
  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    icon: category.icon ?? '',
  };
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [form, setForm] = useState<CategoryForm>(emptyForm);

  const fetchCategories = async () => {
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/categories');
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error || 'Failed to load categories.');
        return;
      }

      setCategories(data);
    } catch (fetchError) {
      console.error('Failed to load categories:', fetchError);
      setError('Failed to connect to categories API.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const filteredCategories = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return categories;

    return categories.filter((category) => (
      category.name.toLowerCase().includes(normalizedQuery)
      || category.slug.toLowerCase().includes(normalizedQuery)
      || (category.icon ?? '').toLowerCase().includes(normalizedQuery)
    ));
  }, [categories, query]);

  const openNewCategoryForm = () => {
    setForm(emptyForm);
    setMessage('');
    setShowCategoryForm(true);
  };

  const openEditCategoryForm = (category: Category) => {
    setForm(categoryToForm(category));
    setMessage('');
    setShowCategoryForm(true);
  };

  const setField = (field: keyof CategoryForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleNameChange = (value: string) => {
    setForm((current) => ({
      ...current,
      name: value,
      slug: current.id ? current.slug : slugify(value),
    }));
  };

  const handleSaveCategory = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');

    try {
      const res = await fetch('/api/admin/categories', {
        method: form.id ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error || 'Failed to save category.');
        return;
      }

      setMessage('Category saved.');
      setShowCategoryForm(false);
      await fetchCategories();
    } catch (saveError) {
      console.error('Failed to save category:', saveError);
      setError('Failed to connect to categories API.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCategory = async (category: Category) => {
    if (!confirm(`Delete ${category.name}? Products in this category will become unassigned.`)) return;

    setSaving(true);
    setError('');
    setMessage('');

    try {
      const res = await fetch(`/api/admin/categories?id=${encodeURIComponent(category.id)}`, {
        method: 'DELETE',
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error || 'Failed to delete category.');
        return;
      }

      setMessage('Category deleted.');
      if (form.id === category.id) {
        setShowCategoryForm(false);
        setForm(emptyForm);
      }
      await fetchCategories();
    } catch (deleteError) {
      console.error('Failed to delete category:', deleteError);
      setError('Failed to connect to categories API.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-stack-lg animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="font-display-xl text-headline-lg text-stark-white uppercase">Categories</h1>
          <p className="font-body-md text-on-surface-variant">Manage product category names, slugs, and icons used across the catalogue and admin tools.</p>
        </div>
        <div className="border border-surface-container-highest bg-charcoal-field px-4 py-3">
          <div className="flex items-center gap-2 text-signal-orange">
            <FolderTree className="h-4 w-4" />
            <span className="font-data-mono text-data-mono">{categories.length}</span>
          </div>
          <div className="font-label-caps text-xs uppercase text-on-surface-variant">Total Categories</div>
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
              placeholder="Search categories..."
              type="search"
            />
          </form>
          <button
            type="button"
            onClick={openNewCategoryForm}
            className="inline-flex items-center justify-center gap-2 bg-signal-orange px-4 py-2 font-label-caps text-tactical-black hover:bg-stark-white"
          >
            <Plus className="h-4 w-4" />
            New Category
          </button>
        </div>

        {showCategoryForm && (
          <form onSubmit={handleSaveCategory} className="grid gap-4 border-b border-surface-container-highest p-4 lg:grid-cols-3">
            <div>
              <label className="block font-label-caps text-on-surface-variant mb-2">Name</label>
              <input value={form.name} onChange={(event) => handleNameChange(event.target.value)} className="w-full bg-tactical-black border border-surface-container-highest p-3 text-stark-white" required />
            </div>
            <div>
              <label className="block font-label-caps text-on-surface-variant mb-2">Slug</label>
              <input value={form.slug} onChange={(event) => setField('slug', slugify(event.target.value))} className="w-full bg-tactical-black border border-surface-container-highest p-3 text-stark-white" required />
            </div>
            <div>
              <label className="block font-label-caps text-on-surface-variant mb-2">Icon</label>
              <input value={form.icon} onChange={(event) => setField('icon', event.target.value)} className="w-full bg-tactical-black border border-surface-container-highest p-3 text-stark-white" placeholder="Optional icon name" />
            </div>
            <div className="flex justify-end gap-3 lg:col-span-3">
              <button type="button" onClick={() => setShowCategoryForm(false)} className="border border-surface-container-highest px-4 py-2 font-label-caps text-stark-white hover:text-signal-orange">Cancel</button>
              <button type="submit" disabled={saving} className="bg-signal-orange px-4 py-2 font-label-caps text-tactical-black hover:bg-stark-white disabled:opacity-60">
                {saving ? 'Saving...' : 'Save Category'}
              </button>
            </div>
          </form>
        )}

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-surface-container-highest bg-surface-container-lowest">
                <th className="px-4 py-3 font-label-caps uppercase text-on-surface-variant">Name</th>
                <th className="px-4 py-3 font-label-caps uppercase text-on-surface-variant">Slug</th>
                <th className="px-4 py-3 font-label-caps uppercase text-on-surface-variant">Icon</th>
                <th className="px-4 py-3 text-right font-label-caps uppercase text-on-surface-variant">Actions</th>
              </tr>
            </thead>
            <tbody className="font-data-mono text-sm text-stark-white">
              {loading ? (
                <tr>
                  <td className="px-4 py-8 text-center text-on-surface-variant" colSpan={4}>Loading categories...</td>
                </tr>
              ) : filteredCategories.length === 0 ? (
                <tr>
                  <td className="px-4 py-8 text-center text-on-surface-variant" colSpan={4}>No categories found.</td>
                </tr>
              ) : (
                filteredCategories.map((category) => (
                  <tr key={category.id} className="border-b border-surface-container-highest/50 hover:bg-surface-container-highest/30">
                    <td className="px-4 py-3 text-signal-orange">{category.name}</td>
                    <td className="px-4 py-3 text-on-surface-variant">{category.slug}</td>
                    <td className="px-4 py-3 text-on-surface-variant">{category.icon || '-'}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex flex-wrap justify-end gap-3">
                        <button type="button" onClick={() => openEditCategoryForm(category)} className="inline-flex items-center gap-1 text-on-surface-variant underline hover:text-signal-orange">
                          <Edit className="h-3 w-3" />
                          Edit
                        </button>
                        <button type="button" onClick={() => handleDeleteCategory(category)} className="inline-flex items-center gap-1 text-error underline hover:text-error/80">
                          <Trash2 className="h-3 w-3" />
                          Delete
                        </button>
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
