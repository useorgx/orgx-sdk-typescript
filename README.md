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

## Context continuation

`prepareContext`, `syncContext`, and `expandContextEvidence` use the existing context-pack and artifact APIs.
Sync requests a fresh full pack until the server supports verified coherent deltas.
Inspect `context_delivery`: current best-effort capsules do not establish action
authority, completeness, or measured model-token savings. Count expanded evidence
in the receiving model’s input budget. Requires the app context-delivery release.


## Portable context continuation

```ts
const first = await client.syncContext({ workspace_id }, null);
const next = await client.syncContext({ workspace_id }, first);
const evidence = await client.expandContextEvidence(artifactId, 2);
```

Retain the returned continuation, including its exact serialized bytes, between
calls. Each sync authenticates and prepares current context. The client validates
full or delta transfer hashes and retries a missing or corrupted base once with
a fresh read. Acknowledgement is transport state, not permission to act. Artifact
expansion with an expected version returns an API conflict if the revision changed.
