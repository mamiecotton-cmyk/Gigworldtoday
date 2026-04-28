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

function fallbackParse() {
  return {
    platform: null,
    orders: [],
    confidence: "low",
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

    const prompt = `Analyze this gig economy earnings screenshot and extract payment information for ALL orders/deliveries visible.

Return ONLY a raw JSON object (no markdown, no code blocks, no explanation):
{
  "platform": null,
  "orders": [
    {"base_pay": null, "tips": null, "date": null}
  ],
  "confidence": "low"
}

Field rules:
- platform: string name of the gig platform (e.g., "DoorDash", "Uber Eats", "Instacart", "Expedite", "Spark", "Senpex"), or null if unidentifiable.
- orders: array of objects, ONE PER ORDER/DELIVERY visible in the screenshot. If only one order is shown, return an array with one item. If multiple orders are listed, return one item per order in the order they appear (top-to-bottom).
  - base_pay: the driver's earnings excluding tips for THIS order. Look for any of:
    - Labels: "Base Pay", "Base Fee", "Pay", "Base Earnings", "Order Pay", "Delivery Fee", "Payout", "Earnings", "Price"
    - Inline format: "$X.XX + Tip $Y.YY" — first amount before "+ Tip" is base_pay
    - Return as a number without currency symbol. Use null if not found.
  - tips: customer tip for THIS order. Look for "Tip", "Tips", "Customer Tip", "Gratuity", or amount after "Tip" in inline format. Return as number, or null.
  - date: order date for THIS order in "YYYY-MM-DD" format. Look for explicit dates like "04/25/2026" or "Apr 25". Convert to ISO format. Use null if not visible. Do NOT guess today's date.
- confidence: "high" if labels were clearly visible, "medium" if inferred, "low" if guessed.

Important:
- Each order in the screenshot must be its own item in the orders array.
- If an order has only a total amount with no base/tip breakdown, put the total in base_pay and tips: 0.
- Ignore deductions or negative fees ("Safety & Admin Fee", "Service Fee") — never subtract them.
- If no orders can be identified at all, return orders as an empty array [].
- Return ONLY the JSON. No other text.`;

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
      return NextResponse.json({ error: "Gemini API error", detail: errText }, { status: 500 });
    }

    const geminiData = await geminiRes.json();
    const rawText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || "";
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

    // Normalize the orders array
    const ordersArray = Array.isArray(parsed.orders) ? parsed.orders : [];
    const normalizedOrders = ordersArray.map((o: any) => ({
      base_pay: numberOrNull(o?.base_pay),
      tips: numberOrNull(o?.tips),
      date: o?.date || null,
    }));

    return NextResponse.json({
      platform: parsed.platform || null,
      orders: normalizedOrders,
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