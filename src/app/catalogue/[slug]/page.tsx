import { notFound } from "next/navigation";
import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";
import {
  fallbackProducts,
  isMissingSchemaError,
  mergeCatalogueProducts,
  normalizeProduct,
  type CatalogueProduct,
} from "@/lib/catalogue-data";
import ProductDetailClient from "@/components/ProductDetailClient";
import JsonLd from "@/components/JsonLd";
import { getSiteSettings } from "@/lib/site-settings-server";
import { getSiteUrl } from "@/lib/site-settings";

interface PageProps {
  params: Promise<{ slug: string }>;
}

function isMissingCatalogueExtension(error: unknown) {
  if (!error || typeof error !== "object") return false;
  const record = error as { code?: string; message?: string };
  return ["42703", "42P01", "PGRST200"].includes(record.code ?? "")
    || /product_series|series_id|display_order|colorway|specifications/i.test(record.message ?? "");
}

async function getProduct(slug: string): Promise<CatalogueProduct | null> {
  const fallback = fallbackProducts.find((product) => product.slug === slug) ?? null;
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );
    let { data, error } = await supabase
      .from("products")
      .select("*, categories(name, slug), product_series(name, slug)")
      .eq("slug", slug)
      .eq("is_published", true)
      .single();

    if (error && isMissingCatalogueExtension(error)) {
      const legacy = await supabase
        .from("products")
        .select("*, categories(name, slug)")
        .eq("slug", slug)
        .eq("is_published", true)
        .single();
      data = legacy.data;
      error = legacy.error;
    }

    if (error) {
      if (isMissingSchemaError(error)) return fallback;
      return fallback;
    }
    return mergeCatalogueProducts([normalizeProduct(data as Record<string, unknown>)])
      .find((product) => product.slug === slug) ?? fallback;
  } catch {
    return fallback;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  return {
    title: product ? `${product.name} Tactical Gear` : "Tactical Gear Product",
    description: product
      ? `${product.name} by DURHAIM. View its ordered gallery and specifications, then enquire through WhatsApp.`
      : "DURHAIM tactical gear product details, WhatsApp enquiries, and authenticity support.",
    alternates: {
      canonical: `/catalogue/${slug}`,
      languages: {
        en: `/catalogue/${slug}`,
        id: `/catalogue/${slug}?lang=id`,
        "x-default": `/catalogue/${slug}`,
      },
    },
    openGraph: product ? {
      title: `${product.name} - DURHAIM`,
      description: product.description,
      url: `/catalogue/${product.slug}`,
      images: product.images[0] ? [{ url: product.images[0], alt: product.name }] : undefined,
      type: "website",
    } : undefined,
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const siteSettings = await getSiteSettings();
  const siteUrl = getSiteUrl(siteSettings);
  const product = await getProduct(slug);
  if (!product) notFound();

  const absoluteImage = product.images[0]
    ? product.images[0].startsWith("http") ? product.images[0] : `${siteUrl}${product.images[0]}`
    : `${siteUrl}/images/durhaim_image_1.png`;
  const productSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
          { "@type": "ListItem", position: 2, name: "Catalogue", item: `${siteUrl}/catalogue` },
          { "@type": "ListItem", position: 3, name: product.name, item: `${siteUrl}/catalogue/${product.slug}` },
        ],
      },
      {
        "@type": "Product",
        "@id": `${siteUrl}/catalogue/${product.slug}#product`,
        name: product.name,
        description: product.description,
        image: product.images.map((image) => image.startsWith("http") ? image : `${siteUrl}${image}`),
        brand: { "@type": "Brand", name: "DURHAIM" },
        category: product.category.name,
        color: product.colorway || undefined,
        offers: product.price === null ? undefined : {
          "@type": "Offer",
          priceCurrency: "IDR",
          price: product.price,
          availability: "https://schema.org/InStock",
          url: `${siteUrl}/catalogue/${product.slug}`,
        },
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: `What is ${product.name}?`,
            acceptedAnswer: { "@type": "Answer", text: `${product.name} is a DURHAIM ${product.category.name.toLowerCase()} product built for modular tactical loadouts.` },
          },
          {
            "@type": "Question",
            name: `How can I enquire about ${product.name}?`,
            acceptedAnswer: { "@type": "Answer", text: "Use the WhatsApp enquiry control on this page for availability, regional pricing, and ordering." },
          },
        ],
      },
    ],
  };
  const background = product.slug === "green-chitto-mark-2"
    ? "/storefront/figma/product/chitto-green/main-background-3.jpg"
    : "/storefront/figma/product/chitto-black/main-background-3.jpg";

  return (
    <main
      id="main-content"
      className="store-product-detail"
      data-figma-node={product.slug === "green-chitto-mark-2" ? "63:1581" : product.slug === "black-chitto-mark-2" ? "63:1556" : undefined}
      style={{ "--product-background": `url(${background})` } as CSSProperties}
    >
      <JsonLd data={productSchema} />
      <ProductDetailClient product={product} />
      <link rel="preload" as="image" href={absoluteImage} />
    </main>
  );
}
