import Link from "next/link";
import TrackerTutorial from "@/components/TrackerTutorial";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Earnings Tracker — GigWorldToday",
  description:
    "Track your gig earnings across DoorDash, Uber, Instacart, Lyft, Spark, and 70+ other platforms. Free, simple, no spreadsheets needed.",
};

export default function TrackerLandingPage() {
  return (
    <div className="bg-white min-h-screen overflow-x-hidden">
      {/* Hero — full viewport, dark navy, energetic */}
      <section className="relative min-h-screen flex items-center bg-gradient-to-br from-[#1A1A2E] via-[#0f3460] to-[#1A1A2E] overflow-hidden pt-20">

        {/* Animated background orbs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 -left-20 w-96 h-96 rounded-full opacity-20 blur-3xl animate-pulse" style={{ background: "#00C9B1" }} />
          <div className="absolute bottom-1/4 -right-20 w-96 h-96 rounded-full opacity-15 blur-3xl animate-pulse" style={{ background: "#F97316", animationDelay: "1s" }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-5 blur-3xl" style={{ background: "#00C9B1" }} />
        </div>

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "50px 50px"
        }} />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid lg:grid-cols-2 gap-12 items-center">

          {/* Left: copy */}
          <div>
            <div className="inline-flex items-center gap-2 bg-[#00C9B1]/10 border border-[#00C9B1]/30 text-[#00C9B1] text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-6">
              <span className="w-2 h-2 rounded-full bg-[#00C9B1] animate-pulse" />
              Free for gig workers
            </div>

            <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-[1.1] mb-5">
              Track earnings across{" "}
              <span className="text-[#00C9B1]">every platform</span>{" "}
              in one place
            </h1>

            <p className="text-lg text-white/70 mb-8 leading-relaxed max-w-lg">
              Snap a screenshot from DoorDash, Uber, Instacart, Lyft, Spark, or
              any of 70+ platforms. We extract your pay automatically.
            </p>

            {/* Stats row */}
            <div className="flex gap-6 mb-8">
              <div>
                <p className="text-2xl font-bold text-white">70+</p>
                <p className="text-xs text-white/50 uppercase tracking-wider">Platforms</p>
              </div>
              <div className="w-px bg-white/10" />
              <div>
                <p className="text-2xl font-bold text-white">Free</p>
                <p className="text-xs text-white/50 uppercase tracking-wider">Forever</p>
              </div>
              <div className="w-px bg-white/10" />
              <div>
                <p className="text-2xl font-bold text-white">30s</p>
                <p className="text-xs text-white/50 uppercase tracking-wider">To log a shift</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/dashboard/earnings"
                className="px-7 py-3.5 rounded-xl font-bold text-white text-base bg-[#00C9B1] hover:bg-[#00b5a0] hover:-translate-y-0.5 active:scale-95 transition-all shadow-lg shadow-[#00C9B1]/30"
              >
                Start tracking free →
              </Link>
              <Link
                href="#how-it-works"
                className="px-7 py-3.5 rounded-xl font-semibold text-white text-base border border-white/20 hover:bg-white/10 hover:-translate-y-0.5 active:scale-95 transition-all"
              >
                See how it works
              </Link>
            </div>

            <p className="text-xs text-white/30 mt-4">
              Free — no credit card, just sign up
            </p>
          </div>

          {/* Right: floating phone preview */}
          <div className="hidden lg:flex justify-center items-center relative">
            <div className="relative">
              {/* Phone frame */}
              <div className="relative w-[280px] rounded-[40px] p-3 shadow-2xl" style={{ background: "#0a0a1a" }}>
                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-20 h-5 bg-[#0a0a1a] rounded-full z-10" />
                <div className="rounded-[30px] overflow-hidden">
                  <img
                    src="/tracker/step-4.jpg"
                    alt="Earnings dashboard preview"
                    className="w-full object-cover object-top"
                    style={{ maxHeight: "480px" }}
                  />
                </div>
                <div className="flex justify-center mt-2">
                  <div className="w-20 h-1 bg-white/20 rounded-full" />
                </div>
              </div>

              {/* Floating stat chips around phone */}
              <div className="absolute -left-16 top-16 bg-white rounded-2xl shadow-xl px-4 py-3 text-center animate-bounce" style={{ animationDuration: "3s" }}>
                <p className="text-xs text-gray-500 font-medium">This Month</p>
                <p className="text-lg font-bold text-[#1A1A2E]">$701.40</p>
              </div>

              <div className="absolute -right-14 top-1/3 bg-[#00C9B1] rounded-2xl shadow-xl px-4 py-3 text-center animate-bounce" style={{ animationDuration: "4s", animationDelay: "0.5s" }}>
                <p className="text-xs text-white/80 font-medium">Tip Rate</p>
                <p className="text-lg font-bold text-white">71%</p>
              </div>

              <div className="absolute -left-12 bottom-24 bg-[#F97316] rounded-2xl shadow-xl px-4 py-3 text-center animate-bounce" style={{ animationDuration: "3.5s", animationDelay: "1s" }}>
                <p className="text-xs text-white/80 font-medium">Take Home</p>
                <p className="text-lg font-bold text-white">$526.05</p>
              </div>

              {/* Glow */}
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-56 h-10 rounded-full blur-2xl opacity-40" style={{ background: "#00C9B1" }} />
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/30">
          <p className="text-xs uppercase tracking-widest">Scroll</p>
          <div className="w-px h-8 bg-gradient-to-b from-white/30 to-transparent animate-pulse" />
        </div>
      </section>

      {/* Trust strip */}
      <section className="py-8 px-4 bg-gray-50 border-y border-gray-100">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs uppercase tracking-wider text-gray-400 mb-3 font-semibold">
            Works with
          </p>
          <p className="text-sm sm:text-base text-gray-600 font-medium">
            DoorDash · Uber · Uber Eats · Instacart · Lyft · Spark · Shipt ·
            Amazon Flex · Grubhub · Senpex{" "}
            <span className="text-[#00C9B1] font-bold">+ 70 more</span>
          </p>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs uppercase tracking-widest text-[#00C9B1] font-bold mb-3">How it works</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#1A1A2E] mb-3">
              Log a shift in 30 seconds
            </h2>
            <p className="text-lg text-gray-500 max-w-xl mx-auto">
              No manual entry required. Just snap a screenshot.
            </p>
          </div>
          <TrackerTutorial />
        </div>
      </section>

      {/* Features grid */}
      <section className="py-20 px-4 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs uppercase tracking-widest text-[#00C9B1] font-bold mb-3">Features</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#1A1A2E] mb-3">
              Built by a gig worker, for gig workers
            </h2>
            <p className="text-lg text-gray-500">Everything you need. Nothing you don&apos;t.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <FeatureCard icon="📱" title="Multi-platform" text="DoorDash, Uber, Instacart, Lyft, Spark, Shipt, Amazon Flex, Grubhub, and 70+ more — all in one tracker." accent="#00C9B1" />
            <FeatureCard icon="📸" title="Screenshot parsing" text="Just upload a screenshot. We extract base pay, tips, bonuses, and adjustments automatically." accent="#F97316" />
            <FeatureCard icon="💰" title="Tax estimates" text="See how much to set aside for taxes (25% default). Plan ahead instead of getting surprised in April." accent="#00C9B1" />
            <FeatureCard icon="📊" title="Drill-down stats" text="See earnings by platform, week, month, year. Find your best earning days and best platforms." accent="#F97316" />
            <FeatureCard icon="📲" title="Add to home screen" text="Install as a phone app for one-tap access. Works on iPhone and Android — no app store needed." accent="#00C9B1" />
            <FeatureCard icon="🆓" title="Always free" text="No credit card. No subscription. No data sold. Built for gig workers, by a gig worker." accent="#F97316" />
          </div>
        </div>
      </section>

      {/* Why */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-gradient-to-br from-[#1A1A2E] to-[#0f3460] rounded-3xl p-8 sm:p-12 text-white text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10 blur-3xl" style={{ background: "#00C9B1" }} />
            <img src="/gigsidekick-avatar.png" alt="GigSidekick" className="w-16 h-16 object-contain mx-auto mb-4" />
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">Why I built this</h2>
            <p className="text-white/70 leading-relaxed mb-4">
              I&apos;m Mamie — a full-time gig economy professional, author of{" "}
              <em>The 5-Star Gig Worker</em>, and creator of GigWorldToday. I built
              this tracker because I needed it myself.
            </p>
            <p className="text-white/70 leading-relaxed">
              Every gig worker I know struggles with the same thing: knowing what
              you actually earned across all the apps you drive for. So I built a
              tool that makes tracking as simple as taking a screenshot. Free,
              forever.
            </p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4 bg-gradient-to-br from-[#00C9B1]/10 to-teal-50">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#1A1A2E] mb-4">
            Start tracking your earnings today
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Free. Sign up in under a minute.
          </p>
          <Link
            href="/dashboard/earnings"
            className="inline-block px-8 py-4 rounded-xl font-bold text-white bg-gradient-to-r from-[#00C9B1] to-teal-500 hover:opacity-90 hover:-translate-y-0.5 active:scale-95 transition-all shadow-xl shadow-teal-500/20 text-base"
          >
            Get started free →
          </Link>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, text, accent }: { icon: string; title: string; text: string; accent: string }) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-lg hover:-translate-y-1 transition-all group">
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-4 group-hover:scale-110 transition-transform"
        style={{ background: `${accent}15` }}
      >
        {icon}
      </div>
      <h3 className="text-base font-bold text-[#1A1A2E] mb-2">{title}</h3>
      <p className="text-sm text-gray-500 leading-relaxed">{text}</p>
    </div>
  );
}
