import { z } from 'zod';
import type { TriageReport } from '../types/triage';

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
  requestId: z.string().min(1),
  submittedTextSnapshot: z.string(),
  submittedAt: z.string(),
  hasImageSnapshot: z.boolean().optional(),
  is_valid_emergency: z.boolean(),
  incident_title: z.string().min(1),
  incident_category: z.string().min(1),
  severity_level: SeverityLevelSchema,
  urgency_rationale: z.string().min(1),
  important_question: z.string().optional(),
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
    image_observations: z.array(z.string()).default([]),
    ai_visual_or_context_inferences: z.array(z.string()),
    missing_critical_info: z.array(z.string()),
  }),
  evidence_trace: z.array(EvidenceTraceItemSchema),
  immediate_actions: z
    .array(
      z.object({
        step_number: z.number(),
        instruction: z.string(),
        rationale: z.string(),
      })
    )
    .min(1)
    .max(3),
  critical_warnings: z.array(z.string()),
  recommended_authorities: z.array(
    z.object({
      name: z.string(),
      number: z.string(),
      reason: z.string(),
    })
  ),
  dispatch_packet_text: z.string().min(1),
  limitations: z.array(z.string()).optional(),
  response_language: z.enum(['en-IN', 'hi-IN', 'mr-IN', 'gu-IN']).optional(),
  model_used: z.string().optional(),
});

export function validateTriageReport(data: unknown): TriageReport {
  const raw = { ...(data as Record<string, unknown>) };

  if (!raw.requestId || typeof raw.requestId !== 'string') {
    raw.requestId = `req_${Date.now()}`;
  }
  if (typeof raw.submittedTextSnapshot !== 'string') {
    raw.submittedTextSnapshot = String(raw.submittedTextSnapshot || '');
  }
  if (!raw.submittedAt || typeof raw.submittedAt !== 'string') {
    raw.submittedAt = new Date().toISOString();
  }
  if (typeof raw.is_valid_emergency !== 'boolean') {
    raw.is_valid_emergency = raw.is_valid_emergency === 'true' || raw.is_valid_emergency === true;
  }
  if (!raw.incident_title || typeof raw.incident_title !== 'string') {
    raw.incident_title = 'Emergency Incident Reported';
  }
  if (!raw.incident_category || typeof raw.incident_category !== 'string') {
    raw.incident_category = 'General Emergency';
  }
  const validSeverities = ['CRITICAL', 'HIGH', 'MODERATE', 'LOW', 'UNCERTAIN', 'NON_EMERGENCY'];
  if (!validSeverities.includes(raw.severity_level as string)) {
    raw.severity_level = raw.is_valid_emergency ? 'HIGH' : 'NON_EMERGENCY';
  }
  if (!raw.urgency_rationale || typeof raw.urgency_rationale !== 'string') {
    raw.urgency_rationale = 'Immediate situation reported by user requiring safety assessment.';
  }
  if (!raw.executive_summary || typeof raw.executive_summary !== 'string') {
    raw.executive_summary = 'User reported emergency incident requiring immediate action.';
  }
  if (!raw.location_status || typeof raw.location_status !== 'object') {
    raw.location_status = { detected_location: 'Not specified', is_location_precise: false };
  }
  if (!raw.people_affected || typeof raw.people_affected !== 'object') {
    raw.people_affected = { reported_summary: 'Unknown', uncertainty: 'Unverified' };
  }
  if (!raw.verification_matrix || typeof raw.verification_matrix !== 'object') {
    raw.verification_matrix = {
      user_reported_facts: [raw.submittedTextSnapshot || 'Incident reported'],
      image_observations: [],
      ai_visual_or_context_inferences: [],
      missing_critical_info: [],
    };
  } else {
    const matrix = raw.verification_matrix as Record<string, unknown>;
    if (!Array.isArray(matrix.user_reported_facts)) matrix.user_reported_facts = [];
    if (!Array.isArray(matrix.image_observations)) matrix.image_observations = [];
    if (!Array.isArray(matrix.ai_visual_or_context_inferences)) matrix.ai_visual_or_context_inferences = [];
    if (!Array.isArray(matrix.missing_critical_info)) matrix.missing_critical_info = [];
  }
  if (!Array.isArray(raw.evidence_trace)) {
    raw.evidence_trace = [
      {
        claim: raw.incident_title as string,
        source_type: 'USER_TEXT',
        supporting_quote_or_observation: raw.submittedTextSnapshot as string,
        verification_status: 'USER_REPORTED',
      },
    ];
  }
  if (Array.isArray(raw.immediate_actions)) {
    raw.immediate_actions = raw.immediate_actions.slice(0, 3).map((act: unknown, idx: number) => {
      const a = (act && typeof act === 'object') ? (act as Record<string, unknown>) : {};
      return {
        step_number: typeof a.step_number === 'number' ? a.step_number : idx + 1,
        instruction: typeof a.instruction === 'string' ? a.instruction : 'Remain in a safe location',
        rationale: typeof a.rationale === 'string' ? a.rationale : 'Protects against immediate hazards',
      };
    });
  } else {
    raw.immediate_actions = [
      { step_number: 1, instruction: 'Assess personal safety and remain clear of active hazards', rationale: 'Personal safety is first priority' },
    ];
  }
  if (!Array.isArray(raw.critical_warnings)) {
    raw.critical_warnings = ['Do not place yourself in danger to investigate.'];
  }
  if (!Array.isArray(raw.recommended_authorities)) {
    raw.recommended_authorities = [{ name: 'Emergency Services', number: '112', reason: 'Official assistance' }];
  }
  if (!raw.dispatch_packet_text || typeof raw.dispatch_packet_text !== 'string') {
    raw.dispatch_packet_text = `EMERGENCY: ${raw.incident_title}. Location pending confirmation.`;
  }

  return TriageReportSchema.parse(raw) as TriageReport;
}
