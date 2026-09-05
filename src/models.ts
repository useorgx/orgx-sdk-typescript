import type { WorkLedgerProjectionMeta } from './projections.js';

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
