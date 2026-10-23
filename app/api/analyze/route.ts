import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { SYSTEM_INSTRUCTION, TRIAGE_RESPONSE_SCHEMA } from "@/lib/geminiSchema";
import { validateTriageReport } from "@/lib/validation";

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
      language
    } = body;

    if (!text && !imageBase64) {
      return NextResponse.json(
        { error: "Please provide either incident description text or an image." },
        { status: 400 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });
    const parts: any[] = [];

    let combinedPrompt = "";
    if (language && language !== "English") {
      combinedPrompt += `[Target Output Language: ${language} - translate summary, immediate actions, and rationale appropriately]\n`;
    }
    if (manualLocation) {
      combinedPrompt += `[User-Entered Manual Location: ${manualLocation}]\n`;
    }
    if (gpsCoords) {
      combinedPrompt += `[Browser Location Shared by User: ${gpsCoords}]\n`;
    }
    if (followUpContext) {
      combinedPrompt += `[USER-CONFIRMED CORRECTION / UPDATE: "${followUpContext}" — Treat this correction as authoritative user-confirmed information and update facts, risks, missing questions, and evidence_trace accordingly.]\n`;
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
          data: cleanBase64
        }
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: [{ role: "user", parts }],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: TRIAGE_RESPONSE_SCHEMA,
        temperature: 0.1
      }
    });

    if (!response.text) {
      throw new Error("No response generated from Gemini 3.8 Flash.");
    }

    const parsedData = JSON.parse(response.text);
    const validatedReport = validateTriageReport(parsedData);
    return NextResponse.json(validatedReport);
  } catch (error: any) {
    console.error("ResQvanta Triage API Error:", error);
    return NextResponse.json(
      {
        error:
          error.message ||
          "An unexpected error occurred during incident analysis. If this is an emergency, call 112 immediately."
      },
      { status: 500 }
    );
  }
}
