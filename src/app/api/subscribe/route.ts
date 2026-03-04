import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabaseServer";
import { Resend } from "resend";

const WELCOME_HTML = `
<div style="max-width:600px;margin:auto;font-family:Arial,Helvetica,sans-serif;line-height:1.6;color:#333;">

<div style="display:flex;align-items:center;margin-bottom:25px;border-bottom:1px solid #eee;padding-bottom:15px;">

<img src="https://gigworldtoday.com/gigsidekick-avatar.png"
alt="GigWorldToday Avatar"
width="80"
style="border-radius:10px;margin-right:12px;">

<div>
<h2 style="margin:0;">GigWorldToday</h2>
<p style="margin:2px 0 0 0;color:#666;font-size:14px;">Weekly Newsletter for Gig Workers</p>
</div>

</div>

<p>Hi <strong>5-Star Gig Worker Community ⭐</strong>,</p>

<p>
Welcome to GigWorldToday. This community was built for gig workers who take their income seriously and want access to reliable, complete information about the gig economy.
</p>

<p>
GigWorldToday is designed to be a <strong>centralized hub where gig workers can discover opportunities, research platforms, and make informed decisions about how they earn.</strong>
</p>

<p>
You've also just joined the <strong>GigWorldToday Weekly Newsletter</strong>, where we share new gig platforms, deep dives into different opportunities, and resources designed to help gig workers increase their income.
</p>

<hr style="margin:30px 0;">

<h3>What You'll Find on GigWorldToday</h3>

<p>
<strong>
<a href="https://gigworldtoday.com/platforms" style="color:#2563eb;text-decoration:none;">
Platform Directory
</a>
</strong><br>
A growing list of gig platforms with details about requirements, pay models, and earning opportunities.
</p>

<p>
<strong>
<a href="https://gigworldtoday.com/products" style="color:#2563eb;text-decoration:none;">
Gig Tools & Resources
</a>
</strong><br>
Helpful tools and products that make gig work easier and more profitable.
</p>

<p>
<strong>
<a href="https://gigworldtoday.com/blog" style="color:#2563eb;text-decoration:none;">
Gig Strategy & Insights
</a>
</strong><br>
Articles and insights focused on helping gig workers think strategically about income and opportunity.
</p>

<hr style="margin:30px 0;">

<h3>The Mindset of This Community</h3>

<p>
The GigWorldToday community is made up of workers who are <strong>income motivated and opportunity focused</strong>.
</p>

<p>
We treat gig work as what it truly is: a flexible income strategy that becomes far more powerful when you understand the full ecosystem of platforms available.
</p>

<p>
Instead of relying on one app, many successful gig workers build income across multiple opportunities.
</p>

<hr style="margin:30px 0;">

<h3>What You'll Receive Each Week</h3>

<p>
<strong>Our weekly newsletter features a variety of short updates, including:</strong>
</p>

<ul>
<li>newly discovered gig platforms</li>
<li>deep dives into various platforms</li>
<li>tools and resources hand-picked for gig workers</li>
<li>strategies and insights to help maximize gig income</li>
</ul>

<p style="text-align:center;margin-top:25px;">
<a href="https://gigworldtoday.com/platforms" style="background:#2563eb;color:#fff;padding:12px 20px;text-decoration:none;border-radius:6px;font-weight:bold;">
Explore Gig Platforms
</a>
</p>

<hr style="margin:30px 0;">

<p>
If you ever discover a platform that should be listed on the site or find a discrepancy, please feel free to reply and let me know.
</p>

<hr style="margin:30px 0;">

<h3>Coming Soon</h3>

<p>
We're also working on something new for the GigWorldToday community.
</p>

<p>
<strong>GigSideKick</strong> is an upcoming tool designed to help gig workers stay organized, discover opportunities, and manage their gig activity and earnings more efficiently.
</p>

<p>
More details will be shared soon.
</p>

<p style="margin-top:30px;">
<strong>Keep earning smart and stay 5-Star ⭐</strong>
</p>

<p>
Mamie<br>
Founder, GigWorldToday
</p>

</div>
`;

async function sendWelcomeEmail(email: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("[subscribe] RESEND_API_KEY not set — skipping welcome email");
    return;
  }
  const resend = new Resend(apiKey);
  await resend.emails.send({
    from: "GigWorldToday <newsletter@gigworldtoday.com>",
    to: email,
    subject: "Welcome to GigWorldToday ⭐",
    html: WELCOME_HTML,
  });
  console.log(`[subscribe] Welcome email sent to ${email}`);
}

export async function POST(req: Request) {
  const { email } = await req.json();

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  const supabase = createServerSupabase();

  // Try to insert the subscriber and return the inserted row
  const { data: inserted, error } = await supabase
    .from("email_subscribers")
    .insert({ email, status: "active", welcome_email_sent: false })
    .select()
    .single();

  if (error) {
    // If the user already exists, fetch the existing row so we can
    // still consider sending the welcome email if it wasn't sent before.
    if (error.code === "23505") {
      const { data: existing, error: fetchErr } = await supabase
        .from("email_subscribers")
        .select("*")
        .eq("email", email)
        .single();

      if (fetchErr || !existing) {
        return NextResponse.json({ error: "Already subscribed" }, { status: 409 });
      }

      // If welcome email hasn't been sent yet, send it now and mark column
      if (!existing.welcome_email_sent) {
        try {
          await sendWelcomeEmail(email);
          await supabase
            .from("email_subscribers")
            .update({ welcome_email_sent: true })
            .eq("email", email);
        } catch (err) {
          console.error("Failed to send welcome email for existing subscriber:", err);
        }
      }

      return NextResponse.json({ error: "Already subscribed" }, { status: 409 });
    }

    return NextResponse.json({ error: "Failed to subscribe" }, { status: 500 });
  }

  // If inserted successfully, send welcome email
  try {
    if (!inserted.welcome_email_sent) {
      await sendWelcomeEmail(email);
      await supabase
        .from("email_subscribers")
        .update({ welcome_email_sent: true })
        .eq("email", email);
    }
  } catch (err) {
    console.error("Failed to send welcome email:", err);
  }

  return NextResponse.json({ success: true });
}
