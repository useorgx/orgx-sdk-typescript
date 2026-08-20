/**
 * Resource and wire types for the OrgX v1 API surface beyond the original
 * work/discovery/handoff/projection set. Field casing follows the wire
 * contract in public/api/v1/openapi.yaml exactly: several resources
 * (decisions, artifacts, work tasks, initiative plans, agent work receipts,
 * workload diagnosis) are snake_case on the wire, while studio and handoff
 * resources are camelCase. Where the spec declares an open object
 * (additionalProperties: true with no properties), we use
 * Record<string, unknown> rather than inventing fields.
 */

/* ------------------------------------------------------------------ */
/* Agent Work Receipt (agent-work-receipt/v0.1)                        */
/* ------------------------------------------------------------------ */

export interface AwrDigest {
  algorithm: string;
  value: string;
  encoding?: 'hex' | 'base64' | 'base64url';
}

export interface AwrExternalReference {
  system: string;
  type: string;
  id: string;
  uri?: string;
  version?: string;
  digest?: AwrDigest;
  metadata?: Record<string, unknown>;
}

export interface AwrRuntime {
  name: string;
  version?: string;
}

export interface AwrModel {
  provider: string;
  name: string;
  version?: string;
}

export interface AwrActor {
  type: 'agent' | 'service' | 'human' | 'team' | 'system' | 'other';
  id: string;
  display_name?: string;
  runtime?: AwrRuntime;
  model?: AwrModel;
  external_refs?: AwrExternalReference[];
  metadata?: Record<string, unknown>;
}

export interface AwrIntent {
  summary: string;
  objective?: string;
  acceptance_criteria?: string[];
  constraints?: string[];
  request_ref?: AwrExternalReference;
  metadata?: Record<string, unknown>;
}

export interface AwrMoneyLimit {
  currency: string;
  amount: number;
}

export interface AwrAuthorityScope {
  actions: string[];
  resources: AwrExternalReference[];
  systems?: string[];
  spend_limit?: AwrMoneyLimit;
}

export interface AwrApproval {
  status: 'requested' | 'granted' | 'denied' | 'revoked' | 'expired';
  approver: AwrActor;
  scope?: string;
  occurred_at: string;
  ref?: AwrExternalReference;
}

export interface AwrAuthority {
  mode: 'explicit' | 'delegated' | 'inherited' | 'policy' | 'none' | 'unknown';
  status: 'granted' | 'restricted' | 'denied' | 'expired' | 'unknown';
  scope: AwrAuthorityScope;
  delegated_by?: AwrActor;
  authorization_ref?: AwrExternalReference;
  approvals?: AwrApproval[];
  constraints?: string[];
  valid_from?: string;
  valid_until?: string;
  metadata?: Record<string, unknown>;
}

export interface AwrAction {
  id: string;
  type: string;
  summary: string;
  status: 'planned' | 'running' | 'completed' | 'failed' | 'skipped' | 'blocked';
  system?: string;
  tool_ref?: AwrExternalReference;
  target_refs?: AwrExternalReference[];
  input_refs?: AwrExternalReference[];
  output_refs?: AwrExternalReference[];
  started_at?: string;
  completed_at?: string;
  error?: string;
  metadata?: Record<string, unknown>;
}

export interface AwrArtifact {
  id: string;
  kind: string;
  name: string;
  ref: AwrExternalReference;
  role?: 'input' | 'intermediate' | 'output' | 'log' | 'report' | 'other';
  media_type?: string;
  digest?: AwrDigest;
  size_bytes?: number;
  created_at?: string;
  metadata?: Record<string, unknown>;
}

export interface AwrEvidence {
  id: string;
  kind: string;
  summary: string;
  observed_at: string;
  ref?: AwrExternalReference;
  digest?: AwrDigest;
  excerpt?: string;
  supports?: string[];
  metadata?: Record<string, unknown>;
}

export interface AwrOutcomeMetric {
  name: string;
  value: number;
  unit: string;
  baseline?: number;
  target?: number;
  observed_at?: string;
  evidence_ids?: string[];
}

export interface AwrAcceptance {
  status: 'pending' | 'accepted' | 'rejected' | 'changes_requested';
  actor?: AwrActor;
  occurred_at?: string;
  evidence_ids?: string[];
  notes?: string;
}

export interface AwrOutcome {
  status:
    | 'succeeded'
    | 'partially_succeeded'
    | 'failed'
    | 'blocked'
    | 'cancelled'
    | 'unknown';
  summary: string;
  observed_effects?: string[];
  metrics?: AwrOutcomeMetric[];
  acceptance?: AwrAcceptance;
  metadata?: Record<string, unknown>;
}

export interface AwrVerificationCheck {
  id: string;
  name: string;
  status: 'passed' | 'failed' | 'skipped' | 'inconclusive';
  method?: string;
  evidence_ids: string[];
  details?: string;
}

export interface AwrVerification {
  status: 'unverified' | 'passed' | 'failed' | 'partial' | 'inconclusive';
  method: string;
  verifier?: AwrActor;
  checks: AwrVerificationCheck[];
  evidence_ids: string[];
  verified_at?: string;
  notes?: string;
  metadata?: Record<string, unknown>;
}

export interface AwrCostComponent {
  category: string;
  amount: number;
}

export interface AwrUsage {
  name: string;
  quantity: number;
  unit: string;
  cost?: number;
}

export interface AwrCost {
  currency: string;
  total: number;
  components?: AwrCostComponent[];
  usage?: AwrUsage[];
  human_minutes?: number;
  estimated?: boolean;
  metadata?: Record<string, unknown>;
}

export interface AwrLineageEdge {
  relationship: string;
  ref: AwrExternalReference;
}

export interface AwrLineage {
  run_ref?: AwrExternalReference;
  parent_receipt_refs: AwrExternalReference[];
  references: AwrLineageEdge[];
  trace_id?: string;
  span_id?: string;
  metadata?: Record<string, unknown>;
}

export interface AwrHumanIntervention {
  id: string;
  kind:
    | 'approval'
    | 'correction'
    | 'input'
    | 'execution'
    | 'escalation'
    | 'override'
    | 'review'
    | 'other';
  actor: AwrActor;
  summary: string;
  occurred_at: string;
  duration_minutes?: number;
  evidence_ids?: string[];
  refs?: AwrExternalReference[];
  metadata?: Record<string, unknown>;
}

export interface AwrTimestamps {
  started_at: string;
  completed_at: string;
  issued_at: string;
  observed_at?: string;
  duration_ms?: number;
}

export interface AwrContentHash {
  algorithm: 'sha-256' | 'sha256';
  value: string;
  encoding?: 'hex' | 'base64' | 'base64url';
}

export interface AwrSignature {
  algorithm: 'ed25519';
  encoding: 'base64url';
  value: string;
  key_id: string;
  signer?: AwrActor;
  signed_at?: string;
}

export interface AwrIntegrity {
  content_hash: AwrContentHash;
  signatures?: AwrSignature[];
}

export interface AgentWorkReceipt {
  schema_version: 'agent-work-receipt/v0.1';
  receipt_id: string;
  intent: AwrIntent;
  actor: AwrActor;
  authority: AwrAuthority;
  actions: AwrAction[];
  artifacts: AwrArtifact[];
  evidence: AwrEvidence[];
  outcome: AwrOutcome;
  verification: AwrVerification;
  cost: AwrCost;
  lineage: AwrLineage;
  human_interventions: AwrHumanIntervention[];
  timestamps: AwrTimestamps;
  integrity?: AwrIntegrity;
  extensions?: Record<string, unknown>;
}

export interface ReceiptImportSuccess {
  ok: true;
  receipt_id: string;
  external_receipt_id: string;
  schema_version: 'agent-work-receipt/v0.1';
  idempotent: boolean;
  imported_at?: string;
  pilot?: { cohort_id: string; partner_ref: string } | null;
}

export interface ReceiptValidationIssue {
  path: string;
  code: string;
  message: string;
}

export interface ReceiptValidatorMetadata {
  name: string;
  schema_version: 'agent-work-receipt/v0.1';
  schema_url: string;
  account_required: boolean;
  persists_submissions: boolean;
  max_bytes: number;
  validation_limits: {
    max_depth: number;
    max_nodes: number;
    max_issues: number;
    apply_before_schema: boolean;
  };
  validation_endpoint: string;
  import_endpoint: string;
  schema: Record<string, unknown>;
}

export interface ReceiptValidationSuccess {
  ok: true;
  valid: true;
  schema_version: 'agent-work-receipt/v0.1';
  schema_url: string;
  receipt: {
    receipt_id: string;
    actor_id: string;
    runtime: string | null;
    producer_reported_outcome_status: string;
    producer_reported_verification_status: string;
    evidence_count: number;
    human_intervention_count: number;
  };
  persistence: {
    stored: boolean;
    import_requires_authentication: boolean;
  };
}

export interface ReceiptValidationFailure {
  ok: false;
  valid: false;
  schema_version: 'agent-work-receipt/v0.1';
  schema_url: string;
  issues: ReceiptValidationIssue[];
  issue_count: number;
  issues_truncated: boolean;
}

export type ReceiptValidationResult =
  | ReceiptValidationSuccess
  | ReceiptValidationFailure;

/* ------------------------------------------------------------------ */
/* Workload doctor (workload-diagnosis/0.1)                            */
/* ------------------------------------------------------------------ */

export type WorkloadSystemCategory =
  | 'code_repository'
  | 'issue_tracker'
  | 'document_store'
  | 'messaging'
  | 'crm'
  | 'database'
  | 'cloud_runtime'
  | 'finance'
  | 'browser'
  | 'local_files'
  | 'identity'
  | 'other';

export interface WorkloadSystem {
  category: WorkloadSystemCategory;
  access: 'read' | 'write' | 'admin';
  side_effect: 'none' | 'reversible' | 'external' | 'irreversible';
  data_class: 'public' | 'internal' | 'confidential' | 'regulated';
}

export type WorkloadAuthorityAction =
  | 'research'
  | 'draft'
  | 'read_internal_data'
  | 'write_internal_records'
  | 'modify_code'
  | 'merge_or_deploy'
  | 'send_external_message'
  | 'spend_funds'
  | 'create_account'
  | 'change_permissions'
  | 'delete_data';

export interface WorkloadAuthority {
  actions: WorkloadAuthorityAction[];
  approval_policy:
    | 'not_applicable'
    | 'per_action'
    | 'sensitive_actions'
    | 'exceptions_only'
    | 'undefined';
  budget_control:
    | 'not_applicable'
    | 'fixed_limit'
    | 'dynamic_limit'
    | 'unbounded'
    | 'undefined';
}

export interface WorkloadAccountability {
  evidence: 'none' | 'activity_log' | 'artifact' | 'verified_outcome';
  acceptance: 'none' | 'agent' | 'human' | 'downstream_system';
  consequence: 'low' | 'moderate' | 'high' | 'regulated';
  retention: 'none' | 'short_term' | 'long_term' | 'regulated';
}

export interface WorkloadDescription {
  name: string;
  outcome: string;
  time_horizon:
    | 'single_turn'
    | 'single_session'
    | 'multi_day'
    | 'recurring'
    | 'continuous';
  agent_count: number;
  coordination: 'none' | 'handoff' | 'parallel' | 'hierarchical';
  systems: WorkloadSystem[];
  authority: WorkloadAuthority;
  accountability: WorkloadAccountability;
}

export interface WorkloadDiagnosisRequest {
  schema_version: 'workload-diagnosis/0.1';
  workload: WorkloadDescription;
}

export type WorkloadBoundary =
  | 'time'
  | 'agents'
  | 'systems'
  | 'authority'
  | 'accountability';

export interface BoundaryFinding {
  state: 'absent' | 'present' | 'critical';
  score: number;
  reason: string;
}

export interface MissingCapability {
  id: string;
  boundary: WorkloadBoundary;
  reason: string;
}

export interface ProposedResource {
  resource: string;
  requested_access: 'read' | 'write' | 'admin';
  scope_intents: string[];
  purpose: string;
  credential_input_required: boolean;
}

export interface LocalWorkItem {
  item: string;
  reason: string;
}

export interface WorkloadRisk {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  boundary: WorkloadBoundary;
  description: string;
  mitigation: string;
}

export interface HumanApproval {
  id: string;
  owner_role:
    | 'workload_owner'
    | 'system_owner'
    | 'code_owner'
    | 'communications_owner'
    | 'budget_owner'
    | 'identity_admin'
    | 'data_owner';
  timing:
    | 'before_installation'
    | 'before_first_use'
    | 'per_action'
    | 'when_threshold_exceeded';
  decision: string;
  scope: string[];
}

export interface WorkloadDiagnosisResponse {
  schema_version: 'workload-diagnosis/0.1';
  diagnosis_id: string;
  recommendation: {
    verdict: 'needed' | 'conditional' | 'not_needed';
    mode: 'none' | 'receipt_only' | 'governed_workspace';
    summary: string;
    rationale: string[];
    active_boundary_count: number;
  };
  boundaries: {
    time: BoundaryFinding;
    agents: BoundaryFinding;
    systems: BoundaryFinding;
    authority: BoundaryFinding;
    accountability: BoundaryFinding;
  };
  missing_capabilities: MissingCapability[];
  proposed_resources: ProposedResource[];
  what_remains_local: LocalWorkItem[];
  risks: WorkloadRisk[];
  capabilities_after_installation: string[];
  human_approvals: HumanApproval[];
  approval_handoff: {
    kind: 'none' | 'browser_review';
    url: string | null;
    mutates_state: boolean;
    carries_sensitive_data: boolean;
    approval_ids: string[];
  };
}

export interface WorkloadDoctorMetadata {
  name: string;
  schema_version: 'workload-diagnosis/0.1';
  endpoint: string;
  method: string;
  content_type: string;
  account_required: boolean;
  accepts_credentials: boolean;
  persists_submissions: boolean;
  max_bytes: number;
  request_example: WorkloadDiagnosisRequest;
  curl_example: string;
  browser_handoff: string;
}

/* ------------------------------------------------------------------ */
/* Studio                                                              */
/* ------------------------------------------------------------------ */

export type StudioContentType =
  | 'carousel'
  | 'post'
  | 'story'
  | 'video'
  | 'banner'
  | 'thumbnail';

export interface ShowcaseExample {
  id?: string;
  title?: string;
  contentType?: StudioContentType;
  industry?: string;
  style?: string;
  thumbnailUrl?: string;
  previewUrls?: string[];
  qaScores?: {
    overall?: number;
    brandAlignment?: number;
    visualQuality?: number;
  };
}

export interface CostBreakdown {
  brandIngestion?: {
    required?: boolean;
    credits?: number;
    complexity?: 'simple' | 'moderate' | 'complex';
  };
  calibration?: { rounds?: number; credits?: number };
  exploration?: { rounds?: number; credits?: number };
  composition?: {
    complexity?: 'basic' | 'standard' | 'premium';
    credits?: number;
    multiplier?: number;
  };
  outputs?: Array<{
    type?: StudioContentType;
    count?: number;
    creditsEach?: number;
    subtotal?: number;
  }>;
}

export interface EstimateResponse {
  estimateId?: string;
  breakdown?: CostBreakdown;
  totalCredits?: number;
  estimatedPrice?: { amount?: number; currency?: 'usd' };
  expiresAt?: string;
  showcase?: ShowcaseExample[];
  requiresAuth?: boolean;
  authRedirectUrl?: string;
}

export interface ShowcaseResponse {
  examples?: ShowcaseExample[];
  total?: number;
  hasMore?: boolean;
}

export interface CheckoutResponse {
  checkoutUrl?: string;
  sessionId?: string;
  amount?: number;
}

/* ------------------------------------------------------------------ */
/* Work tasks (read side)                                              */
/* ------------------------------------------------------------------ */

export type WorkTaskStatus = 'todo' | 'in_progress' | 'done' | 'blocked';

export interface WorkTask {
  id: string;
  title: string;
  status: WorkTaskStatus | null;
  priority?: string | null;
  due_date?: string | null;
  initiative_id: string;
  workstream_id: string;
  milestone_id?: string | null;
  sequence?: number | null;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface WorkTaskConcurrency {
  expected_updated_at: string;
  expected_aggregate_version: number;
}

export interface WorkTaskDetail extends WorkTask {
  concurrency: WorkTaskConcurrency;
}

/* ------------------------------------------------------------------ */
/* Initiatives                                                         */
/* ------------------------------------------------------------------ */

export type InitiativeDomain =
  | 'product'
  | 'engineering'
  | 'marketing'
  | 'sales'
  | 'operations'
  | 'design'
  | 'orchestration';

export interface InitiativePlanTask {
  title: string;
  detail?: string | null;
  type?: 'research' | 'create' | 'review' | 'implement';
  depends_on?: string[];
  agent_id?: string;
  expected_tokens?: number;
  expected_duration_hours?: number;
  expected_budget_usd?: number;
}

export interface InitiativePlanMilestone {
  title: string;
  tasks?: InitiativePlanTask[];
}

export interface InitiativePlanWorkstream {
  name: string;
  goal?: string | null;
  domain?: InitiativeDomain;
  agent_id?: string;
  agent_name?: string;
  confidence?: number;
  rationale?: string;
  depends_on?: string[];
  deliverables?: string[];
  expected_tokens?: number;
  expected_duration_hours?: number;
  expected_budget_usd?: number;
  milestones?: InitiativePlanMilestone[];
}

export interface InitiativePlan {
  initiative: { title: string; summary?: string | null };
  workstreams: InitiativePlanWorkstream[];
}

export interface InitiativeCommitOverrides {
  title?: string;
  visibility?: 'private' | 'workspace' | 'public';
  model_tier?:
    | 'standard'
    | 'balanced'
    | 'precision'
    | 'local'
    | 'sonnet'
    | 'opus';
  autonomy?: {
    mode?: 'manual' | 'gated' | 'autopilot';
    max_budget_usd?: number;
    max_concurrent_agents?: number;
  };
}

export interface InitiativeScaffoldData {
  initiativeId: string;
  workstreamId: string;
  milestoneId: string;
  duplicate: boolean;
}

export interface InitiativeCommitData {
  initiative: {
    id: string;
    title?: string | null;
    status: string;
    aggregateVersion: number;
  };
  created: {
    workstreams: number;
    milestones: number;
    tasks: number;
    dependency_edges: number;
    agents_assigned: number;
  };
  proposal_id?: string;
  receipt: { receipt_id: string; event_id: string };
  links: { self?: string; tree?: string; pulse?: string };
}

export interface InitiativeDetail {
  initiative: {
    id: string;
    title: string;
    status?: string | null;
    summary?: string | null;
    visibility?: string;
    model_tier?: string | null;
    execution_policy?: Record<string, unknown> | null;
    aggregateVersion: number;
    created_at?: string;
    updated_at?: string;
  };
  tree?: { workstreams?: Array<Record<string, unknown>> };
  launches?: Array<Record<string, unknown>>;
}

export interface InitiativeProposalContext {
  audience?: string;
  constraints?: string[];
  success_criteria?: string[];
  links?: string[];
  notes?: string;
}

export interface InitiativeProposalWorkstreamInput {
  name: string;
  goal?: string;
  domain_hint?: InitiativeDomain;
  agent_id?: string;
  depends_on?: string[];
  deliverables?: string[];
  expected_tokens?: number;
  expected_duration_hours?: number;
  expected_budget_usd?: number;
  milestones?: Array<{ title: string; tasks?: InitiativePlanTask[] }>;
}

export interface InitiativeSourceEvidence {
  target_url: string;
  verification_state: 'verified' | 'partial' | 'unverified';
  evidence_urls?: string[];
  notes?: string;
}

export type InitiativeProposalStatus = 'proposed' | 'instantiated' | 'expired';

export interface InitiativeProposalEconomics {
  expected_tokens?: number;
  expected_hours?: number;
  expected_budget_usd?: number;
  human_equivalent_usd?: number;
  value_basis?: string;
}

export interface InitiativeGenerationReceipt {
  receipt_id?: string;
  provider?: string | null;
  model?: string | null;
  tokens_in?: number | null;
  tokens_out?: number | null;
  cost_usd?: number | null;
}

export interface InitiativeProposal {
  proposal_id: string;
  proposal_digest: string;
  status: InitiativeProposalStatus;
  expires_at: string;
  plan: InitiativePlan;
  assignment_source: 'model' | 'baseline';
  economics: InitiativeProposalEconomics;
  generation_receipt?: InitiativeGenerationReceipt;
}

export interface InitiativeProposalDetail {
  proposal_id: string;
  proposal_digest: string;
  status: InitiativeProposalStatus;
  expires_at: string;
  plan: InitiativePlan;
  assignment_source: 'model' | 'baseline';
  economics: Record<string, unknown>;
  context?: Record<string, unknown>;
  source_evidence?: Record<string, unknown> | null;
  instantiated_initiative_id?: string;
  created_at?: string;
}

/* ------------------------------------------------------------------ */
/* Decisions                                                           */
/* ------------------------------------------------------------------ */

export type DecisionStatus =
  | 'pending'
  | 'approved'
  | 'declined'
  | 'superseded'
  | 'cancelled';

export type DecisionShape =
  | 'generic'
  | 'artifact_review'
  | 'icp_confirm'
  | 'budget_approval'
  | 'handoff_route'
  | 'plan_adjust'
  | 'task_restart'
  | 'escalation'
  | 'option_select'
  | 'option_multiselect';

export type DecisionUrgency = 'deferred' | 'standard' | 'urgent' | 'critical';

export interface Decision {
  [key: string]: unknown;
  id: string;
  workspace_id: string;
  title: string;
  summary?: string | null;
  status: DecisionStatus;
  shape?: DecisionShape;
  shape_context?: Record<string, unknown>;
  urgency?: DecisionUrgency;
  blocks_task?: boolean;
  task_id?: string | null;
  initiative_id?: string | null;
  created_at?: string;
  updated_at?: string;
}

/* ------------------------------------------------------------------ */
/* Artifacts                                                           */
/* ------------------------------------------------------------------ */

export type ArtifactEntityType =
  | 'project'
  | 'initiative'
  | 'workstream'
  | 'milestone'
  | 'task'
  | 'decision';

export type ArtifactStatus =
  | 'draft'
  | 'in_review'
  | 'approved'
  | 'changes_requested'
  | 'rejected'
  | 'eval_passed'
  | 'superseded'
  | 'archived';

export interface Artifact {
  [key: string]: unknown;
  id: string;
  name: string;
  artifact_type: string;
  artifact_url?: string | null;
  entity_type: string;
  entity_id: string;
  status: ArtifactStatus;
  version?: number;
  metadata?: Record<string, unknown>;
  verification?: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
}

export interface ArtifactCreateResult {
  ok: boolean;
  artifact: Artifact;
  artifact_type_fallback?: boolean;
  effective_artifact_type?: string;
}

export interface ArtifactDetailResult {
  ok: boolean;
  artifact: Artifact;
  relationships?: Record<string, unknown>;
}

export interface ArtifactType {
  type_code: string;
  label: string;
  summary?: string | null;
  domain: string;
  stage: string;
  workflow: string;
  default_persona?: string | null;
  tags?: string[];
  is_deliverable: boolean;
}

export interface ArtifactTypeListResult {
  data: ArtifactType[];
  meta: {
    apiVersion?: string;
    scope?: 'global';
    count?: number;
    stale?: boolean;
  };
}

/* ------------------------------------------------------------------ */
/* Runs, lifecycle, dedup                                              */
/* ------------------------------------------------------------------ */

export type RunControlAction = 'pause' | 'resume' | 'cancel' | 'rollback';

export interface RunActionResult {
  ok: boolean;
  data: Record<string, unknown>;
}

export type LifecycleLevel =
  | 'initiative'
  | 'workstream'
  | 'milestone'
  | 'task'
  | 'run';

export type LifecycleAction = 'pause' | 'resume' | 'retry' | 'cancel';

export interface LifecycleResult {
  [key: string]: unknown;
  ok: boolean;
  action: string;
  level: string;
  id: string;
  affected: {
    nodes?: number;
    runsPaused?: number;
    runsCancelled?: number;
    redispatched?: number;
  };
  message?: string;
  blockReasons?: string[];
}

export interface DedupClaimResult {
  [key: string]: unknown;
  ok: boolean;
  deduped: boolean;
  claimed: boolean;
  fingerprint_hash: string;
  active_run_id?: string | null;
  expires_at?: string | null;
  data?: Record<string, unknown>;
}

/* ------------------------------------------------------------------ */
/* Operating map and process detail                                    */
/* ------------------------------------------------------------------ */

export interface OperatingMapMeta {
  apiVersion: '1';
  workspaceId: string;
  count?: number;
  projectionStatus: 'derived_from_ledger';
  generatedAt: string;
  sourceCursor: string;
  sourceCursorStatus: 'ledger_replay';
  truncated: boolean;
  truncation: {
    processes: boolean;
    processLimit: number;
    discoverySessions: boolean;
    discoverySessionLimit: number;
  };
  freshness: {
    [key: string]: unknown;
    generatedAt: string;
    freshnessWatermark: string;
    sourceHealthSummary?: Record<string, unknown> | null;
  };
}

export interface OperatingMapResult {
  /** The spec declares the map projection as an open object. */
  data: Record<string, unknown>;
  meta: OperatingMapMeta;
}

export interface OperatingProcessDetail {
  process: Record<string, unknown> & {
    id: string;
    workspaceId: string;
    lifecycleState: string;
  };
  revisions: Array<Record<string, unknown>>;
  observedEpisodeIds: string[];
  variantIds: string[];
  aggregateVersion: number;
}
