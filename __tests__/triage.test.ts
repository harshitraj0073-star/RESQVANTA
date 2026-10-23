import assert from 'node:assert/strict';
import test from 'node:test';
import { validateTriageReport } from '../lib/validation';
import { DEMO_PRESETS } from '../lib/presets';
import { SUPPORTED_LANGUAGES, UI_TRANSLATIONS } from '../lib/translations';

test('DEMO_PRESETS contain all 3 required fictional test scenarios with 4-language localization', () => {
  assert.equal(DEMO_PRESETS.length, 3);
  const ids = DEMO_PRESETS.map((p) => p.id);
  assert.ok(ids.includes('flood-electric'));
  assert.ok(ids.includes('highway-crash'));
  assert.ok(ids.includes('coffee-spill'));

  for (const preset of DEMO_PRESETS) {
    assert.ok(preset.localized['en-IN'].title.length > 0);
    assert.ok(preset.localized['hi-IN'].title.length > 0);
    assert.ok(preset.localized['mr-IN'].title.length > 0);
    assert.ok(preset.localized['gu-IN'].title.length > 0);
  }
});

test('SUPPORTED_LANGUAGES includes all 4 required Indian languages with complete UI translations', () => {
  const codes = SUPPORTED_LANGUAGES.map((l) => l.code);
  assert.deepEqual(codes, ['en-IN', 'hi-IN', 'mr-IN', 'gu-IN']);
  for (const code of codes) {
    assert.ok(UI_TRANSLATIONS[code].call112.length > 0);
    assert.ok(UI_TRANSLATIONS[code].whatToDoNowHeading.length > 0);
    assert.ok(UI_TRANSLATIONS[code].importantQuestionHeading.length > 0);
    assert.ok(UI_TRANSLATIONS[code].resultForInputLabel.length > 0);
  }
});

test('validateTriageReport preserves requestId, submittedTextSnapshot, important_question, and caps immediate_actions at 3', () => {
  const sample: unknown = {
    requestId: 'req_test_accident_101',
    submittedTextSnapshot: 'i am seeing accident now what to do now',
    submittedAt: '2026-10-23T07:00:00.000Z',
    is_valid_emergency: true,
    incident_title: 'Possible Road Accident',
    incident_category: 'Road Traffic Incident',
    severity_level: 'HIGH',
    urgency_rationale:
      'User reports witnessing an active accident right now; injury status and exact location are not yet specified.',
    important_question: 'Is anyone injured or in immediate danger from moving traffic, and what is your location?',
    executive_summary:
      'User reports seeing an accident occurring now and asks for immediate next steps.',
    location_status: {
      detected_location: 'Not specified',
      is_location_precise: false,
    },
    people_affected: {
      reported_summary: 'Unknown',
      uncertainty: 'User has not yet stated whether anyone is hurt.',
    },
    verification_matrix: {
      user_reported_facts: ['Witnessing an accident right now'],
      image_observations: [],
      ai_visual_or_context_inferences: ['Potential traffic hazard and possible injuries at the scene'],
      missing_critical_info: ['Exact location/landmark', 'Whether anyone is injured or trapped'],
    },
    evidence_trace: [
      {
        claim: 'User is witnessing an accident now',
        source_type: 'USER_TEXT',
        supporting_quote_or_observation: 'i am seeing accident now what to do now',
        verification_status: 'USER_REPORTED',
      },
    ],
    immediate_actions: [
      {
        step_number: 1,
        instruction: 'Stay in a safe spot clear of moving traffic.',
        rationale: 'Protect yourself from secondary collisions first.',
      },
      {
        step_number: 2,
        instruction: 'Call 112 if anyone appears injured or in danger.',
        rationale: 'Emergency responders need early notification.',
      },
      {
        step_number: 3,
        instruction: 'Note the road landmark to share with responders.',
        rationale: 'Helps ambulance and police locate the scene quickly.',
      },
      {
        step_number: 4,
        instruction: 'Extra fourth step that should be trimmed.',
        rationale: 'Should be capped at 3.',
      },
    ],
    critical_warnings: ['Do not step into active traffic lanes.'],
    recommended_authorities: [
      {
        name: 'Emergency Services',
        number: '112',
        reason: 'Police and ambulance dispatch',
      },
    ],
    dispatch_packet_text:
      '[112 BRIEF] Possible Road Accident reported by witness. Location & injury count pending confirmation.',
    response_language: 'en-IN',
    model_used: 'gemini-3.8-flash',
  };

  const validated = validateTriageReport(sample);
  assert.equal(validated.requestId, 'req_test_accident_101');
  assert.equal(validated.submittedTextSnapshot, 'i am seeing accident now what to do now');
  assert.equal(validated.incident_title, 'Possible Road Accident');
  assert.equal(validated.immediate_actions.length, 3);
  assert.ok(validated.important_question?.includes('injured'));
});
