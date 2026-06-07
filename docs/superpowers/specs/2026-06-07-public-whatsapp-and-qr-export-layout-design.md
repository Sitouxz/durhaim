# Public WhatsApp Focus and QR Export Layout Design

## Goal

Make the public storefront enquiry-led instead of price-led, and make every visual QR export use consistent, visually aligned spacing.

## Approved Public Storefront Behavior

- Keep catalogue product cards linking to the product detail page.
- Remove prices from every public page.
- Remove public price controls, including the region/currency selector and price-based catalogue sorting.
- Keep product pricing and regional price management available in admin.
- Make the direct WhatsApp enquiry the primary action on product detail pages.
- Keep the enquiry cart as a secondary way to collect multiple products before sending one WhatsApp message, but do not display prices in it.
- Remove public copy, metadata, FAQ content, and structured product offers that advertise regional pricing.

## Approved QR Export Behavior

- Rows and columns remain user-selectable.
- Choose orientation automatically:
  - columns greater than rows: landscape
  - rows greater than or equal to columns: portrait
- Derive the page dimensions from the selected rows and columns instead of forcing the grid onto A4.
- Use square label cells.
- Use the same gap horizontally and vertically.
- Use the same QR padding on every side of every label.
- Wrap the page tightly around the complete grid so all four outer margins match.
- Use one shared layout calculation for QR PDF and QR PNG exports so they line up identically.
- Apply the same shared margin and padding values to single-label printing.
- CSV export is unchanged because it has no visual page layout.

## Layout Calculation

For the selected rows and columns:

1. Select portrait or landscape from the dominant grid axis.
2. Calculate one square cell size from the dominant row or column count.
3. Calculate the complete grid width and height.
4. Derive custom page dimensions from the grid plus the shared outer margin.
5. Center a square QR inside each square cell using the shared label padding.

This preserves flexible row and column selection while keeping every QR and label consistently aligned.

## Components and Data Flow

- Public navigation removes region/currency controls while retaining language selection and enquiry cart access.
- Catalogue requests no longer send the selected price region and no longer offer price sorting.
- Catalogue cards omit price presentation and continue to link to product detail pages.
- Product detail presentation omits price and highlights WhatsApp as the primary action.
- The enquiry cart omits item prices and sends product names through WhatsApp as before.
- A pure shared QR layout helper calculates orientation, flexible page dimensions, square cell size, equal outer margins, and item coordinates.
- PDF and PNG generators consume the same helper output.
- Single-label print uses the same shared spacing constants in its print CSS.

## Error Handling

- Preserve existing empty-export and QR generation error messages.
- Clamp rows and columns to their existing supported ranges.
- Ensure calculated QR and cell sizes stay positive.
- Keep the synchronous print-window opening behavior so browsers do not block single-label printing.

## Verification

- Add focused automated checks for public price removal and shared QR layout behavior.
- Run existing catalogue, bulk QR, print QR, public copy, lint, and build checks.
- Visually inspect the catalogue, product detail, cart, and navigation at desktop and mobile widths.
- Generate representative PDF and PNG layouts with wide, tall, and square grids and inspect rendered output for equal gaps, square cells, centered grids, and matching PDF/PNG geometry.
