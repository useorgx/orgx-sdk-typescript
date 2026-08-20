export type WorkLedgerGranularity = 'day' | 'week' | 'month';

export interface WorkLedgerCounts {
  toolCalls: number;
  conversations: number;
  sessions: number;
  runs: number;
  receipts: number;
  decisions: number;
  artifacts: number;
  total: number;
}

export interface WorkLedgerSourceHealth {
  id: string;
  label: string;
  table: string;
  rows: number;
  unlinkedRows: number | null;
  note: string | null;
}

export interface WorkLedger {
  from: string;
  to: string;
  granularity: WorkLedgerGranularity;
  timezone: string;
  buckets: Array<
    WorkLedgerCounts & {
      start: string;
      end: string;
      key: string;
      label: string;
      longLabel: string;
      clients: Array<
        WorkLedgerCounts & { sourceClient: string; label: string }
      >;
      initiatives: Array<
        WorkLedgerCounts & {
          initiativeId: string | null;
          title: string;
          unattributed: boolean;
        }
      >;
    }
  >;
  clients: Array<
    WorkLedgerCounts & {
      sourceClient: string;
      label: string;
      activeBuckets: number;
      firstSeen: string | null;
      lastSeen: string | null;
    }
  >;
  initiatives: Array<
    WorkLedgerCounts & {
      initiativeId: string | null;
      title: string;
      unattributed: boolean;
      activeBuckets: number;
      clients: string[];
    }
  >;
  totals: WorkLedgerCounts;
  peakBucketTotal: number;
  sources: WorkLedgerSourceHealth[];
  mode: 'aggregated' | 'scanned';
  truncated: boolean;
  queryMs: number;
}

export interface WorkLedgerProjectionMeta {
  projectionStatus: 'derived_work_ledger';
  generatedAt: string;
  sourceCursor: string | null;
  sourceCursorStatus: 'not_available';
  mode: 'aggregated' | 'scanned';
  truncated: boolean;
  queryMs: number;
  freshness: {
    generatedAt: string;
    windowFrom: string;
    windowTo: string;
    sourceHealthMeasured: boolean;
  };
}

export interface AdoptionProjection {
  schemaVersion: '1.0.0';
  projectionId: string;
  workspaceId: string;
  processRef: { id: string; workspaceId: string };
  eligiblePopulation: number;
  targetPathPopulation: number;
  behavioralAdoptionRate: number | null;
  selfReportedAdoptionRate: number | null;
  bypassCount: number;
  shadowSystemCount: number;
  sourceHealth: Record<string, unknown>;
  confidence: number;
  limitations: string[];
  refreshedAt: string;
}

export interface ValueCaseProjection {
  schemaVersion: '1.0.0';
  projectionId: string;
  workspaceId: string;
  processRefs: Array<{ id: string; workspaceId: string }>;
  baselinePeriod: { start: string; end: string };
  comparisonPeriod: { start: string; end: string } | null;
  baselineObservationRefs: Array<{ id: string; workspaceId: string }>;
  expectationRefs: Array<{ id: string; workspaceId: string }>;
  realizedOutcomeRefs: Array<{ id: string; workspaceId: string }>;
  adoptionProjectionRef: { id: string; workspaceId: string } | null;
  costMeterEventRefs: Array<{ id: string; workspaceId: string }>;
  attributionLinkRefs: Array<{ id: string; workspaceId: string }>;
  annualHardBenefit: { low: string; expected: string; high: string };
  annualCapacityValue: { low: string; expected: string; high: string };
  softBenefits: Array<Record<string, unknown>>;
  firstYearCustomerCost: { low: string; expected: string; high: string };
  orgxCogs: { low: string; expected: string; high: string };
  roiRange: { low: number; expected: number; high: number };
  paybackMonthsRange: {
    low: number | null;
    expected: number | null;
    high: number | null;
  };
  sourceHealth: Record<string, unknown>;
  confidence: number;
  limitations: string[];
  derivationVersion: string;
  sourceCursor: string;
  refreshedAt: string;
}

export interface MeterUsageBucket {
  meter: string;
  unit: string;
  eventCount: number;
  totalQuantity: number;
  actualQuantity: number;
  estimatedQuantity: number;
  unavailableEventCount: number;
}

export interface MeterUsageProjection {
  schemaVersion: '1.0.0';
  projectionId: string;
  workspaceId: string;
  from: string | null;
  to: string | null;
  eventCount: number;
  rawEventCount: number;
  correctionCount: number;
  totalQuantity: number;
  actualQuantity: number;
  estimatedQuantity: number;
  unavailableEventCount: number;
  actualEventCount: number;
  estimatedEventCount: number;
  providerUsageEventCount: number;
  buckets: MeterUsageBucket[];
  sourceCursor: string | null;
  freshnessWatermark: string | null;
  evidenceStatus: 'measured' | 'estimated' | 'insufficient_evidence';
  billingReady: false;
  limitations: string[];
  refreshedAt: string;
}
