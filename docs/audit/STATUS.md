# Audit Status — 2026-07-25

`main` @ `c135a05`. `npm run verify` exits 0. Database reconciled to
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
| F-7 | P2 | Nothing cacheable; functions run in `iad1` | open |
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

**14 fixed · 2 blocked on your decision · 1 needs DDL · 3 open**

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
| A9 infrastructure | **not started** — Vercel preview exposure, DNS, SPF/DKIM/DMARC, `npm audit` |
| A10 privacy | **not started** — IP/UA retention, no privacy policy, no cookie notice, PDP Law |
| B functional flows | partial — verification flows done; catalogue, WhatsApp, newsletter, admin CRUD outstanding |
| C UI/UX | partial — baseline captured, F-12/F-13 fixed; admin UI and cross-browser outstanding |
| D accessibility | **not started** — the largest untouched track |
| E performance | **not started** — F-7 is the known item |
| F SEO | partial — F-6, F-15 fixed; structured data, crawl, hreflang outstanding |
| G data integrity | partial — F-2 root cause found; collisions, orphans, restore drill outstanding |
| H reliability / ops | partial — F-3 fixed; no error tracking, no uptime monitoring, no test framework |

## Reproducing

Capture tooling in `docs/audit/tools/` — zero dependencies, drives system Chrome over CDP:

```bash
node docs/audit/tools/mkmanifest.mjs && node docs/audit/tools/shoot.mjs base.json
```

`diag.mjs <url> <width>` finds overflowing elements; `labelcheck.mjs` measures clipped labels;
`a3-rolematrix.mjs` and `a2a4a8.mjs` re-run the security matrices (both seed and tear down their
own `ZZAUDIT` fixtures). Scan `_index.json` for non-zero `overflowPx` before opening any image —
note that it only reports rightward overflow, which is how F-13 initially hid.
