import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { OrgXClient, applyContextTransfer } from '../dist/index.js';

const version = text => 'sha256:' + createHash('sha256').update(text).digest('hex');
const serialized = JSON.stringify({ context_delivery: {}, text: 'résumé\u2028中文', value: 1e-7 }, null, 2);
const full = text => ({ context_transfer: { schema_version: 'orgx.context-transfer/v1', mode: 'full', serialized: text, version: version(text) } });

test('portable continuation reconstructs exact bytes and rejects tampering', async () => {
  const base = await applyContextTransfer(full(serialized));
  const delta = { context_transfer: { schema_version: 'orgx.context-transfer/v1', mode: 'delta', base_version: base.version, version: base.version, operations: [{ copy: [0, serialized.split('\n').length] }] } };
  assert.deepEqual(await applyContextTransfer(delta, base), base);
  await assert.rejects(applyContextTransfer(delta, { ...base, serialized: serialized + ' ' }), /base mismatch/);
  await assert.rejects(applyContextTransfer({ context_transfer: { ...delta.context_transfer, operations: [{ copy: [-1, 2] }] } }, base), /range/);
});

test('sync retries a corrupted base once with a fresh authenticated read', async () => {
  const calls = [];
  const base = await applyContextTransfer(full(serialized));
  const client = new OrgXClient({ apiKey: 'test', fetch: async (_url, init) => {
    calls.push(JSON.parse(init.body));
    return Response.json({ data: calls.length === 1 ? { context_transfer: { schema_version: 'orgx.context-transfer/v1', mode: 'delta', base_version: base.version, version: base.version, operations: [] } } : full(serialized) });
  } });
  const result = await client.syncContext({ workspace_id: 'w' }, base);
  assert.equal(result.serialized, serialized);
  assert.deepEqual(calls, [{ workspace_id: 'w', delivery_mode: 'delta', acknowledged_context_version: base.version }, { workspace_id: 'w', delivery_mode: 'delta' }]);
});
