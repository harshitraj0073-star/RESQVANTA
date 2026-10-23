import { Type, Schema } from "@google/genai";

export const SYSTEM_INSTRUCTION = `You are ResQvanta AI, a precision emergency triage bridge designed to transform unstructured, panicked, multilingual (English, Hindi, Hinglish, Marathi) text and multimodal hazard imagery into a structured, epistemically honest incident assessment.

STRICT OPERATIONAL DIRECTIVES:
1. EPISTEMIC HONESTY (NON-NEGOTIABLE):
   - Strictly separate what the user explicitly stated ("user_reported_facts") from what you visually or contextually inferred ("ai_visual_or_context_inferences").
   - Explicitly list what critical information is missing ("missing_critical_info"), such as exact building number, victim breathing status, trapped individuals count.
   - NEVER fabricate facts, hospital bed counts, or claim emergency units have been dispatched.

2. NON-EMERGENCY GUARDRAIL:
   - If the user describes or uploads everyday items (e.g., spilled coffee, lost pen, study notes, benign objects) that pose NO genuine emergency, set:
     * "is_valid_emergency": false
     * "severity_level": "NON_EMERGENCY"
     * "severity_score": 1
     * "incident_category": "Benign / Non-Emergency"
   - Politely advise that no emergency services are required.

3. ASD-STE100 IMPERATIVE LIFE-SAVING ACTIONS:
   - Provide direct, concise, numbered imperative actions (e.g. "Do not step into standing water.", "Isolate main circuit breaker if safely reachable from dry ground.").
   - Provide critical "actions to avoid" (e.g. "Do not touch victim with bare hands if electrical current is suspected.").

4. INDIA EMERGENCY ROUTING:
   - National Emergency Number: 112
   - Ambulance: 108
   - Fire / Disaster: 101 / NDRF`;

export const TRIAGE_RESPONSE_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    is_valid_emergency: { type: Type.BOOLEAN },
    incident_title: { type: Type.STRING },
    incident_category: { type: Type.STRING },
    severity_level: {
      type: Type.STRING,
      enum: ["CRITICAL", "HIGH", "MODERATE", "LOW", "NON_EMERGENCY"]
    },
    severity_score: { type: Type.INTEGER, description: "Scale from 1 to 10" },
    confidence_score: { type: Type.INTEGER, description: "Scale from 0 to 100" },
    executive_summary: { type: Type.STRING },
    location_status: {
      type: Type.OBJECT,
      properties: {
        detected_location: { type: Type.STRING },
        is_location_precise: { type: Type.BOOLEAN }
      },
      required: ["detected_location", "is_location_precise"]
    },
    verification_matrix: {
      type: Type.OBJECT,
      properties: {
        user_reported_facts: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        },
        ai_visual_or_context_inferences: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        },
        missing_critical_info: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      },
      required: ["user_reported_facts", "ai_visual_or_context_inferences", "missing_critical_info"]
    },
    immediate_actions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          step_number: { type: Type.INTEGER },
          instruction: { type: Type.STRING },
          rationale: { type: Type.STRING }
        },
        required: ["step_number", "instruction", "rationale"]
      }
    },
    critical_warnings: {
      type: Type.ARRAY,
      items: { type: Type.STRING }
    },
    recommended_authorities: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          number: { type: Type.STRING },
          reason: { type: Type.STRING }
        },
        required: ["name", "number", "reason"]
      }
    },
    dispatch_packet_text: {
      type: Type.STRING,
      description: "Standardized text block ready to copy and paste to a 112 emergency dispatcher"
    }
  },
  required: [
    "is_valid_emergency",
    "incident_title",
    "incident_category",
    "severity_level",
    "severity_score",
    "confidence_score",
    "executive_summary",
    "location_status",
    "verification_matrix",
    "immediate_actions",
    "critical_warnings",
    "recommended_authorities",
    "dispatch_packet_text"
  ]
};
