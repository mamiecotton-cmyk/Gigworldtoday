import type { Metadata } from "next";
import Link from "next/link";
import SubscribeForm from "./SubscribeForm";

export const metadata: Metadata = {
  title: "The No-Car Gig Blueprint | Work the Gig Apps Without Your Own Car",
  description:
    "From a former rental car manager: when to rent, deposit requirements at the major companies, renting with imperfect credit, and how to get a car for a month without paying it all at once.",
};

const PROGRAM = [
  {
    title: "The best times to rent",
    text: "How timing your booking and pickup can change what you pay each week.",
  },
  {
    title: "Security deposit requirements",
    text: "What the major rental car companies hold, side by side, so there are no surprises at the counter.",
  },
  {
    title: "Renting with imperfect credit",
    text: "The card options to look at and how rental companies treat them.",
  },
  {
    title: "A month-long rental without paying it all at once",
    text: "Ways to spread the cost of a longer rental instead of paying everything up front.",
  },
  {
    title: "The multi-app daily workflow",
    text: "Core apps plus fillers, the rules that keep you profitable, and a printable weekly tracker.",
  },
  {
    title: "The fine-print checklist",
    text: "What to confirm in the rental contract, your insurance and each gig app before you drive.",
  },
];

export default function RentalBlueprintPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-10">
      {/* Hero */}
      <section className="mb-10">
        <p className="text-sm font-semibold tracking-wide text-amber-600 uppercase">
          For gig workers
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold mt-1 mb-3">The No-Car Gig Blueprint</h1>
        <p className="text-lg text-gray-700 mb-6">
          Work multiple gig apps without putting miles on your own car, and keep more of
          what you earn.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/api/checkout"
            className="inline-block text-center bg-amber-500 hover:bg-amber-600 text-white font-bold px-6 py-3 rounded-lg"
          >
            Get the full blueprint, $9.99
          </Link>
          <a
            href="#free"
            className="inline-block text-center border-2 border-amber-500 text-amber-700 font-bold px-6 py-3 rounded-lg hover:bg-amber-50"
          >
            Get the free one-page overview
          </a>
        </div>
      </section>

      {/* About Mamie */}
      <section className="bg-amber-50 border-l-4 border-amber-500 rounded-xl p-6 mb-8">
        <h2 className="text-xl font-bold mb-2">Hi, I&apos;m Mamie</h2>
        <p className="text-gray-700 mb-3">
          I&apos;m a former rental car manager with 10 years in the rental car industry. I know
          how rental companies price their cars, how deposits and holds work, and what to ask
          at the counter, and I&apos;ve been a full-time gig worker since 2020 across more than
          10 platforms.
        </p>
        <p className="text-gray-700">
          This blueprint is the system I use to run multiple gig apps from a weekly rental, so
          my own car stays home and I can see exactly what the car costs me.
        </p>
      </section>

      {/* Program overview */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">What&apos;s inside the program</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {PROGRAM.map((item) => (
            <div
              key={item.title}
              className="bg-white/90 border border-gray-200 rounded-xl p-5"
            >
              <h3 className="font-bold mb-1">{item.title}</h3>
              <p className="text-gray-700 text-sm">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Why a rental */}
      <section className="bg-white/90 border border-gray-200 rounded-xl p-6 mb-8">
        <h2 className="text-xl font-bold mb-3">Why leave your own car at home?</h2>
        <p className="text-gray-700 mb-3">
          Tires, brakes, oil, insurance changes and depreciation add up fast with gig mileage.
          A weekly rental turns those surprises into one predictable cost you can plan around
          and cap, and a hybrid at around 50 mpg can cut your biggest variable cost too.
        </p>
        <p className="text-gray-700">
          The goal: stop asking &quot;how much did I make?&quot; and start asking &quot;how much
          did I keep after the car?&quot;
        </p>
      </section>

      {/* Buy */}
      <section className="bg-gray-900 text-white rounded-xl p-6 mb-8 text-center">
        <h2 className="text-2xl font-bold mb-1">Get the full blueprint</h2>
        <p className="text-gray-300 mb-4">
          One-time $9.99. Sign in, pay securely with Stripe, and get instant access.
        </p>
        <Link
          href="/api/checkout"
          className="inline-block bg-amber-500 hover:bg-amber-600 text-white font-bold px-8 py-3 rounded-lg"
        >
          Buy now, $9.99
        </Link>
      </section>

      {/* Free overview */}
      <section id="free" className="bg-white/90 border border-gray-200 rounded-xl p-6 mb-6">
        <h2 className="text-lg font-bold mb-1">Want a quick preview first?</h2>
        <p className="text-gray-700 text-sm mb-4">
          Get the free one-page overview and join the weekly GigWorldToday newsletter.
        </p>
        <SubscribeForm downloadHref="/downloads/No-Car-Gig-Blueprint-Overview.pdf" />
      </section>

      <p className="text-xs text-gray-500">
        General information only, not legal, tax, insurance or financial advice. Rental terms,
        deposit requirements, insurance coverage and gig app rules vary by company and location
        and change often; verify before you book. Results vary and no income is guaranteed.
      </p>
    </main>
  );
}
