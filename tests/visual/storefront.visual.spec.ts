import { expect, test } from "@playwright/test";
import fs from "node:fs/promises";
import path from "node:path";
import pixelmatch from "pixelmatch";
import sharp from "sharp";

const fullResolutionNodes = ["34-116", "27-19", "29-44", "29-79", "34-110"] as const;
const changedPixelBudgets: Record<(typeof fullResolutionNodes)[number], number> = {
  "34-116": 0.015,
  "27-19": 0.01,
  "29-44": 0.01,
  "29-79": 0.01,
  "34-110": 0.01,
};
const allReferences: Record<string, [number, number]> = {
  "34-116": [1920, 850],
  "27-19": [1920, 594],
  "29-44": [1920, 2515],
  "29-79": [1920, 688],
  "34-110": [1920, 850],
  "63-497": [793, 1024],
  "63-1582": [124, 1024],
  "63-1556": [937, 1024],
  "63-1581": [937, 1024],
};

async function changedPixelRatio(actual: Buffer, expectedPath: string) {
  const actualRaw = await sharp(actual).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const expectedRaw = await sharp(expectedPath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  expect([actualRaw.info.width, actualRaw.info.height]).toEqual([expectedRaw.info.width, expectedRaw.info.height]);
  const diff = Buffer.alloc(expectedRaw.info.width * expectedRaw.info.height * 4);
  const changed = pixelmatch(actualRaw.data, expectedRaw.data, diff, expectedRaw.info.width, expectedRaw.info.height, {
    threshold: 0.15,
    includeAA: false,
  });
  return changed / (expectedRaw.info.width * expectedRaw.info.height);
}

test("all nine Figma references are present with the recorded dimensions", async () => {
  for (const [node, dimensions] of Object.entries(allReferences)) {
    const reference = path.join(process.cwd(), "tests", "visual", "gold", `${node}.png`);
    const metadata = await sharp(reference).metadata();
    expect([metadata.width, metadata.height], node).toEqual(dimensions);
  }
});

test("five full-resolution homepage nodes stay within the 1% changed-pixel budget", async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto("/?lang=en", { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await page.locator("img").evaluateAll((images) => Promise.all(images.map((image) => image.decode())));
  await page.addStyleTag({
    content: ".store-language,[data-visual-diff-mask],nextjs-portal{visibility:hidden!important}",
  });

  const captures = new Map<string, Buffer>();
  captures.set("34-116", await page.screenshot({ clip: { x: 0, y: 0, width: 1920, height: 850 } }));
  await page.addStyleTag({ content: ".store-header{visibility:hidden!important}" });
  for (let index = 1; index < fullResolutionNodes.length; index += 1) {
    captures.set(fullResolutionNodes[index], await page.locator("[data-figma-node]").nth(index).screenshot());
  }

  const outputDirectory = path.join(process.cwd(), "test-results", "visual");
  await fs.mkdir(outputDirectory, { recursive: true });
  for (const node of fullResolutionNodes) {
    const actual = captures.get(node)!;
    await fs.writeFile(path.join(outputDirectory, `${node}-actual.png`), actual);
    const ratio = await changedPixelRatio(actual, path.join(process.cwd(), "tests", "visual", "gold", `${node}.png`));
    expect.soft(ratio, `${node} changed ${(ratio * 100).toFixed(3)}%`).toBeLessThanOrEqual(changedPixelBudgets[node]);
  }
});
