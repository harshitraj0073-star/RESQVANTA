import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import {
  SYSTEM_INSTRUCTION,
  TRIAGE_RESPONSE_SCHEMA,
} from "@/lib/geminiSchema";
import { validateTriageReport } from "@/lib/validation";
import { SupportedLanguage } from "@/lib/translations";

// Fast, highly responsive model sequence for real Gemini AI under 2.5s
const PRIMARY_MODEL = "gemini-3.5-flash";
const FALLBACK_MODEL = "gemini-3.5-flash-lite";

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
    combinedPrompt += `[IMPORTANT: Analyze ONLY the user's specific situation described below. Do NOT give generic advice. Tailor actions specifically to this problem.]\n`;

    if (manualLocation && typeof manualLocation === "string" && manualLocation.trim()) {
      combinedPrompt += `[Location/Landmark: ${manualLocation.trim()}]\n`;
    }
    if (gpsCoords && typeof gpsCoords === "string" && gpsCoords.trim()) {
      combinedPrompt += `[GPS Coordinates: ${gpsCoords.trim()}]\n`;
    }
    if (followUpContext && typeof followUpContext === "string" && followUpContext.trim()) {
      combinedPrompt += `[User Clarification / Follow-Up Details: "${followUpContext.trim()}"]\n`;
    }
    if (cleanText) {
      combinedPrompt += `[User's Emergency Description]:\n"${cleanText}"\n`;
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

    // Attempt primary fast model (gemini-3.5-flash) with fallback to gemini-3.5-flash-lite
    let responseText: string | null = null;
    let modelUsed = PRIMARY_MODEL;

    try {
      const resp = await ai.models.generateContent({
        model: PRIMARY_MODEL,
        contents: [{ role: "user", parts }],
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          responseMimeType: "application/json",
          responseSchema: TRIAGE_RESPONSE_SCHEMA,
          temperature: 0.1,
        },
      });
      responseText = resp.text || null;
    } catch (primaryErr) {
      console.warn("Primary model spike, falling back to gemini-3.5-flash-lite...", primaryErr);
      modelUsed = FALLBACK_MODEL;
      const respFallback = await ai.models.generateContent({
        model: FALLBACK_MODEL,
        contents: [{ role: "user", parts }],
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          responseMimeType: "application/json",
          responseSchema: TRIAGE_RESPONSE_SCHEMA,
          temperature: 0.1,
        },
      });
      responseText = respFallback.text || null;
    }

    if (!responseText) {
      throw new Error("Empty response received from Gemini engine.");
    }

    const parsedData = JSON.parse(responseText);

    parsedData.requestId = trustedRequestId;
    parsedData.submittedTextSnapshot = followUpContext
      ? `${cleanText} [Update: ${followUpContext}]`.trim()
      : cleanText || "[Image Submission]";
    parsedData.submittedAt = new Date().toISOString();
    parsedData.hasImageSnapshot = hasImage;
    parsedData.response_language = langCode;
    parsedData.model_used = modelUsed;

    const validatedReport = validateTriageReport(parsedData);
    return NextResponse.json(validatedReport);
  } catch (error: any) {
    console.error("ResQvanta Gemini API Error:", error?.message || error);
    return NextResponse.json(
      {
        error:
          error.message ||
          "Could not analyze with Gemini. If this is an immediate life-threatening emergency, call 112 directly.",
      },
      { status: 500 }
    );
  }
}
