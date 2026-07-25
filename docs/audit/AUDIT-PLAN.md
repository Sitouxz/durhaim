# Durhaim.com — Full Website Audit Plan

**Target:** https://www.durhaim.com (Vercel, Next.js 15 App Router, Supabase Postgres)
**Prepared:** 2026-07-25
**Method:** every finding reproduced and captured visually (screenshot / HTTP transcript / SQL transcript) before it enters the report.

---

## 0. Findings already confirmed during scoping

These came out of reading the code and probing the live system while writing this plan. They are stated up front because two of them change the urgency of the whole engagement.

| # | Severity | Finding | Evidence |
|---|---|---|---|
| P0-1 | **Critical** | The entire serial-number table is publicly readable with the anon key that ships in the browser bundle. `GET /rest/v1/serial_numbers?select=*` returns **40,338 rows**. RLS policy `public_read_verifiable_serials` grants `SELECT` to `anon` for any row where `status != 'REVOKED'`, and 0 rows are revoked — so 100% of the table is exposed. Anyone can dump every valid serial and print matching counterfeit QR labels. This defeats the entire purpose of the authenticity system. | `content-range: 0-4/40338`, HTTP 206, sample serials returned |
| P0-2 | **High** | **All 40,850 serials have `product_id = NULL`.** `/api/verify` therefore always returns `product.name = null`. The verification result page cannot name the product it is authenticating, for every serial in the system. | count query: `product_id IS NULL` → 40,850 / 40,850 |
| P1-1 | Medium | Canonical / `og:url` / `sitemap.xml` all point at `https://durhaim.com`, which 308-redirects to `https://www.durhaim.com`. Every canonical signal points at a redirect. | live headers + HTML head |
| P1-2 | Medium | Homepage serves `Cache-Control: private, no-cache, no-store, max-age=0`. Nothing is cacheable. Edge is `sin1` but the function executes in `iad1` (US East) — worst-case latency for an Indonesian audience. | `X-Vercel-Id: sin1::iad1::…` |

**Recommendation:** patch P0-1 before the audit proceeds. It is a live data leak on a production anti-counterfeit product, and the fix is a one-line RLS policy change plus a serial-verification path that goes through the server. Details in §7.

RLS on every other table is correctly locked down — verified: `serial_lists`, `verification_logs`, `newsletter_subscribers`, `site_settings`, `admin_users`, `admin_activity_logs` all return 0 rows to `anon`. `products` (3) and `categories` (4) are intentionally public. So P0-1 is a single isolated policy mistake, not a systemic RLS failure.

---

## 1. Scope — full surface inventory

### 1.1 Public routes (13)

| Route | Notes |
|---|---|
| `/` | Home. Also intercepts legacy WordPress QR: `/?code=X&action=validate` → 308 → `/verify/X` |
| `/catalogue` | Filter, search, sort, paginate, region-aware pricing |
| `/catalogue/[slug]` | Product detail → WhatsApp enquiry |
| `/verify` | Serial checker: manual entry **+ live camera QR scan** (jsQR) |
| `/verify/[serial]` | Direct verify landing (what printed QR codes resolve to) |
| `/qr-guide` | How-to for scanning |
| `/our-story`, `/battle-proven`, `/latest-projects`, `/social-engagement`, `/contact` | Content pages |
| `/cart` | Server redirect → `/catalogue` (storefront is WhatsApp-only) |
| `/not-found` | 404 |
| `/robots.txt`, `/sitemap.xml` | Generated |

### 1.2 Admin routes (7)

`/admin/login` · `/admin` (overview) · `/admin/products` · `/admin/categories` · `/admin/serials` (1,469 LOC — largest surface: generation, bulk QR, print, PDF export, advanced filtering) · `/admin/users` · `/admin/settings`

### 1.3 API routes (13)

- **Public:** `/api/products`, `/api/verify`, `/api/newsletter`
- **Admin:** `login`, `logout`, `overview`, `products`, `product-images`, `categories`, `serials`, `settings`, `users`, `user-logs`

### 1.4 Flows to cover end-to-end (12)

1. Browse → filter/search/sort → product detail → WhatsApp enquiry
2. Region/currency switching (ID / GLOBAL, `regional_prices`)
3. Language switching (EN / ID, `?lang=id`)
4. Serial verification — manual entry
5. Serial verification — camera QR scan
6. Serial verification — direct URL `/verify/[serial]`
7. Serial verification — legacy WordPress QR redirect
8. Newsletter subscribe
9. Admin auth: login, bootstrap-password path, session lifetime, logout, suspended user, role gates
10. Admin product CRUD + image upload + regional pricing + publish toggle
11. Admin serial lifecycle: generate → status transitions → bulk QR export → print/PDF
12. Admin user CRUD + settings change → propagation to the public site

### 1.5 Explicitly out of scope

Payment/checkout (none exists — WhatsApp-only), email deliverability of transactional mail (none sent), native apps, third-party WhatsApp Business config.

### 1.6 Relationship to the existing `npm run verify` suite

The repo already has 20 audit scripts wired into `npm run verify`. Those are **static source assertions** — they check that code contains expected strings/patterns. They cannot catch any of P0-1, P0-2, P1-1 or P1-2. This audit is runtime, data-level, and visual; the scripts stay as a regression net and I will note where a finding should become a new assertion in them.

---

## 2. Audit tracks

### Track A — Security

**A1. Data exposure & RLS**
- Re-run the full table × verb matrix for `anon`: `SELECT / INSERT / UPDATE / DELETE` on all 9 tables (scoping only tested SELECT).
- Confirm P0-1 fix and check for regression via a second path.
- Abuse `record_serial_verification`: it is `GRANT EXECUTE … TO anon`, so the `/api/verify` rate limiter can be bypassed entirely by calling the RPC directly with the browser's anon key — inflating `verification_count` and flooding `verification_logs`. Quantify and confirm.
- Check the Supabase project for exposed Storage buckets and any other schema in the exposed API surface.
- Run Supabase advisors (security + performance lint).

**A2. Authentication**
- Session token design: `v1.base64(email).sha256("v1:email:secret")` — deterministic, contains **no expiry, no nonce, no session id**. Consequences to verify: cookie theft grants access indefinitely; logout only clears the cookie client-side so a captured token still validates; a password change does not invalidate existing sessions. (Suspension *is* re-checked per request — that part is sound.)
- Plain SHA-256 of a concatenation rather than HMAC.
- Bootstrap path: `ADMIN_PASSWORD` still grants OWNER login whenever `password_hash` is null. Verify it is now closed (there is 1 admin user; check whether its hash is set) and that the env var can be retired.
- Login rate limiting: in-memory `Map`, keyed `IP:email`. On Vercel this resets on every cold start and is per-instance. Verify the practical bypass (rotate email casing, rotate IP, concurrent instances).
- **User enumeration:** login returns `"Invalid or inactive admin user"` vs `"Invalid admin password"` — distinguishes valid emails. Confirm and rate.
- No MFA, no account lockout, no password-age or reuse policy. Assess against a single-OWNER deployment.

**A3. Authorization (role matrix)**
- Build the full endpoint × method × role matrix for STAFF / ADMIN / OWNER against all 10 admin endpoints.
- Known gap to confirm: **`GET /api/admin/users` has no `requireAdminRole` call** — any authenticated STAFF can enumerate every admin user's email, role and `last_login_at`.
- Check `PATCH /api/admin/settings` validates the body *before* authorizing (information ordering, low severity).
- Privilege escalation attempts: STAFF→ADMIN self-promotion, ADMIN editing an OWNER, mass-assignment of `role`/`status` via unexpected body fields.

**A4. Session & CSRF**
- Cookie flags: `httpOnly`, `secure`, `sameSite=lax`, `maxAge` 8h — verify all set correctly in production.
- CSRF: no tokens anywhere. `SameSite=Lax` + JSON-only bodies + `form-action 'self'` is meaningful defence — verify no admin endpoint accepts `application/x-www-form-urlencoded` or a simple-request content type, which would reopen it.
- Test session replay after logout.

**A5. Headers & CSP**
- `script-src 'self' 'unsafe-inline'` — `unsafe-inline` defeats most of CSP's XSS value. Assess whether nonce-based CSP is feasible with the current inline Next.js bootstrap.
- Confirm headers are applied to API routes, redirects and 404s, not just pages.
- HSTS `preload` is asserted — check actual submission status on hstspreload.org.
- Review `connect-src` allowances (`vercel.live`, `ws-us3.pusher.com` — production necessity?).

**A6. Input validation & injection**
- **PostgREST filter injection** in `/api/products`: `buildSearchFilter` interpolates user input into an `.or()` string. The sanitizer strips `% , ( )` but leaves `.` and `:` — the exact PostgREST operator delimiters. Attempt to break out of `ilike` into another column/operator. This is the highest-priority injection test.
- Serial input: regex `^[A-Z0-9-]{6,40}$` — fuzz around Unicode normalisation, very long input, null bytes.
- IDOR on every UUID path/body param.
- `/api/admin/product-images`: upload type/size/extension validation, SVG-as-image XSS, path traversal, SSRF if remote URLs are accepted.
- Stored XSS via admin-controlled fields (product name/description, settings, user notes) rendered on the public site.
- `JsonLd` uses `dangerouslySetInnerHTML` with a `<` escape — verify it is watertight against DB-sourced content.

**A7. Secrets**
- Grep the built client bundle for the service-role key and any non-`NEXT_PUBLIC_` env value.
- Scan git history for committed secrets.
- Audit the loose root-level scripts (`check_db.js`, `check_db2.js`, `check_api.js`, `update_db.js`, `check_type*.js`, `test_catalogue.py`) — committed debug tooling that reads `.env.local`. Check for hardcoded credentials and recommend removal.
- Verify `.env.local` is not deployed and Vercel env vars are scoped per-environment.

**A8. Rate limiting & abuse**
- Verify, newsletter and login limiters all use the same in-memory `Map` → all three are effectively unenforced on serverless. Measure real throughput achievable.
- Newsletter: unbounded insert of arbitrary emails (0 rows today — also verify the flow works at all).
- Cost/DoS: unauthenticated `/api/products` with `limit=24` and arbitrary `page` hitting the DB every request (`force-dynamic`, no caching).

**A9. Infrastructure**
- Vercel: **preview deployments are publicly reachable and share the production Supabase credentials** — verify and recommend protection. There is no staging environment; `.env.local` points local dev at production data.
- TLS config, DNS records, SPF/DKIM/DMARC on durhaim.com (spoofing risk for a brand using a Gmail support address).
- Dependency audit: `npm audit`, plus review of `jspdf`/`html2canvas`/`jsqr` versions.

**A10. Privacy & compliance**
- `verification_logs` stores IP + user-agent (1,024 rows today) with no retention policy, no privacy notice and no disclosure on the verify page. Assess against Indonesian PDP Law (UU 27/2022).
- No privacy policy page, no terms, no cookie notice; newsletter captures email with no consent record.
- Check what the QR-scan camera permission prompt tells the user.

### Track B — Functional flows

For each of the 12 flows in §1.4: happy path, every branch, and every error state — with a screenshot per state.

Specific edge cases to force (using tagged test data):
- Verify: valid ACTIVE · INACTIVE · REVOKED · non-existent · malformed · whitespace/lowercase · legacy WP format (`ZY1956EW9KJF`) vs new format (`DRH-VES-260725-XXXX`) · a serial with a real `product_id` (must be created — none exist) · repeat scan (count increments) · rate-limited response.
- Catalogue: empty search result · category with no products · page beyond last · `limit` above cap · unpublished product accessed directly by slug · missing image.
- Admin serials: generate for a real product · generate custom · bulk-select across pages · bulk QR export at volume · print layout fidelity · PDF export fidelity · every filter and sort column · date-range and scan-count filters.
- Admin: duplicate slug/email · validation failures · concurrent edit · very long field values · special characters and Indonesian diacritics.
- Resilience: DB unreachable → the `fallbackProducts` path silently serves 3 hardcoded products with a `warning` field the UI may not surface. Verify what the user actually sees during an outage.

### Track C — UI/UX & visual

- **Visual baseline:** every one of the 20 routes captured at 360 / 375 / 768 / 1024 / 1440 / 1920 px. This is the reference set for the whole report.
- Responsive integrity: no horizontal scroll, no clipped text, no overlapping elements, tap targets ≥ 44px, safe-area handling.
- Design-system consistency against `DESIGN.md`: typography scale, spacing, colour tokens, button/badge/card variants, border radii.
- Interaction states for every control: default / hover / focus / active / disabled / loading / error.
- Empty, loading and error states for every data-driven view (catalogue, verify, all 6 admin tables).
- Navigation: `TopNavBar` mobile menu, `Footer` link integrity (all internal links resolve, no 404s), `WhatsAppFAB` placement and overlap at every breakpoint.
- Copy & localisation: EN/ID completeness, no mixed-language leakage, currency and number formatting per region, `LocalizedText` coverage.
- Admin UX specifically: the 1,469-LOC serials page — bulk-selection affordances, destructive-action confirmations, feedback on long-running QR/PDF jobs, table usability at 40k rows.
- Cross-browser: Chrome, Safari (desktop + iOS), Firefox, Edge. iOS Safari matters most for the camera QR scanner.

### Track D — Accessibility (WCAG 2.2 AA)

- Keyboard: full traversal of every flow, visible focus, logical order, no traps, skip-to-content, modal focus management.
- Screen reader: landmarks, heading hierarchy, form labels + error association, image alt text, `aria-live` on the verify result (currently likely missing — a result that changes silently is invisible to AT).
- Colour contrast across the dark tactical theme — high-risk area; every text/background and state pair.
- Camera QR scanner must have an equivalent non-camera path, clearly offered.
- Forms: labels, `autocomplete`, inline error text, required indication.
- Motion: `prefers-reduced-motion` respected.
- Zoom to 200% and 400% reflow.
- Automated pass (axe) on every route + manual verification of what automation can't see.

### Track E — Performance

- Lighthouse (mobile + desktop) on `/`, `/catalogue`, `/catalogue/[slug]`, `/verify`, `/admin/serials`; record LCP, CLS, INP, TBT, TTFB.
- **Caching:** `Cache-Control: no-store` on the homepage and `force-dynamic` on `/api/products` mean nothing is cached anywhere. Model the win from ISR/`revalidate` on catalogue and content pages.
- **Region:** functions executing in `iad1` for a Singapore/Indonesia audience. Check Supabase region and recommend co-location.
- Images: `remotePatterns: []` and raw `/images/*.png` — audit whether `next/image` is used, actual file weights, and format (PNG for product photography is expensive).
- Bundle: confirm `jspdf` / `html2canvas` / `jsqr` are not in the public bundle; audit `'use client'` boundaries (`CommerceProvider` at 473 LOC is a client component wrapping the app).
- Font loading strategy and layout-shift.
- `/admin/serials` at 40k rows — measure query time, payload size and render time.

### Track F — SEO & AI discoverability

- Fix and verify the www/non-www canonical mismatch (P1-1), including `sitemap.xml` and all `og:*` URLs.
- `hreflang` alternates advertise `?lang=id` — verify that URL actually serves Indonesian content and is indexable, otherwise the alternates are false signals.
- Sitemap completeness: `/qr-guide`, `/latest-projects`, `/social-engagement` exist but are **not in the sitemap route list**. Decide in or out, deliberately.
- Structured data: validate every `JsonLd` block against Google's Rich Results test; Product schema needs price/currency/availability to be eligible.
- Per-route titles and descriptions: uniqueness, length, keyword intent.
- OG/Twitter card rendering — actually fetch and view the images.
- Crawl for broken links, redirect chains and orphan pages.
- AI-answer readiness: robots already allows GPTBot/ClaudeBot/PerplexityBot — assess whether verify/authenticity content is structured to be cited.

### Track G — Data integrity

- Serial dataset health: 40,850 rows, **100% with null `product_id`**, 40,338 ACTIVE (all `wp_imported`), 512 INACTIVE, 0 REVOKED. Determine whether the WordPress import dropped the product mapping and scope a backfill.
- Format inconsistency between legacy (`ZY1956EW9KJF`) and generated (`DRH-CUS-260725-XXXX`) serials — confirm both verify correctly and that the generator's collision probability at scale is acceptable (4 random chars per day-prefix is ~1.7M combinations — check for existing collisions).
- Orphans and referential integrity: `verification_logs` → `serial_numbers`, `serial_numbers` → `products`/`serial_lists`, `products` → `categories`.
- `newsletter_subscribers` is empty — verify the subscribe flow ever persists.
- `site_settings` propagation: change each key in admin, confirm it reaches the public site (WhatsApp number, support email, location, public domain).
- Backup: verify `backups/` contents are restorable, and that a restore procedure exists and is documented.

### Track H — Reliability & operations

- Error handling: silent fallbacks (catalogue), unhandled states, whether any user-facing error leaks internals.
- **No error tracking, no uptime monitoring, no alerting** — assess and recommend.
- **No test framework at all** (`package.json` has no test runner) — the 20 audit scripts are the only safety net. Recommend a minimum viable test layer around auth, RLS and verification.
- Deploy safety: no staging, local dev writes to production data. Recommend a Supabase branch or a second project.

---

## 3. Visual verification method

Every finding carries evidence. No finding ships on assertion alone.

- **Public, read-only flows** → tested against production `www.durhaim.com` in the in-app browser. Screenshots at each viewport.
- **Admin and mutating flows** → tested against `npm run dev` on localhost (which shares the production DB — hence the data protocol in §4), so that CSP, cookie-secure behaviour and rate limiting can also be exercised against production separately and compared.
- **API and RLS findings** → captured as full HTTP request/response transcripts (method, headers, status, body) and SQL/PostgREST transcripts, saved alongside screenshots.
- **Naming:** `docs/audit/screenshots/<track><id>-<route>-<state>-<viewport>.png` — e.g. `A3-01-api-admin-users-staff-403.png`.
- Every finding row in the report links its evidence file(s) and gives exact reproduction steps.

---

## 4. Test-data & database safety protocol

There is no staging environment: local dev, preview deployments and production all point at the same Supabase project. Every mutation must therefore be reversible and traceable.

1. **Pre-audit snapshot.** Full `pg_dump` to `backups/pre-audit-2026-07-25.sql` (gitignored) before any write. Verify the dump is non-empty and parseable.
2. **Tagging.** Every record created for testing is prefixed `ZZAUDIT`:
   - serials `ZZAUDIT-…`, products/categories slug `zzaudit-…`
   - admin users `zzaudit-staff@durhaim.test`, `zzaudit-admin@durhaim.test`, `zzaudit-owner@durhaim.test`
3. **No touching real rows.** The 40,850 production serials, the single real admin user, and the 3 real products are read-only for the duration. Role-matrix testing uses the three `ZZAUDIT` users, then deletes them.
4. **Mutation log.** `docs/audit/MUTATION-LOG.md` records every write with its exact reverse statement, appended as it happens.
5. **`site_settings` handling.** Values are captured before any change and restored immediately after each propagation test.
6. **Teardown + verification.** A single cleanup script removes all `ZZAUDIT` rows, followed by a diff of row counts per table against the pre-audit snapshot. Any delta is investigated before the audit closes.
7. **Blast-radius rules.** No `DELETE` without a `WHERE` on a `ZZAUDIT` tag. No schema changes outside the agreed P0-1 fix. No load/DoS testing against production. Login-lockout testing runs against localhost only.

---

## 5. Deliverables

| File | Contents |
|---|---|
| `docs/audit/FINDINGS.md` | Every finding: severity, track, description, impact, reproduction, evidence link, recommended fix, effort |
| `docs/audit/EXEC-SUMMARY.md` | One page: top risks, what to fix this week, what to fix this quarter |
| `docs/audit/FLOW-MATRIX.md` | 12 flows × states × viewports × browsers, pass/fail with evidence |
| `docs/audit/RLS-MATRIX.md` | 9 tables × 4 verbs × `anon`/`authenticated`, actual observed result |
| `docs/audit/PERMISSION-MATRIX.md` | 13 endpoints × methods × 3 roles, expected vs actual |
| `docs/audit/A11Y-REPORT.md` | WCAG 2.2 AA, per criterion, per route |
| `docs/audit/PERF-REPORT.md` | Lighthouse runs, waterfalls, before/after where fixes are applied |
| `docs/audit/SEO-REPORT.md` | Crawl, canonicals, structured-data validation, hreflang |
| `docs/audit/screenshots/` | All visual evidence |
| `docs/audit/MUTATION-LOG.md` | Every DB write + its reversal |
| `docs/audit/REMEDIATION-PLAN.md` | Fixes grouped into PR-sized batches by severity, with new `audit:*` script assertions to prevent regression |

Severity scale: **P0** exploitable now / data exposed · **P1** significant security, broken core flow, or major UX failure · **P2** meaningful defect or degradation · **P3** polish and hardening.

---

## 6. Sequencing

| Phase | Work | Output |
|---|---|---|
| **0** | Snapshot DB, stand up local dev, create `ZZAUDIT` fixtures, capture visual baseline of all 20 routes | Baseline screenshots, mutation log started |
| **1** | Track A — security (RLS matrix, auth, role matrix, injection, headers, secrets, infra, privacy) | `RLS-MATRIX`, `PERMISSION-MATRIX`, security findings |
| **2** | Track B — all 12 flows, every state, both serial formats | `FLOW-MATRIX` |
| **3** | Tracks C + D — UI/UX, responsive, cross-browser, accessibility | `A11Y-REPORT`, visual findings |
| **4** | Tracks E + F — performance and SEO | `PERF-REPORT`, `SEO-REPORT` |
| **5** | Tracks G + H — data integrity, ops, reliability | Data findings |
| **6** | Teardown, verify DB clean, write report and remediation plan | `FINDINGS`, `EXEC-SUMMARY`, `REMEDIATION-PLAN` |

Phase 1 is front-loaded deliberately: it is where the confirmed critical finding lives, and where more are most likely.

---

## 7. P0-1 fix — built, pending DDL application

Branch: `fix/serial-rls-exposure`.

### What the fix does

My first attempt moved public verification onto the service-role client. The repo's own
`audit:security-hardening` script rejected it, and the script was right: putting the
service-role key in a public route means any bug there has full-database blast radius.
The existing architecture — public verification through the constrained
`SECURITY DEFINER` RPC with the anon key — was already correct. The leak was the
*extra* table-level SELECT policy sitting beside it, not the RPC.

So the fix keeps the intended design and removes the leak:

1. **Drop `public_read_verifiable_serials`.** `anon` gets no `SELECT` on `serial_numbers`.
2. **`record_serial_verification` now returns the certificate payload** (`found`, `serial`,
   `status`, `verification_count`, `created_at`, `product_name`, `product_image`) instead of
   just a count, so the public pages no longer need a table read. Return type changes
   `INTEGER` → `JSONB`.
3. **New `p_count BOOLEAN DEFAULT TRUE` parameter.** When a visitor's per-IP rate limit is
   already tripped, the page looks the certificate up without incrementing or logging —
   preserving today's behaviour, where a rate-limited scanner still sees an accurate result
   rather than a misleading "not registered".
4. **Revoked serials are now reported correctly.** The old RPC filtered `status != 'REVOKED'`
   and returned NULL, so a revoked serial was indistinguishable from an unknown one. The
   `REVOKED` branch in both UIs was effectively dead code. It now works.
5. **`getSerialVerification` is wrapped in React `cache()`.** `generateMetadata` and the page
   body both need the data; without deduping, one scan would be counted twice.

Files: `supabase/fix-serial-rls-exposure.sql` (new), `supabase/schema.sql`,
`src/lib/serial-verification.ts` (new), `src/app/api/verify/route.ts`,
`src/app/verify/[serial]/page.tsx`.

`schema.sql` is edited as well as the migration — it is idempotent and re-runnable, and it
was the file that *created* the leaking policy. Applying only a migration would let the next
`npm run supabase:apply` reintroduce the leak.

### Verification status

| Check | Result |
|---|---|
| `npx tsc --noEmit` | clean |
| `next lint` | clean (1 pre-existing unused-var warning in `SerialChecker.tsx`) |
| `npm run build` | passes, all 20 routes |
| 18 `audit:*` scripts | 16 pass; 2 fail pre-existing (see F-4, F-5 in `FINDINGS.md`) |
| `audit:security-hardening` | passes — the guardrail that caught my first attempt |
| anon can no longer read `serial_numbers` | **verified: `*/0`, was `0-4/40338`** |
| End-to-end behaviour | **verified — 15 checks, see `FINDINGS.md` F-1** |

**DDL applied 2026-07-25** by Executor via the Supabase dashboard SQL editor. F-1 is closed.

### ⚠️ Applying the DDL broke the deployed code — see F-11

The migration had to land before the new code, but applying it alone broke the *previously
deployed* code, which read `serial_numbers` with the anon key that the migration revokes.
Production `/api/verify` returned "not found" for every serial until the branch shipped.

The hand-off instruction ("apply the SQL before the code ships") was correct for the new code
and incomplete about the old. A schema change that removes a grant the running code depends on
is a breaking change in *both* directions; the two must be released together, or the code
must tolerate both shapes. Recorded as F-11 so the sequencing lesson carries into the
remaining remediation batches, several of which also touch schema and code together.
