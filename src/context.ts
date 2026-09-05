/** Shared by REST, MCP, SDKs and UI. A digest establishes identity, not freshness. */
export interface ContextDelivery {
  schema_version: 'orgx.context-delivery/v1';
  mode: 'full' | 'delta';
  consistency: 'best_effort_multi_read' | 'database_snapshot';
  completeness: 'incomplete' | 'unknown';
  reusable_for_consequential_action: false;
  /** Verification of transport reconstruction only, never authority to act. */
  base_verified: boolean;
  rebootstrap_required: boolean;
  reasons: string[];
  accounting: {
    serialized_data_bytes: number;
    model_input_tokens: null;
    tokenizer: string | null;
    /** Complete JSON data object, including delivery metadata; excludes model/chat wrappers. */
    serialized_data_tokens?: number | null;
    source_expansion_tokens: null;
  };
  performance_profile: 'unqualified_best_effort' | 'unqualified_snapshot';
  meets_prepared_byte_bound: boolean;
}

export interface ContextPreparationInput {
  /** Compact direct delivery; use full context for delta transfer. */
  response_profile?: 'full' | 'prepared';
  workspace_id: string;
  initiative_id?: string;
  workstream_id?: string;
  task_id?: string;
  /** Hints only: the server must authenticate and reconstruct current scope. */
  acknowledged_capsule_id?: string;
  reader_tokenizer?: 'o200k_base' | 'cl100k_base';
  max_payload_tokens?: number;
  delivery_mode?: 'full' | 'delta';
  acknowledged_context_version?: string;
}

export interface ContextPreparation {
  context_capsule?: Record<string, unknown>;
  context_delivery: ContextDelivery;
  [key: string]: unknown;
}
