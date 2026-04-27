import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { imageBase64, mimeType } = body;

    console.log("parse-screenshot called, has image:", !!imageBase64, "mimeType:", mimeType);

    if (!imageBase64) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    console.log("Gemini API key present:", !!apiKey, "key prefix:", apiKey?.substring(0, 8));

    if (!apiKey) {
      return NextResponse.json({ error: "Gemini API key not configured" }, { status: 500 });
    }

    const prompt = `You are analyzing a gig economy earnings screenshot. Extract the following information and return ONLY a valid JSON object with no additional text, markdown, or explanation:

{
  "platform": "platform name (e.g. DoorDash, Uber Eats, Instacart, Spark, Shipt, Amazon Flex, Lyft, Uber) or null if cannot determine",
  "base_pay": number or null (base pay amount without tips, as a decimal number),
  "tips": number or null (tips amount, as a decimal number),
  "date": "YYYY-MM-DD format or null if cannot determine",
  "confidence": "high | medium | low"
}

Rules:
- Extract only numbers, no currency symbols
- If you see "Earnings" or "Pay" without tips broken out, put the full amount in base_pay and 0 in tips
- If you cannot determine the platform, set platform to null
- Return ONLY the JSON object, nothing else`;

    const response = await fetch(
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
            maxOutputTokens: 256,
          },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error("Gemini API error:", error);
      return NextResponse.json({ error: "Gemini API error", detail: error }, { status: 500 });
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    console.log("Gemini raw response:", text);

    // Clean and parse the JSON response — handle various formats
    let cleaned = text.trim();
    // Remove markdown code blocks
    cleaned = cleaned.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
    // Extract JSON object if surrounded by other text
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("No JSON found in Gemini response:", cleaned);
      return NextResponse.json({ error: "Could not parse Gemini response" }, { status: 500 });
    }
    const parsed = JSON.parse(jsonMatch[0]);

    return NextResponse.json({
      platform: parsed.platform || null,
      base_pay: parsed.base_pay !== undefined ? Number(parsed.base_pay) : null,
      tips: parsed.tips !== undefined ? Number(parsed.tips) : null,
      date: parsed.date || new Date().toISOString().split("T")[0],
      confidence: parsed.confidence || "low",
    });
  } catch (error) {
    console.error("Parse screenshot error:", error);
    return NextResponse.json({ 
      error: "Failed to process screenshot",
      detail: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
