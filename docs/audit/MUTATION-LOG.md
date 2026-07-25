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
