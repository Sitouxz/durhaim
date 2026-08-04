"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import type { CatalogueProduct } from "@/lib/catalogue-data";
import { useCommerce } from "@/components/CommerceProvider";
import { useSiteSettings } from "@/components/SiteSettingsProvider";
import { localizeCategoryName } from "@/lib/product-localization";
import { buildWhatsAppUrl } from "@/lib/site-settings";

const categoryOptions = ["all", "vest", "pack", "belt", "accessories"] as const;
const categoryOrder = ["vest", "pack", "belt"];
const seriesOrder = [
  "chitto-series", "cobra-series", "mamba-series", "thunder-chestrig-series", "viper-series",
  "aim-vortex-rifle-bag", "anaconda", "bite-bee-handbag", "cobra-backpack",
  "dregon-head-backpack", "dump-pouch", "fabric-holster", "handgun-double-mag-pouch",
  "rifle-mag-pouch", "snake-head-sling-bag", "wolven-messenger-bag", "rattle-belt", "trojan-pro-warbelt",
];

type CatalogueGroup = {
  category: CatalogueProduct["category"];
  series: Array<{
    key: string;
    name: string;
    products: CatalogueProduct[];
  }>;
};

export default function CataloguePage() {
  const { language, region, formatPrice, t } = useCommerce();
  const siteSettings = useSiteSettings();
  const [category, setCategory] = useState("all");
  const [queryInput, setQueryInput] = useState("");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("display");
  const [products, setProducts] = useState<CatalogueProduct[]>([]);
  const [openSeries, setOpenSeries] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [warning, setWarning] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const initialCategory = params.get("category");
    const initialSearch = params.get("search");
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
      setError("");
      setWarning("");
      try {
        const params = new URLSearchParams({ sort, limit: "200", region });
        if (category !== "all") params.set("category", category);
        if (query.trim()) params.set("search", query.trim());
        const response = await fetch(`/api/products?${params}`, { signal: controller.signal, cache: "no-store" });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || t.catalogue.unableToLoad);
        const nextProducts = data.products ?? [];
        setProducts(nextProducts);
        setWarning(data.warning ?? "");
        setOpenSeries((current) => {
          if (current.size) return current;
          return new Set([
            ...nextProducts.map((product: CatalogueProduct) => product.series?.slug ?? "uncategorized"),
            "anaconda",
          ]);
        });
      } catch (fetchError) {
        if (fetchError instanceof DOMException && fetchError.name === "AbortError") return;
        setError(fetchError instanceof Error ? fetchError.message : t.catalogue.unableToLoad);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    void fetchProducts();
    return () => controller.abort();
  }, [category, query, region, sort, t.catalogue.unableToLoad]);

  const groups = useMemo<CatalogueGroup[]>(() => {
    const categoryMap = new Map<string, CatalogueGroup>();
    for (const product of products) {
      const displayCategory = product.category.slug === "accessories"
        ? { ...product.category, slug: "pack", name: "Pack & Pouch" }
        : product.category;
      let categoryGroup = categoryMap.get(displayCategory.slug);
      if (!categoryGroup) {
        categoryGroup = { category: displayCategory, series: [] };
        categoryMap.set(displayCategory.slug, categoryGroup);
      }
      const seriesKey = product.series?.slug ?? "uncategorized";
      let seriesGroup = categoryGroup.series.find((item) => item.key === seriesKey);
      if (!seriesGroup) {
        seriesGroup = { key: seriesKey, name: product.series?.name ?? product.category.name, products: [] };
        categoryGroup.series.push(seriesGroup);
      }
      seriesGroup.products.push(product);
    }
    const packGroup = categoryMap.get("pack");
    if (packGroup && !packGroup.series.some((item) => item.key === "anaconda")) {
      packGroup.series.push({ key: "anaconda", name: "Anaconda Assault Backpack", products: [] });
    }
    return [...categoryMap.values()]
      .sort((a, b) => categoryOrder.indexOf(a.category.slug) - categoryOrder.indexOf(b.category.slug))
      .map((group) => ({
        ...group,
        series: group.series.sort((a, b) => {
          const aIndex = seriesOrder.indexOf(a.key);
          const bIndex = seriesOrder.indexOf(b.key);
          return (aIndex < 0 ? Number.MAX_SAFE_INTEGER : aIndex) - (bIndex < 0 ? Number.MAX_SAFE_INTEGER : bIndex);
        }),
      }));
  }, [products]);

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setQuery(queryInput.trim());
  }

  function selectCategory(value: string) {
    setCategory(value);
  }

  function toggleSeries(key: string) {
    setOpenSeries((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  const localizedWarning = language === "id"
    ? warning
        .replace("Database schema is not installed. Showing the bundled Figma catalogue.", "Skema database belum terpasang. Menampilkan katalog Figma lokal.")
        .replace("Products database is unavailable. Showing the bundled Figma catalogue.", "Database produk belum tersedia. Menampilkan katalog Figma lokal.")
    : warning;

  return (
    <main id="main-content" className="store-catalogue" data-figma-node="63:1582">
      <div className="store-catalogue__title">
        <h1>CATALOGUE</h1>
      </div>

      <div className="store-catalogue__layout">
        <aside className="store-catalogue__filters">
          <section>
            <h2>{language === "id" ? "KATEGORI" : "CATEGORIES"}</h2>
            <div className="store-category-options">
              {categoryOptions.map((option) => (
                <label key={option}>
                  <input
                    type="radio"
                    name="catalogue-category"
                    checked={category === option}
                    onChange={() => selectCategory(option)}
                  />
                  <span>{t.catalogue.categoryLabels[option]}</span>
                </label>
              ))}
            </div>
          </section>

          <section>
            <h2>{language === "id" ? "CARI PRODUK" : "SEARCH ITEM"}</h2>
            <form className="store-catalogue-search" onSubmit={submitSearch}>
              <label className="sr-only" htmlFor="catalogue-query">{t.catalogue.keyword}</label>
              <input
                id="catalogue-query"
                type="search"
                value={queryInput}
                onChange={(event) => setQueryInput(event.target.value)}
                placeholder={t.catalogue.keyword}
              />
              <button type="submit" aria-label={t.common.searchCatalogue}><Search aria-hidden="true" /></button>
            </form>
          </section>
        </aside>

        <section className="store-catalogue__results" aria-live="polite" aria-busy={loading}>
          <div className="store-catalogue__sort">
            <span>{products.length} {language === "id" ? "PRODUK" : "ITEMS"}</span>
            <label>
              {t.catalogue.sortBy}
              <select value={sort} onChange={(event) => setSort(event.target.value)}>
                <option value="display">{language === "id" ? "Urutan katalog" : "Catalogue order"}</option>
                <option value="name-az">{t.catalogue.nameAz}</option>
                <option value="name-za">{t.catalogue.nameZa}</option>
                <option value="price-high">{t.catalogue.priceHigh}</option>
                <option value="price-low">{t.catalogue.priceLow}</option>
              </select>
            </label>
          </div>

          {localizedWarning && <p className="store-catalogue__notice">{localizedWarning}</p>}
          {error && <p className="store-catalogue__notice" role="alert">{error}</p>}
          {loading && products.length === 0 && <p className="store-catalogue__status">{t.catalogue.loading}</p>}
          {!loading && !error && products.length === 0 && <p className="store-catalogue__status">{t.catalogue.empty}</p>}

          {groups.map((categoryGroup) => (
            <section className="store-catalogue-category" key={categoryGroup.category.slug}>
              <h2>{localizeCategoryName(categoryGroup.category.slug, categoryGroup.category.name, language)}</h2>
              {categoryGroup.series.map((seriesGroup) => {
                const expanded = openSeries.has(seriesGroup.key);
                return (
                  <section className="store-series" key={seriesGroup.key}>
                    <button
                      className="store-series__trigger"
                      type="button"
                      aria-expanded={expanded}
                      aria-controls={`series-${seriesGroup.key}`}
                      onClick={() => toggleSeries(seriesGroup.key)}
                    >
                      <span>{seriesGroup.name}</span>
                      <ChevronDown aria-hidden="true" />
                    </button>
                    {expanded && (
                      <div className="store-product-grid" id={`series-${seriesGroup.key}`}>
                        {seriesGroup.products.map((product) => {
                          const regionalPrice = product.regional_prices[region];
                          const hasPrice = product.price !== null || typeof regionalPrice === "number";
                          const enquiry = t.product.enquiry(product.name, product.slug);
                          return (
                            <article className="store-product-card" key={product.slug}>
                              <div className="store-product-card__image">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={product.images[0] ?? ""} alt={product.name} loading="lazy" />
                                <div className="store-product-card__utility">
                                  {hasPrice && <span>{formatPrice(product.price ?? regionalPrice ?? 0, product.regional_prices)}</span>}
                                  <a href={buildWhatsAppUrl(siteSettings, enquiry)} target="_blank" rel="noopener noreferrer">
                                    WhatsApp
                                  </a>
                                </div>
                              </div>
                              <h3>{product.name}</h3>
                              <Link href={`/catalogue/${product.slug}`}>{t.catalogue.viewDetails}</Link>
                            </article>
                          );
                        })}
                      </div>
                    )}
                  </section>
                );
              })}
            </section>
          ))}
        </section>
      </div>
    </main>
  );
}
