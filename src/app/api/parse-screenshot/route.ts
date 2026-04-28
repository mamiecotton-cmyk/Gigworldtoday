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

Field rules:
- platform: string name of the gig platform (e.g., "DoorDash", "Uber Eats", "Instacart", "Expedite", "Spark"), or null if unidentifiable
- base_pay: the driver's earnings excluding tips. Look for any of these labels: "Base Pay", "Base Fee", "Pay", "Base Earnings", "Order Pay", "Delivery Fee", "Payout", "Earnings". Return as a number without currency symbol. Use null if not found.
- tips: customer tip amount. Look for any of these labels: "Tip", "Tips", "Customer Tip", "Gratuity". Return as a number without currency symbol. Use null if not found or if zero.
- date: order or earnings date in "YYYY-MM-DD" format, or null if not visible
- confidence: "high" if labels were clearly visible, "medium" if inferred, "low" if guessed

Important:
- Ignore deductions or negative fees (like "Safety & Admin Fee", "Service Fee") — never subtract them.
- If the screenshot only shows a total earnings amount with no breakdown, put the total in base_pay and tips: 0.
- Return ONLY the JSON. No other text.`;

    const callGemini = async () => {
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
              maxOutputTokens: 2048,
              responseMimeType: "application/json",
              thinkingConfig: {
                thinkingBudget: 0,
              },
            },
          }),
        }
      );

      console.log("Gemini response status:", geminiRes.status, geminiRes.ok);
      if (!geminiRes.ok) {
        const errText = await geminiRes.text();
        console.error("Gemini error body:", errText);
        return { error: errText };
      }

      const geminiData = await geminiRes.json();
      const rawText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || "";
      console.log("Gemini raw text:", rawText.slice(0, 500));

      return { rawText };
    };

    let attempt = await callGemini();
    if (attempt.error) {
      return NextResponse.json({ error: "Gemini API error", detail: attempt.error }, { status: 500 });
    }

    let rawText = attempt.rawText || "";
    let parsed = rawText ? parseJsonObject(rawText) : null;

    // Retry once if Gemini returns unparsable or empty text.
    if (!rawText || !parsed) {
      console.warn("Parse failed on first attempt, retrying Gemini once");
      attempt = await callGemini();

      if (attempt.error) {
        return NextResponse.json({ error: "Gemini API error", detail: attempt.error }, { status: 500 });
      }

      rawText = attempt.rawText || "";
      parsed = rawText ? parseJsonObject(rawText) : null;
    }

    if (!rawText) {
      console.error("Empty response from Gemini");
      return NextResponse.json(fallbackParse());
    }

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
