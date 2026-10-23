import assert from 'node:assert/strict';
import test from 'node:test';
import { validateTriageReport } from '../lib/validation';
import { DEMO_PRESETS } from '../lib/presets';

test('DEMO_PRESETS contain valid emergency and non-emergency scenarios', () => {
  assert.ok(DEMO_PRESETS.length >= 3, 'Must include at least 3 presets');
  const ids = DEMO_PRESETS.map((p) => p.id);
  assert.ok(ids.includes('flood-electric'));
  assert.ok(ids.includes('highway-crash'));
  assert.ok(ids.includes('false-alarm'));
});

test('validateTriageReport accepts valid structured Gemini triage output', () => {
  const sample: unknown = {
    incidentCategory: 'Urban Flood & Electrical Hazard',
    severityLevel: 'CRITICAL',
    severityScore: 94,
    executiveSummary: 'Basement flooding with active sparking electrical panel and 4 trapped occupants.',
    extractedLocation: {
      landmarkOrAddress: 'Sector 4, Plot 19 Basement',
      confidence: 'HIGH',
    },
    peopleAffected: {
      estimatedCount: '4 people (1 elderly, 1 child)',
      vulnerableGroupsPresent: true,
    },
    verificationMatrix: {
      userReportedFacts: ['Water rising to knee level', 'Sparking electric meter'],
      aiInferredRisks: ['High electrocution hazard in conductive standing water'],
      missingCriticalInfo: ['Exact building floor exit access'],
    },
    immediateActions: [
      'MOVE all occupants to dry elevated platform away from water immediately.',
      'KEEP at least 5 meters away from the sparking electric meter.',
    ],
    doNotDoWarnings: ['DO NOT touch standing water while electrical panel is sparking.'],
    recommendedResponders: ['112 National Emergency', 'Fire & Rescue', 'Power Utility'],
    dispatchPacketSummary: '[112 DISPATCH] CRITICAL Flood/Electrocution at Sector 4 Plot 19. 4 trapped.',
  };

  const validated = validateTriageReport(sample);
  assert.equal(validated.severityLevel, 'CRITICAL');
  assert.equal(validated.severityScore, 94);
});
