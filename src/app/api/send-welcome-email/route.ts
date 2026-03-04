import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    const { data, error } = await resend.emails.send({
      from: "GigWorldToday <newsletter@gigworldtoday.com>",
      to: email,
      subject: "Welcome to GigWorldToday ⭐",
      html: `
      <div style="font-family:Arial,Helvetica,sans-serif;max-width:600px;margin:auto">

      <h2>Welcome to GigWorldToday</h2>

      <p>Hi <strong>5-Star Gig Worker Community ⭐</strong>,</p>

      <p>
      Welcome to GigWorldToday — a centralized hub where gig workers
      discover opportunities and maximize income.
      </p>

      <p>
      Our weekly newsletter features short updates including:
      </p>

      <ul>
      <li>new gig platforms</li>
      <li>deep dives into gig platforms</li>
      <li>tools hand-picked for gig workers</li>
      <li>strategies to maximize gig income</li>
      </ul>

      <p>
      <a href="https://gigworldtoday.com/platforms">
      Explore Gig Platforms
      </a>
      </p>

      <p>Keep earning smart and stay 5-Star ⭐</p>

      <p>Mamie<br>Founder, GigWorldToday</p>

      </div>
      `
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Welcome email failed:", error);
    return NextResponse.json({ error: "Email failed" }, { status: 500 });
  }
}
