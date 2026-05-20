import type { Metadata } from "next";
import Link from "next/link";

const faqSections = [
  {
    title: "Getting Started",
    items: [
      {
        question: "Which apps should I begin with?",
        answer:
          "Start with the major platforms that operate in your area, then add one or two specialized courier apps. Balance demand, pickup density, vehicle requirements, and pay model before committing to long shifts.",
      },
      {
        question: "How do I set a sustainable schedule?",
        answer:
          "Track demand windows, note peak hours in your markets, and protect at least one day off per week. Use short shifts that let you evaluate pay versus wear-and-tear.",
      },
    ],
  },
  {
    title: "Earnings & Pay",
    items: [
      {
        question: "How do I compare pay across apps?",
        answer:
          "Compare net pay, minutes spent, and deadhead distance. Hourly-equivalent metrics are the most useful: divide net trip pay by time on the task.",
      },
      {
        question: "Should I accept every trip or order?",
        answer:
          "No. Estimate route time and distance before accepting when possible. Rejecting clearly unprofitable or extremely time-consuming requests preserves your effective hourly rate.",
      },
    ],
  },
  {
    title: "Multi-Apping & Strategy",
    items: [
      {
        question: "Is multi-apping worth it?",
        answer:
          "Multi-apping can increase your acceptance rate and reduce downtime, but it adds cognitive load and can increase cancellation risk. Use it selectively and prioritize the highest expected pay first.",
      },
      {
        question: "How do I coordinate multiple apps safely?",
        answer:
          "Use clear audio and visual cues, keep a small note of active tasks, and never accept overlapping tasks that will put you in breach of a platform's terms.",
      },
    ],
  },
  {
    title: "Risk & Account Management",
    items: [
      {
        question: "How do I protect my account from deactivation?",
        answer:
          "Follow platform rules, document disputes, maintain high service ratings, and communicate professionally. Keep records and screenshots of problem rides or orders to contest unjust deactivations.",
      },
      {
        question: "What about insurance and liability?",
        answer:
          "Check platform-provided insurance limits and consider supplemental policies that explicitly cover gig work. Liability gaps exist for many trip scenarios, so read policy fine print carefully.",
      },
    ],
  },
];

const travelApps = [
  {
    name: "DoorDash",
    href: "/platforms/doordash",
    note:
      "Best portable food-delivery app for many drivers. If DoorDash is available where you are, you can usually open Dasher, switch to the local zone, and start or schedule a dash when the area has availability.",
  },
  {
    name: "Instacart",
    href: "/platforms/instacart",
    note:
      "Useful when you travel near grocery-heavy suburbs or dense retail corridors. Open the Shopper app near Instacart-enabled stores and watch for batches where shopper demand and store coverage are active.",
  },
  {
    name: "Senpex",
    href: "/platforms/senpex",
    note:
      "A good travel companion for same-day courier, catering, and business deliveries. It is especially worth checking if you are moving through larger metro areas or have a vehicle that can handle non-food delivery work.",
  },
  {
    name: "Courial",
    href: "/platforms/courial",
    note:
      "A concierge-style option for errands, documents, retail items, and scheduled deliveries. Keep it available when traveling, but expect offer volume to depend heavily on the city and partner demand.",
  },
  {
    name: "Roadie",
    href: "/platforms/roadie",
    note:
      "One of the strongest travel-friendly add-on apps because gigs are tied to pickup locations and routes. Check it when passing airports, retailers, warehouses, or hardware stores, especially if you can handle bigger items.",
  },
];

export const metadata: Metadata = {
  title: "Gig Worker FAQ 2026 | GigWorldToday",
  description:
    "A practical GigWorldToday FAQ for gig workers covering travel-friendly apps, earnings, expenses, multi-apping, insurance, and account protection.",
  alternates: {
    canonical: "https://www.gigworldtoday.com/gig-worker-faq-2026",
  },
  openGraph: {
    title: "Gig Worker FAQ 2026 | GigWorldToday",
    description:
      "Practical answers for gig workers on apps, earnings, expenses, multi-apping, and account protection.",
    url: "https://www.gigworldtoday.com/gig-worker-faq-2026",
    siteName: "GigWorldToday",
    type: "article",
  },
};

export default function GigWorkerFaqPage() {
  return (
    <div className="min-h-screen py-10 md:py-14">
      <div className="mx-auto max-w-6xl px-6">
        <section className="mb-8 rounded-3xl border border-white/50 bg-white/90 p-6 shadow-xl md:p-10">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-[#0f3460]">
            GigWorldToday Guide
          </p>
          <div className="grid gap-8 md:grid-cols-[1.5fr_0.8fr] md:items-end">
            <div>
              <h1 className="text-3xl font-bold leading-tight tracking-tight text-slate-950 md:text-5xl">
                Gig Worker FAQ 2026
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-700 md:text-lg">
                Practical answers for drivers and couriers who want better app choices,
                cleaner earnings records, smarter multi-apping, and fewer costly surprises.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              <p>
                <span className="font-semibold text-slate-900">Last updated:</span> May 2026
              </p>
              <p className="mt-1">
                <span className="font-semibold text-slate-900">Author:</span> GigWorldToday Editorial Team
              </p>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/tracker"
              className="rounded-xl bg-teal-500 px-5 py-3 text-sm font-semibold text-white shadow hover:bg-teal-600"
            >
              Open Earnings Tracker
            </Link>
            <Link
              href="/products"
              className="rounded-xl border border-orange-300 bg-white px-5 py-3 text-sm font-semibold text-orange-700 hover:bg-orange-50"
            >
              Explore Tools
            </Link>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[2fr_0.9fr]">
          <main className="space-y-5">
            <section className="rounded-2xl border border-white/50 bg-white/90 p-6 shadow-lg">
              <h2 className="text-2xl font-bold text-slate-950">Getting Started</h2>
              <div className="mt-5 space-y-5">
                {faqSections[0].items.map((item) => (
                  <div key={item.question}>
                    <h3 className="text-base font-semibold text-slate-900">{item.question}</h3>
                    <p className="mt-2 leading-relaxed text-slate-700">{item.answer}</p>
                  </div>
                ))}
              </div>
            </section>

            <details className="group rounded-2xl border border-white/50 bg-white/90 shadow-lg">
              <summary className="flex cursor-pointer list-none items-start justify-between gap-4 p-6 [&::-webkit-details-marker]:hidden">
                <div>
                  <h2 className="text-2xl font-bold text-slate-950">
                    Top 5 Apps That Travel With You
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    DoorDash, Instacart, Senpex, Courial, and Roadie for drivers who work across cities.
                  </p>
                </div>
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-teal-200 text-lg font-semibold text-teal-700 transition group-open:rotate-45 group-open:bg-teal-50">
                  +
                </span>
              </summary>
              <div className="border-t border-slate-100 px-6 pb-6 pt-5">
                <h3 className="text-base font-semibold text-slate-900">
                  Which gig apps can I turn on when I am away from home?
                </h3>
                <p className="mt-2 leading-relaxed text-slate-700">
                  These are apps to keep on your phone if you work in more than one city,
                  travel often, or drive through multiple markets. The key advantage is
                  portability: once your account is active, you can open the app in a covered
                  area and look for nearby work without starting a brand-new local application.
                  Local demand, waitlists, vehicle rules, certifications, and account status can
                  still affect what you see.
                </p>
                <ol className="mt-5 space-y-3">
                  {travelApps.map((app, index) => (
                    <li
                      key={app.name}
                      className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                    >
                      <div className="flex items-center gap-3">
                        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-teal-500 text-sm font-bold text-white">
                          {index + 1}
                        </span>
                        <Link
                          href={app.href}
                          className="font-bold text-slate-950 hover:text-teal-700 hover:underline"
                        >
                          {app.name}
                        </Link>
                      </div>
                      <p className="mt-2 text-sm leading-relaxed text-slate-700">{app.note}</p>
                    </li>
                  ))}
                </ol>
                <h3 className="mt-6 text-base font-semibold text-slate-900">
                  How should I use travel-friendly apps?
                </h3>
                <p className="mt-2 leading-relaxed text-slate-700">
                  Before a trip, make sure your driver account, payment method, ID, background
                  check, and app permissions are current. When you arrive, turn on one app at a
                  time to read local demand, then layer in courier apps like Roadie, Senpex, and
                  Courial when a route or pickup location makes sense.
                </p>
              </div>
            </details>

            {faqSections.slice(1).map((section) => (
              <section
                key={section.title}
                className="rounded-2xl border border-white/50 bg-white/90 p-6 shadow-lg"
              >
                <h2 className="text-2xl font-bold text-slate-950">{section.title}</h2>
                <div className="mt-5 space-y-5">
                  {section.items.map((item) => (
                    <div key={item.question}>
                      <h3 className="text-base font-semibold text-slate-900">{item.question}</h3>
                      <p className="mt-2 leading-relaxed text-slate-700">{item.answer}</p>
                    </div>
                  ))}
                </div>
              </section>
            ))}

            <section className="rounded-2xl border border-white/50 bg-white/90 p-6 shadow-lg">
              <h2 className="text-2xl font-bold text-slate-950">Expenses & Profit</h2>
              <div className="mt-5 space-y-5">
                <div>
                  <h3 className="text-base font-semibold text-slate-900">
                    What counts as a gig expense?
                  </h3>
                  <p className="mt-2 leading-relaxed text-slate-700">
                    Typical deductible expenses include fuel, vehicle depreciation, maintenance,
                    phone and data, supplies, delivery bags, and app subscription fees. Track
                    everything and separate business from personal use.
                  </p>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-slate-900">
                    Fuel savings partnerships
                  </h3>
                  <p className="mt-2 leading-relaxed text-slate-700">
                    <a
                      href="https://upside.sjv.io/c/7066741/3887861/39811?param1=gigworld25"
                      className="font-semibold text-teal-700 hover:underline"
                    >
                      Upside
                    </a>{" "}
                    is a free cash-back app that partners with gig platforms such as Uber and
                    Instacart to help drivers earn cash back on fuel and eligible in-store
                    purchases, including groceries and restaurant orders, at participating
                    merchants. Enter promo code{" "}
                    <span className="font-semibold text-slate-950">GIGWORLD25</span> in the
                    Upside app to receive an extra $0.25/gal bonus on your first qualifying gas
                    transaction at participating locations.
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-white/50 bg-white/90 p-6 shadow-lg">
              <h2 className="text-2xl font-bold text-slate-950">Final Thoughts</h2>
              <p className="mt-3 leading-relaxed text-slate-700">
                Measure, iterate, and treat gig work like a small business. Keep a weekly earnings
                log, inspect expenses monthly, and test one change per week so decisions move from
                hunches to measurable outcomes.
              </p>
            </section>
          </main>

          <aside className="space-y-5">
            <section className="rounded-2xl border border-white/50 bg-white/90 p-6 shadow-lg">
              <h2 className="text-xl font-bold text-slate-950">Quick Resources</h2>
              <ul className="mt-4 space-y-3 text-sm leading-relaxed text-slate-700">
                <li>
                  <span className="font-semibold text-slate-950">Shift checklist:</span> phone
                  charged, power bank, insulated bag, and any market-specific supplies.
                </li>
                <li>
                  <span className="font-semibold text-slate-950">Recordkeeping:</span> use one app
                  or spreadsheet for mileage and receipts.
                </li>
                <li>
                  <span className="font-semibold text-slate-950">Safety:</span> trust your instincts
                  and log incidents immediately.
                </li>
              </ul>
            </section>

            <section className="rounded-2xl border border-white/50 bg-white/90 p-6 shadow-lg">
              <h2 className="text-xl font-bold text-slate-950">Glossary</h2>
              <ul className="mt-4 space-y-3 text-sm leading-relaxed text-slate-700">
                <li>
                  <span className="font-semibold text-slate-950">Deadhead:</span> distance traveled
                  without a paying passenger or order.
                </li>
                <li>
                  <span className="font-semibold text-slate-950">Effective hourly:</span> net pay
                  divided by time actively working.
                </li>
                <li>
                  <span className="font-semibold text-slate-950">Multi-apping:</span> running
                  multiple platforms to reduce downtime.
                </li>
              </ul>
            </section>

            <section className="rounded-2xl border border-teal-100 bg-teal-50/90 p-6 shadow-lg">
              <h2 className="text-xl font-bold text-slate-950">Next Step</h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-700">
                Track your real net pay so you can see which apps are actually worth your time.
              </p>
              <Link
                href="/tracker"
                className="mt-4 inline-flex rounded-xl bg-teal-500 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-600"
              >
                Open tracker
              </Link>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}
