# `@useorgx/sdk`

Typed client for OrgX REST API v1.

```ts
import { OrgXClient } from '@useorgx/sdk';

const orgx = new OrgXClient({ apiKey: process.env.ORGX_API_KEY });
const created = await orgx.createWork({
  title: 'Review the launch plan',
  idempotencyKey: 'launch-plan-review-001',
});
await orgx.completeWork({
  taskId: created.data.taskId,
  expectedUpdatedAt: String(created.data.task.updated_at),
  expectedAggregateVersion: created.data.aggregateVersion,
  evidence: { reviewedSections: 12, brokenLinks: 0 },
  idempotencyKey: 'launch-plan-review-complete-001',
});
```

API reference: https://docs.useorgx.com/docs/api/overview

## Context delivery

The OrgX 1.1 source supports prepared delivery and portable full/delta continuation.
Registry publication is tracked in [Release setup](RELEASING.md).

### Prepared context

```ts
const prepared = await orgx.prepareContext({
  workspace_id,
  response_profile: "prepared",
});
```

Prepared delivery requests a compact direct response. It cannot be combined with
delta mode. Inspect `context_delivery` for source consistency and completeness;
context delivery does not grant authority to act.

### Portable continuation

```ts
const first = await orgx.syncContext({ workspace_id }, null);
const next = await orgx.syncContext({ workspace_id }, first);
const evidence = await orgx.expandContextEvidence(artifactId, 2);
```

Retain the returned continuation, including its exact serialized bytes, between
calls. Each sync authenticates and prepares current context using the full profile.
The server selects a delta only when it is smaller; otherwise it sends full state.
The client validates transfer hashes and repairs a missing or corrupted retained
base with one fresh read. Pass `null` to start portable continuation. The older single-argument capsule acknowledgement form requests a full rebootstrap.

Artifact expansion with an expected version returns a conflict if the current
revision differs. Include expanded evidence in the receiving model's input budget.

Transport savings do not establish model-token savings, task correctness, human
acceptance, or a performance SLA.


## Controller reconciliation

Read the current controller revision before requesting a shadow reconciliation:

```ts
const status = await client.getControllerStatus(workspaceId, 'growth');
const result = await client.reconcileController({
  workspaceId,
  domain: 'growth',
  specRevision: status.data.spec_revision,
  idempotencyKey: 'growth-review-2026-09-09',
});
```

Reuse the same idempotency key only when retrying the same request. Both calls return the server envelope, including receipts and limitations. A healthy historical run does not establish current enablement; inspect the reported limitations. Reconciliation creates shadow proposals for human review and grants no execution or policy authority. The server validates workspace access, activation, revision and evidence freshness.
