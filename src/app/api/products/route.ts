import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  fallbackProducts,
  filterProducts,
  isMissingSchemaError,
  mergeCatalogueProducts,
  normalizeProduct,
  paginateProducts,
  type CatalogueProduct,
} from "@/lib/catalogue-data";
import { detectRegionFromHeaders, type RegionCode } from "@/lib/commerce";

export const dynamic = "force-dynamic";

function parsePositiveInt(value: string | null, fallback: number, max = Number.MAX_SAFE_INTEGER) {
  const parsed = Number.parseInt(value ?? "", 10);
  if (!Number.isFinite(parsed) || parsed < 1) return fallback;
  return Math.min(parsed, max);
}

function sanitizeSearch(value: string | null) {
  const search = value?.trim();
  if (!search) return "";
  return search.replace(/[%,()]/g, " ").replace(/\s+/g, " ").slice(0, 80).trim();
}

function isMissingCatalogueExtension(error: unknown) {
  if (!error || typeof error !== "object") return false;
  const record = error as { code?: string; message?: string };
  return ["42703", "42P01", "PGRST200"].includes(record.code ?? "")
    || /product_series|series_id|display_order|colorway|specifications/i.test(record.message ?? "");
}

function buildProductResponse(req: NextRequest, sourceProducts: CatalogueProduct[]) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const series = searchParams.get("series");
  const search = sanitizeSearch(searchParams.get("search"));
  const sort = searchParams.get("sort") ?? "newest";
  const page = parsePositiveInt(searchParams.get("page"), 1);
  const limit = parsePositiveInt(searchParams.get("limit"), 12, 200);
  const region = (searchParams.get("region") || detectRegionFromHeaders(req.headers)) as RegionCode;
  const filtered = filterProducts(sourceProducts, { category, series, search, sort, region });
  return { ...paginateProducts(filtered, page, limit), region };
}

export async function GET(req: NextRequest) {
  const includeFigmaCatalogue = process.env.STOREFRONT_V2_ENABLED !== "false";
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );

    let { data, error } = await supabase
      .from("products")
      .select("*, categories!inner(name, slug), product_series(name, slug)")
      .eq("is_published", true)
      .limit(200);

    if (error && isMissingCatalogueExtension(error)) {
      const legacy = await supabase
        .from("products")
        .select("*, categories!inner(name, slug)")
        .eq("is_published", true)
        .limit(200);
      data = legacy.data;
      error = legacy.error;
    }

    if (error) {
      if (isMissingSchemaError(error)) {
        return NextResponse.json({
          ...buildProductResponse(req, fallbackProducts),
          source: "figma-fallback",
          warning: "Database schema is not installed. Showing the bundled Figma catalogue.",
        });
      }
      console.error("Products API query error:", error);
      return NextResponse.json({ error: "Unable to load products." }, { status: 500 });
    }

    const databaseProducts = (data ?? []).map((product) => normalizeProduct(product as Record<string, unknown>));
    const figmaSlugs = new Set(fallbackProducts.map((product) => product.slug));
    const sourceProducts = includeFigmaCatalogue
      ? mergeCatalogueProducts(databaseProducts).filter((product) => figmaSlugs.has(product.slug))
      : databaseProducts;
    return NextResponse.json({
      ...buildProductResponse(req, sourceProducts),
      source: includeFigmaCatalogue ? "database+figma" : "database",
    });
  } catch (error) {
    console.error("Products API error:", error);
    return NextResponse.json({
      ...buildProductResponse(req, fallbackProducts),
      source: "figma-fallback",
      warning: "Products database is unavailable. Showing the bundled Figma catalogue.",
    });
  }
}
