import Link from "next/link";
import type { Metadata } from "next";
import TrackerTutorial from "@/components/TrackerTutorial";

export const metadata: Metadata = {
  title: "Earnings Tracker — GigWorldToday",
  description:
    "Track your gig earnings across DoorDash, Uber, Instacart, Lyft, Spark, and 70+ other platforms. Free, simple, no spreadsheets needed.",
};

export default function TrackerLandingPage() {
  return (
    <div className="bg-gradient-to-b from-white to-gray-50 min-h-screen">
      {/* Hero */}
      <section className="pt-28 pb-16 sm:pt-32 sm:pb-20 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <span className="inline-block bg-teal-50 text-teal-700 text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full mb-5">
            Free for gig workers
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#1A1A2E] leading-tight mb-5">
            Track earnings across multiple platforms{" "}
            <span className="text-[#00C9B1]">in one place</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Stop juggling spreadsheets. Snap a screenshot from any gig app and
            we&apos;ll log your pay automatically — base, tips, bonuses, and adjustments.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <Link
              href="/dashboard/earnings"
              className="px-7 py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-[#00C9B1] to-teal-500 hover:opacity-90 hover:-translate-y-0.5 active:scale-95 transition-all shadow-lg shadow-teal-500/25 text-base"
            >
              Start tracking free
            </Link>
            <Link
              href="#how-it-works"
              className="px-7 py-3.5 rounded-xl font-semibold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 hover:-translate-y-0.5 active:scale-95 transition-all text-base"
            >
              See how it works
            </Link>
          </div>
          <p className="text-xs text-gray-400 mt-5">
            Free — no credit card, just sign up
          </p>
        </div>
      </section>

      {/* Trust strip */}
      <section className="py-10 px-4 bg-white border-y border-gray-100">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs uppercase tracking-wider text-gray-400 mb-4 font-semibold">
            Works with
          </p>
          <p className="text-base sm:text-lg text-gray-700 font-medium">
            DoorDash · Uber · Uber Eats · Instacart · Lyft · Spark · Shipt ·
            Amazon Flex · Grubhub · Senpex{" "}
            <span className="text-[#00C9B1] font-bold">+ 60 more</span>
          </p>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#1A1A2E] mb-3">
              How it works
            </h2>
            <p className="text-lg text-gray-600">
              Log a shift in less than 30 seconds.
            </p>
          </div>

          <TrackerTutorial />
        </div>
      </section>

      {/* Features grid */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#1A1A2E] mb-3">
              Built by a gig worker, for gig workers
            </h2>
            <p className="text-lg text-gray-600">
              Everything you need. Nothing you don&apos;t.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon="📱"
              title="Multi-platform"
              text="DoorDash, Uber, Instacart, Lyft, Spark, Shipt, Amazon Flex, Grubhub, and 70+ more — all in one tracker."
            />
            <FeatureCard
              icon="📸"
              title="Screenshot parsing"
              text="Just upload a screenshot. We extract base pay, tips, bonuses, and adjustments automatically."
            />
            <FeatureCard
              icon="💰"
              title="Tax estimates"
              text="See how much to set aside for taxes (25% default). Plan ahead instead of getting surprised in April."
            />
            <FeatureCard
              icon="📊"
              title="Drill-down stats"
              text="See earnings by platform, week, month, year. Find your best earning days and best platforms."
            />
            <FeatureCard
              icon="📲"
              title="Add to home screen"
              text="Save to home screen for one-tap access. Works on iPhone and Android."
            />
            <FeatureCard
              icon="🆓"
              title="Always free"
              text="No credit card. No subscription. No data sold. Built for gig workers, by a gig worker."
            />
          </div>
        </div>
      </section>

      {/* Why */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#1A1A2E] mb-5">
            Why we built this
          </h2>
          <p className="text-lg text-gray-600 mb-4 leading-relaxed">
            I&apos;m Mamie — a full-time gig economy professional, author of{" "}
            <em>The 5-Star Gig Worker</em>, and creator of GigWorldToday. I built this tracker
            because I needed it myself.
          </p>
          <p className="text-lg text-gray-600 mb-4 leading-relaxed">
            Every gig worker I know struggles with the same thing: knowing what
            you actually earned across all the apps you contract with. Flipping back and forth between multiple apps gets old.
            Apps charge subscription fees. The platforms don&apos;t
            help you compare.
          </p>
          <p className="text-lg text-gray-600 leading-relaxed">
            So I built a tool that makes tracking as simple as taking a
            screenshot. It&apos;s free, it&apos;ll stay free, and it&apos;s built around how
            real drivers actually work — not how a MBA thinks we work.
          </p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4 bg-gradient-to-br from-[#1A1A2E] via-[#0f3460] to-[#1A1A2E]">
        <div className="max-w-3xl mx-auto text-center text-white">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Start tracking your earnings today
          </h2>
          <p className="text-lg text-white/70 mb-8">
            Free. Sign up in under a minute.
          </p>
          <Link
            href="/dashboard/earnings"
            className="inline-block px-8 py-4 rounded-xl font-bold text-white bg-gradient-to-r from-[#00C9B1] to-teal-500 hover:opacity-90 hover:-translate-y-0.5 active:scale-95 transition-all shadow-2xl shadow-teal-500/30 text-base"
          >
            Get started free →
          </Link>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, text }: { icon: string; title: string; text: string }) {
  return (
    <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-100 rounded-2xl p-6 hover:shadow-lg transition-all">
      <div className="text-3xl mb-3">{icon}</div>
      <h3 className="text-lg font-bold text-[#1A1A2E] mb-2">{title}</h3>
      <p className="text-sm text-gray-600 leading-relaxed">{text}</p>
    </div>
  );
}
