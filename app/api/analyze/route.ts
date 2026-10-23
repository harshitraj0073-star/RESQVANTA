import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import {
  GEMINI_MODEL_ID,
  SYSTEM_INSTRUCTION,
  TRIAGE_RESPONSE_SCHEMA,
} from "@/lib/geminiSchema";
import { validateTriageReport } from "@/lib/validation";
import { SupportedLanguage } from "@/lib/translations";

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

async function callGeminiWithBoundedRetry(
  ai: GoogleGenAI,
  parts: any[],
  maxAttempts = 2
) {
  let lastError: any = null;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: GEMINI_MODEL_ID,
        contents: [{ role: "user", parts }],
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          responseMimeType: "application/json",
          responseSchema: TRIAGE_RESPONSE_SCHEMA,
          temperature: 0.1,
        },
      });
      if (response.text) {
        return response;
      }
      throw new Error(`Empty response from ${GEMINI_MODEL_ID}`);
    } catch (err: any) {
      lastError = err;
      const msg = String(err?.message || "");
      const isTransient =
        msg.includes("503") ||
        msg.includes("UNAVAILABLE") ||
        msg.includes("429") ||
        msg.includes("RESOURCE_EXHAUSTED");
      if (isTransient && attempt < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, 900 * attempt));
        continue;
      }
      throw err;
    }
  }
  throw lastError;
}

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not configured on the server." },
        { status: 500 }
      );
    }

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

    const response = await callGeminiWithBoundedRetry(ai, parts, 2);

    const parsedData = JSON.parse(response.text!);

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
    console.error("ResQvanta Triage API Error:", error);
    return NextResponse.json(
      {
        error:
          error.message ||
          "An unexpected error occurred during incident analysis. If this is an emergency, call 112 immediately.",
      },
      { status: 500 }
    );
  }
}
