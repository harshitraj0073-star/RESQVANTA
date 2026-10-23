import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { SYSTEM_INSTRUCTION, TRIAGE_RESPONSE_SCHEMA } from "@/lib/geminiSchema";

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
    const { text, imageBase64, imageMimeType, gpsCoords, followUpContext, language } = body;

    if (!text && !imageBase64) {
      return NextResponse.json(
        { error: "Please provide either incident description text or an image." },
        { status: 400 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });

    // Prepare content parts for multimodal input
    const parts: any[] = [];

    let combinedPrompt = "";
    if (language && language !== "English") {
      combinedPrompt += `[Target Output Language: ${language} - translate the immediate actions and summary appropriately]\n`;
    }
    if (gpsCoords) {
      combinedPrompt += `[GPS Coordinates from Device Sensor: ${gpsCoords}]\n`;
    }
    if (followUpContext) {
      combinedPrompt += `[User Added Follow-up Details for Missing Info Resolution: "${followUpContext}"]\n`;
    }
    if (text) {
      combinedPrompt += `[Raw User Incident Report]:\n${text}\n`;
    }

    parts.push({ text: combinedPrompt });

    if (imageBase64) {
      // Strip data url prefix if present
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
      throw new Error("No response generated from Gemini model.");
    }

    const parsedData = JSON.parse(response.text);
    return NextResponse.json(parsedData);
  } catch (error: any) {
    console.error("ResQvanta Triage API Error:", error);
    return NextResponse.json(
      {
        error: error.message || "An unexpected error occurred during incident triage."
      },
      { status: 500 }
    );
  }
}
