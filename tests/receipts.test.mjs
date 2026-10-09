import { test } from 'node:test';
import assert from 'node:assert/strict';
import { OrgXClient, OrgXApiError } from '../dist/index.js';
import { receipt } from './receipt-v02-fixture.mjs';

test('portable v0.2 import and validation preserve every field and the idempotency key', async () => {
  const calls = [];
  const client = new OrgXClient({ apiKey: 'fixture', fetch: async (url, init) => {
    calls.push({ url: new URL(url), init });
    return Response.json({ ok: true, schema_version: receipt.schema_version });
  } });
  await client.importAgentWorkReceipt({ receipt, workspaceId: 'workspace', idempotencyKey: 'receipt-key' });
  await client.validateAgentWorkReceipt(receipt);
  assert.equal(calls.length, 2);
  assert.equal(calls[0].url.pathname, '/api/v1/agent-work-receipts');
  assert.equal(calls[0].init.headers.get('Idempotency-Key'), 'receipt-key');
  assert.deepEqual(JSON.parse(calls[0].init.body), { workspace_id: 'workspace', receipt });
  assert.equal(calls[1].url.pathname, '/api/v1/agent-work-receipts/validate');
  assert.deepEqual(JSON.parse(calls[1].init.body), receipt);
});

test('a denied receipt import is not retried with another endpoint or condensed payload', async () => {
  const calls = [];
  const client = new OrgXClient({ fetch: async (url, init) => {
    calls.push({ url, body: JSON.parse(init.body) });
    return Response.json({ error: { code: 'forbidden', message: 'Denied' } }, { status: 403 });
  } });
  await assert.rejects(client.importAgentWorkReceipt({ receipt, idempotencyKey: 'receipt-key' }), error => error instanceof OrgXApiError && error.status === 403);
  assert.equal(calls.length, 1);
  assert.deepEqual(calls[0].body.receipt, receipt);
});
