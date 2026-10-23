import assert from 'node:assert/strict';
import test from 'node:test';
import { validateTriageReport } from '../lib/validation';
import { DEMO_PRESETS } from '../lib/presets';

test('DEMO_PRESETS contain all 3 required fictional test scenarios', () => {
  assert.equal(DEMO_PRESETS.length, 3);
  const ids = DEMO_PRESETS.map((p) => p.id);
  assert.ok(ids.includes('flood-electric'));
  assert.ok(ids.includes('highway-crash'));
  assert.ok(ids.includes('coffee-spill'));
});

test('validateTriageReport accepts valid structured Gemini 3.8 Flash output with Evidence Trace', () => {
  const sample: unknown = {
    is_valid_emergency: true,
    incident_title: 'Basement Flooding and Sparking Electrical Meter',
    incident_category: 'Flooding / Electrical Hazard',
    severity_level: 'CRITICAL',
    urgency_rationale:
      'Combination of rising water in an enclosed basement and active electrical sparks presents an immediate electrocution hazard, with one elderly person possibly inside.',
    executive_summary:
      'User reports basement flooding and sparks coming from an electric meter, with an elderly person possibly inside.',
    location_status: {
      detected_location: 'Apartment basement (exact address not provided)',
      is_location_precise: false,
    },
    people_affected: {
      reported_summary: 'One elderly person possibly inside basement',
      uncertainty: 'User stated "ho sakta hai" (may be inside); presence is unconfirmed.',
    },
    verification_matrix: {
      user_reported_facts: [
        'Water has filled the apartment basement',
        'Sparks are coming from the electric meter',
        'An elderly person may be inside',
      ],
      ai_visual_or_context_inferences: [
        'Possible electrocution risk if standing water contacts live electrical components',
      ],
      missing_critical_info: [
        'Exact apartment building name and street address',
        'Confirmation of whether the elderly person is inside the basement',
      ],
    },
    evidence_trace: [
      {
        claim: 'Water in apartment basement and sparking meter',
        source_type: 'USER_TEXT',
        supporting_quote_or_observation:
          'Apartment ke basement mein paani bhar gaya hai aur electric meter se sparks aa rahe hain.',
        verification_status: 'USER_REPORTED',
      },
      {
        claim: 'Elderly person possibly inside',
        source_type: 'USER_TEXT',
        supporting_quote_or_observation: 'Ek elderly person andar ho sakta hai.',
        verification_status: 'USER_REPORTED',
        uncertainty_note: 'Reported as uncertain by user.',
      },
    ],
    immediate_actions: [
      {
        step_number: 1,
        instruction: 'Call 112 immediately and report flooding with an active electrical hazard.',
        rationale: 'Professional responders and power utility isolation are required.',
      },
      {
        step_number: 2,
        instruction: 'Do not enter the flooded basement or touch standing water.',
        rationale: 'Sparking electrical equipment can energize water and cause fatal shock.',
      },
    ],
    critical_warnings: [
      'Do not step into flooded areas near electrical meters or wiring.',
    ],
    recommended_authorities: [
      {
        name: 'National Emergency Services',
        number: '112',
        reason: 'Immediate fire, rescue, and medical coordination',
      },
    ],
    dispatch_packet_text:
      '[112 EMERGENCY BRIEF] Type: Flood & Electrical Hazard | Summary: Apartment basement flooded with sparking electric meter. 1 elderly person possibly inside (unconfirmed). Location: Apartment basement (exact address pending).',
  };

  const validated = validateTriageReport(sample);
  assert.equal(validated.severity_level, 'CRITICAL');
  assert.equal(validated.evidence_trace.length, 2);
});
