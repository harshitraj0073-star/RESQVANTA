import assert from 'node:assert/strict';
import test from 'node:test';
import { validateTriageReport } from '../lib/validation';

test('Zod Schema strictly validates valid emergency report structure', () => {
  const sample = {
    requestId: 'req_valid_001',
    submittedTextSnapshot: 'Accident reported',
    submittedAt: new Date().toISOString(),
    is_valid_emergency: true,
    incident_title: 'Highway Crash',
    incident_category: 'Traffic',
    severity_level: 'CRITICAL',
    urgency_rationale: 'Active danger on high-speed road',
    executive_summary: 'Car crash on highway',
    location_status: { detected_location: 'NH 48', is_location_precise: true },
    people_affected: { reported_summary: '2 hurt', uncertainty: 'None' },
    verification_matrix: {
      user_reported_facts: ['Car crash'],
      image_observations: [],
      ai_visual_or_context_inferences: ['Secondary collision hazard'],
      missing_critical_info: [],
    },
    evidence_trace: [
      {
        claim: 'Car crash',
        source_type: 'USER_TEXT',
        supporting_quote_or_observation: 'Accident reported',
        verification_status: 'USER_REPORTED',
      },
    ],
    immediate_actions: [
      { step_number: 1, instruction: 'Call 112', rationale: 'Immediate response' },
    ],
    critical_warnings: ['Stay off road'],
    recommended_authorities: [{ name: 'Police', number: '112', reason: 'Rescue' }],
    dispatch_packet_text: 'EMERGENCY: Highway Crash on NH 48',
  };

  const validated = validateTriageReport(sample);
  assert.equal(validated.incident_title, 'Highway Crash');
  assert.equal(validated.severity_level, 'CRITICAL');
});

test('validateTriageReport sanitizes malicious / malformed input without throwing', () => {
  const malformed = {
    requestId: null,
    submittedTextSnapshot: 12345,
    submittedAt: null,
    is_valid_emergency: 'yes', // invalid boolean type
    incident_title: '<script>alert("hack")</script>',
    immediate_actions: [
      { step_number: 1, instruction: 'Step 1' },
      { step_number: 2, instruction: 'Step 2' },
      { step_number: 3, instruction: 'Step 3' },
      { step_number: 4, instruction: 'Step 4' },
      { step_number: 5, instruction: 'Step 5' },
    ],
    verification_matrix: null,
  };

  const result = validateTriageReport(malformed);
  assert.ok(result.requestId.startsWith('req_'));
  assert.equal(typeof result.submittedTextSnapshot, 'string');
  assert.equal(result.immediate_actions.length, 3, 'Caps actions strictly at 3');
  assert.ok(Array.isArray(result.verification_matrix.image_observations));
});

test('validateTriageReport handles empty or non-emergency gracefully', () => {
  const nonEmergency = {
    requestId: 'req_non_emg',
    submittedTextSnapshot: 'Spilled water on table',
    submittedAt: new Date().toISOString(),
    is_valid_emergency: false,
    incident_title: 'Minor Water Spill',
    incident_category: 'Household',
    severity_level: 'NON_EMERGENCY',
    urgency_rationale: 'No danger present',
    executive_summary: 'Water on table',
    immediate_actions: [{ step_number: 1, instruction: 'Wipe with cloth' }],
    dispatch_packet_text: 'NON-EMERGENCY: Water on table',
  };

  const report = validateTriageReport(nonEmergency);
  assert.equal(report.is_valid_emergency, false);
  assert.equal(report.severity_level, 'NON_EMERGENCY');
});
