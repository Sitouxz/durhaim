# Complete Incomplete Features Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the current static/inert Durhaim prototype into a working storefront, verification system, and admin dashboard with functional controls.

**Architecture:** Fix the data layer first because most broken flows come from missing Supabase tables. Then convert public catalogue/search, verification, admin serial/product workflows, and global controls from static markup into small client/server modules that use existing Next.js App Router APIs.

**Tech Stack:** Next.js 14 App Router, React 18, TypeScript, Supabase JS, Tailwind CSS, `qrcode`, optional lightweight Node audit scripts.

---

## File Structure

- Modify `supabase/schema.sql`: make schema idempotent, add proper product/category relationships, seed data with foreign keys, and optional settings/newsletter tables.
- Create `src/lib/catalogue-data.ts`: shared static fallback catalogue used when Supabase is not configured or empty.
- Modify `src/app/api/products/route.ts`: use fallback data on missing-table errors and fix category filtering.
- Modify `src/app/api/admin/products/route.ts`: return predictable product rows and useful errors.
- Modify `src/app/api/admin/serials/route.ts`: validate requests, generate unique serial batches, filter by status/search, export support.
- Modify `src/app/api/verify/route.ts`: normalize serial behavior and return stable product payloads.
- Modify `src/app/catalogue/page.tsx`: replace static controls with working search/filter/sort/pagination and product actions.
- Create `src/app/catalogue/[slug]/page.tsx`: product detail page for “View Details”.
- Modify `src/components/TopNavBar.tsx`: working search submit and cart link/state.
- Create `src/app/cart/page.tsx`: minimal enquiry cart page backed by local storage.
- Modify `src/components/Footer.tsx`: working contact/latest links and newsletter submit.
- Create `src/app/contact/page.tsx`: contact/support page.
- Create `src/app/latest-projects/page.tsx`: projects page or redirect to social engagement.
- Modify `src/components/SerialChecker.tsx`: replace QR guide placeholder with real route.
- Create `src/app/qr-guide/page.tsx`: QR scanning guidance page.
- Modify `src/app/battle-proven/page.tsx`: replace `href="#"` with a real catalogue/social route.
- Modify `src/app/admin/page.tsx`: load dashboard metrics from APIs.
- Modify `src/app/admin/products/page.tsx`: add error/empty states and link to public product pages.
- Modify `src/app/admin/serials/page.tsx`: implement filter/export and robust API error UI.
- Modify `src/app/admin/layout.tsx`: sign-out behavior or clearly route to login.
- Create `src/app/admin/login/page.tsx`: placeholder-free admin login surface if full auth is not implemented yet.
- Create `scripts/audit-routes.js`: route-reference audit.
- Create `scripts/audit-inert-controls.js`: static check for placeholder links/buttons.
- Modify `package.json`: add `audit:routes`, `audit:controls`, and optionally `test:smoke`.

---

### Task 1: Stabilize Supabase Schema and Seed Data

**Files:**
- Modify: `supabase/schema.sql`

- [ ] **Step 1: Rewrite schema to be idempotent**

Use `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";` and `CREATE TABLE IF NOT EXISTS` for every table:

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  icon TEXT
);
```

- [ ] **Step 2: Fix product seed relationships**

Seed categories first, then products with `category_id` subqueries:

```sql
INSERT INTO public.products (name, slug, description, price, category_id, is_published)
VALUES
(
  'TBP VEST MK-IV',
  'tbp-vest-mk-iv',
  'DURABILITY HARD IMPACT & MODULAR',
  1850000,
  (SELECT id FROM public.categories WHERE slug = 'vest'),
  true
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  category_id = EXCLUDED.category_id,
  is_published = EXCLUDED.is_published;
```

- [ ] **Step 3: Add one valid serial tied to a product**

```sql
INSERT INTO public.serial_numbers (serial, product_id, status)
VALUES (
  'DRH-TEST-260520-XXXX',
  (SELECT id FROM public.products WHERE slug = 'tbp-vest-mk-iv'),
  'ACTIVE'
)
ON CONFLICT (serial) DO UPDATE SET
  product_id = EXCLUDED.product_id,
  status = EXCLUDED.status;
```

- [ ] **Step 4: Apply schema**

Run the SQL in the configured Supabase project SQL editor, or via Supabase CLI if linked:

```bash
supabase db push
```

Expected: tables `categories`, `products`, `serial_numbers`, `serial_lists`, and `verification_logs` exist in `public`.

- [ ] **Step 5: Verify APIs stop returning missing-table errors**

Run:

```powershell
Invoke-WebRequest -Uri 'http://127.0.0.1:3001/api/products' -UseBasicParsing
Invoke-WebRequest -Uri 'http://127.0.0.1:3001/api/admin/products' -UseBasicParsing
Invoke-WebRequest -Uri 'http://127.0.0.1:3001/api/admin/serials' -UseBasicParsing
```

Expected: `200` responses, no `PGRST205`.

---

### Task 2: Add API Fallbacks and Better Errors

**Files:**
- Create: `src/lib/catalogue-data.ts`
- Modify: `src/app/api/products/route.ts`
- Modify: `src/app/api/admin/products/route.ts`

- [ ] **Step 1: Create fallback catalogue**

```ts
export type CatalogueProduct = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  category: { name: string; slug: string };
  images: string[];
  tags: string[];
};

export const fallbackProducts: CatalogueProduct[] = [
  {
    id: 'fallback-tbp-vest',
    name: 'TBP VEST MK-IV',
    slug: 'tbp-vest-mk-iv',
    description: 'DURABILITY HARD IMPACT & MODULAR',
    price: 1850000,
    category: { name: 'Vest & Chestrig', slug: 'vest' },
    images: ['https://lh3.googleusercontent.com/aida/ADBb0uhHmarY6x8tQQajILZYGhdMrE_-8N5sRpGivbjfVr7JV1GKgh1VPOJ5UwwZq8boGUAATN8Qo2TJt70_N3aFkd0KyOTZdkRBzyUxSj2dm9l1ZquJ2XLAk_BfM1vXPEdXbeOy3ZRiMPtCuihStQPqlz-Ljk89EELaFmWl1P5VsCg2rZ5Tgknyxr3uqk4ZdS-STDpVubokBOe0xfV1lk0DyQ6J3FtvcnBqUk1-fyua1f5e22SHPkccNAigEb-M'],
    tags: ['BATTLE PROVEN'],
  },
];
```

- [ ] **Step 2: Return fallback for missing Supabase tables in public products API**

In `src/app/api/products/route.ts`, when `error.code === 'PGRST205'`, filter/sort/page `fallbackProducts` and return `200`.

- [ ] **Step 3: Return explicit setup error for admin APIs**

Admin APIs should return:

```ts
return NextResponse.json(
  { error: 'Database schema is not installed. Apply supabase/schema.sql.' },
  { status: 503 }
);
```

Expected: public catalogue still works without DB; admin clearly reports setup needed.

- [ ] **Step 4: Verify**

Run:

```bash
npm run lint
npm run build
```

Expected: both pass.

---

### Task 3: Make Catalogue Controls Real

**Files:**
- Modify: `src/app/catalogue/page.tsx`
- Create: `src/app/catalogue/[slug]/page.tsx`

- [ ] **Step 1: Convert catalogue page to a client component**

Add `'use client';`, state for `category`, `query`, `sort`, `page`, `products`, `loading`, and `error`.

- [ ] **Step 2: Fetch products when controls change**

```ts
const params = new URLSearchParams();
if (category !== 'all') params.set('category', category);
if (query.trim()) params.set('search', query.trim());
params.set('sort', sort);
params.set('page', String(page));

const res = await fetch(`/api/products?${params.toString()}`);
```

- [ ] **Step 3: Wire checkboxes as category filters**

Use one selected category at a time: `all`, `vest`, `pack`, `belt`, `accessories`.

- [ ] **Step 4: Wire search form**

Search submit resets `page` to `1` and calls fetch via state.

- [ ] **Step 5: Wire sort dropdown**

Sort values: `newest`, `price-high`, `price-low`.

- [ ] **Step 6: Replace “View Details” buttons with links**

```tsx
<Link href={`/catalogue/${product.slug}`} className="...">
  VIEW DETAILS
</Link>
```

- [ ] **Step 7: Create product detail route**

`src/app/catalogue/[slug]/page.tsx` should fetch `/api/products`, find the matching slug, show product name, image, description, price, and WhatsApp enquiry link.

- [ ] **Step 8: Verify**

Manual checks:

```text
/catalogue?category=vest filters to vest products.
Search for "vest" narrows products.
Sort price high/low changes order when data has prices.
View Details opens /catalogue/tbp-vest-mk-iv.
```

---

### Task 4: Complete Verification UX

**Files:**
- Modify: `src/components/SerialChecker.tsx`
- Modify: `src/app/verify/page.tsx`
- Modify: `src/app/api/verify/route.ts`
- Modify: `src/app/verify/[serial]/page.tsx`
- Create: `src/app/qr-guide/page.tsx`

- [ ] **Step 1: Normalize serial consistently**

Use:

```ts
const normalizedSerial = serial.trim().toUpperCase();
```

in the homepage checker, `/verify` page, API route, and certificate page.

- [ ] **Step 2: Replace QR guide placeholder**

Change:

```tsx
href="#"
```

to:

```tsx
href="/qr-guide"
```

- [ ] **Step 3: Create QR guide page**

Include three sections: scan QR, verify URL domain, contact support if serial is not found.

- [ ] **Step 4: Make certificate page display revoked and missing states distinctly**

Show `AUTHENTIC`, `REVOKED`, or `UNVERIFIED` instead of one generic false state.

- [ ] **Step 5: Verify**

Run:

```powershell
Invoke-WebRequest -Uri 'http://127.0.0.1:3001/api/verify' -Method POST -Body '{"serial":"DRH-TEST-260520-XXXX"}' -ContentType 'application/json' -UseBasicParsing
```

Expected after DB setup: `{ "found": true, ... }`.

---

### Task 5: Complete Admin Serials

**Files:**
- Modify: `src/app/api/admin/serials/route.ts`
- Modify: `src/app/admin/serials/page.tsx`

- [ ] **Step 1: Add status filter to GET**

Read `status` from `searchParams`; apply `.eq('status', status)` when it is `ACTIVE`, `USED`, or `REVOKED`.

- [ ] **Step 2: Implement filter control**

Replace inert `FILTER` button with a `<select>` bound to status, then refetch serials.

- [ ] **Step 3: Implement CSV export**

Add client function:

```ts
const exportCsv = () => {
  const rows = serials.map((s) => [
    s.serial,
    getProductName(s.products),
    s.status,
    s.verification_count ?? 0,
    new Date(s.created_at).toISOString(),
  ]);
  const csv = [['Serial', 'Product', 'Status', 'Scans', 'Generated'], ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(','))
    .join('\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = 'durhaim-serials.csv';
  a.click();
  URL.revokeObjectURL(url);
};
```

- [ ] **Step 4: Prevent duplicate serials during batch generation**

In API, generate more candidates than needed, insert, and if Supabase unique conflict occurs, retry once with fresh candidates.

- [ ] **Step 5: Verify**

Manual checks: search, status filter, export download, generate batch, revoke, restore, print QR.

---

### Task 6: Complete Admin Products and Dashboard

**Files:**
- Modify: `src/app/admin/products/page.tsx`
- Modify: `src/app/admin/page.tsx`
- Modify: `src/app/api/admin/products/route.ts`

- [ ] **Step 1: Add useful product payload**

Admin products API should select `id, name, slug, price, is_published, categories(name, slug), serial_numbers(count)`.

- [ ] **Step 2: Show API error state**

If fetch fails, display the response `error` message in a bordered warning panel.

- [ ] **Step 3: Make dashboard metrics dynamic**

Fetch admin products and serials. Compute:

```ts
totalProducts = products.length;
activeSerials = serials.filter((s) => s.status === 'ACTIVE').length;
revokedSerials = serials.filter((s) => s.status === 'REVOKED').length;
verificationTotal = serials.reduce((sum, s) => sum + (s.verification_count ?? 0), 0);
```

- [ ] **Step 4: Verify**

Expected: admin dashboard reflects API data or shows a clear database setup error.

---

### Task 7: Complete Global Header, Footer, and Cart

**Files:**
- Modify: `src/components/TopNavBar.tsx`
- Modify: `src/components/Footer.tsx`
- Create: `src/app/cart/page.tsx`
- Create: `src/app/contact/page.tsx`
- Create: `src/app/latest-projects/page.tsx`
- Create: `src/app/api/newsletter/route.ts`

- [ ] **Step 1: Header search redirects to catalogue**

On submit:

```ts
router.push(`/catalogue?search=${encodeURIComponent(search.trim())}`);
```

- [ ] **Step 2: Cart button links to `/cart`**

Use `<Link href="/cart">` around the cart icon.

- [ ] **Step 3: Create cart page**

Read `localStorage.durhaimCart`, list items, allow remove/clear, and provide WhatsApp enquiry CTA.

- [ ] **Step 4: Footer contact links**

Change footer placeholders:

```tsx
<Link href="/contact">Contact</Link>
<Link href="/latest-projects">Latest Projects</Link>
```

- [ ] **Step 5: Newsletter API**

Create route that validates email and returns `{ ok: true }`. If a `newsletter_subscribers` table exists later, insert there.

- [ ] **Step 6: Footer newsletter submit**

Make footer a client component or extract `NewsletterForm`. Show success/error message after submit.

- [ ] **Step 7: Verify**

Manual checks: header search opens catalogue with query, cart route works, footer links resolve, newsletter submit shows success.

---

### Task 8: Admin Auth and Sign Out

**Files:**
- Create: `src/app/admin/login/page.tsx`
- Modify: `src/app/admin/layout.tsx`
- Optional create: `src/middleware.ts`

- [ ] **Step 1: Decide auth depth**

For a minimal implementation, sign-out routes to `/admin/login`. For full implementation, wire Supabase Auth.

- [ ] **Step 2: Minimal sign-out behavior**

Convert admin layout to a client shell or extract a `SignOutButton` component:

```tsx
'use client';

import { useRouter } from 'next/navigation';

export function SignOutButton() {
  const router = useRouter();
  return (
    <button onClick={() => router.push('/admin/login')} className="...">
      Sign Out
    </button>
  );
}
```

- [ ] **Step 3: Create login page**

Show email/password fields and a disabled or working login depending on auth choice. Do not leave any button inert: if auth is not wired, route back to `/admin` with clear demo wording.

- [ ] **Step 4: Verify**

Click Sign Out; expected URL `/admin/login`.

---

### Task 9: Replace Remaining Placeholder Links

**Files:**
- Modify: `src/app/battle-proven/page.tsx`
- Modify: `src/components/SerialChecker.tsx`
- Modify: `src/components/Footer.tsx`

- [ ] **Step 1: Replace Battle Proven `href="#"`**

Choose the most relevant target:

```tsx
href="/catalogue?category=vest"
```

- [ ] **Step 2: Run static inert-control audit**

Create `scripts/audit-inert-controls.js` that fails on `href="#"` and buttons without `onClick`, `type="submit"`, or a wrapping link.

- [ ] **Step 3: Add package script**

```json
"audit:controls": "node scripts/audit-inert-controls.js"
```

- [ ] **Step 4: Verify**

Run:

```bash
npm run audit:controls
```

Expected: no placeholder links; known submit buttons allowed.

---

### Task 10: Final Verification Pass

**Files:**
- Modify: `package.json`
- Create: `scripts/audit-routes.js`

- [ ] **Step 1: Add route audit script**

Use the already-tested route-reference scanner to ensure internal links have pages.

- [ ] **Step 2: Add scripts**

```json
"audit:routes": "node scripts/audit-routes.js",
"verify": "npm run lint && npm run audit:routes && npm run audit:controls && npm run build"
```

- [ ] **Step 3: Run full verification**

```bash
npm run verify
```

Expected: lint, route audit, control audit, and build pass.

- [ ] **Step 4: Manual smoke checklist**

```text
Homepage serial checker: valid serial shows certificate link.
/verify form: redirects to /verify/[serial].
Catalogue: search, category, sort, pagination, detail page.
Header: search and cart.
Footer: contact, latest projects, newsletter.
Admin: products, serial search/filter/export, generate, revoke, restore, print QR.
Admin: sign out goes to login.
```

---

## Implementation Order

1. Task 1: Supabase schema and seed data.
2. Task 2: API fallbacks and errors.
3. Task 3: Catalogue.
4. Task 4: Verification.
5. Task 5: Admin serials.
6. Task 6: Admin products/dashboard.
7. Task 7: Header/footer/cart/contact/newsletter.
8. Task 8: Admin auth/sign-out.
9. Task 9: Placeholder cleanup.
10. Task 10: Verification scripts and smoke pass.

## Spec Coverage Review

- Supabase missing-table runtime failures: covered by Tasks 1 and 2.
- Static catalogue filters/search/sort/pagination/details: covered by Task 3.
- Verification and QR guide placeholders: covered by Task 4.
- Admin serial generation/filter/export/revoke/restore: covered by Task 5.
- Admin product/dashboard data: covered by Task 6.
- Header search/cart and footer links/newsletter: covered by Task 7.
- Admin sign-out/login: covered by Task 8.
- Remaining `href="#"` placeholders: covered by Task 9.
- Regression prevention: covered by Task 10.

