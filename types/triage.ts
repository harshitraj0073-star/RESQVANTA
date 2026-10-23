export type SeverityLevel = 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW' | 'NON_EMERGENCY';

export interface TriageReport {
  is_valid_emergency: boolean;
  incident_title: string;
  incident_category: string;
  severity_level: SeverityLevel;
  severity_score: number; // 1 to 10
  confidence_score: number; // 0 to 100
  executive_summary: string;
  location_status: {
    detected_location: string;
    is_location_precise: boolean;
  };
  verification_matrix: {
    user_reported_facts: string[];
    ai_visual_or_context_inferences: string[];
    missing_critical_info: string[];
  };
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
}
