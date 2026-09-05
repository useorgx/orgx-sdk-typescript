import { test } from 'node:test';
import assert from 'node:assert/strict';
import { OrgXClient } from '../dist/index.js';

test('context sync preserves scope, authorization and unverified delivery', async () => {
  const calls = [];
  const data = { context_delivery: { base_verified: false } };
  const client = new OrgXClient({ apiKey: 'test-key', fetch: async (...args) => {
    calls.push(args); return Response.json({ ok: true, data });
  } });
  const input = { response_profile: 'prepared', workspace_id: 'workspace', task_id: 'task', acknowledged_capsule_id: 'capsule_base' };
  assert.deepEqual(await client.syncContext(input), data);
  assert.equal(calls[0][0], 'https://useorgx.com/api/v1/context-pack');
  assert.deepEqual(JSON.parse(calls[0][1].body), input);
  assert.equal(calls[0][1].headers.get('authorization'), 'Bearer test-key');
});

test('artifact expansion cannot replace the SDK origin with a caller URL', async () => {
  let requested;
  const client = new OrgXClient({ fetch: async (url) => {
    requested = url; return Response.json({ data: { artifact: { id: 'a' } } });
  } });
  await client.expandContextEvidence('a/b');
  assert.equal(requested, 'https://useorgx.com/api/v1/artifacts/a%2Fb');
});
