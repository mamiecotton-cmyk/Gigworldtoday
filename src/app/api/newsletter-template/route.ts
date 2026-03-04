import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

/** GET — return the body content of the newsletter template */
export async function GET() {
  try {
    const templatePath = path.join(process.cwd(), "emails", "newsletter.html");
    const html = fs.readFileSync(templatePath, "utf-8");

    // Extract content between <body...> and </body>
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    const content = bodyMatch ? bodyMatch[1].trim() : html;

    return NextResponse.json({ content });
  } catch {
    return NextResponse.json(
      { error: "Template not found" },
      { status: 404 }
    );
  }
}
