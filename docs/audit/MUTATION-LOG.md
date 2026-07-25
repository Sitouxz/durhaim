# Database Mutation Log

Every write made against the production Supabase project during the audit, with its reversal.
Per AUDIT-PLAN §4.

---

## 2026-07-25 · P0-1 (F-1) schema fix

**Applied by:** Executor, via Supabase dashboard SQL editor
**Script:** [`supabase/fix-serial-rls-exposure.sql`](../../supabase/fix-serial-rls-exposure.sql)
**Result:** `Success. No rows returned`

| Change | Reversal (not recommended — reopens the leak) |
|---|---|
| `DROP POLICY public_read_verifiable_serials ON serial_numbers` | recreate policy `FOR SELECT TO anon, authenticated USING (status != 'REVOKED')` |
| `record_serial_verification` retyped `INTEGER` → `JSONB`, gained `p_count BOOLEAN DEFAULT TRUE` | restore the prior 3-arg `RETURNS INTEGER` definition from git history of `supabase/schema.sql` |
| `GRANT EXECUTE` moved to the 4-arg signature | re-grant on the 3-arg signature |

Data rows touched: none. DDL only.

---

## 2026-07-25 · F-1 post-apply verification fixtures

Three tagged serials created to exercise the RPC, because **no production serial has a
`product_id`** (F-2) and the `product_name` / `product_image` payload could not otherwise be
tested.

| Serial | Status | product_id |
|---|---|---|
| `ZZAUDIT-ACTIVE-0001` | ACTIVE | `2708714a-…` (TBP VEST MK-IV) |
| `ZZAUDIT-REVOKED-0001` | REVOKED | same |
| `ZZAUDIT-INACTIVE-001` | INACTIVE | same |

Side effects during testing: `verification_count` incremented on the fixtures only
(ACTIVE → 4, INACTIVE → 1); 3 rows added to `verification_logs`, all referencing fixture
serial ids.

**Reversal — executed:**

```sql
DELETE FROM public.serial_numbers WHERE serial LIKE 'ZZAUDIT%';
-- verification_logs rows cascade via serial_id ON DELETE CASCADE
```

**Reconciliation after teardown:**

| Table | Pre-test | Post-teardown | Delta |
|---|---|---|---|
| `serial_numbers` | 40,850 | 40,850 | 0 |
| `verification_logs` | 1,024 | 1,024 | 0 |
| `products` | 3 | 3 | 0 |
| residual `ZZAUDIT%` rows | — | 0 | — |

No production serial's `verification_count` was incremented, and no existing row was modified
or deleted at any point.

---

## 2026-07-25 · Pre-audit snapshot

`backups/pre-audit-2026-07-25/` (15 MB, gitignored) — every table exported to JSON via
PostgREST with the service role, paged at 1,000 rows. Taken before any Track A write.

| Table | Rows |
|---|---|
| `categories` | 4 |
| `products` | 3 |
| `serial_lists` | 19 |
| `serial_numbers` | 40,850 |
| `verification_logs` | 1,031 |
| `newsletter_subscribers` | 0 |
| `site_settings` | 4 |
| `admin_users` | 1 |
| `admin_activity_logs` | 29 |

Not a `pg_dump`: no `DATABASE_URL` is available, so this captures row data only — not schema,
functions, policies or grants. Schema is recoverable from `supabase/*.sql` in git.

---

## 2026-07-25 · Track A / N-1 anon write-permission probes

To test writes without touching production data, one throwaway row was seeded per table with
the service role, the anon key was then used to attempt `PATCH` and `DELETE` against that row,
and the row was re-read to confirm it was unchanged. Every seeded row was deleted afterwards.

Rows created and removed: 9 seeded probe rows, plus 3 `newsletter_subscribers` entries
(`zzaudit-news2@`, `zzaudit-plain@`, `zzaudit-ins@durhaim.test`) from insert probes — anon
insert being permitted there by design.

**Reversal — executed:**

```sql
DELETE FROM public.newsletter_subscribers WHERE email ILIKE '%zzaudit%';
-- plus per-table deletes on slug/serial/name/key/email/actor_email ILIKE '%zzaudit%'
```

**Cleanup caveat worth recording:** the first sweep used PostgREST `?col=like.zzaudit%`, which
did not match — PostgREST expects `*` as its wildcard, not SQL `%`. Three rows survived and
were only caught by the reconciliation pass below. Always reconcile; do not trust the delete's
status code.

**Reconciliation — every table matches the pre-audit snapshot exactly:**

| Table | Snapshot | After | Delta |
|---|---|---|---|
| `categories` | 4 | 4 | 0 |
| `products` | 3 | 3 | 0 |
| `serial_lists` | 19 | 19 | 0 |
| `serial_numbers` | 40,850 | 40,850 | 0 |
| `verification_logs` | 1,031 | 1,031 | 0 |
| `newsletter_subscribers` | 0 | 0 | 0 |
| `site_settings` | 4 | 4 | 0 |
| `admin_users` | 1 | 1 | 0 |
| `admin_activity_logs` | 29 | 29 | 0 |
