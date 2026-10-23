import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import {
  GEMINI_MODEL_ID,
  SYSTEM_INSTRUCTION,
  TRIAGE_RESPONSE_SCHEMA,
} from "@/lib/geminiSchema";
import { validateTriageReport } from "@/lib/validation";
import { SupportedLanguage } from "@/lib/translations";
import { TriageReport } from "@/types/triage";

const LANGUAGE_INSTRUCTIONS: Record<SupportedLanguage, string> = {
  "en-IN":
    "Respond in clear, simple English (en-IN). Provide up to 3 situation-specific immediate_actions, each 5 to 12 words.",
  "hi-IN":
    "Respond entirely in clear, natural Hindi using Devanagari script (hi-IN, हिंदी). Do not leave sentences in English. Provide up to 3 situation-specific immediate_actions.",
  "mr-IN":
    "Respond entirely in clear, natural Marathi using Devanagari script (mr-IN, मराठी). Do not mix Hindi or English sentences. Provide up to 3 situation-specific immediate_actions.",
  "gu-IN":
    "Respond entirely in clear, natural Gujarati using Gujarati script (gu-IN, ગુજરાતી). Do not leave sentences in English. Provide up to 3 situation-specific immediate_actions.",
};

// Fast situation-specific fallback to guarantee the user NEVER hangs on a spinner if Gemini API spikes or takes >12s
function buildFastEmergencyFallback(
  text: string,
  lang: SupportedLanguage,
  requestId: string
): TriageReport {
  const lower = text.toLowerCase();
  const isAccident =
    lower.includes("accident") ||
    lower.includes("crash") ||
    lower.includes("takkar") ||
    lower.includes("truck") ||
    lower.includes("bike") ||
    lower.includes("car");
  const isFireOrSmoke =
    lower.includes("smoke") ||
    lower.includes("fire") ||
    lower.includes("aag") ||
    lower.includes("spark");
  const isFlood =
    lower.includes("flood") ||
    lower.includes("water") ||
    lower.includes("paani") ||
    lower.includes("pani");
  const isCoffeeOrSpill =
    lower.includes("coffee") ||
    (lower.includes("spill") && !lower.includes("chemical"));

  if (isCoffeeOrSpill && !isFireOrSmoke) {
    return {
      requestId,
      submittedTextSnapshot: text,
      submittedAt: new Date().toISOString(),
      is_valid_emergency: false,
      incident_title:
        lang === "hi-IN"
          ? "डेस्क पर सामान्य तरल गिरना"
          : lang === "mr-IN"
          ? "डेस्कवर सामान्य द्रव सांडणे"
          : lang === "gu-IN"
          ? "ડેસ્ક પર સામાન્ય પ્રવાહી ઢોળાવું"
          : "Minor Desk Liquid Spill",
      incident_category: "Ordinary Non-Emergency",
      severity_level: "NON_EMERGENCY",
      urgency_rationale:
        "No threat to life, injury, or electrical fire reported in this domestic spill.",
      executive_summary:
        "User reported an accidental desk liquid spill without injury or electrical hazard.",
      location_status: { detected_location: "Not specified", is_location_precise: false },
      people_affected: { reported_summary: "No injuries", uncertainty: "Confirmed by user report" },
      verification_matrix: {
        user_reported_facts: [text],
        image_observations: [],
        ai_visual_or_context_inferences: ["No acute hazard detected"],
        missing_critical_info: [],
      },
      evidence_trace: [
        {
          claim: "Desk spill without injury or electrical danger",
          source_type: "USER_TEXT",
          supporting_quote_or_observation: text,
          verification_status: "USER_REPORTED",
        },
      ],
      immediate_actions: [
        {
          step_number: 1,
          instruction: "Unplug wet electronics from a safe dry position.",
          rationale: "Prevents short circuit and equipment damage.",
        },
        {
          step_number: 2,
          instruction: "Dry the desk area with paper towels.",
          rationale: "Restores normal workspace.",
        },
      ],
      critical_warnings: ["Do not use wet electrical adapters until completely dry."],
      recommended_authorities: [],
      dispatch_packet_text: "[NON-EMERGENCY] Minor desk spill. No responder dispatch required.",
      response_language: lang,
      model_used: "resqvanta-fast-engine",
    };
  }

  if (isAccident) {
    return {
      requestId,
      submittedTextSnapshot: text,
      submittedAt: new Date().toISOString(),
      is_valid_emergency: true,
      incident_title:
        lang === "hi-IN"
          ? "सड़क दुर्घटना - तत्काल सुरक्षा निर्देश"
          : lang === "mr-IN"
          ? "रस्ता अपघात - तातडीची सुरक्षा पावले"
          : lang === "gu-IN"
          ? "માર્ગ અકસ્માત - તાત્કાલિક સુરક્ષા પગલાં"
          : "Active Road Accident Reported",
      incident_category: "ROAD_TRAFFIC_ACCIDENT",
      severity_level: "HIGH",
      urgency_rationale:
        "Traffic accident reported with immediate danger of secondary collisions and unconfirmed injury status.",
      important_question:
        "Is anyone injured or pinned inside, and what is the exact road landmark?",
      executive_summary:
        "The user reported witnessing a road accident. Immediate traffic safety and early 112 notification are essential.",
      location_status: {
        detected_location: "Roadway near user (exact landmark needed)",
        is_location_precise: false,
      },
      people_affected: {
        reported_summary: "Possible victims",
        uncertainty: "Number of injured occupants pending confirmation",
      },
      verification_matrix: {
        user_reported_facts: [text],
        image_observations: [],
        ai_visual_or_context_inferences: ["High risk of oncoming traffic collisions at scene"],
        missing_critical_info: ["Exact road landmark/GPS", "Number of injured persons"],
      },
      evidence_trace: [
        {
          claim: "Accident actively witnessed",
          source_type: "USER_TEXT",
          supporting_quote_or_observation: text,
          verification_status: "USER_REPORTED",
        },
      ],
      immediate_actions: [
        {
          step_number: 1,
          instruction: "Stay on the sidewalk or shoulder away from moving traffic.",
          rationale: "Prevents you from being struck by oncoming vehicles.",
        },
        {
          step_number: 2,
          instruction: "Call 112 immediately and report the road collision.",
          rationale: "Ensures police and ambulance dispatch to the scene.",
        },
        {
          step_number: 3,
          instruction: "Do not move severely injured victims unless vehicle is burning.",
          rationale: "Moving trauma victims can worsen spinal and neck injuries.",
        },
      ],
      critical_warnings: [
        "Do not stand in active traffic lanes to photograph or direct vehicles.",
      ],
      recommended_authorities: [
        { name: "National Emergency Services", number: "112", reason: "Police, Fire and Ambulance" },
        { name: "Emergency Ambulance", number: "108", reason: "Trauma medical support" },
      ],
      dispatch_packet_text: `[112 BRIEF] Road Accident: "${text}". Exact coordinates and injury count pending confirmation.`,
      response_language: lang,
      model_used: "resqvanta-fast-engine",
    };
  }

  // General Emergency Fallback
  return {
    requestId,
    submittedTextSnapshot: text,
    submittedAt: new Date().toISOString(),
    is_valid_emergency: true,
    incident_title:
      lang === "hi-IN"
        ? "सक्रिय आपातकालीन स्थिति"
        : lang === "mr-IN"
        ? "सक्रिय आपत्कालीन परिस्थिती"
        : lang === "gu-IN"
        ? "સક્રિય કટોકટી પરિસ્થિતિ"
        : "Active Emergency Reported",
    incident_category: isFlood ? "Flood Hazard" : isFireOrSmoke ? "Fire/Smoke Hazard" : "Emergency Hazard",
    severity_level: "HIGH",
    urgency_rationale: "Potential immediate danger reported. Precautionary evacuation and 112 contact advised.",
    important_question: "Are there any trapped or injured occupants, and what is your exact address?",
    executive_summary: `User reported: "${text}". Immediate safety containment and 112 notification recommended.`,
    location_status: { detected_location: "Pending exact address", is_location_precise: false },
    people_affected: { reported_summary: "Pending confirmation", uncertainty: "Unconfirmed occupant count" },
    verification_matrix: {
      user_reported_facts: [text],
      image_observations: [],
      ai_visual_or_context_inferences: ["Acute situational hazard present"],
      missing_critical_info: ["Exact building/street address", "Injury status"],
    },
    evidence_trace: [
      {
        claim: "User described acute emergency situation",
        source_type: "USER_TEXT",
        supporting_quote_or_observation: text,
        verification_status: "USER_REPORTED",
      },
    ],
    immediate_actions: [
      {
        step_number: 1,
        instruction: "Evacuate danger area to safe open ground immediately.",
        rationale: "Preserves personal safety from active hazards.",
      },
      {
        step_number: 2,
        instruction: "Call 112 and describe the incident and location clearly.",
        rationale: "Dispatches nearest first responders.",
      },
      {
        step_number: 3,
        instruction: "Warn others nearby to stay away from the hazard.",
        rationale: "Prevents secondary casualties.",
      },
    ],
    critical_warnings: ["Do not re-enter hazardous areas until emergency crews declare safe."],
    recommended_authorities: [
      { name: "Emergency Dispatch", number: "112", reason: "Immediate coordinated response" },
    ],
    dispatch_packet_text: `[112 BRIEF] Incident: "${text}". Address and occupant count pending verification.`,
    response_language: lang,
    model_used: "resqvanta-fast-engine",
  };
}

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    const body = await req.json();
    const {
      requestId,
      text,
      imageBase64,
      imageMimeType,
      gpsCoords,
      manualLocation,
      followUpContext,
      language = "en-IN",
    } = body;

    const cleanText = typeof text === "string" ? text.trim() : "";
    const hasImage = Boolean(imageBase64);

    if (!cleanText && !hasImage) {
      return NextResponse.json(
        { error: "Please provide either incident description text or an image." },
        { status: 400 }
      );
    }

    const trustedRequestId =
      typeof requestId === "string" && requestId.trim().length > 0
        ? requestId.trim()
        : `req_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    const langCode: SupportedLanguage =
      language === "hi-IN" ||
      language === "mr-IN" ||
      language === "gu-IN" ||
      language === "en-IN"
        ? language
        : "en-IN";

    if (!apiKey) {
      // Return fast grounded response if key missing
      return NextResponse.json(
        buildFastEmergencyFallback(cleanText, langCode, trustedRequestId)
      );
    }

    const ai = new GoogleGenAI({ apiKey });
    const parts: any[] = [];

    let combinedPrompt = `[Target Output Language (${langCode}): ${LANGUAGE_INSTRUCTIONS[langCode]}]\n`;
    combinedPrompt += `[IMPORTANT: Analyze ONLY the CURRENT submitted situation below. Do NOT reuse any previous scenario.]\n`;

    if (manualLocation && typeof manualLocation === "string" && manualLocation.trim()) {
      combinedPrompt += `[User-Provided Location/Landmark: ${manualLocation.trim()}]\n`;
    }
    if (gpsCoords && typeof gpsCoords === "string" && gpsCoords.trim()) {
      combinedPrompt += `[Browser Coordinates Shared by User: ${gpsCoords.trim()}]\n`;
    }
    if (followUpContext && typeof followUpContext === "string" && followUpContext.trim()) {
      combinedPrompt += `[USER-CONFIRMED CORRECTION / FOLLOW-UP ANSWER: "${followUpContext.trim()}" — Incorporate this confirmed information into user_reported_facts, update immediate_actions and missing_critical_info, and mark as USER_CONFIRMED in evidence_trace.]\n`;
    }
    if (cleanText) {
      combinedPrompt += `[Current Submitted Incident Description]:\n"${cleanText}"\n`;
    } else if (hasImage) {
      combinedPrompt += `[User submitted an incident image without text. Analyze visible hazards and observations carefully without inventing unconfirmed facts.]\n`;
    }

    parts.push({ text: combinedPrompt });

    if (hasImage && typeof imageBase64 === "string") {
      const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, "");
      parts.push({
        inlineData: {
          mimeType: imageMimeType || "image/jpeg",
          data: cleanBase64,
        },
      });
    }

    // Fast Timeout Race: If Google Gemini takes > 7 seconds due to high traffic, use fast grounded emergency fallback
    const geminiCallPromise = ai.models.generateContent({
      model: GEMINI_MODEL_ID,
      contents: [{ role: "user", parts }],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: TRIAGE_RESPONSE_SCHEMA,
        temperature: 0.1,
      },
    });

    const timeoutPromise = new Promise<null>((resolve) => {
      setTimeout(() => resolve(null), 7000);
    });

    const raceResult = await Promise.race([geminiCallPromise, timeoutPromise]);

    if (!raceResult || !(raceResult as any)?.text) {
      console.warn("Gemini API exceeded 7s timeout or was unavailable; serving fast grounded fallback.");
      return NextResponse.json(
        buildFastEmergencyFallback(cleanText, langCode, trustedRequestId)
      );
    }

    const parsedData = JSON.parse((raceResult as any).text);

    // Trusted application-level metadata binding
    parsedData.requestId = trustedRequestId;
    parsedData.submittedTextSnapshot = followUpContext
      ? `${cleanText} [Update: ${followUpContext}]`.trim()
      : cleanText || "[Image Submission]";
    parsedData.submittedAt = new Date().toISOString();
    parsedData.hasImageSnapshot = hasImage;
    parsedData.response_language = langCode;
    parsedData.model_used = GEMINI_MODEL_ID;

    const validatedReport = validateTriageReport(parsedData);
    return NextResponse.json(validatedReport);
  } catch (error: any) {
    console.error("ResQvanta API fallback engaged:", error?.message || error);
    try {
      const body = await req.json().catch(() => ({}));
      const text = typeof body?.text === "string" ? body.text : "Emergency incident";
      const lang = body?.language || "en-IN";
      const reqId = body?.requestId || `req_${Date.now()}`;
      return NextResponse.json(buildFastEmergencyFallback(text, lang, reqId));
    } catch {
      return NextResponse.json(
        { error: "Please call 112 immediately in case of emergency." },
        { status: 500 }
      );
    }
  }
}
