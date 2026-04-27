import { NextRequest, NextResponse } from "next/server";

function parseJsonObject(rawText: string) {
  const cleaned = rawText
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch {}

  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    try {
      return JSON.parse(cleaned.slice(firstBrace, lastBrace + 1));
    } catch {}
  }

  return null;
}

function numberOrNull(value: unknown) {
  if (value == null || value === "") return null;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value === "string") {
    const normalized = value.replace(/[$,]/g, "").trim();
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function fallbackParse(confidence = "low") {
  return {
    platform: null,
    base_pay: null,
    tips: null,
    date: new Date().toISOString().split("T")[0],
    confidence,
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { imageBase64, mimeType } = body;
    console.log("parse-screenshot called, has image:", Boolean(imageBase64), "mimeType:", mimeType);

    if (!imageBase64) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Gemini API key not configured" }, { status: 500 });
    }

    const prompt = `Analyze this gig economy earnings screenshot and extract payment information.

Return ONLY a raw JSON object (no markdown, no code blocks, no explanation):
{"platform":null,"base_pay":null,"tips":null,"date":null,"confidence":"low"}

Rules:
- platform: string name like "DoorDash", "Uber Eats", "Instacart" etc, or null
- base_pay: number without currency symbol, or null  
- tips: number without currency symbol, or null
- date: "YYYY-MM-DD" format or null
- confidence: "high", "medium", or "low"

Return ONLY the JSON. No other text.`;

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  inline_data: {
                    mime_type: mimeType || "image/jpeg",
                    data: imageBase64,
                  },
                },
                { text: prompt },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 512,
            responseMimeType: "application/json",
          },
        }),
      }
    );

    console.log("Gemini response status:", geminiRes.status, geminiRes.ok);
    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      console.error("Gemini error body:", errText);
      return NextResponse.json({ error: "Gemini API error", detail: errText }, { status: 500 });
    }

    const geminiData = await geminiRes.json();

    const rawText =
      geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    console.log("Gemini raw text:", rawText.slice(0, 500));

    if (!rawText) {
      console.error("Empty response from Gemini");
      return NextResponse.json(fallbackParse());
    }

    const parsed = parseJsonObject(rawText);

    if (!parsed) {
      console.error("Could not parse Gemini response:", rawText);
      return NextResponse.json(fallbackParse());
    }

    return NextResponse.json({
      platform: parsed.platform || null,
      base_pay: numberOrNull(parsed.base_pay),
      tips: numberOrNull(parsed.tips),
      date: parsed.date || new Date().toISOString().split("T")[0],
      confidence: parsed.confidence || "low",
    });
  } catch (error) {
    console.error("Parse screenshot error:", error);
    return NextResponse.json(
      {
        error: "Failed to process screenshot",
        detail: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
