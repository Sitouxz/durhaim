# WhatsApp Icon Replacement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Show the WhatsApp brand mark in the footer contact row and floating contact button while preserving their WhatsApp destinations.

**Architecture:** A reusable `WhatsAppIcon` component owns the inline SVG. The footer and floating action button render that component, retaining their existing layout and hover classes; the footer link changes from `tel:` to the existing WhatsApp URL builder.

**Tech Stack:** Next.js 15, React 18, TypeScript, Tailwind CSS, Node.js static audit.

---

### Task 1: Add a regression audit for WhatsApp contact icons

**Files:**
- Create: `scripts/audit-whatsapp-icons.js`
- Modify: `package.json`

- [ ] **Step 1: Write the failing audit**

```js
const fs = require('fs');
const path = require('path');

const root = process.cwd();
const footer = fs.readFileSync(path.join(root, 'src/components/Footer.tsx'), 'utf8');
const fab = fs.readFileSync(path.join(root, 'src/components/WhatsAppFAB.tsx'), 'utf8');

for (const [name, source] of [['Footer', footer], ['WhatsAppFAB', fab]]) {
  if (!source.includes('WhatsAppIcon')) {
    throw new Error(`${name} must render WhatsAppIcon.`);
  }
}

if (!footer.includes('href={buildWhatsAppUrl(siteSettings)}')) {
  throw new Error('Footer contact number must open WhatsApp.');
}

console.log('WhatsApp icon usage is configured.');
```

- [ ] **Step 2: Add `"audit:whatsapp-icons": "node scripts/audit-whatsapp-icons.js"` to the `scripts` object in `package.json` and run it**

Run: `npm run audit:whatsapp-icons`

Expected: failure because neither component imports or renders `WhatsAppIcon`.

### Task 2: Create and use the WhatsApp brand icon

**Files:**
- Create: `src/components/WhatsAppIcon.tsx`
- Modify: `src/components/Footer.tsx`
- Modify: `src/components/WhatsAppFAB.tsx`

- [ ] **Step 1: Implement the reusable icon component**

```tsx
import type { SVGProps } from "react";

export default function WhatsAppIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M12.004 2.003a9.99 9.99 0 0 0-8.47 15.281L2.05 21.93l4.76-1.438a9.97 9.97 0 0 0 5.194 1.455h.004c5.514 0 9.997-4.486 9.997-10a9.94 9.94 0 0 0-2.929-7.071 9.94 9.94 0 0 0-7.072-2.928Zm0 18.306h-.003a8.29 8.29 0 0 1-4.227-1.154l-.304-.18-2.825.854.887-2.755-.198-.283A8.27 8.27 0 0 1 3.72 12.003a8.284 8.284 0 0 1 8.285-8.285 8.284 8.284 0 0 1 8.284 8.285 8.284 8.284 0 0 1-8.285 8.306Zm4.542-6.22c-.249-.124-1.472-.727-1.7-.81-.228-.083-.394-.124-.56.124-.165.249-.642.81-.787.976-.145.165-.29.186-.538.062-.249-.125-1.05-.387-2-1.234-.739-.659-1.238-1.474-1.383-1.722-.145-.249-.016-.383.109-.507.112-.112.248-.29.373-.435.124-.145.165-.248.248-.414.083-.165.041-.31-.02-.435-.062-.124-.56-1.348-.767-1.846-.201-.482-.406-.417-.56-.425a10.77 10.77 0 0 0-.476-.009c-.165 0-.435.062-.663.31-.228.248-.87.852-.87 2.078 0 1.225.89 2.409 1.015 2.575.124.165 1.752 2.675 4.244 3.752.592.256 1.055.408 1.416.521.595.19 1.137.163 1.565.099.477-.071 1.472-.603 1.68-1.184.207-.581.207-1.08.145-1.184-.062-.104-.228-.166-.477-.29Z" />
    </svg>
  );
}
```

- [ ] **Step 2: Replace the footer `phone` material symbol with `<WhatsAppIcon className="h-4 w-4 shrink-0" />`, import the component, and change its contact link to `buildWhatsAppUrl(siteSettings)` with a new-tab `target` and `rel`.**

- [ ] **Step 3: Replace the floating button `chat` material symbol with `<WhatsAppIcon className="h-6 w-6 text-stark-white group-hover:text-tactical-black" />` and import the component.**

- [ ] **Step 4: Run the audit**

Run: `npm run audit:whatsapp-icons`

Expected: `WhatsApp icon usage is configured.`

### Task 3: Verify the production build

**Files:**
- Verify: `src/components/WhatsAppIcon.tsx`
- Verify: `src/components/Footer.tsx`
- Verify: `src/components/WhatsAppFAB.tsx`

- [ ] **Step 1: Run the focused audit and production build**

Run: `npm run audit:whatsapp-icons; npm run build`

Expected: audit passes and Next.js completes the production build without TypeScript or compilation errors.

- [ ] **Step 2: Inspect the diff**

Run: `git diff --check; git diff -- src/components/WhatsAppIcon.tsx src/components/Footer.tsx src/components/WhatsAppFAB.tsx scripts/audit-whatsapp-icons.js package.json`

Expected: no whitespace errors; only the shared WhatsApp icon, its two uses, the WhatsApp destination adjustment, and the focused audit are present.
