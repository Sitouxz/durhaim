# Durhaim.com — Audit Findings

Running log. Findings are added as they are confirmed; the full audit per
[AUDIT-PLAN.md](AUDIT-PLAN.md) has not started yet — everything below surfaced during scoping
and while fixing P0-1.

Severity: **P0** exploitable now / data exposed · **P1** significant security, broken core flow,
or major UX failure · **P2** meaningful defect · **P3** polish.

---

## F-1 · P0 · Entire serial registry publicly readable

**Status: CLOSED** — DDL applied 2026-07-25, fix verified end-to-end

RLS policy `public_read_verifiable_serials` granted `SELECT` on `serial_numbers` to `anon`
for every row where `status != 'REVOKED'`. Zero rows are revoked, so 100% of the table was
exposed. `NEXT_PUBLIC_SUPABASE_ANON_KEY` ships in the browser bundle, so no authentication
was needed.

**Reproduction**

```
GET https://<project>.supabase.co/rest/v1/serial_numbers?select=serial,status,product_id&limit=5
     apikey: <anon key, readable in any page's JS bundle>
     Prefer: count=exact
→ HTTP 206, content-range: 0-4/40338
```

**Impact.** A counterfeiter can download all 40,338 valid serials and print QR labels that
pass verification. This defeats the entire purpose of the authenticity system — the product
the site exists to sell trust in.

**Fix.** See AUDIT-PLAN §7. Drop the policy; the constrained `record_serial_verification`
RPC becomes the only anon-reachable path to serial data and now returns the certificate
payload directly.

**Note.** RLS on every other table is correct — `serial_lists`, `verification_logs`,
`newsletter_subscribers`, `site_settings`, `admin_users`, `admin_activity_logs` all return 0
rows to `anon`. This was one isolated policy mistake, not systemic.

### Post-apply verification — all passed

| # | Check | Result |
|---|---|---|
| 1 | anon `SELECT` on `serial_numbers` | **`*/0`, body `[]`** (was `0-4/40338`) |
| 2 | anon reads still work where intended | `products` 3, `categories` 4; all other tables 0 |
| 3 | RPC as anon, ACTIVE serial | `found:true`, status, `product_name`, `product_image`, count 1 → 2 |
| 4 | RPC `p_count:false` | payload returned, count stayed at 2, no log row |
| 5 | RPC, REVOKED serial | `status:"REVOKED"`, count **not** incremented, no log row |
| 6 | RPC, unknown serial | `{"found":false}` |
| 7 | RPC input normalisation | `"  zzaudit-active-0001  "` resolved correctly |
| 8 | `verification_logs` side effects | exactly 3 rows: 2 ACTIVE + 1 INACTIVE, 0 for REVOKED/`p_count:false` |
| 9 | `/verify/[serial]` page view increments by **exactly 1** | 2 → 3 → 4 across two views (the `cache()` dedupe; without it each view would double-count) |
| 10 | Certificate page renders AUTHENTIC | `ASLI` / `KEASLIAN TERVERIFIKASI`, product name `TBP VEST MK-IV` resolved |
| 11 | Certificate page renders REVOKED | `DICABUT` / `SERTIFIKAT DICABUT` — previously unreachable, see F-8 |
| 12 | Certificate page renders UNVERIFIED | `SERIAL TIDAK TERDAFTAR`, dates and count `N/A` |
| 13 | `POST /api/verify` all branches | ACTIVE → `found:true` + product name; REVOKED → revoked message; unknown → not found; `"ab"` → format error |
| 14 | Legacy WordPress QR redirect | `/?code=…&action=validate` → 308 → `/verify/…` |
| 15 | Teardown reconciliation | 40,850 serials / 1,024 logs / 3 products — identical to pre-test baseline, 0 residual `ZZAUDIT` rows |

Evidence and reversals: [MUTATION-LOG.md](MUTATION-LOG.md).

Testing used three `ZZAUDIT` fixture serials rather than production data, so no real
serial's `verification_count` was touched. The fixtures also gave the first-ever test of the
`product_name` / `product_image` payload, which is untestable with production data because
of F-2.

---

## F-2 · P1 · Every serial has a null `product_id`

**Status:** open, root cause not yet established

All **40,850** rows in `serial_numbers` have `product_id = NULL`.

```sql
select count(*) from serial_numbers;                        -- 40850
select count(*) from serial_numbers where product_id is null; -- 40850
```

**Impact.** The certificate page and `/api/verify` can never name or picture the product they
are authenticating. Every verification renders the generic "Durhaim Product" fallback. The
customer-facing result is materially weaker than designed.

**Breakdown.** 40,338 `ACTIVE` (all `wp_imported = true`) · 512 `INACTIVE` · 0 `REVOKED`.
Both the WordPress import *and* the in-app generator produced null mappings, so there are
likely two separate causes.

`backups/wp-serial-migration-2026-06-26T17-16-44-743Z.json` (1.9 MB) is probably the source
needed to reconstruct the mapping — to be assessed in Track G.

---

## F-3 · P1 · `npm run verify` has been dead for over a month

**Status:** partially fixed on `fix/serial-rls-exposure` (crash fixed; two revealed failures left open)

Commit `875a966` (2026-06-21, *"feat: make storefront WhatsApp-only"*) deleted the
`assertIncludes` helper from `scripts/audit-page-completion.js` but left a call to it behind.
The script has thrown `ReferenceError: assertIncludes is not defined` ever since.

Because `verify` is a `&&` chain, it aborted at step 4 of 20 — so **16 audit scripts and
`npm run build` have not run as part of the gate since 2026-06-21**, spanning commits
`ecf60cd`, `a74ac2a`, `f19bf6e`.

**Fix applied.** Restored the three-line helper. This was a prerequisite for validating the
P0-1 fix, so it is included in this branch rather than deferred.

**Consequence.** Restoring the gate immediately revealed two real regressions that had been
accumulating behind it — F-4 and F-5. Both are left open for batch remediation.

**Recommendation.** The chain should not be `&&`-joined; one broken script should not hide
nineteen others. Run all, collect failures, exit non-zero at the end. Also worth wiring into
CI, since a local-only gate is one nobody runs.

---

## F-4 · P2 · Serial table exposes an Activate action it must not

**Status:** open (pre-existing, was masked by F-3)

`audit:admin-completion` fails:

```
src/app/admin/serials/page.tsx: serial table actions must not expose Activate
```

The assertion (`scripts/audit-admin-completion.js:52`) checks the rendered serial table
region for `Activate` or `updateSerialStatus(s.id, 'ACTIVE')`. Something re-introduced a
direct activate control that a deliberate earlier decision removed.

Needs a judgement call during Track B: either the control is a genuine regression and should
go, or the business rule changed and the assertion is stale. Not fixed pending that call.

---

## F-5 · P2 · Serial QR exports may not use the configured public domain

**Status:** open (pre-existing, was masked by F-3)

`audit:settings-workflow` fails at `scripts/audit-settings-workflow.js:85`:

```
AssertionError: serial QR exports must use the configured public domain
```

If QR exports embed a hardcoded domain rather than the `public_domain` site setting, printed
labels can point at the wrong host — and printed labels cannot be recalled. High
consequence for a physical product; worth prioritising above its severity once confirmed.

---

## F-6 · P2 · Canonical URLs point at a redirect

**Status:** open

The site serves from `www.durhaim.com`, but `<link rel="canonical">`, `og:url` and
`sitemap.xml` all point at `https://durhaim.com`, which 308-redirects to the `www` host.
Every canonical signal targets a redirect instead of the live URL.

```
GET https://durhaim.com/  → 308 → https://www.durhaim.com/
canonical: https://durhaim.com
sitemap:   https://durhaim.com/sitemap.xml
```

Driven by the `public_domain` site setting (`durhaim.com`). Fix is either to set it to the
canonical `www` host or to make `www` redirect to the apex — but pick one and make every
signal agree.

**Also affects printed labels.** QR codes encoding the apex host take two redirects to reach
the certificate:

```
durhaim.com/?code=X&action=validate → 308 → www.durhaim.com/?code=X&action=validate
                                     → 308 → www.durhaim.com/verify/X
```

Functionally fine, but it is two extra round trips on a mobile connection in the field, for
every scan of every label already in circulation. Resolving the host mismatch removes one hop
for all future labels.

---

## F-7 · P2 · Nothing is cacheable, and functions run on the wrong continent

**Status:** open

Homepage responds `Cache-Control: private, no-cache, no-store, max-age=0, must-revalidate`.
Combined with `force-dynamic` on `/api/products`, no page or API response is cacheable
anywhere.

`X-Vercel-Id: sin1::iad1::…` — the request enters the edge in Singapore and executes in
`iad1` (US East). For a primarily Indonesian audience that is a trans-Pacific round trip per
request, on every request, with no cache to absorb it.

Quantify in Track E; likely the single largest available performance win.

---

## F-8 · P3 · REVOKED was unreachable in public verification

**Status:** fixed on `fix/serial-rls-exposure`

The old `record_serial_verification` filtered `status != 'REVOKED'` and returned NULL for
revoked serials, and the anon RLS policy hid them too. So `/api/verify`'s
`if (data.status === 'REVOKED')` branch and the certificate page's REVOKED UI state were
both dead code — a revoked serial was indistinguishable from an unknown one.

Since a revoked certificate is a *stronger* signal than an unknown serial (it means "this
was ours and we withdrew it"), collapsing the two lost real information. The rewritten RPC
returns revoked status explicitly, without counting or logging it as a verification.

---

## F-9 · P1 · A serial that does not exist still renders as a certificate, with a "VERIFIED" seal

**Status:** open (found during F-1 verification)

`/verify/<any-string>` always renders the full certificate layout. For an unregistered serial
the status panel correctly reads `SERIAL TIDAK TERDAFTAR` ("Serial Not Registered") — but
everything around it still asserts authenticity:

- page heading: **SERTIFIKAT KEASLIAN** ("Authenticity Certificate")
- section label: **PRODUK TERSERTIFIKASI** ("Certified Product")
- the `DRH` seal in the sidebar: **TERVERIFIKASI** ("VERIFIED")
- a fabricated **ID SERTIFIKAT** (`DRH-CERT-PE999999`) is generated for the unknown input
- **DITERBITKAN** ("Issued") shows today's date
- **OTORITAS: DURHAIM TACTICAL**

**Reproduction:** `http://localhost:3000/verify/ZZAUDIT-NOPE-999999` (any unregistered string).

**Impact.** Someone holding a counterfeit scans its QR, lands on a page headed "Authenticity
Certificate" bearing a "VERIFIED" seal, a certificate ID, an issue date and Durhaim's
authority — and one panel of contradicting text, in a page whose every other signal says
genuine. On the product whose entire job is distinguishing real from fake, the default
presentation should be refusal, not a certificate with a caveat.

The same applies to the `REVOKED` state, which also keeps the `TERVERIFIKASI` seal.

**Recommendation.** For `UNVERIFIED` and `REVOKED`, suppress the certificate chrome
entirely — no seal, no certificate ID, no issue date, no "Certified Product" framing. Show a
rejection page. The certificate layout should be reachable only by an `ACTIVE` serial.

---

## F-10 · P3 · Certificate page title has a doubled brand suffix

**Status:** open (found during F-1 verification)

Rendered title: `Authenticity Certificate - TBP VEST MK-IV | DURHAIM | DURHAIM`

`generateMetadata` in `src/app/verify/[serial]/page.tsx` already appends `| DURHAIM`, and the
root layout's title template appends it again. Cosmetic, but it is the text shown in search
results and browser tabs for every scanned QR code.

Related: the certificate ID is just the serial's last 8 alphanumerics
(`DRH-CERT-` + `serial.replace(/[^A-Z0-9]/g,'').slice(-8)`), so it carries no independent
information and collides for any two serials sharing a tail. Worth deciding whether it should
be a real identifier or be dropped.

---

## F-11 · P1 · Applying the F-1 migration broke the deployed `/api/verify`

**Status: RESOLVED** — merged to `main` (`c033dfa`) and deployed 2026-07-25; production
re-verified below. Recorded for the process lesson.

**Production verification after deploy**

| Check | Result |
|---|---|
| `POST /api/verify` real active serial | `{"found":true,"serial":"ZY1956EW9KJF","product":{"name":null,"status":"ACTIVE"}}` |
| `POST /api/verify` unknown serial | `{"found":false,"message":"Serial number not found in our system."}` |
| `/verify/ZY1956EW9KJF` | renders `ASLI` (authentic) |
| Legacy QR `durhaim.com/?code=…&action=validate` | 2 hops → `www.durhaim.com/verify/ZY1956EW9KJF`, 200 |
| anon `SELECT` on `serial_numbers` | `*/0`, body `[]` — leak stayed closed through the deploy |

`product.name` is `null` because of F-2, not this fix.

**Cause.** The F-1 migration revokes anon's `SELECT` on `serial_numbers`. The code deployed at
that moment (`main`) read that table with the anon key in `/api/verify`, so every lookup
started returning empty and the endpoint reported "Serial number not found in our system"
for valid serials.

```
POST https://www.durhaim.com/api/verify  {"serial":"ZY1956EW9KJF"}
→ {"found":false,"message":"Serial number not found in our system."}
```

**Blast radius.** `/verify` — both the manual entry form and the camera QR scanner, which
share `SerialChecker.tsx:104` → `POST /api/verify`. The certificate page `/verify/[serial]`,
where scanned QR labels actually land, was unaffected because it used the service-role key.
So printed labels kept working; the on-site checker did not.

**Lesson.** The hand-off said "apply the SQL before the code ships", which was right for the
new code and silent about the old. Revoking a grant the running code depends on is breaking in
both directions — schema and code had to be released together, or the code had to tolerate
both RPC shapes during a transition. Several remaining remediation items also touch schema and
code together; each needs an explicit ordering plan, and ideally a backward-compatible
intermediate step.

---

## Carried into the full audit

Read from source during scoping, not yet reproduced — these are Track A work items, listed
so they are not lost:

- Session tokens carry no expiry, nonce or session id; logout only clears the cookie, so a
  captured token stays valid. Password changes do not invalidate sessions. Plain SHA-256 of
  a concatenation rather than HMAC.
- `GET /api/admin/users` has no `requireAdminRole` call — any authenticated STAFF can
  enumerate every admin user.
- Login responses distinguish "invalid or inactive admin user" from "invalid admin password"
  → user enumeration.
- All three rate limiters use an in-memory `Map`, which on serverless is per-instance and
  resets on cold start — effectively unenforced.
- `/api/products` interpolates user input into a PostgREST `.or()` filter string; the
  sanitizer strips `% , ( )` but leaves `.` and `:`, the operator delimiters.
- `script-src` includes `'unsafe-inline'`, negating most of the CSP's XSS value.
- `verification_logs` stores IP + user-agent with no retention policy, no privacy notice and
  no privacy policy page (1,024 rows today).
- Preview deployments are publicly reachable and share production Supabase credentials;
  there is no staging environment.
- Committed debug scripts at repo root (`check_db.js`, `update_db.js`, `check_api*.js`,
  `check_type*.js`, `test_catalogue.py`) read `.env.local`.
- No test framework, no error tracking, no uptime monitoring.
