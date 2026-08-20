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
