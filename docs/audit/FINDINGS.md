# Durhaim.com — Audit Findings

Running log. Findings are added as they are confirmed; the full audit per
[AUDIT-PLAN.md](AUDIT-PLAN.md) has not started yet — everything below surfaced during scoping
and while fixing P0-1.

Severity: **P0** exploitable now / data exposed · **P1** significant security, broken core flow,
or major UX failure · **P2** meaningful defect · **P3** polish.

---

## F-1 · P0 · Entire serial registry publicly readable

**Status:** fix built on `fix/serial-rls-exposure`, **DDL not yet applied — still live**

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
