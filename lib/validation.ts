import { z } from 'zod';
import { TriageReport } from '@/types/triage';

export const SeverityLevelSchema = z.enum([
  'CRITICAL',
  'HIGH',
  'MODERATE',
  'LOW',
  'NON_EMERGENCY',
]);

export const TriageReportSchema = z.object({
  incidentCategory: z.string().min(1),
  severityLevel: SeverityLevelSchema,
  severityScore: z.number().min(0).max(100),
  executiveSummary: z.string().min(1),
  extractedLocation: z.object({
    landmarkOrAddress: z.string(),
    confidence: z.enum(['HIGH', 'MEDIUM', 'LOW', 'MISSING']),
  }),
  peopleAffected: z.object({
    estimatedCount: z.string(),
    vulnerableGroupsPresent: z.boolean(),
  }),
  verificationMatrix: z.object({
    userReportedFacts: z.array(z.string()),
    aiInferredRisks: z.array(z.string()),
    missingCriticalInfo: z.array(z.string()),
  }),
  immediateActions: z.array(z.string()).min(1),
  doNotDoWarnings: z.array(z.string()),
  recommendedResponders: z.array(z.string()),
  dispatchPacketSummary: z.string().min(1),
});

export function validateTriageReport(data: unknown): TriageReport {
  return TriageReportSchema.parse(data) as TriageReport;
}
