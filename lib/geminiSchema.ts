import { Type, Schema } from "@google/genai";

export const GEMINI_MODEL_ID = "gemini-3.8-flash";

export const SYSTEM_INSTRUCTION = `You are ResQvanta AI, an emergency information assistant powered by Google Gemini 3.8 Flash. Your job is to transform unstructured, panicked, multilingual (English, Hindi, Marathi, Gujarati, or Hinglish) inputs and optional images into concise, immediate safety guidance and structured evidence.

STRICT OPERATIONAL & SAFETY DIRECTIVES:
1. EMERGENCY-FIRST BREVITY (NON-NEGOTIABLE):
   - "incident_title" must be a SHORT emergency headline (3 to 7 words, e.g., "Electrical Danger Near Floodwater").
   - "immediate_actions" MUST contain AT MOST 3 actions (1 to 3 items).
   - Each "instruction" in "immediate_actions" MUST be short and direct (5 to 12 words, e.g., "Stay away from the flooded basement area.", "Call 112 and report the electrical danger.", "Keep others back; do not enter the water.").
   - Each "rationale" must be a single brief supporting sentence.

2. EVIDENCE & UNCERTAINTY ENGINE:
   - Strictly separate statements directly reported by the user or observed in media ("user_reported_facts") from AI interpretations ("ai_visual_or_context_inferences").
   - Label AI interpretations as possible risks/interpretations, never confirmed facts.
   - List the most important unanswered questions ("missing_critical_info"). Never invent missing locations, injury counts, rescues, or hospital availability.
   - Populate "evidence_trace" so every key claim is traceable to USER_TEXT, USER_IMAGE, USER_CORRECTION, or AI_INFERENCE.
   - If the user provides follow-up corrections, mark those updated facts as USER_CONFIRMED in "evidence_trace".

3. URGENCY ASSESSMENT (NO ARBITRARY SCORES):
   - Classify urgency into one of: "CRITICAL", "HIGH", "MODERATE", "LOW", "UNCERTAIN", or "NON_EMERGENCY".
   - Provide a concise 1-sentence "urgency_rationale" explaining why that level was chosen and what uncertainty remains.

4. FALSE-ALARM & CONTRADICTION DETECTION:
   - If the user describes an ordinary non-emergency (e.g., spilled coffee on a desk/laptop with nobody hurt and no fire), do NOT invent a catastrophic emergency.
   - Set "is_valid_emergency": false, "severity_level": "NON_EMERGENCY" (or "LOW"), and provide proportionate practical steps.

5. FOUR-LANGUAGE OUTPUT ACCURACY:
   - Output all user-facing text fields ("incident_title", "incident_category", "urgency_rationale", "executive_summary", "immediate_actions", "verification_matrix", "critical_warnings", "dispatch_packet_text") in the requested target language ("en-IN" = English, "hi-IN" = Hindi in Devanagari script, "mr-IN" = Marathi in Devanagari script, "gu-IN" = Gujarati in Gujarati script).
   - Preserve emergency numbers (112, 108, 101), user-provided names, landmarks, and addresses accurately.`;

export const TRIAGE_RESPONSE_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    is_valid_emergency: { type: Type.BOOLEAN },
    incident_title: {
      type: Type.STRING,
      description: "Short emergency headline (3 to 7 words)."
    },
    incident_category: { type: Type.STRING },
    severity_level: {
      type: Type.STRING,
      enum: ["CRITICAL", "HIGH", "MODERATE", "LOW", "UNCERTAIN", "NON_EMERGENCY"]
    },
    urgency_rationale: {
      type: Type.STRING,
      description: "One brief sentence explaining the urgency level and any key uncertainty."
    },
    executive_summary: { type: Type.STRING },
    location_status: {
      type: Type.OBJECT,
      properties: {
        detected_location: { type: Type.STRING },
        is_location_precise: { type: Type.BOOLEAN }
      },
      required: ["detected_location", "is_location_precise"]
    },
    people_affected: {
      type: Type.OBJECT,
      properties: {
        reported_summary: { type: Type.STRING },
        uncertainty: { type: Type.STRING }
      },
      required: ["reported_summary", "uncertainty"]
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
      required: [
        "user_reported_facts",
        "ai_visual_or_context_inferences",
        "missing_critical_info"
      ]
    },
    evidence_trace: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          claim: { type: Type.STRING },
          source_type: {
            type: Type.STRING,
            enum: ["USER_TEXT", "USER_IMAGE", "USER_CORRECTION", "AI_INFERENCE"]
          },
          supporting_quote_or_observation: { type: Type.STRING },
          verification_status: {
            type: Type.STRING,
            enum: ["USER_REPORTED", "USER_CONFIRMED", "AI_INFERRED"]
          },
          uncertainty_note: { type: Type.STRING }
        },
        required: [
          "claim",
          "source_type",
          "supporting_quote_or_observation",
          "verification_status"
        ]
      }
    },
    immediate_actions: {
      type: Type.ARRAY,
      description: "Up to 3 immediate safety actions, each instruction 5 to 12 words.",
      items: {
        type: Type.OBJECT,
        properties: {
          step_number: { type: Type.INTEGER },
          instruction: {
            type: Type.STRING,
            description: "Short, direct imperative instruction (5 to 12 words)."
          },
          rationale: {
            type: Type.STRING,
            description: "One brief supporting sentence."
          }
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
      description: "Compact 112 Emergency Brief ready to copy or share via SMS/WhatsApp."
    },
    limitations: {
      type: Type.ARRAY,
      items: { type: Type.STRING }
    }
  },
  required: [
    "is_valid_emergency",
    "incident_title",
    "incident_category",
    "severity_level",
    "urgency_rationale",
    "executive_summary",
    "location_status",
    "people_affected",
    "verification_matrix",
    "evidence_trace",
    "immediate_actions",
    "critical_warnings",
    "recommended_authorities",
    "dispatch_packet_text"
  ]
};
