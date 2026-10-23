import { z } from 'zod';
import { TriageReport } from '@/types/triage';

export const SeverityLevelSchema = z.enum([
  'CRITICAL',
  'HIGH',
  'MODERATE',
  'LOW',
  'UNCERTAIN',
  'NON_EMERGENCY',
]);

export const EvidenceTraceItemSchema = z.object({
  claim: z.string().min(1),
  source_type: z.enum(['USER_TEXT', 'USER_IMAGE', 'USER_CORRECTION', 'AI_INFERENCE']),
  supporting_quote_or_observation: z.string(),
  verification_status: z.enum(['USER_REPORTED', 'USER_CONFIRMED', 'AI_INFERRED']),
  uncertainty_note: z.string().optional(),
});

export const TriageReportSchema = z.object({
  is_valid_emergency: z.boolean(),
  incident_title: z.string().min(1),
  incident_category: z.string().min(1),
  severity_level: SeverityLevelSchema,
  urgency_rationale: z.string().min(1),
  executive_summary: z.string().min(1),
  location_status: z.object({
    detected_location: z.string(),
    is_location_precise: z.boolean(),
  }),
  people_affected: z.object({
    reported_summary: z.string(),
    uncertainty: z.string(),
  }),
  verification_matrix: z.object({
    user_reported_facts: z.array(z.string()),
    ai_visual_or_context_inferences: z.array(z.string()),
    missing_critical_info: z.array(z.string()),
  }),
  evidence_trace: z.array(EvidenceTraceItemSchema),
  immediate_actions: z.array(
    z.object({
      step_number: z.number(),
      instruction: z.string(),
      rationale: z.string(),
    })
  ),
  critical_warnings: z.array(z.string()),
  recommended_authorities: z.array(
    z.object({
      name: z.string(),
      number: z.string(),
      reason: z.string(),
    })
  ),
  dispatch_packet_text: z.string().min(1),
});

export function validateTriageReport(data: unknown): TriageReport {
  return TriageReportSchema.parse(data) as TriageReport;
}
