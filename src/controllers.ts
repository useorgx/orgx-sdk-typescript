import type { ApiEnvelope } from './index.js';

export type ControllerDomain =
  | 'product'
  | 'engineering'
  | 'growth'
  | 'sales'
  | 'design'
  | 'operations';

export interface ControllerApiResult {
  controller_id: string;
  domain: ControllerDomain;
  spec_revision: string;
  run_id: string | null;
  last_run_id: string | null;
  status: 'never_run' | 'running' | 'healthy' | 'degraded' | 'failed';
  result: 'proposal' | 'noop';
  last_result: 'proposal' | 'noop' | null;
  last_signal_id: string | null;
  last_signal_state: 'observed' | 'cleared' | null;
  last_error_code: string | null;
  event_ids: string[];
  projection_cursor: string;
  decision_id: string | null;
  decision_event_id: string | null;
  receipt_id: string | null;
  last_receipt_id: string | null;
  duplicate: boolean;
  protocol_version: 'orgx.controller.v1';
  mode: 'shadow';
  proposal: Record<string, unknown> | null;
  learning_proposal: Record<string, unknown> | null;
  noop_reason: string | null;
  source_health: Record<string, unknown> | null;
  limitations: string[];
}

export interface ReconcileControllerInput {
  workspaceId: string;
  domain: ControllerDomain;
  idempotencyKey: string;
  specRevision?: string;
  inputCursor?: string;
  maxInputAgeSeconds?: number;
}

/** Controller calls share the authenticated, error-preserving client transport. */
export abstract class ControllerOperations {
  protected abstract request<T>(path: string, options?: {
    method?: 'GET' | 'POST'; body?: unknown; idempotencyKey?: string;
  }): Promise<T>;

  async getControllerStatus(
    workspaceId: string,
    domain: ControllerDomain
  ): Promise<ApiEnvelope<ControllerApiResult>> {
    const params = new URLSearchParams({
      workspace_id: workspaceId,
      protocol_version: 'orgx.controller.v1',
    });
    return this.request<ApiEnvelope<ControllerApiResult>>(
      `/controllers/${encodeURIComponent(domain)}?${params.toString()}`
    );
  }

  async reconcileController(
    input: ReconcileControllerInput
  ): Promise<ApiEnvelope<ControllerApiResult>> {
    return this.request<ApiEnvelope<ControllerApiResult>>(
      `/controllers/${encodeURIComponent(input.domain)}/reconcile`,
      {
        method: 'POST',
        idempotencyKey: input.idempotencyKey,
        body: {
          workspace_id: input.workspaceId,
          idempotency_key: input.idempotencyKey,
          protocol_version: 'orgx.controller.v1',
          mode: 'shadow',
          ...(input.specRevision !== undefined ? { spec_revision: input.specRevision } : {}),
          ...(input.inputCursor !== undefined ? { input_cursor: input.inputCursor } : {}),
          ...(input.maxInputAgeSeconds !== undefined
            ? { max_input_age_seconds: input.maxInputAgeSeconds }
            : {}),
        },
      }
    );
  }

}
