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
    const localDate = (body.localDate as string) || new Date().toISOString().split("T")[0];
    const localYear = localDate.split("-")[0];
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
    {"base_pay": null, "tips": null, "adjustments": null, "bonuses": null, "date": null}
  ],
  "confidence": "low"
}

Field rules:
- platform: string name of the gig platform (e.g., "DoorDash", "Uber Eats", "Instacart", "Expedite", "Spark", "Senpex"), or null if unidentifiable.
- orders: array of objects, ONE PER ORDER/DELIVERY/PAY-PERIOD visible. Top-to-bottom order.
  - base_pay: driver's earnings before tips and any extras. Look for: "Base Pay", "Base Fee", "Pay", "Base Earnings", "Order Pay", "Delivery Fee", "Payout", "Earnings", "Price", or first amount before "+ Tip" in inline format like "$X.XX + Tip $Y.YY". Number, no currency. null if not found.
  - tips: customer tip. Look for: "Tip", "Tips", "Customer Tip", "Gratuity", or amount after "Tip" inline. Number or null.
  - adjustments: STATE-MANDATED MINIMUM PAY top-ups ONLY. Look for these specific labels:
    - "Earnings Standard", "Seattle Earnings Standard", "NYC Earnings Standard"
    - "Pay Adjustment", "DoorDash Pay Adjustment"
    - "Prop 22", "Prop 22 Earnings Guarantee"
    - "Minimum Earnings Adjustment", "Minimum Pay"
    - "Regulatory Adjustment"
    Number or null. ONLY use this for state/city minimum-wage top-ups.
  - bonuses: SUM of all OTHER positive earnings beyond base + tips + adjustments. Add together anything labeled:
    - "Boost", "Peak Pay", "Promotion", "Promo", "Surge", "Surge Pay"
    - "Challenge", "Quest", "Bonus", "Reward"
    - "Reimbursement", "Mileage Reimbursement"
    - "Referral", "Incentive"
    - Any positive amount with a label NOT recognized as base/tip/adjustment/fee
    Sum into a single number. null only if there are no such items.
  - date: order date in "YYYY-MM-DD" format. Look for explicit dates ("04/25/2026", "Apr 25", "Tue, Apr 14"). Convert to ISO. If the year is not visible in the screenshot, ASSUME THE CURRENT YEAR (${localYear}). Do NOT guess random past years like 2020 or 2021. Do NOT guess future dates — today is ${localDate} (user's local date) and dates must be on or before today. If no date is visible at all, return null.

Important:
- Each visible order or pay period gets its own item in the orders array.
- IGNORE deductions/fees ("Safety & Admin Fee", "Service Fee", any negative amount). Never subtract them.
- If a screenshot shows only a total with no breakdown, put the total in base_pay and leave others null.
- Confidence: "high" if labels were clear, "medium" if inferred, "low" if guessed.
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
      adjustments: numberOrNull(o?.adjustments),
      bonuses: numberOrNull(o?.bonuses),
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