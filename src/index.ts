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

import type {
  AgentWorkReceipt,
  Artifact,
  ArtifactCreateResult,
  ArtifactDetailResult,
  ArtifactEntityType,
  ArtifactStatus,
  ArtifactTypeListResult,
  CheckoutResponse,
  Decision,
  DecisionShape,
  DecisionStatus,
  DecisionUrgency,
  DedupClaimResult,
  EstimateResponse,
  InitiativeCommitData,
  InitiativeCommitOverrides,
  InitiativeDetail,
  InitiativePlan,
  InitiativeProposal,
  InitiativeProposalContext,
  InitiativeProposalDetail,
  InitiativeProposalWorkstreamInput,
  InitiativeScaffoldData,
  InitiativeSourceEvidence,
  LifecycleAction,
  LifecycleLevel,
  LifecycleResult,
  OperatingMapResult,
  OperatingProcessDetail,
  ReceiptImportSuccess,
  ReceiptValidationResult,
  ReceiptValidatorMetadata,
  RunActionResult,
  RunControlAction,
  ShowcaseResponse,
  StudioContentType,
  WorkloadDiagnosisRequest,
  WorkloadDiagnosisResponse,
  WorkloadDoctorMetadata,
  WorkTask,
  WorkTaskDetail,
  WorkTaskStatus,
} from './types.js';

export * from './types.js';

import type { ContextPreparation, ContextPreparationInput } from './context.js';
export type { ContextPreparation, ContextPreparationInput, ContextDelivery } from './context.js';

export type DiscoveryRunMode = 'bounded_sync' | 'deep_search' | 'reconcile';
export type DiscoveryRunStatus =
  | 'queued'
  | 'running'
  | 'succeeded'
  | 'partial'
  | 'failed'
  | 'cancelled';

export interface SourceHealth {
  sourceId: string;
  sourceKind: string;
  status:
    | 'connected'
    | 'syncing'
    | 'stale'
    | 'degraded'
    | 'disconnected'
    | 'permission_required';
  cursor: string | null;
  lastSuccessfulSyncAt: string | null;
  recordsObserved: number;
  errorCode: string | null;
  limitations: string[];
}

export interface DiscoveryRun {
  schemaVersion: '1.0.0';
  id: string;
  workspaceId: string;
  mode: DiscoveryRunMode;
  status: DiscoveryRunStatus;
  initiatedBy: { type: string; id: string; displayName?: string };
  query: string | null;
  sourceKinds: string[];
  sourceCursors: Record<string, string>;
  observationCount: number;
  candidateProcessCardCount: number;
  citationCount: number;
  costMicros: string;
  confidence: number | null;
  startedAt: string;
  completedAt: string | null;
  sourceHealth: SourceHealth[];
  limitations: string[];
}

export interface DiscoveryResult {
  run: DiscoveryRun;
  observations: Array<Record<string, unknown>>;
  processCards: Array<Record<string, unknown>>;
  confirmedProcessRefs: Array<{ id: string; workspaceId: string }>;
}

export interface OperatingProcess {
  [key: string]: unknown;
  id: string;
  workspaceId: string;
  lifecycleState: string;
}

export interface Episode {
  id: string;
  initiativeId: string;
  workspaceId: string;
  ownerId: string;
  state: string;
  contract: Record<string, unknown>;
  contractDigest: string;
  plan: Record<string, unknown> | null;
  planDigest: string | null;
  aggregateVersion: number;
  lastEventHash: string;
  lastEventAt: string;
  compatibility: {
    source: 'mission_v1';
    missionId: string;
    semantics: 'mission_projection';
  };
}

export type HandoffStatus =
  | 'proposed'
  | 'claimed'
  | 'returned'
  | 'fulfilled'
  | 'escalated'
  | 'cancelled';
export type HandoffPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface Handoff {
  schemaVersion: '1.0.0';
  id: string;
  workspaceId: string;
  handoffKey: string;
  fromStageKey: string;
  toStageKey: string;
  sourceProcessRef: string | null;
  sourceRevisionRef: string | null;
  title: string;
  summary: string | null;
  priority: HandoffPriority;
  slaMinutes: number | null;
  dueAt: string | null;
  currentActor: { type: string; id: string; displayName?: string } | null;
  proofRequirements: Array<Record<string, unknown>>;
  result: Record<string, unknown> | null;
  status: HandoffStatus;
  createdAt: string;
  updatedAt: string;
  aggregateVersion?: number;
}

export interface WorkCommandResult {
  taskId: string;
  receiptId: string;
  eventId: string;
  aggregateVersion: number;
  eventHash: string;
  duplicate: boolean;
  task: Record<string, unknown>;
  receipt: Record<string, unknown>;
}

export interface LedgerEvent {
  id: string;
  workspaceId: string;
  ownerId: string;
  aggregateType: string;
  aggregateId: string;
  aggregateVersion: number;
  eventType: string;
  schemaVersion: number;
  actorType: string;
  actorId: string;
  payload: Record<string, unknown>;
  payloadDigest: string;
  occurredAtCanonical: string;
  recordedAt?: string;
  idempotencyKey: string;
  causationId: string | null;
  correlationId: string | null;
  contextManifestDigest: string | null;
  previousHash: string | null;
  eventHash: string;
}

export interface EventStreamPage {
  events: LedgerEvent[];
  nextCursor: string | null;
  sourceCursor: string | null;
  hasMore: boolean;
  limit: number;
}

export interface EventStreamSubscriptionOptions {
  after?: string;
  limit?: number;
  eventTypes?: string[];
  aggregateType?: string;
  streamMs?: number;
  pollMs?: number;
  signal?: AbortSignal;
}

export interface EventStreamSubscription {
  close(): void;
  done: Promise<void>;
}

export interface ApiEnvelope<T> {
  data: T;
  meta: {
    apiVersion: '1';
    workspaceId: string;
    duplicate?: boolean;
    count?: number;
    requiresConfirmation?: boolean;
    aggregateVersion?: number;
    projectionStatus?: string;
    hasMore?: boolean;
    nextCursor?: string | null;
    sourceCursor?: string | null;
    delivery?: string;
    ordering?: string;
    duplicateTolerant?: boolean;
    limit?: number;
    generatedAt?: string;
    sourceCursorStatus?: string;
    mode?: string;
    truncated?: boolean;
    queryMs?: number;
    freshness?: WorkLedgerProjectionMeta['freshness'];
    processId?: string;
    evidenceStatus?: 'measured' | 'insufficient_evidence';
    freshnessWatermark?: string;
    revisionId?: string | null;
    boundEpisodeCount?: number;
    economicRowCount?: number;
  };
}

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

export interface HandoffTransitionInput {
  workspaceId: string;
  handoffId: string;
  expectedAggregateVersion: number;
  idempotencyKey: string;
}

export interface ImportAgentWorkReceiptInput {
  receipt: AgentWorkReceipt;
  workspaceId?: string;
  idempotencyKey: string;
}

export interface CreateEstimateInput {
  prompt: string;
  contentTypes: StudioContentType[];
  variantCount?: number;
  brandUrl?: string;
  brandId?: string;
  platform?:
    | 'linkedin'
    | 'instagram'
    | 'twitter'
    | 'facebook'
    | 'youtube'
    | 'tiktok'
    | 'generic';
}

export interface GetShowcaseOptions {
  query?: string;
  contentType?: StudioContentType;
  industry?: 'tech' | 'finance' | 'health' | 'retail' | 'education' | 'other';
  style?:
    | 'minimal'
    | 'corporate'
    | 'playful'
    | 'elegant'
    | 'bold'
    | 'artistic';
  featured?: boolean;
  limit?: number;
  offset?: number;
}

export interface ListWorkOptions {
  initiativeId?: string;
  status?: WorkTaskStatus;
  updatedSince?: string;
  cursor?: string;
  limit?: number;
}

export interface ScaffoldInitiativeInput {
  title: string;
  workspaceId?: string;
  summary?: string | null;
  idempotencyKey: string;
}

export interface CommitInitiativeProposalInput {
  proposalId: string;
  proposalDigest: string;
  workspaceId?: string;
  initiativeId?: string;
  overrides?: InitiativeCommitOverrides;
  idempotencyKey: string;
}

export interface CommitInitiativePlanInput {
  plan: InitiativePlan;
  planDigest: string;
  workspaceId?: string;
  initiativeId?: string;
  overrides?: InitiativeCommitOverrides;
  idempotencyKey: string;
}

export interface ProposeInitiativeScaffoldInput {
  title: string;
  workspaceId?: string;
  summary?: string | null;
  prompt?: string;
  goalIds?: string[];
  context?: InitiativeProposalContext;
  depth?: 'initiative' | 'workstreams' | 'full';
  workstreams?: InitiativeProposalWorkstreamInput[];
  agentAssignment?: 'auto' | 'none';
  generation?: {
    model_tier?: 'standard' | 'balanced' | 'precision';
    max_workstreams?: number;
  };
  sourceEvidence?: InitiativeSourceEvidence;
  idempotencyKey: string;
}

export interface CreateDecisionInput {
  workspaceId: string;
  title: string;
  shape?: DecisionShape;
  shapeContext?: Record<string, unknown>;
  urgency?: DecisionUrgency;
  blocksTask?: boolean;
  taskId?: string;
  initiativeId?: string;
  idempotencyKey?: string;
}

export interface ListDecisionsOptions {
  shape?: string;
  urgency?: DecisionUrgency;
  status?: DecisionStatus;
  limit?: number;
}

export interface CreateArtifactInput {
  entityType: ArtifactEntityType;
  entityId: string;
  name: string;
  artifactType: string;
  artifactUrl?: string;
  externalUrl?: string;
  previewMarkdown?: string;
  initiativeId?: string;
  status?: 'draft' | 'in_review' | 'changes_requested' | 'superseded' | 'archived';
  metadata?: Record<string, unknown>;
  createdByType?: 'human' | 'agent';
  createdById?: string;
  idempotencyKey?: string;
}

export interface ListArtifactsOptions {
  initiativeId?: string;
  taskId?: string;
  status?: Exclude<ArtifactStatus, 'eval_passed'>;
  since?: string;
  limit?: number;
}

export interface ListArtifactsByEntityInput {
  entityType: ArtifactEntityType;
  entityId: string;
  kind?: string;
  limit?: number;
}

export interface ControlRunInput {
  runId: string;
  action: RunControlAction;
  checkpointId?: string;
  reason?: string;
  idempotencyKey?: string;
}

export interface ApplyLifecycleActionInput {
  level: LifecycleLevel;
  id: string;
  action: LifecycleAction;
  idempotencyKey?: string;
}

export interface ClaimDedupFingerprintInput {
  source: string;
  eventKey: string;
  initiativeId?: string;
  ttlSeconds?: number;
  activeRunId?: string;
  idempotencyKey?: string;
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
  async prepareContext(input: ContextPreparationInput): Promise<ContextPreparation> {
    const response = await this.request<ApiEnvelope<ContextPreparation>>('/context-pack', {
      method: 'POST', body: input,
    });
    return response.data;
  }

  /** Safe full rebootstrap until the server can verify a coherent delta base. */
  async syncContext(input: ContextPreparationInput & { acknowledged_capsule_id: string }): Promise<ContextPreparation> {
    return this.prepareContext(input);
  }

  /** Dereference an OrgX artifact through the existing authenticated API. */
  async expandContextEvidence(artifactId: string): Promise<Record<string, unknown>> {
    const response = await this.request<ApiEnvelope<Record<string, unknown>>>(
      `/artifacts/${encodeURIComponent(artifactId)}`
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

  async getOperatingProcess(
    workspaceId: string,
    processId: string
  ): Promise<OperatingProcessDetail> {
    const response = await this.request<ApiEnvelope<OperatingProcessDetail>>(
      `/operating-processes/${encodeURIComponent(
        processId
      )}?workspace_id=${encodeURIComponent(workspaceId)}`
    );
    return response.data;
  }

  async getOperatingMap(
    workspaceId: string,
    options: { limit?: number } = {}
  ): Promise<OperatingMapResult> {
    const params = new URLSearchParams({ workspace_id: workspaceId });
    if (options.limit !== undefined) params.set('limit', String(options.limit));
    return this.request<OperatingMapResult>(
      `/operating-map?${params.toString()}`
    );
  }

  async returnHandoff(input: HandoffTransitionInput): Promise<Handoff> {
    return this.transitionHandoff('return', input);
  }

  async escalateHandoff(input: HandoffTransitionInput): Promise<Handoff> {
    return this.transitionHandoff('escalate', input);
  }

  async cancelHandoff(input: HandoffTransitionInput): Promise<Handoff> {
    return this.transitionHandoff('cancel', input);
  }

  async importAgentWorkReceipt(
    input: ImportAgentWorkReceiptInput
  ): Promise<ReceiptImportSuccess> {
    return this.request<ReceiptImportSuccess>('/agent-work-receipts', {
      method: 'POST',
      idempotencyKey: input.idempotencyKey,
      body: {
        ...(input.workspaceId ? { workspace_id: input.workspaceId } : {}),
        receipt: input.receipt,
      },
    });
  }

  async getReceiptValidatorMetadata(): Promise<ReceiptValidatorMetadata> {
    return this.request<ReceiptValidatorMetadata>(
      '/agent-work-receipts/validate'
    );
  }

  /**
   * Validate a receipt without persisting it. A structurally invalid receipt
   * is a 422 with the issue list, which this method returns rather than
   * throwing; check `valid` on the result.
   */
  async validateAgentWorkReceipt(
    receipt: AgentWorkReceipt
  ): Promise<ReceiptValidationResult> {
    return this.request<ReceiptValidationResult>(
      '/agent-work-receipts/validate',
      { method: 'POST', body: receipt, allowStatuses: [422] }
    );
  }

  async getWorkloadDoctorMetadata(): Promise<WorkloadDoctorMetadata> {
    return this.request<WorkloadDoctorMetadata>('/doctor/workload');
  }

  async diagnoseWorkloadBoundaries(
    input: WorkloadDiagnosisRequest
  ): Promise<WorkloadDiagnosisResponse> {
    return this.request<WorkloadDiagnosisResponse>('/doctor/workload', {
      method: 'POST',
      body: input,
    });
  }

  async createEstimate(input: CreateEstimateInput): Promise<EstimateResponse> {
    return this.request<EstimateResponse>('/studio/estimate', {
      method: 'POST',
      body: {
        prompt: input.prompt,
        contentTypes: input.contentTypes,
        ...(input.variantCount !== undefined
          ? { variantCount: input.variantCount }
          : {}),
        ...(input.brandUrl ? { brandUrl: input.brandUrl } : {}),
        ...(input.brandId ? { brandId: input.brandId } : {}),
        ...(input.platform ? { platform: input.platform } : {}),
      },
    });
  }

  async getShowcase(options: GetShowcaseOptions = {}): Promise<ShowcaseResponse> {
    const params = new URLSearchParams();
    if (options.query) params.set('query', options.query);
    if (options.contentType) params.set('contentType', options.contentType);
    if (options.industry) params.set('industry', options.industry);
    if (options.style) params.set('style', options.style);
    if (options.featured !== undefined)
      params.set('featured', String(options.featured));
    if (options.limit !== undefined) params.set('limit', String(options.limit));
    if (options.offset !== undefined)
      params.set('offset', String(options.offset));
    const query = params.toString();
    return this.request<ShowcaseResponse>(
      `/studio/showcase${query ? `?${query}` : ''}`
    );
  }

  async createCheckout(estimateId: string): Promise<CheckoutResponse> {
    return this.request<CheckoutResponse>('/studio/checkout', {
      method: 'POST',
      body: { estimateId },
    });
  }

  // POST /studio/callback is intentionally not exposed: it is the Stripe
  // webhook receiver and is never called by API clients.

  async listWork(
    workspaceId: string,
    options: ListWorkOptions = {}
  ): Promise<ApiEnvelope<WorkTask[]>> {
    const params = new URLSearchParams({ workspace_id: workspaceId });
    if (options.initiativeId)
      params.set('initiative_id', options.initiativeId);
    if (options.status) params.set('status', options.status);
    if (options.updatedSince)
      params.set('updated_since', options.updatedSince);
    if (options.cursor) params.set('cursor', options.cursor);
    if (options.limit !== undefined) params.set('limit', String(options.limit));
    return this.request<ApiEnvelope<WorkTask[]>>(`/work?${params.toString()}`);
  }

  async getWorkTask(
    workspaceId: string,
    taskId: string
  ): Promise<WorkTaskDetail> {
    const response = await this.request<ApiEnvelope<WorkTaskDetail>>(
      `/work/${encodeURIComponent(taskId)}?workspace_id=${encodeURIComponent(
        workspaceId
      )}`
    );
    return response.data;
  }

  /**
   * Scaffold a minimal initiative (title/summary variant of
   * POST /initiatives). Committing a proposal or an inline plan through the
   * same endpoint is exposed as `commitInitiativeProposal` and
   * `commitInitiativePlan`.
   */
  async scaffoldInitiative(
    input: ScaffoldInitiativeInput
  ): Promise<ApiEnvelope<InitiativeScaffoldData>> {
    return this.request<ApiEnvelope<InitiativeScaffoldData>>('/initiatives', {
      method: 'POST',
      idempotencyKey: input.idempotencyKey,
      body: {
        ...(input.workspaceId ? { workspace_id: input.workspaceId } : {}),
        title: input.title,
        ...(input.summary !== undefined ? { summary: input.summary } : {}),
      },
    });
  }

  async commitInitiativeProposal(
    input: CommitInitiativeProposalInput
  ): Promise<ApiEnvelope<InitiativeCommitData>> {
    return this.request<ApiEnvelope<InitiativeCommitData>>('/initiatives', {
      method: 'POST',
      idempotencyKey: input.idempotencyKey,
      body: {
        ...(input.workspaceId ? { workspace_id: input.workspaceId } : {}),
        proposal_id: input.proposalId,
        proposal_digest: input.proposalDigest,
        ...(input.initiativeId ? { initiative_id: input.initiativeId } : {}),
        ...(input.overrides ? { overrides: input.overrides } : {}),
      },
    });
  }

  async commitInitiativePlan(
    input: CommitInitiativePlanInput
  ): Promise<ApiEnvelope<InitiativeCommitData>> {
    return this.request<ApiEnvelope<InitiativeCommitData>>('/initiatives', {
      method: 'POST',
      idempotencyKey: input.idempotencyKey,
      body: {
        ...(input.workspaceId ? { workspace_id: input.workspaceId } : {}),
        plan: input.plan,
        plan_digest: input.planDigest,
        ...(input.initiativeId ? { initiative_id: input.initiativeId } : {}),
        ...(input.overrides ? { overrides: input.overrides } : {}),
      },
    });
  }

  async getInitiative(
    initiativeId: string,
    options: { workspaceId?: string; include?: string } = {}
  ): Promise<ApiEnvelope<InitiativeDetail>> {
    const params = new URLSearchParams();
    if (options.workspaceId) params.set('workspace_id', options.workspaceId);
    if (options.include) params.set('include', options.include);
    const query = params.toString();
    return this.request<ApiEnvelope<InitiativeDetail>>(
      `/initiatives/${encodeURIComponent(initiativeId)}${
        query ? `?${query}` : ''
      }`
    );
  }

  async proposeInitiativeScaffold(
    input: ProposeInitiativeScaffoldInput
  ): Promise<ApiEnvelope<InitiativeProposal>> {
    return this.request<ApiEnvelope<InitiativeProposal>>(
      '/initiatives/proposals',
      {
        method: 'POST',
        idempotencyKey: input.idempotencyKey,
        body: {
          ...(input.workspaceId ? { workspace_id: input.workspaceId } : {}),
          title: input.title,
          ...(input.summary !== undefined ? { summary: input.summary } : {}),
          ...(input.prompt ? { prompt: input.prompt } : {}),
          ...(input.goalIds ? { goal_ids: input.goalIds } : {}),
          ...(input.context ? { context: input.context } : {}),
          ...(input.depth ? { depth: input.depth } : {}),
          ...(input.workstreams ? { workstreams: input.workstreams } : {}),
          ...(input.agentAssignment
            ? { agent_assignment: input.agentAssignment }
            : {}),
          ...(input.generation ? { generation: input.generation } : {}),
          ...(input.sourceEvidence
            ? { source_evidence: input.sourceEvidence }
            : {}),
        },
      }
    );
  }

  async getInitiativeScaffoldProposal(
    proposalId: string,
    options: { workspaceId?: string } = {}
  ): Promise<ApiEnvelope<InitiativeProposalDetail>> {
    const params = new URLSearchParams();
    if (options.workspaceId) params.set('workspace_id', options.workspaceId);
    const query = params.toString();
    return this.request<ApiEnvelope<InitiativeProposalDetail>>(
      `/initiatives/proposals/${encodeURIComponent(proposalId)}${
        query ? `?${query}` : ''
      }`
    );
  }

  async listArtifactTypes(): Promise<ArtifactTypeListResult> {
    return this.request<ArtifactTypeListResult>('/artifact-types');
  }

  async createDecision(input: CreateDecisionInput): Promise<Decision> {
    const response = await this.request<{ decision: Decision }>('/decisions', {
      method: 'POST',
      idempotencyKey: input.idempotencyKey,
      body: {
        workspace_id: input.workspaceId,
        title: input.title,
        ...(input.shape ? { shape: input.shape } : {}),
        ...(input.shapeContext ? { shape_context: input.shapeContext } : {}),
        ...(input.urgency ? { urgency: input.urgency } : {}),
        ...(input.blocksTask !== undefined
          ? { blocks_task: input.blocksTask }
          : {}),
        ...(input.taskId ? { task_id: input.taskId } : {}),
        ...(input.initiativeId ? { initiative_id: input.initiativeId } : {}),
      },
    });
    return response.decision;
  }

  async listDecisions(
    workspaceId: string,
    options: ListDecisionsOptions = {}
  ): Promise<Decision[]> {
    const params = new URLSearchParams({ workspace_id: workspaceId });
    if (options.shape) params.set('shape', options.shape);
    if (options.urgency) params.set('urgency', options.urgency);
    if (options.status) params.set('status', options.status);
    if (options.limit !== undefined) params.set('limit', String(options.limit));
    const response = await this.request<{ decisions: Decision[] }>(
      `/decisions?${params.toString()}`
    );
    return response.decisions;
  }

  async createArtifact(
    input: CreateArtifactInput
  ): Promise<ArtifactCreateResult> {
    return this.request<ArtifactCreateResult>('/artifacts', {
      method: 'POST',
      idempotencyKey: input.idempotencyKey,
      body: {
        entity_type: input.entityType,
        entity_id: input.entityId,
        name: input.name,
        artifact_type: input.artifactType,
        ...(input.artifactUrl ? { artifact_url: input.artifactUrl } : {}),
        ...(input.externalUrl ? { external_url: input.externalUrl } : {}),
        ...(input.previewMarkdown
          ? { preview_markdown: input.previewMarkdown }
          : {}),
        ...(input.initiativeId ? { initiative_id: input.initiativeId } : {}),
        ...(input.status ? { status: input.status } : {}),
        ...(input.metadata ? { metadata: input.metadata } : {}),
        ...(input.createdByType
          ? { created_by_type: input.createdByType }
          : {}),
        ...(input.createdById ? { created_by_id: input.createdById } : {}),
      },
    });
  }

  async listArtifacts(
    workspaceId: string,
    options: ListArtifactsOptions = {}
  ): Promise<Artifact[]> {
    const params = new URLSearchParams({ workspace_id: workspaceId });
    if (options.initiativeId)
      params.set('initiative_id', options.initiativeId);
    if (options.taskId) params.set('task_id', options.taskId);
    if (options.status) params.set('status', options.status);
    if (options.since) params.set('since', options.since);
    if (options.limit !== undefined) params.set('limit', String(options.limit));
    const response = await this.request<{ artifacts: Artifact[] }>(
      `/artifacts?${params.toString()}`
    );
    return response.artifacts;
  }

  async listArtifactsByEntity(
    input: ListArtifactsByEntityInput
  ): Promise<Artifact[]> {
    const params = new URLSearchParams({
      entity_type: input.entityType,
      entity_id: input.entityId,
    });
    if (input.kind) params.set('kind', input.kind);
    if (input.limit !== undefined) params.set('limit', String(input.limit));
    const response = await this.request<{ ok: boolean; artifacts: Artifact[] }>(
      `/artifacts/by-entity?${params.toString()}`
    );
    return response.artifacts;
  }

  async getArtifact(artifactId: string): Promise<ArtifactDetailResult> {
    return this.request<ArtifactDetailResult>(
      `/artifacts/${encodeURIComponent(artifactId)}`
    );
  }

  async controlRun(input: ControlRunInput): Promise<RunActionResult> {
    return this.request<RunActionResult>(
      `/runs/${encodeURIComponent(input.runId)}/actions/${input.action}`,
      {
        method: 'POST',
        idempotencyKey: input.idempotencyKey,
        body: {
          ...(input.checkpointId ? { checkpointId: input.checkpointId } : {}),
          ...(input.reason ? { reason: input.reason } : {}),
        },
      }
    );
  }

  /**
   * Apply a lifecycle action. A blocked action is a 422 that still carries a
   * structured LifecycleResult (ok: false, blockReasons), which this method
   * returns rather than throwing; check `ok` on the result.
   */
  async applyLifecycleAction(
    input: ApplyLifecycleActionInput
  ): Promise<LifecycleResult> {
    return this.request<LifecycleResult>('/lifecycle', {
      method: 'POST',
      idempotencyKey: input.idempotencyKey,
      allowStatuses: [422],
      body: {
        level: input.level,
        id: input.id,
        action: input.action,
      },
    });
  }

  async claimDedupFingerprint(
    input: ClaimDedupFingerprintInput
  ): Promise<DedupClaimResult> {
    return this.request<DedupClaimResult>('/live/dedup/claim', {
      method: 'POST',
      idempotencyKey: input.idempotencyKey,
      body: {
        source: input.source,
        event_key: input.eventKey,
        ...(input.initiativeId ? { initiative_id: input.initiativeId } : {}),
        ...(input.ttlSeconds !== undefined
          ? { ttl_seconds: input.ttlSeconds }
          : {}),
        ...(input.activeRunId ? { active_run_id: input.activeRunId } : {}),
      },
    });
  }

  private async transitionHandoff(
    action: 'return' | 'escalate' | 'cancel',
    input: HandoffTransitionInput
  ): Promise<Handoff> {
    const response = await this.request<ApiEnvelope<Handoff>>(
      `/handoffs/${encodeURIComponent(input.handoffId)}/${action}`,
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
      /**
       * Non-2xx statuses whose response body is a documented, structured
       * result (e.g. validation failures) rather than an error envelope.
       */
      allowStatuses?: number[];
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
    if (!response.ok && !options.allowStatuses?.includes(response.status)) {
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
