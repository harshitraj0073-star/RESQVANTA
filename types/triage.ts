export type SeverityLevel =
  | 'CRITICAL'
  | 'HIGH'
  | 'MODERATE'
  | 'LOW'
  | 'UNCERTAIN'
  | 'NON_EMERGENCY';

export interface EvidenceTraceItem {
  claim: string;
  source_type: 'USER_TEXT' | 'USER_IMAGE' | 'USER_CORRECTION' | 'AI_INFERENCE';
  supporting_quote_or_observation: string;
  verification_status: 'USER_REPORTED' | 'USER_CONFIRMED' | 'AI_INFERRED';
  uncertainty_note?: string;
}

export interface TriageReport {
  requestId: string;
  submittedTextSnapshot: string;
  submittedAt: string;
  hasImageSnapshot?: boolean;
  is_valid_emergency: boolean;
  incident_title: string;
  incident_category: string;
  severity_level: SeverityLevel;
  urgency_rationale: string;
  important_question?: string;
  executive_summary: string;
  location_status: {
    detected_location: string;
    is_location_precise: boolean;
  };
  people_affected: {
    reported_summary: string;
    uncertainty: string;
  };
  verification_matrix: {
    user_reported_facts: string[];
    image_observations: string[];
    ai_visual_or_context_inferences: string[];
    missing_critical_info: string[];
  };
  evidence_trace: EvidenceTraceItem[];
  immediate_actions: {
    step_number: number;
    instruction: string;
    rationale: string;
  }[];
  critical_warnings: string[];
  recommended_authorities: {
    name: string;
    number: string;
    reason: string;
  }[];
  dispatch_packet_text: string;
  limitations?: string[];
  response_language?: 'en-IN' | 'hi-IN' | 'mr-IN' | 'gu-IN';
  model_used?: string;
}
