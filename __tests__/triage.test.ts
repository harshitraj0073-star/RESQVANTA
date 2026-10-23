import assert from 'node:assert/strict';
import test from 'node:test';
import { validateTriageReport } from '../lib/validation';
import { DEMO_PRESETS } from '../lib/presets';
import { SUPPORTED_LANGUAGES, UI_TRANSLATIONS } from '../lib/translations';

test('DEMO_PRESETS contain all 3 required fictional test scenarios', () => {
  assert.equal(DEMO_PRESETS.length, 3);
  const ids = DEMO_PRESETS.map((p) => p.id);
  assert.ok(ids.includes('flood-electric'));
  assert.ok(ids.includes('highway-crash'));
  assert.ok(ids.includes('coffee-spill'));
});

test('SUPPORTED_LANGUAGES includes all 4 required Indian languages with complete UI translations', () => {
  const codes = SUPPORTED_LANGUAGES.map((l) => l.code);
  assert.deepEqual(codes, ['en-IN', 'hi-IN', 'mr-IN', 'gu-IN']);
  for (const code of codes) {
    assert.ok(UI_TRANSLATIONS[code].call112.length > 0);
    assert.ok(UI_TRANSLATIONS[code].whatToDoNowHeading.length > 0);
  }
});

test('validateTriageReport enforces max 3 immediate actions and validates schema', () => {
  const sample: unknown = {
    is_valid_emergency: true,
    incident_title: 'Electrical Danger Near Floodwater',
    incident_category: 'Electrical & Flood Hazard',
    severity_level: 'CRITICAL',
    urgency_rationale:
      'Active electrical sparking near rising basement floodwater poses an immediate electrocution risk.',
    executive_summary:
      'User reported flooded basement and sparking meter with an elderly person possibly inside.',
    location_status: {
      detected_location: 'Apartment basement (exact address unconfirmed)',
      is_location_precise: false,
    },
    people_affected: {
      reported_summary: 'One elderly person possibly inside',
      uncertainty: 'Presence is unconfirmed by the user.',
    },
    verification_matrix: {
      user_reported_facts: [
        'Water has entered the basement',
        'Sparks are coming from the electric meter',
      ],
      ai_visual_or_context_inferences: [
        'High risk of electrical current conducting through standing water',
      ],
      missing_critical_info: [
        'Exact building address and landmark',
        'Whether the elderly person is confirmed inside',
      ],
    },
    evidence_trace: [
      {
        claim: 'Flooded basement and sparking meter',
        source_type: 'USER_TEXT',
        supporting_quote_or_observation:
          'Basement mein paani bhar gaya hai aur meter se sparks aa rahe hain.',
        verification_status: 'USER_REPORTED',
      },
    ],
    immediate_actions: [
      {
        step_number: 1,
        instruction: 'Stay away from the flooded basement area.',
        rationale: 'Standing water near sparks may carry lethal voltage.',
      },
      {
        step_number: 2,
        instruction: 'Call 112 and report the electrical danger.',
        rationale: 'Professional rescue and utility shutoff are needed.',
      },
      {
        step_number: 3,
        instruction: 'Keep others away; do not enter to attempt rescue.',
        rationale: 'Entering energized water risks additional casualties.',
      },
      {
        step_number: 4,
        instruction: 'Extra fourth step that should be trimmed.',
        rationale: 'Should be capped at 3.',
      },
    ],
    critical_warnings: ['Do not touch wet walls or metal railings.'],
    recommended_authorities: [
      {
        name: 'Emergency Services',
        number: '112',
        reason: 'Fire, rescue, and medical response',
      },
    ],
    dispatch_packet_text:
      '[112 BRIEF] Electrical Danger Near Floodwater. 1 elderly person possibly inside.',
    response_language: 'en-IN',
    model_used: 'gemini-3.8-flash',
  };

  const validated = validateTriageReport(sample);
  assert.equal(validated.severity_level, 'CRITICAL');
  assert.equal(validated.immediate_actions.length, 3);
});
