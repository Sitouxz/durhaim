---
name: DURHAIM Monochrome Storefront
scope: .storefront-v2
source: Figma WEB DURHAIM BARU
reference_nodes:
  homepage: ['34:116', '27:19', '29:44', '29:79', '34:110']
  catalogue: ['63:497', '63:1582']
  product: ['63:1556', '63:1581']
---

# DURHAIM storefront design system

The public storefront is an image-led, monochrome tactical catalogue. It should feel like a field-equipment manual enlarged into a storefront: direct, dense where the catalogue requires it, and cinematic where the brand story requires it. The Figma artboards are authoritative at 1920px.

## Isolation contract

All new variables and visual overrides live below `.storefront-v2`. The admin application is not wrapped in this namespace and continues to use the legacy Tailwind tokens. Public components must not change global legacy token values to achieve the redesign.

## Color tokens

```css
.storefront-v2 {
  --store-black: #000000;
  --store-white: #ffffff;
  --store-structure: #666666;
  --store-divider: #444444;
  --store-muted-text: #b3b3b3;
  --store-overlay-soft: rgba(0, 0, 0, 0.34);
  --store-overlay-strong: rgba(0, 0, 0, 0.68);
}
```

`#666666` is structural grey for panels and large labels. Small text on black uses `#B3B3B3` to satisfy WCAG AA. There is no storefront orange, gradient, glow, or decorative shadow.

## Typography

- Family: Tactic Sans, supplied Regular and Bold files, loaded locally through `next/font/local`.
- Display: Bold, uppercase, line-height 0.94–1.05, tracking no tighter than `-0.04em`.
- Navigation and utilities: Bold, uppercase, 14–16px desktop.
- Body: Regular, 16–19px, line-height 1.45–1.65, maximum 72ch.
- Technical specifications: Regular, 18–30px depending on viewport and Figma region.
- Headings use balanced wrapping; long prose uses pretty wrapping.

## Layout

- Desktop reference width: 1920px.
- Header height: 147px at 1920px, then compressed below 1024px.
- Homepage sections are full-bleed, photo-led compositions matching the five Figma groups.
- Catalogue uses a stable left filter rail and a wider right series column on desktop; it becomes a single reading column below 1024px.
- Product detail uses a gallery/specification split on desktop and image-first flow on mobile.
- Public content aligns to a fluid edge inset: `clamp(16px, 3.65vw, 70px)`.
- Shapes are square. Borders are 1px `--store-divider` or white for active/high-priority controls.

## Imagery

- Images are local files recorded in `public/storefront/asset-manifest.json` with source node, source URL or Drive ID, byte size, and SHA-256.
- `object-fit: cover` and `object-position` values are chosen per reference crop. Do not substitute generic imagery.
- Dark scrims are allowed only where the Figma uses them or text contrast requires them.
- Product gallery order is data, not presentation coincidence; preserve it.

## Interaction

- Every control has a visible monochrome focus outline and a 44px minimum touch target.
- Series accordions use native buttons and `aria-expanded`; all are open initially.
- Scanner permission is requested only after a deliberate Scan action.
- Gallery thumbnails change the main image and expose their selected state.
- Hover-only commercial information must also be reachable by focus and tap.
- Motion is limited to opacity/transform transitions under 240ms and disabled by `prefers-reduced-motion`.

## Responsive contract

- 1440px: preserve desktop proportions with fluid type and insets.
- 1024px: compact navigation, maintain two-column catalogue only when content remains readable.
- 768px: mobile navigation and single-column product/category flows.
- 390px and 320px: no horizontal overflow, 16px edge insets, image-first order, and minimum 44px controls.

## Deliberate reference exceptions

- Language utility, floating WhatsApp control, newsletter/footer, pricing utilities, and verification error states remain available.
- Obvious copy errors are corrected without changing meaning.
- Small grey text is lightened only enough to meet AA contrast.
- Visual-diff masks may cover retained utilities that do not exist in a reference node; masks may not hide core layout differences.
