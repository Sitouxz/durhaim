"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { CatalogueProduct } from "@/lib/catalogue-data";
import { useCommerce } from "@/components/CommerceProvider";
import { useSiteSettings } from "@/components/SiteSettingsProvider";
import { localizeCategoryName, localizeProductDescription } from "@/lib/product-localization";
import { buildWhatsAppUrl } from "@/lib/site-settings";

function formatSpecification(item: string) {
  const specification = item.trim();
  return /[.!?]$/.test(specification) ? specification : `${specification}.`;
}

export default function ProductDetailClient({ product }: { product: CatalogueProduct }) {
  const { language, region, formatPrice, t } = useCommerce();
  const siteSettings = useSiteSettings();
  const [selectedImage, setSelectedImage] = useState(product.images[0] ?? "");
  const [hydrated, setHydrated] = useState(false);
  const categoryName = localizeCategoryName(product.category.slug, product.category.name, language);
  const description = localizeProductDescription(product.description, language);
  const regionalPrice = product.regional_prices[region];
  const hasPrice = product.price !== null || typeof regionalPrice === "number";

  useEffect(() => setHydrated(true), []);

  return (
    <>
      <div className="store-product-detail__reference" data-hydrated={hydrated}>
        <div className="store-product-stage">
          <div className="store-product-stage__image">
            {selectedImage && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={selectedImage} alt={product.name} />
            )}
          </div>
          <section className="store-product-stage__copy">
            <h1>{product.name}</h1>
            <nav className="store-product-breadcrumb" aria-label="Breadcrumb">
              <Link href="/catalogue">{t.nav.catalogue.toUpperCase()}</Link>
              <span>{"//"}</span>
              <Link href={`/catalogue?category=${product.category.slug}`}>{categoryName}</Link>
              <span>{"//"}</span>
              <span aria-current="page">{product.name}</span>
            </nav>
            {product.specifications.length > 0 && (
              <div className="store-product-specifications">
                <h2>{t.product.specification.toUpperCase()}</h2>
                <ul>
                  {product.specifications.map((item) => <li key={item}>{formatSpecification(item)}</li>)}
                </ul>
              </div>
            )}
            {!product.specifications.length && description && <p className="store-product-description">{description}</p>}
          </section>
        </div>

        {product.images.length > 1 && (
          <div className="store-product-gallery" aria-label={t.product.gallery}>
            {product.images.slice(1).map((image, index) => (
              <button
                key={image}
                type="button"
                aria-label={`Show product image ${index + 2}`}
                aria-pressed={selectedImage === image}
                onClick={() => setSelectedImage(image)}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={image} alt="" />
              </button>
            ))}
          </div>
        )}
      </div>

      <section className="store-product-utility" aria-label="Purchase and navigation">
        <div>
          <span>{categoryName}</span>
          {hasPrice && (
            <>
              <strong>{formatPrice(product.price ?? regionalPrice ?? 0, product.regional_prices)}</strong>
              <small>{t.common.priceRegion}: {region}</small>
            </>
          )}
        </div>
        <div>
          <a
            href={buildWhatsAppUrl(siteSettings, t.product.enquiry(product.name, product.slug))}
            target="_blank"
            rel="noopener noreferrer"
          >
            {t.product.enquire}
          </a>
          <Link href="/catalogue">{t.product.back}</Link>
        </div>
      </section>
    </>
  );
}
