/**
 * Thin, typed OrgX v1 client.
 *
 * The OpenAPI document remains the wire-contract source of truth. This
 * runtime owns transport, authentication, idempotency, and workspace query
 * handling; it deliberately does not reimplement server authorization or
 * lifecycle rules.
 */

import type {
  AdoptionProjection,
  MeterUsageProjection,
  ValueCaseProjection,
  WorkLedger,
  WorkLedgerGranularity,
  WorkLedgerProjectionMeta,
} from './projections.js';

export type {
  AdoptionProjection,
  MeterUsageBucket,
  MeterUsageProjection,
  ValueCaseProjection,
  WorkLedger,
  WorkLedgerCounts,
  WorkLedgerGranularity,
  WorkLedgerProjectionMeta,
  WorkLedgerSourceHealth,
} from './projections.js';

import type { ContextPreparation, ContextPreparationInput } from './context.js';
import {
  applyContextTransfer,
  type ContextContinuation,
} from './continuation.js';
export {
  applyContextTransfer,
  type ContextContinuation,
} from './continuation.js';
export type {
  ContextPreparation,
  ContextPreparationInput,
  ContextDelivery,
} from './context.js';

export type {
  DiscoveryRunMode,
  DiscoveryRunStatus,
  SourceHealth,
  DiscoveryRun,
  DiscoveryResult,
  OperatingProcess,
  Episode,
  HandoffStatus,
  HandoffPriority,
  Handoff,
  WorkCommandResult,
  LedgerEvent,
  EventStreamPage,
  EventStreamSubscriptionOptions,
  EventStreamSubscription,
  ApiEnvelope,
} from './models.js';
import type {
  DiscoveryRunMode,
  DiscoveryResult,
  OperatingProcess,
  Episode,
  HandoffPriority,
  Handoff,
  WorkCommandResult,
  LedgerEvent,
  EventStreamPage,
  EventStreamSubscriptionOptions,
  EventStreamSubscription,
  ApiEnvelope,
} from './models.js';

export class OrgXApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details: unknown;

  constructor(
    status: number,
    code: string,
    message: string,
    details?: unknown
  ) {
    super(message);
    this.name = 'OrgXApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export interface OrgXClientOptions {
  baseUrl?: string;
  apiKey?: string;
  token?: string;
  fetch?: typeof globalThis.fetch;
}

export interface StartDiscoveryInput {
  workspaceId: string;
  mode?: DiscoveryRunMode;
  query?: string | null;
  sourceKinds?: string[];
  idempotencyKey: string;
}

export interface CreateHandoffInput {
  workspaceId: string;
  handoffId?: string;
  handoffKey: string;
  fromStageKey: string;
  toStageKey: string;
  sourceProcessRef?: string | null;
  sourceRevisionRef?: string | null;
  title: string;
  summary?: string | null;
  priority?: HandoffPriority;
  slaMinutes?: number | null;
  dueAt?: string | null;
  proofRequirements?: Array<Record<string, unknown>>;
  idempotencyKey: string;
}

export interface CreateWorkInput {
  title: string;
  idempotencyKey: string;
  workspaceId?: string;
  commandId?: string;
  initiativeId?: string;
  workstreamId?: string;
  milestoneId?: string;
  description?: string | null;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: string | null;
  metadata?: Record<string, unknown>;
  estimatedCostCents?: number;
  causationId?: string | null;
  correlationId?: string | null;
}

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

export interface CompleteWorkInput {
  taskId: string;
  expectedUpdatedAt: string;
  expectedAggregateVersion: number;
  summary?: string | null;
  evidence?: Record<string, unknown>;
  costCents?: number;
  causationId?: string | null;
  correlationId?: string | null;
  idempotencyKey: string;
}

export class OrgXClient {
  private readonly baseUrl: string;
  private readonly token: string | undefined;
  private readonly fetchImpl: typeof globalThis.fetch;

  constructor(options: OrgXClientOptions = {}) {
    this.baseUrl = (options.baseUrl ?? 'https://useorgx.com/api/v1').replace(
      /\/$/,
      ''
    );
    this.token = options.apiKey ?? options.token;
    this.fetchImpl = options.fetch ?? globalThis.fetch;
  }

  /** Prepare current context. Returned references do not grant action authority. */
  async prepareContext(
    input: ContextPreparationInput
  ): Promise<ContextPreparation> {
    const response = await this.request<ApiEnvelope<ContextPreparation>>(
      '/context-pack',
      {
        method: 'POST',
        body: input,
      }
    );
    return response.data;
  }

  /** Existing capsule acknowledgements remain a full rebootstrap. */
  async syncContext(
    input: ContextPreparationInput & { acknowledged_capsule_id: string }
  ): Promise<ContextPreparation>;
  /** Pass null for a fresh portable base; pass that result for acknowledged deltas. */
  async syncContext(
    input: ContextPreparationInput,
    previous: ContextContinuation | null
  ): Promise<ContextContinuation>;
  async syncContext(
    input: ContextPreparationInput,
    previous?: ContextContinuation | null
  ): Promise<ContextPreparation | ContextContinuation> {
    if (previous === undefined) return this.prepareContext(input);
    const {
      acknowledged_capsule_id: _legacy,
      acknowledged_context_version: _version,
      ...scope
    } = input;
    const response = await this.prepareContext({
      ...scope,
      delivery_mode: 'delta',
      ...(previous ? { acknowledged_context_version: previous.version } : {}),
    });
    try {
      return await applyContextTransfer(response, previous);
    } catch (error) {
      if (!previous) throw error;
      // One authenticated fresh read repairs an evicted or corrupted local base.
      return applyContextTransfer(
        await this.prepareContext({ ...scope, delivery_mode: 'delta' })
      );
    }
  }

  /** Dereference an OrgX artifact through the existing authenticated API. */
  async expandContextEvidence(
    artifactId: string,
    expectedVersion?: number
  ): Promise<Record<string, unknown>> {
    if (
      expectedVersion !== undefined &&
      (!Number.isSafeInteger(expectedVersion) || expectedVersion < 1)
    )
      throw new Error('Artifact version must be a positive integer');
    const response = await this.request<ApiEnvelope<Record<string, unknown>>>(
      `/artifacts/${encodeURIComponent(artifactId)}${
        expectedVersion === undefined
          ? ''
          : `?expected_version=${expectedVersion}`
      }`
    );
    return response.data;
  }

  async startDiscoveryRun(
    input: StartDiscoveryInput
  ): Promise<DiscoveryResult> {
    const response = await this.request<ApiEnvelope<DiscoveryResult>>(
      '/discovery-runs',
      {
        method: 'POST',
        idempotencyKey: input.idempotencyKey,
        body: {
          workspace_id: input.workspaceId,
          mode: input.mode ?? 'bounded_sync',
          query: input.query ?? null,
          source_kinds: input.sourceKinds ?? [],
        },
      }
    );
    return response.data;
  }

  async listDiscoveryRuns(
    workspaceId: string,
    limit = 20
  ): Promise<DiscoveryResult[]> {
    const response = await this.request<ApiEnvelope<DiscoveryResult[]>>(
      `/discovery-runs?workspace_id=${encodeURIComponent(
        workspaceId
      )}&limit=${limit}`
    );
    return response.data;
  }

  async getDiscoveryRun(
    workspaceId: string,
    runId: string
  ): Promise<DiscoveryResult> {
    const response = await this.request<ApiEnvelope<DiscoveryResult>>(
      `/discovery-runs/${encodeURIComponent(
        runId
      )}?workspace_id=${encodeURIComponent(workspaceId)}`
    );
    return response.data;
  }

  async proposeProcessFromDiscovery(input: {
    workspaceId: string;
    discoveryRunId: string;
    processCandidateId: string;
    idempotencyKey: string;
  }): Promise<
    ApiEnvelope<{
      process: OperatingProcess;
      revision: Record<string, unknown>;
      discoveryRunId: string;
      processCandidateId: string;
      ledger: Record<string, unknown>;
    }>
  > {
    return this.request(
      `/discovery-runs/${encodeURIComponent(input.discoveryRunId)}/propose`,
      {
        method: 'POST',
        idempotencyKey: input.idempotencyKey,
        body: {
          workspace_id: input.workspaceId,
          process_candidate_id: input.processCandidateId,
        },
      }
    );
  }

  async listOperatingProcesses(
    workspaceId: string
  ): Promise<OperatingProcess[]> {
    const response = await this.request<ApiEnvelope<OperatingProcess[]>>(
      `/operating-processes?workspace_id=${encodeURIComponent(workspaceId)}`
    );
    return response.data;
  }

  async listEpisodes(workspaceId: string, limit = 50): Promise<Episode[]> {
    const response = await this.request<ApiEnvelope<Episode[]>>(
      `/episodes?workspace_id=${encodeURIComponent(workspaceId)}&limit=${limit}`
    );
    return response.data;
  }

  async listEvents(
    workspaceId: string,
    options: {
      cursor?: string;
      limit?: number;
      eventTypes?: string[];
      aggregateType?: string;
    } = {}
  ): Promise<EventStreamPage> {
    const params = new URLSearchParams({ workspace_id: workspaceId });
    if (options.cursor) params.set('cursor', options.cursor);
    if (options.limit !== undefined) params.set('limit', String(options.limit));
    if (options.aggregateType)
      params.set('aggregate_type', options.aggregateType);
    for (const eventType of options.eventTypes ?? []) {
      params.append('event_type', eventType);
    }
    const response = await this.request<ApiEnvelope<LedgerEvent[]>>(
      `/events/stream?${params.toString()}`
    );
    return {
      events: response.data,
      nextCursor: response.meta.nextCursor ?? null,
      sourceCursor: response.meta.sourceCursor ?? null,
      hasMore: response.meta.hasMore ?? false,
      limit: response.meta.limit ?? options.limit ?? response.data.length,
    };
  }

  /**
   * Subscribe to the bounded SSE transport over the same canonical event
   * ledger. The server lease expires and `done` resolves; callers should
   * reconnect with the last cursor they received from `onEvent`.
   */
  async subscribeEvents(
    workspaceId: string,
    onEvent: (event: LedgerEvent, cursor: string) => void | Promise<void>,
    options: EventStreamSubscriptionOptions = {}
  ): Promise<EventStreamSubscription> {
    const params = new URLSearchParams({
      workspace_id: workspaceId,
      transport: 'sse',
    });
    if (options.after) params.set('after', options.after);
    if (options.limit !== undefined) params.set('limit', String(options.limit));
    if (options.streamMs !== undefined)
      params.set('stream_ms', String(options.streamMs));
    if (options.pollMs !== undefined)
      params.set('poll_ms', String(options.pollMs));
    if (options.aggregateType)
      params.set('aggregate_type', options.aggregateType);
    for (const eventType of options.eventTypes ?? []) {
      params.append('event_type', eventType);
    }

    const controller = new AbortController();
    const abortFromCaller = () => controller.abort();
    if (options.signal) {
      if (options.signal.aborted) controller.abort();
      else
        options.signal.addEventListener('abort', abortFromCaller, {
          once: true,
        });
    }

    const headers = new Headers({ accept: 'text/event-stream' });
    if (this.token) headers.set('authorization', `Bearer ${this.token}`);
    const response = await this.fetchImpl(
      `${this.baseUrl}/events/stream?${params.toString()}`,
      { method: 'GET', headers, signal: controller.signal }
    );
    if (!response.ok || !response.body) {
      const payload = (await response.json().catch(() => null)) as {
        error?: { code?: string; message?: string; details?: unknown };
      } | null;
      const error = payload?.error;
      throw new OrgXApiError(
        response.status,
        error?.code ?? 'event_stream_failed',
        error?.message ?? 'OrgX event stream failed',
        error?.details
      );
    }

    const done = (async () => {
      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let eventName = 'message';
      let eventId = '';
      let dataLines: string[] = [];

      const dispatch = async () => {
        if (dataLines.length === 0) return;
        const data = dataLines.join('\n');
        const name = eventName;
        const id = eventId;
        eventName = 'message';
        eventId = '';
        dataLines = [];
        if (name === 'ledger_event') {
          await onEvent(JSON.parse(data) as LedgerEvent, id);
        } else if (name === 'error') {
          const payload = JSON.parse(data) as {
            code?: string;
            message?: string;
          };
          throw new OrgXApiError(
            503,
            payload.code ?? 'event_stream_unavailable',
            payload.message ?? 'OrgX event stream unavailable'
          );
        }
      };

      const consumeLine = async (line: string) => {
        if (line === '') {
          await dispatch();
          return;
        }
        if (line.startsWith(':')) return;
        const separator = line.indexOf(':');
        const field = separator === -1 ? line : line.slice(0, separator);
        const value =
          separator === -1 ? '' : line.slice(separator + 1).replace(/^ /, '');
        if (field === 'event') eventName = value;
        else if (field === 'id') eventId = value;
        else if (field === 'data') dataLines.push(value);
      };

      while (true) {
        const chunk = await reader.read();
        buffer += decoder.decode(chunk.value ?? new Uint8Array(), {
          stream: !chunk.done,
        });
        const lines = buffer.split(/\r?\n/);
        buffer = lines.pop() ?? '';
        for (const line of lines) await consumeLine(line);
        if (chunk.done) {
          if (buffer) await consumeLine(buffer);
          await dispatch();
          break;
        }
      }
    })().finally(() => {
      options.signal?.removeEventListener('abort', abortFromCaller);
    });

    return {
      close: () => controller.abort(),
      done,
    };
  }

  async getWorkLedger(
    workspaceId: string,
    options: {
      from?: string;
      to?: string;
      granularity?: WorkLedgerGranularity;
      timezone?: string;
      includeSourceHealth?: boolean;
    } = {}
  ): Promise<ApiEnvelope<WorkLedger>> {
    const params = new URLSearchParams({ workspace_id: workspaceId });
    if (options.from) params.set('from', options.from);
    if (options.to) params.set('to', options.to);
    if (options.granularity) params.set('granularity', options.granularity);
    if (options.timezone) params.set('timezone', options.timezone);
    if (options.includeSourceHealth === false)
      params.set('include_source_health', 'false');
    return this.request<ApiEnvelope<WorkLedger>>(
      `/projections/work-ledger?${params.toString()}`
    );
  }

  async getAdoptionProjection(
    workspaceId: string,
    processId: string
  ): Promise<ApiEnvelope<AdoptionProjection>> {
    const params = new URLSearchParams({
      workspace_id: workspaceId,
      process_id: processId,
    });
    return this.request<ApiEnvelope<AdoptionProjection>>(
      `/projections/adoption?${params.toString()}`
    );
  }

  async getValueCaseProjection(
    workspaceId: string,
    processId: string
  ): Promise<ApiEnvelope<ValueCaseProjection>> {
    const params = new URLSearchParams({
      workspace_id: workspaceId,
      process_id: processId,
    });
    return this.request<ApiEnvelope<ValueCaseProjection>>(
      `/projections/value-case?${params.toString()}`
    );
  }

  async getMeterUsageProjection(
    workspaceId: string,
    options: { from?: string; to?: string } = {}
  ): Promise<ApiEnvelope<MeterUsageProjection>> {
    const params = new URLSearchParams({ workspace_id: workspaceId });
    if (options.from) params.set('from', options.from);
    if (options.to) params.set('to', options.to);
    return this.request<ApiEnvelope<MeterUsageProjection>>(
      `/projections/meter-usage?${params.toString()}`
    );
  }

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
          ...(input.specRevision ? { spec_revision: input.specRevision } : {}),
          ...(input.inputCursor ? { input_cursor: input.inputCursor } : {}),
          ...(input.maxInputAgeSeconds !== undefined
            ? { max_input_age_seconds: input.maxInputAgeSeconds }
            : {}),
        },
      }
    );
  }

  async listHandoffs(workspaceId: string): Promise<Handoff[]> {
    const response = await this.request<ApiEnvelope<Handoff[]>>(
      `/handoffs?workspace_id=${encodeURIComponent(workspaceId)}`
    );
    return response.data;
  }

  async createWork(
    input: CreateWorkInput
  ): Promise<ApiEnvelope<WorkCommandResult>> {
    return this.request<ApiEnvelope<WorkCommandResult>>('/work', {
      method: 'POST',
      idempotencyKey: input.idempotencyKey,
      body: {
        ...(input.workspaceId ? { workspace_id: input.workspaceId } : {}),
        ...(input.commandId ? { command_id: input.commandId } : {}),
        title: input.title,
        description: input.description ?? null,
        ...(input.initiativeId && input.workstreamId && input.milestoneId
          ? {
              initiative_id: input.initiativeId,
              workstream_id: input.workstreamId,
              milestone_id: input.milestoneId,
            }
          : {}),
        priority: input.priority ?? 'medium',
        due_date: input.dueDate ?? null,
        metadata: input.metadata ?? {},
        estimated_cost_cents: input.estimatedCostCents ?? 0,
        causation_id: input.causationId ?? null,
        correlation_id: input.correlationId ?? null,
      },
    });
  }

  async completeWork(
    input: CompleteWorkInput
  ): Promise<ApiEnvelope<WorkCommandResult>> {
    return this.request<ApiEnvelope<WorkCommandResult>>(
      `/work/${encodeURIComponent(input.taskId)}/complete`,
      {
        method: 'POST',
        idempotencyKey: input.idempotencyKey,
        body: {
          expected_updated_at: input.expectedUpdatedAt,
          expected_aggregate_version: input.expectedAggregateVersion,
          summary: input.summary ?? null,
          evidence: input.evidence ?? {},
          cost_cents: input.costCents ?? 0,
          causation_id: input.causationId ?? null,
          correlation_id: input.correlationId ?? null,
        },
      }
    );
  }

  async getHandoff(workspaceId: string, handoffId: string): Promise<Handoff> {
    const response = await this.request<ApiEnvelope<Handoff>>(
      `/handoffs/${encodeURIComponent(
        handoffId
      )}?workspace_id=${encodeURIComponent(workspaceId)}`
    );
    return response.data;
  }

  async createHandoff(input: CreateHandoffInput): Promise<Handoff> {
    const response = await this.request<ApiEnvelope<Handoff>>('/handoffs', {
      method: 'POST',
      idempotencyKey: input.idempotencyKey,
      body: {
        workspace_id: input.workspaceId,
        handoff_id: input.handoffId,
        handoff_key: input.handoffKey,
        from_stage_key: input.fromStageKey,
        to_stage_key: input.toStageKey,
        source_process_ref: input.sourceProcessRef ?? null,
        source_revision_ref: input.sourceRevisionRef ?? null,
        title: input.title,
        summary: input.summary ?? null,
        priority: input.priority ?? 'normal',
        sla_minutes: input.slaMinutes ?? null,
        due_at: input.dueAt ?? null,
        proof_requirements: input.proofRequirements ?? [],
      },
    });
    return response.data;
  }

  async claimHandoff(input: {
    workspaceId: string;
    handoffId: string;
    expectedAggregateVersion: number;
    idempotencyKey: string;
  }): Promise<Handoff> {
    const response = await this.request<ApiEnvelope<Handoff>>(
      `/handoffs/${encodeURIComponent(input.handoffId)}/claim`,
      {
        method: 'POST',
        idempotencyKey: input.idempotencyKey,
        body: {
          workspace_id: input.workspaceId,
          expected_aggregate_version: input.expectedAggregateVersion,
        },
      }
    );
    return response.data;
  }

  async fulfillHandoff(input: {
    workspaceId: string;
    handoffId: string;
    expectedAggregateVersion: number;
    result: Record<string, unknown>;
    idempotencyKey: string;
  }): Promise<Handoff> {
    const response = await this.request<ApiEnvelope<Handoff>>(
      `/handoffs/${encodeURIComponent(input.handoffId)}/fulfill`,
      {
        method: 'POST',
        idempotencyKey: input.idempotencyKey,
        body: {
          workspace_id: input.workspaceId,
          expected_aggregate_version: input.expectedAggregateVersion,
          result: input.result,
        },
      }
    );
    return response.data;
  }

  async proposeOperatingProcess(input: {
    workspaceId: string;
    process: OperatingProcess;
    revision: Record<string, unknown>;
    idempotencyKey: string;
  }): Promise<
    ApiEnvelope<{
      process: OperatingProcess;
      revision: Record<string, unknown>;
    }>
  > {
    return this.request('/operating-processes', {
      method: 'POST',
      idempotencyKey: input.idempotencyKey,
      body: {
        workspace_id: input.workspaceId,
        process: input.process,
        revision: input.revision,
      },
    });
  }

  async confirmOperatingProcess(input: {
    workspaceId: string;
    processId: string;
    expectedAggregateVersion: number;
    idempotencyKey: string;
  }): Promise<ApiEnvelope<Record<string, unknown>>> {
    return this.transitionOperatingProcess('confirm', input);
  }

  async activateOperatingProcess(input: {
    workspaceId: string;
    processId: string;
    expectedAggregateVersion: number;
    idempotencyKey: string;
  }): Promise<ApiEnvelope<Record<string, unknown>>> {
    return this.transitionOperatingProcess('activate', input);
  }

  private async transitionOperatingProcess(
    action: 'confirm' | 'activate',
    input: {
      workspaceId: string;
      processId: string;
      expectedAggregateVersion: number;
      idempotencyKey: string;
    }
  ): Promise<ApiEnvelope<Record<string, unknown>>> {
    return this.request(`/operating-processes/${input.processId}/${action}`, {
      method: 'POST',
      idempotencyKey: input.idempotencyKey,
      body: {
        workspace_id: input.workspaceId,
        expected_aggregate_version: input.expectedAggregateVersion,
      },
    });
  }

  private async request<T>(
    path: string,
    options: {
      method?: 'GET' | 'POST';
      body?: unknown;
      idempotencyKey?: string;
    } = {}
  ): Promise<T> {
    const headers = new Headers({ accept: 'application/json' });
    if (options.body !== undefined)
      headers.set('content-type', 'application/json');
    if (options.idempotencyKey)
      headers.set('Idempotency-Key', options.idempotencyKey);
    if (this.token) headers.set('authorization', `Bearer ${this.token}`);
    const response = await this.fetchImpl(`${this.baseUrl}${path}`, {
      method: options.method ?? 'GET',
      headers,
      body:
        options.body === undefined ? undefined : JSON.stringify(options.body),
    });
    const payload = (await response.json().catch(() => null)) as
      | { error?: { code?: string; message?: string; details?: unknown } }
      | T
      | null;
    if (!response.ok) {
      const error =
        payload && typeof payload === 'object' && 'error' in payload
          ? payload.error
          : undefined;
      throw new OrgXApiError(
        response.status,
        error?.code ?? 'request_failed',
        error?.message ?? `OrgX API request failed (${response.status})`,
        error?.details
      );
    }
    return payload as T;
  }
}
