# 🛡️ DURHAIM — Product Requirements Document (PRD)

> **Project:** Durhaim Tactical Gear Website
> **Version:** 1.0
> **Date:** 2026-05-20
> **Design System:** Ironclad Vanguard (Dark Tactical Theme)
> **Status:** Approved

---

## 1. Executive Summary

Durhaim is a tactical gear brand website built to project **authority, reliability, and operational readiness**. The platform serves two core objectives:

1. **Commerce** — Showcase products and convert visitors into buyers via WhatsApp-based ordering.
2. **Authenticity** — Provide a verifiable product authenticity system using unique serial numbers, QR codes, and shareable certificate pages.

The website will consist of a **public-facing storefront** and a **protected admin dashboard**.

---

## 2. Target Users

| Persona | Description |
|---------|-------------|
| **Buyer** | End consumers browsing products, checking authenticity, and placing orders via WhatsApp |
| **Reseller / Dealer** | Partners verifying product authenticity for their customers |
| **Admin** | Internal team managing products, generating serial numbers, and printing QR labels |

---

## 3. Core Features

### 3.1 🏠 Homepage (Public)

The homepage is the primary storefront and authenticity verification hub.

#### 3.1.1 Hero Section
- Full-bleed hero image/video with bold headline (Archivo Narrow, uppercase)
- Primary CTA: "EXPLORE GEAR" or "CHECK AUTHENTICITY"
- Design: dark tactical aesthetic per Ironclad Vanguard design system

#### 3.1.2 Product Catalog
- Grid/list view of all products with:
  - Product image (desaturated tactical treatment)
  - Product name (headline-md, uppercase)
  - Price display (data-mono font)
  - "ORDER NOW" button → opens WhatsApp with pre-filled message
  - Category/tag badges (e.g., "BATTLE PROVEN", "NEW ISSUE")
- Filter by category, price range, availability
- Sort by: newest, price (low→high, high→low), popular

#### 3.1.3 Serial Number Authenticity Checker
- Prominent input field with tactical styling (charcoal background, signal-orange focus border)
- User enters serial number → system validates against database
- **Valid Result:** Shows product details, purchase date, authenticity status with green "VERIFIED" badge, and link to full certificate page
- **Invalid Result:** Shows "SERIAL NOT FOUND" warning with contact support option
- Uses JetBrains Mono for serial number display (per design system)

#### 3.1.4 Brand Story / About Section
- Brief brand narrative emphasizing reliability and tactical heritage
- Key stats (products shipped, countries, years of service)

#### 3.1.5 Footer
- Contact info, social links, WhatsApp shortcut
- Legal links (privacy, terms)

---

### 3.2 💬 WhatsApp Ordering System

#### 3.2.1 Direct Order Button
- Each product card has an "ORDER VIA WHATSAPP" button
- Opens WhatsApp (web or app) with pre-filled message:
  ```
  Hi Durhaim, I would like to order:
  🛡️ Product: [Product Name]
  💰 Price: [Price]
  🔗 Link: [Product URL]
  ```
- Button uses `https://wa.me/{PHONE_NUMBER}?text={ENCODED_MESSAGE}` format
- Phone number configurable from admin dashboard

#### 3.2.2 Floating WhatsApp Button
- Fixed position: bottom-right corner (24px from edges)
- WhatsApp green icon with subtle pulse animation on idle
- On hover: expands to show "Chat with us" label
- Persists across all public pages
- Pre-filled general inquiry message:
  ```
  Hi Durhaim, I would like to ask about your products.
  ```

---

### 3.3 📜 Product Authenticity Certificate Page

Each verified product gets a unique, shareable certificate page.

#### 3.3.1 Certificate Content
- **URL Structure:** `durhaim.com/verify/{serial_number}`
- Displays:
  - Durhaim logo + "AUTHENTICITY CERTIFICATE" header
  - Product name and image
  - Serial number (JetBrains Mono, large)
  - QR code (self-referencing the certificate URL)
  - Verification status badge ("✅ AUTHENTIC" or "⚠️ UNVERIFIED")
  - Date of manufacture / registration
  - Product specifications summary
  - Unique certificate ID

#### 3.3.2 Shareability
- Fully shareable URL (no authentication required to view)
- Open Graph meta tags for rich social media preview:
  - Title: "Durhaim Authenticity Certificate — [Product Name]"
  - Description: "Serial: [SN] — Verified authentic by Durhaim"
  - Image: Product thumbnail or certificate preview
- Copy-to-clipboard button for the URL
- Share buttons: WhatsApp, Facebook, Twitter/X
- Downloadable as PDF or image (print-ready)

#### 3.3.3 Anti-Fraud Measures
- Rate limiting on verification endpoint (prevent brute-force serial guessing)
- Log each verification attempt (IP, timestamp, serial queried)
- Optional: Show verification count ("This product has been verified X times")

---

### 3.4 🔧 Admin Dashboard (Protected)

Accessible at `/admin` with authentication.

#### 3.4.1 Authentication
- Email/password login
- Session-based or JWT authentication
- Role: Admin (full access)

#### 3.4.2 Product Management
- **CRUD Operations:**
  - Create new product (name, description, price, images, category, specifications)
  - Edit existing products
  - Delete / archive products
  - Toggle product visibility (draft / published)
- **Image Upload:** Support multiple images per product
- **Categories:** Create and manage product categories
- **Rich Text Editor:** For product descriptions

#### 3.4.3 Serial Number Management
- **Generate Serial Numbers:**
  - Single generation or batch generation (e.g., generate 100 serials for "Product X")
  - Serial format: `DRH-{CATEGORY}-{YYMMDD}-{RANDOM_4CHAR}` (e.g., `DRH-TBP-260520-A3F7`)
  - Auto-associate with a product
  - Set status: ACTIVE, USED, REVOKED
- **QR Code Generation:**
  - Each serial number gets a QR code pointing to `durhaim.com/verify/{serial_number}`
  - QR codes rendered as high-resolution images
  - **Print-Ready Export:**
    - Single QR label (customizable size: 30x30mm, 40x40mm, 50x50mm)
    - Batch print layout (grid of QR labels on A4/Letter paper)
    - Export formats: PDF, PNG
    - QR label includes: QR code + serial number text + Durhaim branding
- **Serial Number Table:**
  - Searchable, sortable, paginated list
  - Columns: Serial, Product, Status, Created Date, Verification Count
  - Bulk actions: revoke, export CSV

#### 3.4.4 Dashboard Overview
- Total products count
- Total serial numbers (active / used / revoked)
- Recent verification attempts
- Quick-action buttons

---

## 4. Additional Features (In Scope)

### 4.1 📊 Analytics Dashboard (Admin)
- Product view counts and trending products
- Verification attempt trends (daily/weekly/monthly)
- Geographic distribution of verifications
- WhatsApp click-through rates per product
- Top verified products

### 4.2 🌐 Multi-Language Support (ID / EN)
- Toggle between Bahasa Indonesia and English
- All public-facing content translatable
- Admin dashboard in English (default)

### Deferred Features (Future Phases)

| Feature | Description |
|---------|-------------|
| 🔒 Warranty Tracker | Warranty period per serial, auto-expiry, admin extend/void |
| 📍 Dealer Locator | Map-based authorized reseller directory |
| 🎛️ Gear Configurator | Interactive product builder with live preview |
| ⭐ Community Reviews | Verified buyer reviews linked to serial numbers |

---

## 5. Tech Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **Frontend** | Next.js 14 (App Router) | SSR for SEO, dynamic routes for certificates |
| **Styling** | Vanilla CSS + CSS Variables | Per Ironclad Vanguard design system tokens |
| **Backend** | Next.js API Routes | API for products, serials, auth |
| **Database** | Supabase (PostgreSQL) | Auth, storage, real-time, free tier |
| **QR Generation** | `qrcode` npm library | Client + server-side QR rendering |
| **PDF Export** | `jspdf` + `html2canvas` | Print-ready QR labels and certificates |
| **Image Storage** | Supabase Storage | Product images, QR assets |
| **Deployment** | Vercel or Netlify | Optimized for Next.js |
| **Fonts** | Google Fonts | Archivo Narrow, Inter, JetBrains Mono |

---

## 6. Data Models (High-Level)

### Products
```
Product {
  id: UUID
  name: string
  slug: string
  description: text
  price: decimal
  category_id: FK
  images: string[]
  specifications: jsonb
  is_published: boolean
  created_at: timestamp
  updated_at: timestamp
}
```

### Categories
```
Category {
  id: UUID
  name: string
  slug: string
  icon: string (optional)
}
```

### Serial Numbers
```
SerialNumber {
  id: UUID
  serial: string (unique, indexed)
  product_id: FK → Product
  list_id: FK → SerialList (nullable)        // Maps to WP "Lists of codes" batches
  status: enum (ACTIVE, USED, REVOKED)
  link: string (nullable)                     // WP legacy: associated URL
  ordered: boolean (default: false)           // WP legacy: order flag
  svp: string (nullable)                      // WP legacy: SVP field
  warranty_expires_at: timestamp (nullable)
  verification_count: integer (default: 0)
  wp_imported: boolean (default: false)       // Migration flag
  created_at: timestamp
}
```

### Serial Lists (Batches)
```
SerialList {
  id: UUID
  name: string                                // e.g., "Iannas 2023 (1000 dlc)"
  product_id: FK → Product (nullable)
  total_codes: integer
  created_at: timestamp
}
```

### Verification Logs
```
VerificationLog {
  id: UUID
  serial_id: FK → SerialNumber
  ip_address: string
  user_agent: string
  verified_at: timestamp
}
```

### Admin Users
```
AdminUser {
  id: UUID
  email: string (unique)
  password_hash: string
  role: enum (SUPER_ADMIN, ADMIN)
  created_at: timestamp
}
```

---

## 7. Page Map

```
PUBLIC PAGES                          ADMIN PAGES
─────────────                         ───────────
🏠 Homepage                           🔐 Admin Login
  ├─ 📦 Product Detail                  └─ 📊 Admin Dashboard
  │    └─ 💬 WhatsApp Order                  ├─ 📦 Product Management
  └─ 🔍 Authenticity Checker                 ├─ 🔢 Serial Number Manager
       └─ 📜 Certificate /verify/:serial     ├─ 🖨️ QR Print Generator
                                             └─ 📈 Analytics
```

---

## 8. Non-Functional Requirements

| Requirement | Target |
|------------|--------|
| **Performance** | < 2s First Contentful Paint |
| **Mobile Responsive** | Full responsiveness (mobile-first) |
| **SEO** | SSR pages with proper meta tags |
| **Security** | Rate-limited APIs, hashed passwords, HTTPS |
| **Accessibility** | WCAG 2.1 AA compliance |
| **Browser Support** | Chrome, Firefox, Safari, Edge (latest 2 versions) |

---

## 9. Milestones

| Phase | Scope | Est. Duration |
|-------|-------|---------------|
| **Phase 1** | Homepage, Product Catalog, WhatsApp Order, Floating Button, Multi-Language | 1-2 weeks |
| **Phase 2** | Serial Number System, Authenticity Checker, Certificate Page, QR Generation | 1-2 weeks |
| **Phase 3** | Admin Dashboard (Products CRUD, Serial Management, QR Print, Analytics) | 2-3 weeks |
| **Phase 4** | WordPress Serial Code Migration + Data Validation | 1 week |

---

## 10. WordPress Migration Plan

Existing serial codes will be migrated from the **Serial Codes Validator** WordPress plugin (v2.8.6 Premium) **after** the new website is fully built and tested.

### 10.1 Existing Plugin Data Structure

From the WordPress plugin, we have:

| Data | Fields | Notes |
|------|--------|-------|
| **Lists of Codes** | Name, Created date | Batch groupings (e.g., "Iannas 2023 (1000 dlc)", "balaad 2021 10 000", "Nike 2021 5000 codes") |
| **Codes** | Code, Link, Created, Ordered, SVP, Status, Used | Individual serial codes with tracking fields |
| **IP List** | IP, Code, Created, Code Status | Verification attempt logs per IP address |

### 10.2 Migration Strategy

```
1. EXPORT  →  Export all data from WP plugin (CSV/JSON via plugin's export feature)
2. MAP     →  Map WP fields to new database schema:
               - WP "Lists"    → SerialList table
               - WP "Codes"    → SerialNumber table (with legacy fields preserved)
               - WP "IP List"  → VerificationLog table
3. IMPORT  →  Run migration script to bulk insert into Supabase
4. VERIFY  →  Cross-check record counts and spot-check random serials
5. TEST    →  Verify existing serial codes work with new checker
```

### 10.3 Field Mapping

| WordPress Field | New Database Field | Notes |
|----------------|-------------------|-------|
| Code | `serial` | Primary lookup key |
| Link | `link` | Preserved as-is |
| Created | `created_at` | Timestamp conversion |
| Ordered | `ordered` | Boolean flag |
| SVP | `svp` | Preserved for reference |
| Status (active/etc.) | `status` | Map to ACTIVE/USED/REVOKED enum |
| Used | `ordered` or `status` | Determines if code was consumed |
| IP (from IP List) | `VerificationLog.ip_address` | Historical verification data |

### 10.4 Migration Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Duplicate serial codes across batches | Deduplicate during import, flag conflicts |
| Unknown status values | Map all unique WP statuses before import |
| Data loss | Full WP database backup before migration |
| Broken links | Validate all `link` fields post-import |

---

## 11. Decisions Log

| # | Question | Decision |
|---|----------|----------|
| 1 | WhatsApp Number | Dummy number `+628123456789` — will update later |
| 2 | Database | **Supabase** (PostgreSQL + Auth + Storage) |
| 3 | Primary Language | **English** (with Bahasa Indonesia toggle) |
| 4 | Additional Features | Analytics Dashboard + Multi-Language included; others deferred |
| 5 | Serial Code Migration | Post-launch migration from WordPress Serial Codes Validator plugin |

---

## 12. Remaining Open Questions

Non-blocking — can be clarified during development:

1. **Product Data** — Do you have existing product data/images, or should we use placeholder content?
2. **Domain** — What domain will this deploy to? (affects certificate URLs, can default to Vercel/Netlify subdomain)
3. **Admin Users** — How many admin accounts? Single admin or role-based (super admin vs. editor)?
4. **Hosting** — Vercel (free tier, optimized for Next.js) or existing hosting setup?
