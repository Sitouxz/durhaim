import { expect, test } from "@playwright/test";
import axe from "axe-core";

const responsiveWidths = [1440, 1024, 768, 390, 320];

test.describe("storefront behavior", () => {
  for (const width of responsiveWidths) {
    test(`homepage and catalogue do not overflow at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: width <= 390 ? 844 : 900 });
      await page.goto("/?lang=en", { waitUntil: "domcontentloaded" });
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);

      if (width <= 1100) {
        await expect(page.locator(".store-header")).toHaveAttribute("data-hydrated", "true", { timeout: 60_000 });
        const menu = page.getByRole("button", { name: "Open menu" });
        await expect(menu).toBeVisible();
        await expect(menu).toHaveCSS("min-height", "44px");
        await menu.click();
        await expect(page.getByRole("navigation", { name: "Mobile navigation" })).toBeVisible();
      }

      await page.goto("/catalogue?lang=en", { waitUntil: "domcontentloaded" });
      await page.waitForSelector(".store-series");
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
    });
  }

  test("catalogue imports 80 products and keeps accordions independent", async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1200 });
    await page.goto("/catalogue?lang=en", { waitUntil: "domcontentloaded" });
    await expect(page.locator(".store-product-card")).toHaveCount(80, { timeout: 60_000 });
    await expect(page.locator(".store-series")).toHaveCount(18);

    const first = page.locator(".store-series__trigger").first();
    const second = page.locator(".store-series__trigger").nth(1);
    await expect(first).toHaveAttribute("aria-expanded", "true");
    await expect(second).toHaveAttribute("aria-expanded", "true");
    await first.click();
    await expect(first).toHaveAttribute("aria-expanded", "false");
    await expect(second).toHaveAttribute("aria-expanded", "true");
  });

  test("catalogue products use the gray reference card treatment", async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto("/catalogue?lang=en", { waitUntil: "domcontentloaded" });
    const firstCard = page.locator(".store-product-card").first();
    await expect(firstCard).toHaveCSS("background-color", "rgb(41, 41, 41)");
    await expect(firstCard).toHaveCSS("border-top-color", "rgb(102, 102, 102)");
    await expect(firstCard.locator(":scope > a")).toHaveCSS("background-color", "rgb(102, 102, 102)");
  });

  test("homepage category labels stay visible", async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto("/?lang=en", { waitUntil: "domcontentloaded" });
    const tile = page.locator(".home-category-strip a").first();
    const label = tile.locator("span");

    await expect(tile).toHaveCSS("opacity", "1");
    await expect(label).toHaveCSS("opacity", "1");
  });

  test("catalogue search, category filter, and product gallery remain interactive", async ({ page }) => {
    await page.goto("/catalogue?lang=en", { waitUntil: "domcontentloaded" });
    await page.waitForSelector(".store-product-card");
    await page.locator(".store-category-options label", { hasText: "Belt" }).click();
    await expect(page.locator(".store-product-card")).toHaveCount(6);

    await page.goto("/catalogue/black-chitto-mark-2?lang=en", { waitUntil: "domcontentloaded" });
    await expect(page.locator(".store-product-detail__reference")).toHaveAttribute("data-hydrated", "true", { timeout: 60_000 });
    const mainImage = page.locator(".store-product-stage__image img");
    const original = await mainImage.getAttribute("src");
    await expect(page.locator(".store-product-gallery button")).toHaveCount(4);
    await page.locator(".store-product-gallery button").first().click();
    await expect(mainImage).not.toHaveAttribute("src", original ?? "");
  });

  test("Figma product detail nodes keep their reference copy and identifiers", async ({ page }) => {
    await page.goto("/catalogue/black-chitto-mark-2?lang=en", { waitUntil: "domcontentloaded" });
    await expect(page.locator('main[data-figma-node="63:1556"]')).toBeVisible();
    await expect(page.locator(".store-product-specifications li").first()).toHaveText("Black Color.");

    await page.goto("/catalogue/green-chitto-mark-2?lang=en", { waitUntil: "domcontentloaded" });
    await expect(page.locator('main[data-figma-node="63:1581"]')).toBeVisible();
    await expect(page.locator(".store-product-specifications li").first()).toHaveText("Green Color.");
  });

  test("camera permission is requested only after the scan action", async ({ page }) => {
    await page.addInitScript(() => {
      let calls = 0;
      Object.defineProperty(window, "__cameraCalls", { get: () => calls });
      Object.defineProperty(navigator, "mediaDevices", {
        configurable: true,
        value: { getUserMedia: async () => { calls += 1; throw new Error("denied"); } },
      });
    });
    await page.goto("/?lang=en", { waitUntil: "domcontentloaded" });
    await expect(page.locator(".store-serial-checker")).toHaveAttribute("data-hydrated", "true");
    await expect.poll(() => page.evaluate(() => (window as Window & { __cameraCalls?: number }).__cameraCalls ?? 0)).toBe(0);
    await page.getByRole("button", { name: /try scan again/i }).click();
    await expect.poll(() => page.evaluate(() => (window as Window & { __cameraCalls?: number }).__cameraCalls ?? 0)).toBe(1);
  });

  test("accessibility has no serious or critical violations", async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 900 });
    for (const route of ["/?lang=en", "/catalogue?lang=en", "/catalogue/black-chitto-mark-2?lang=en", "/verify?lang=en"]) {
      await page.goto(route, { waitUntil: "domcontentloaded" });
      await page.addScriptTag({ content: axe.source });
      const result = await page.evaluate(async () => {
        const axeApi = (window as unknown as { axe: { run: (context: Document, options: object) => Promise<{ violations: Array<{ id: string; impact: string | null }> }> } }).axe;
        return axeApi.run(document, { resultTypes: ["violations"] });
      });
      const blocking = result.violations.filter((item) => item.impact === "critical" || item.impact === "serious");
      expect(blocking, `${route}: ${blocking.map((item) => item.id).join(", ")}`).toEqual([]);
    }
  });
});
