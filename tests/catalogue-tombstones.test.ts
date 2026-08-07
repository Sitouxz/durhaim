import assert from 'node:assert/strict';
import test from 'node:test';
import {
  catalogueTombstoneKey,
  catalogueTombstoneSlug,
} from '../src/lib/catalogue-tombstones.ts';

test('catalogue tombstone keys preserve the exact product slug', () => {
  const slug = 'royale-mamba-mark-2';
  const key = catalogueTombstoneKey(slug);

  assert.equal(key, 'catalogue_deleted_product:royale-mamba-mark-2');
  assert.equal(catalogueTombstoneSlug(key), slug);
});

test('unrelated site settings cannot be mistaken for catalogue tombstones', () => {
  assert.equal(catalogueTombstoneSlug('public_domain'), null);
  assert.equal(catalogueTombstoneSlug('catalogue_deleted_product:'), '');
});
