import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { imageBase64, mimeType } = body;

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

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      console.error("Gemini API error:", geminiRes.status, errText);
      return NextResponse.json(
        { error: "Gemini API error", detail: errText },
        { status: 500 }
      );
    }

    const geminiData = await geminiRes.json();
    console.log("Gemini response status:", geminiRes.status);

    const rawText =
      geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    console.log("Gemini raw text:", rawText);

    if (!rawText) {
      return NextResponse.json(
        { error: "Empty response from Gemini" },
        { status: 500 }
      );
    }

    // Try multiple parsing strategies
    let parsed: any = null;

    // Strategy 1: direct parse
    try {
      parsed = JSON.parse(rawText.trim());
    } catch {}

    // Strategy 2: extract JSON object
    if (!parsed) {
      try {
        const match = rawText.match(/\{[^{}]*\}/);
        if (match) parsed = JSON.parse(match[0]);
      } catch {}
    }

    // Strategy 3: strip markdown and parse
    if (!parsed) {
      try {
        const cleaned = rawText
          .replace(/```json/gi, "")
          .replace(/```/g, "")
          .trim();
        parsed = JSON.parse(cleaned);
      } catch {}
    }

    if (!parsed) {
      console.error("Could not parse Gemini response:", rawText);
      return NextResponse.json(
        { error: "Could not parse response", raw: rawText },
        { status: 500 }
      );
    }

    return NextResponse.json({
      platform: parsed.platform || null,
      base_pay: parsed.base_pay != null ? Number(parsed.base_pay) : null,
      tips: parsed.tips != null ? Number(parsed.tips) : null,
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