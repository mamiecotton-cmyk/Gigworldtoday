import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    hasGemini: Boolean(process.env.GEMINI_API_KEY),
    geminiLength: process.env.GEMINI_API_KEY?.length || 0,
    nodeEnv: process.env.NODE_ENV,
    vercelEnv: process.env.VERCEL_ENV,
    allKeys: Object.keys(process.env)
      .filter(k => k.includes("GEMINI") || k.includes("GOOGLE"))
      .sort(),
  });
}
