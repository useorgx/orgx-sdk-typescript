import { test } from 'node:test';
import assert from 'node:assert/strict';
import { OrgXClient, OrgXApiError } from '../dist/index.js';

const response = { data: { mode: 'shadow', receipt_id: 'receipt-server', duplicate: true, limitations: ['Current controller activation: policy_disabled.'] } };

test('controller status preserves workspace scope, protocol and the server envelope', async () => {
  const calls = [];
  const client = new OrgXClient({ apiKey: 'fixture', fetch: async (url, init) => {
    calls.push({ url: new URL(url), init });
    return Response.json(response);
  } });
  assert.deepEqual(await client.getControllerStatus('workspace/a?b', 'growth'), response);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url.pathname, '/api/v1/controllers/growth');
  assert.equal(calls[0].url.searchParams.get('workspace_id'), 'workspace/a?b');
  assert.equal(calls[0].url.searchParams.get('protocol_version'), 'orgx.controller.v1');
  assert.equal(calls[0].init.headers.get('authorization'), 'Bearer fixture');
});

test('reconciliation binds idempotency to the shadow request and preserves explicit controls', async () => {
  const calls = [];
  const client = new OrgXClient({ token: 'fixture', fetch: async (url, init) => {
    calls.push({ url, init }); return Response.json(response);
  } });
  assert.deepEqual(await client.reconcileController({ workspaceId: 'w', domain: 'growth', idempotencyKey: 'retry-key', specRevision: 'revision', inputCursor: '', maxInputAgeSeconds: 0 }), response);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].init.method, 'POST');
  assert.equal(calls[0].init.headers.get('Idempotency-Key'), 'retry-key');
  assert.deepEqual(JSON.parse(calls[0].init.body), {
    workspace_id: 'w', idempotency_key: 'retry-key', mode: 'shadow', protocol_version: 'orgx.controller.v1',
    spec_revision: 'revision', input_cursor: '', max_input_age_seconds: 0,
  });
});

test('controller denial is preserved without automatic retry', async () => {
  let calls = 0;
  const client = new OrgXClient({ fetch: async () => {
    calls++; return Response.json({ error: { code: 'controller_disabled', message: 'Disabled' } }, { status: 403 });
  } });
  await assert.rejects(client.reconcileController({ workspaceId: 'w', domain: 'growth', idempotencyKey: 'key' }), error => error instanceof OrgXApiError && error.status === 403 && error.code === 'controller_disabled');
  assert.equal(calls, 1);
});
