# Simplified Serial Export Modal Design

## Goal

Make serial exports easy to understand by centering the modal on the three choices admins commonly need:

1. Generated date range
2. Products
3. Export type

Keep uncommon controls available inside a collapsed Advanced options section.

## Default Modal

The modal opens with only these interactive controls visible:

- Generated date range with From and To date inputs
- A searchable multi-select product dropdown
- Export type radio buttons: CSV, QR PDF, and QR PNG
- A collapsed Advanced options trigger
- A live export summary
- One explicit Export button

The export type controls only choose a format. Selecting a format must not immediately start a download.

## Export Filters

### Generated Date Range

- Both dates are optional.
- No dates means all generated dates.
- One date may be used by itself as an open-ended range.
- A Clear dates action resets both dates.

### Products

- The product dropdown supports selecting more than one product.
- The dropdown is searchable and uses checkboxes.
- All products are included by default.
- The closed dropdown summarizes the selection, such as `Black Thunder, Cobra +2`.
- The modal shows the selected product count below the dropdown.

### Matching Records

The default export scope is all serials matching the modal's selected generated-date range and products.

Existing table search, status, scan-count, pagination, and sorting state must not silently change the default all-matching export. Selected rows and current page remain available as explicit advanced scopes.

## Export Type

Show CSV, QR PDF, and QR PNG as visible radio-card choices.

- One type is always selected.
- QR PDF is the initial default.
- Changing the selected type updates the summary and final button label.
- QR-specific layout controls appear only when QR PDF or QR PNG is selected.

## Advanced Options

Advanced options are collapsed when the modal opens.

When expanded, show:

- Row scope
  - All matching serials, selected by default
  - Selected rows
  - Current page
- QR sheet layout when a QR format is selected
  - Columns
  - Rows per sheet

Date and product filters still apply when Selected rows or Current page is chosen.

Unavailable scopes are disabled and show a zero count. For example, Selected rows is disabled when no rows are selected.

## Summary And Export Action

Above the final button, show a live summary containing:

- Matching serial count
- Selected date range or all generated dates
- Selected product count or all products
- Selected export type
- Advanced row scope when it is not All matching serials

The final button uses an explicit label such as `EXPORT 25 SERIALS`.

Disable the button when:

- No serials match
- The date range is invalid
- An export is already running

While exporting, keep the modal open and show progress on the button. Close the modal only after the export starts successfully. Preserve the current error behavior if generation or download fails.

## Component And Data Changes

- Replace the immediate-action export dropdown with controlled export-type radio cards and a final submit button.
- Add export-specific multi-product state.
- Add an expandable Advanced options region.
- Calculate and display the matching count before export.
- Extend the serial export query path to support multiple product IDs and accurate counts.
- Keep the existing CSV, QR PDF, QR PNG, and shared QR layout generation functions.

## Accessibility

- Use a fieldset and legend for export type and row scope radio groups.
- Make the product multi-select fully keyboard operable.
- Expose expanded state with `aria-expanded`.
- Announce changing match counts with a polite live region.
- Keep visible focus styles and descriptive button labels.

## Verification

- Confirm the modal opens with Advanced options collapsed.
- Confirm date range and multiple products determine the default all-matching count and export.
- Confirm table filters do not silently alter the default all-matching export.
- Confirm CSV, QR PDF, and QR PNG require the final Export button.
- Confirm QR layout controls appear only for QR formats.
- Confirm Selected rows and Current page still respect date and product filters.
- Confirm empty and invalid ranges disable export with clear feedback.
- Run focused serial export audits, lint, and build.
