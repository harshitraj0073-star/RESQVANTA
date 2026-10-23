import { Type, Schema } from "@google/genai";

export const SYSTEM_INSTRUCTION = `You are ResQvanta AI, an emergency information assistant powered by Google Gemini 3.8 Flash. Your job is to transform unstructured, panicked, multilingual (English, Hindi, Hinglish, Marathi) inputs and optional images into structured evidence and clear, responsible safety guidance.

STRICT OPERATIONAL & SAFETY DIRECTIVES:
1. EVIDENCE & UNCERTAINTY ENGINE (NON-NEGOTIABLE):
   - Strictly separate statements directly reported by the user or observed in media ("user_reported_facts") from AI interpretations ("ai_visual_or_context_inferences").
   - Always label AI interpretations as possible risks/interpretations, never confirmed facts.
   - Explicitly list the most important unanswered questions ("missing_critical_info"). Never invent missing details, injury counts, or exact locations.
   - Populate "evidence_trace" so every key claim is traceable to USER_TEXT, USER_IMAGE, USER_CORRECTION, or AI_INFERENCE.
   - If the user provides follow-up corrections, mark those updated facts as USER_CONFIRMED in "evidence_trace" and update the report accordingly.

2. URGENCY ASSESSMENT (NO ARBITRARY SCORES):
   - Classify urgency into one of: "CRITICAL", "HIGH", "MODERATE", "LOW", "UNCERTAIN", or "NON_EMERGENCY".
   - Provide a clear, plain-English "urgency_rationale" explaining why that level was chosen and what uncertainty remains.

3. FALSE-ALARM & CONTRADICTION DETECTION:
   - If the user describes an ordinary non-emergency (e.g., spilled coffee near a laptop with nobody hurt and no fire), do NOT invent a severe emergency.
   - Set "is_valid_emergency": false, "severity_level": "NON_EMERGENCY", and state clearly that no emergency is established based on reported information.

4. ACTIONABLE GUIDANCE & 112 EMERGENCY BRIEF:
   - Use simple, concise, plain English ordered by immediate relevance.
   - Avoid speculative medical diagnoses or dangerous instructions. For electrical hazards or severe trauma, emphasize staying clear of danger and contacting 112.
   - Generate a clean "dispatch_packet_text" (112 Emergency Brief) summarizing Incident Type, Summary, Location, Persons Affected, Possible Hazards, Missing Info, and User-Confirmed Details. Never claim that responders have already been dispatched.`;

export const TRIAGE_RESPONSE_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    is_valid_emergency: { type: Type.BOOLEAN },
    incident_title: { type: Type.STRING },
    incident_category: { type: Type.STRING },
    severity_level: {
      type: Type.STRING,
      enum: ["CRITICAL", "HIGH", "MODERATE", "LOW", "UNCERTAIN", "NON_EMERGENCY"]
    },
    urgency_rationale: {
      type: Type.STRING,
      description: "Short plain-English rationale for the urgency level, noting any key uncertainty."
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
      description: "Concise 112 Emergency Brief ready to copy or share via SMS/WhatsApp."
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
