# WhatsApp-Only Storefront Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the enquiry-cart experience so every product enquiry goes directly to WhatsApp, while preserving a graceful redirect for legacy `/cart` links.

**Architecture:** Keep `CommerceProvider` for language and regional settings, but remove its cart dictionary. Product pages retain their existing direct WhatsApp action; cart navigation, cart storage, and the add-to-cart component disappear. The old route becomes a server-side redirect to `/catalogue`.

**Tech Stack:** Next.js 15, React 18, TypeScript, Tailwind CSS, Node.js static audits.

---

### Task 1: Add a failing cart-removal audit

**Files:**
- Create: `scripts/audit-whatsapp-only-storefront.js`
- Modify: `package.json`

- [ ] **Step 1: Write the failing audit**

```js
const fs = require('fs');
const path = require('path');

const root = process.cwd();
const failures = [];
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

if (fs.existsSync(path.join(root, 'src/components/AddToCartButton.tsx'))) {
  failures.push('AddToCartButton must be removed.');
}

for (const relativePath of ['src/components/TopNavBar.tsx', 'src/components/ProductDetailClient.tsx']) {
  const source = read(relativePath);
  if (source.includes('/cart') || source.includes('AddToCartButton') || source.includes('shopping_cart')) {
    failures.push(`${relativePath} still exposes a cart control.`);
  }
}

const cartRoute = read('src/app/cart/page.tsx');
if (!cartRoute.includes('redirect("/catalogue")')) {
  failures.push('The legacy cart route must redirect to the catalogue.');
}

if (failures.length) {
  console.error('WhatsApp-only storefront audit failed:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log('The storefront routes every product enquiry through WhatsApp.');
```

- [ ] **Step 2: Add `"audit:whatsapp-only": "node scripts/audit-whatsapp-only-storefront.js"` to `package.json` and run it**

Run: `npm run audit:whatsapp-only`

Expected: failure because the add-to-cart component, header control, product action, and cart page still exist.

### Task 2: Remove cart controls and storage

**Files:**
- Delete: `src/components/AddToCartButton.tsx`
- Modify: `src/components/ProductDetailClient.tsx`
- Modify: `src/components/TopNavBar.tsx`
- Modify: `src/components/CommerceProvider.tsx`
- Modify: `src/app/cart/page.tsx`

- [ ] **Step 1: Remove the `AddToCartButton` import and JSX from `ProductDetailClient.tsx`, keeping the direct WhatsApp link and catalogue back link.**

- [ ] **Step 2: Remove the cart link and its `openCart` translation from `TopNavBar.tsx` and `CommerceProvider.tsx`. Remove the complete `cart` dictionary type and English/Indonesian dictionary sections.**

- [ ] **Step 3: Replace `src/app/cart/page.tsx` with the server redirect below and delete `AddToCartButton.tsx`.**

```tsx
import { redirect } from "next/navigation";

export default function CartPage() {
  redirect("/catalogue");
}
```

- [ ] **Step 4: Run the new audit**

Run: `npm run audit:whatsapp-only`

Expected: `The storefront routes every product enquiry through WhatsApp.`

### Task 3: Update repository audits for the removed feature

**Files:**
- Modify: `scripts/audit-page-completion.js`
- Modify: `scripts/audit-public-indonesian-copy.js`
- Modify: `scripts/audit-public-pricing.js`
- Modify: `scripts/audit-settings-workflow.js`
- Modify: `package.json`

- [ ] **Step 1: Remove cart-specific source assertions and consumers from the four existing audits.**

- [ ] **Step 2: Add `npm run audit:whatsapp-only` to the `verify` script after the route audit.**

- [ ] **Step 3: Run the related audits**

Run: `npm run audit:whatsapp-only; npm run audit:pages; npm run audit:public-id-copy; npm run audit:public-pricing; npm run audit:settings`

Expected: all audits pass and none reads a cart page as a public consumer.

### Task 4: Verify and publish

**Files:**
- Verify: `src/app/cart/page.tsx`
- Verify: `src/components/ProductDetailClient.tsx`
- Verify: `src/components/TopNavBar.tsx`
- Verify: `src/components/CommerceProvider.tsx`

- [ ] **Step 1: Run the production build**

Run: `npm run build`

Expected: Next.js builds successfully without cart import or translation errors.

- [ ] **Step 2: Verify the catalogue in a browser**

Run: start the local development server and open `/catalogue`.

Expected: no shopping-cart icon appears in the header; a product detail page exposes its WhatsApp enquiry action; `/cart` redirects to `/catalogue`.

- [ ] **Step 3: Review, commit, and push all requested pending changes**

Run: `git diff --check; git status --short; git add package.json src scripts docs; git commit -m "feat: make storefront WhatsApp-only"; git push`

Expected: no whitespace errors, a clean commit, and the current feature branch is published.
