# Audit Status — 2026-07-25

`main` @ `HEAD`. `npm run verify` exits 0. Database reconciled to
`backups/pre-audit-2026-07-25/` after every batch.

## Findings

| # | Sev | Title | Status |
|---|---|---|---|
| F-1 | P0 | Entire serial registry publicly readable | **FIXED** |
| F-2 | P1 | Null `product_id` — 4,097 mapped serials deleted by the WP import | root cause found, **blocked on decision** |
| F-3 | P1 | `npm run verify` dead since 2026-06-21 | **FIXED** |
| F-4 | P2 | Serial table exposed a manual Activate | **FIXED** |
| F-5 | P1 | QR labels encoded `window.location.origin` | **FIXED** |
| F-6 | P2 | Canonical URLs pointed at a redirect | **FIXED** |
| F-7 | P2 | Nothing cacheable; functions run in `iad1` | **mostly FIXED** |
| F-8 | P3 | REVOKED unreachable in public verification | **FIXED** |
| F-9 | P1 | Unregistered serials rendered as certificates | **FIXED** |
| F-10 | P3 | Doubled brand suffix in certificate title | **FIXED** |
| F-11 | P1 | Migration broke deployed `/api/verify` | **RESOLVED** |
| F-12 | P2 | Header overflow 768–943px | **FIXED** |
| F-13 | P2 | Category labels clipped below 1440px | **FIXED** |
| F-14 | P2 | `/api/products` leaked upstream error bodies | **FIXED** |
| F-15 | P2 | `/catalogue` + `/verify` had no metadata | **FIXED** |
| F-16 | P2 | `INACTIVE` serials verify as authentic | open, **needs decision** |
| F-17 | P2 | `GET /api/admin/users` had no role check | **FIXED** |
| F-18 | P2 | Cookies survive logout + password rotation | open, **needs 1 DDL column** |
| F-19 | P2 | Malformed settings body reset all settings | **FIXED** |
| F-20 | P3 | Login responses distinguished real accounts | **FIXED** |
| F-21 | P2 | A11y: contrast 2.08:1, unlabelled inputs, no skip link, unnamed FAB | **mostly FIXED** |
| F-22 | P2 | 4 dependency vulns; postcss fix blocked by an override pin | open |
| F-23 | P2 | SPF authorises the old WordPress host; DMARC p=none | open |
| F-24 | P2 | IP/UA logged with no privacy policy or retention (PDP Law) | open |
| F-25 | P3 | Serial generation can fail on keyspace collision at scale | **FIXED** (batch 8) |
| F-26 | P2 | No-pricing policy enforced in UI but not in API/database | open, **needs decision** |
| F-27 | P2 | 1.45MB of unoptimised PNG; next/image unused | open |
| F-28 | P3 | 36 of 46 image files unreferenced (5MB WP leftovers) | open, not deleted by choice |
| F-30 | P2 | Serial generation unbounded; count=100000 hung the server | **FIXED** |
| F-31 | P3 | Duplicate product slug returns 400 where category returns 409 | open |
| F-32 | P2 | WhatsApp FAB overlaps the Revoke control in admin; storefront chrome wraps admin | open |
| F-33 | P3 | All admin pages share the default storefront title | open |
| F-29 | P2 | No tests, no error tracking, no uptime monitoring, no CI | **partly FIXED** (RLS test + gate hardened; CI, error tracking, uptime open) |

**19 fixed · 3 blocked on your decision · 1 needs DDL · 8 open**

Negative results (tested, not exploitable): N-1 anon write access, N-2 PostgREST `.or()`
injection, N-3 login rate limiting, N-4 secret exposure and git history, N-5 API header coverage.

## Blocked on you

1. **F-2** — restore the 4,097 deleted serials from the backup? Depends on whether any were
   printed and shipped. Irreversible bulk write, so not my call.
2. **F-16** — should `INACTIVE` serials verify as authentic? Currently they do, so the status has
   no public effect and the 512 unissued serials certify like real ones.
3. **F-18** — needs `ALTER TABLE admin_users ADD COLUMN session_epoch INTEGER NOT NULL DEFAULT 0;`
   applied (I have no DDL access — the Supabase MCP token reaches a different org).

## Tracks

| Track | State |
|---|---|
| A1 RLS / permissions | done (N-1) |
| A2 authentication | done (F-18, F-20, N-3) |
| A3 authorization matrix | done (F-17) |
| A4 CSRF / body handling | done (F-19) |
| A5 headers & CSP | done (N-5); nonce-based CSP scoped separately |
| A6 injection | done (N-2) |
| A7 secrets | done (N-4) |
| A8 rate limiting | done (N-3) |
| A9 infrastructure | done (F-22, F-23); Vercel preview exposure still unverified |
| A10 privacy | done (F-24) |
| B functional flows | mostly done — verification + admin CRUD exercised (F-30, F-31, N-7); WhatsApp deep-link and camera scanner outstanding |
| C UI/UX | mostly done — public + admin captured; F-12/F-13 fixed, F-32/F-33 logged; cross-browser outstanding |
| D accessibility | partial (F-21) - keyboard/scanner, admin UI, zoom reflow, reduced-motion outstanding |
| E performance | partial — F-7 fixed and measured (4-5x); F-27 images and bundle documented; Lighthouse + fonts outstanding |
| F SEO | partial — F-6, F-15 fixed; structured data validated (F-26); crawl + hreflang outstanding |
| G data integrity | partial — F-2 root cause, F-25 collisions, N-6 orphans clean; restore drill outstanding |
| H reliability / ops | done (F-3 fixed, F-29 documents the gaps) |

## Note on authenticated capture

`tools/shoot.mjs` supports a `cookie` option and **does** capture the authenticated admin surface
correctly. Two earlier attempts were wrongly judged failures: I compared total document heights
across pages, saw them identical, and concluded the cookie was not applying. It was. The admin
layout is a fixed shell whose table scrolls internally, so total page height is the same on every
admin route while the content differs completely. Opening one image settled in seconds what the
heuristic had got wrong twice.

Lesson, and it is the second time in this audit: a proxy metric that looks decisive is not
evidence. `scrollWidth` hid F-13's left-clipped labels the same way.

## Reproducing

Capture tooling in `docs/audit/tools/` — zero dependencies, drives system Chrome over CDP:

```bash
node docs/audit/tools/mkmanifest.mjs && node docs/audit/tools/shoot.mjs base.json
```

`diag.mjs <url> <width>` finds overflowing elements; `labelcheck.mjs` measures clipped labels;
`a3-rolematrix.mjs` and `a2a4a8.mjs` re-run the security matrices (both seed and tear down their
own `ZZAUDIT` fixtures). Scan `_index.json` for non-zero `overflowPx` before opening any image —
note that it only reports rightward overflow, which is how F-13 initially hid.
