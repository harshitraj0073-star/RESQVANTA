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
    "Respond in clear, simple English (en-IN). Keep immediate_actions to at most 3 items, each 5 to 12 words.",
  "hi-IN":
    "Respond entirely in clear, natural Hindi using Devanagari script (hi-IN, हिंदी). Do not leave sentences in English. Keep immediate_actions to at most 3 items.",
  "mr-IN":
    "Respond entirely in clear, natural Marathi using Devanagari script (mr-IN, मराठी). Do not mix Hindi or English sentences. Keep immediate_actions to at most 3 items.",
  "gu-IN":
    "Respond entirely in clear, natural Gujarati using Gujarati script (gu-IN, ગુજરાતી). Do not leave sentences in English. Keep immediate_actions to at most 3 items.",
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
      text,
      imageBase64,
      imageMimeType,
      gpsCoords,
      manualLocation,
      followUpContext,
      language = "en-IN",
    } = body;

    if (!text && !imageBase64) {
      return NextResponse.json(
        { error: "Please provide either incident description text or an image." },
        { status: 400 }
      );
    }

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

    if (manualLocation) {
      combinedPrompt += `[User-Entered Location/Landmark: ${manualLocation}]\n`;
    }
    if (gpsCoords) {
      combinedPrompt += `[Browser Coordinates Shared by User: ${gpsCoords}]\n`;
    }
    if (followUpContext) {
      combinedPrompt += `[USER-CONFIRMED CORRECTION / UPDATE: "${followUpContext}" — Treat this correction as authoritative user-confirmed information, update facts, risks, missing questions, and mark as USER_CONFIRMED in evidence_trace.]\n`;
    }
    if (text) {
      combinedPrompt += `[Raw User Incident Report]:\n${text}\n`;
    }

    parts.push({ text: combinedPrompt });

    if (imageBase64) {
      const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z]+;base64,/, "");
      parts.push({
        inlineData: {
          mimeType: imageMimeType || "image/jpeg",
          data: cleanBase64,
        },
      });
    }

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

    if (!response.text) {
      throw new Error(`No response generated from ${GEMINI_MODEL_ID}.`);
    }

    const parsedData = JSON.parse(response.text);
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
