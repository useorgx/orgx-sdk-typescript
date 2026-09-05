/** Shared by REST, MCP, SDKs and UI. A digest establishes identity, not freshness. */
export interface ContextDelivery {
  schema_version: 'orgx.context-delivery/v1';
  mode: 'full';
  consistency: 'best_effort_multi_read';
  completeness: 'incomplete' | 'unknown';
  reusable_for_consequential_action: false;
  base_verified: false;
  rebootstrap_required: boolean;
  reasons: string[];
  accounting: {
    serialized_data_bytes: number;
    model_input_tokens: null;
    tokenizer: null;
    source_expansion_tokens: null;
  };
  performance_profile: 'unqualified_best_effort';
  meets_prepared_byte_bound: boolean;
}

export interface ContextPreparationInput {
  workspace_id: string;
  initiative_id?: string;
  workstream_id?: string;
  task_id?: string;
  /** Hints only: the server must authenticate and reconstruct current scope. */
  acknowledged_capsule_id?: string;
}

export interface ContextPreparation {
  context_capsule?: Record<string, unknown>;
  context_delivery: ContextDelivery;
  [key: string]: unknown;
}
