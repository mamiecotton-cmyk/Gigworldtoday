import type { Metadata } from "next";
import Link from "next/link";
import SubscribeForm from "./SubscribeForm";

export const metadata: Metadata = {
  title: "I Made $8,000+ in One Month Without My Own Car | The No-Car Gig Blueprint",
  description:
    "Need money for the holidays or an unexpected bill? Mamie, a former rental car manager, shows how she worked the gig apps from a weekly rental and kept more of what she earned.",
};

// Flip to true in Vercel (NEXT_PUBLIC_BLUEPRINT_LIVE=true) when the full guide is ready to sell.
const LIVE = process.env.NEXT_PUBLIC_BLUEPRINT_LIVE === "true";

const EARNINGS = [
  ["Expedite", "$4,144.01"],
  ["Roadie", "$2,346.92"],
  ["Zifty", "$1,131.38"],
  ["Senpex", "$387.84"],
];

const TIPS = [
  {
    title: "Rent a hybrid.",
    text: "You get about 50 MPG, and that saves hundreds on gas.",
  },
  {
    title: "Book through Priceline and prepay.",
    text: "That's where I get the best weekly rates.",
  },
  {
    title: "Stack multiple platforms.",
    text: "That way you always have deliveries.",
  },
  {
    title: "Check your credit card.",
    text: "Some cards already cover rental car insurance for free. Make sure yours covers work or delivery use.",
  },
];

const INSIDE = [
  "Which platforms to stack",
  "The best days to rent",
  "The best vehicles in the rental fleet to drive",
  "Insurance tips that can save you hundreds",
  "Security deposit requirements at the major rental companies",
  "Renting with imperfect credit",
  "Getting a car for a month without paying for it all at once",
];

export default function RentalBlueprintPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-10">
      {/* Hero */}
      <section className="mb-8">
        <p className="text-sm font-semibold tracking-wide text-amber-600 uppercase">
          A gig worker&apos;s recap
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold mt-1 mb-4">
          I made over $8,000 in one month doing gig work, and I didn&apos;t use my own car.
        </h1>
        <p className="text-lg text-gray-700 mb-3">
          If you want extra money for the holidays, or you&apos;re staring at an unexpected bill,
          you don&apos;t need to own a car to get started. You can rent one by the week and put
          it to work.
        </p>
        <p className="text-lg text-gray-700">
          I&apos;m Mamie, a former rental car manager. Here&apos;s exactly how my September
          broke down.
        </p>
      </section>

      {/* Earnings */}
      <section className="bg-white/90 border border-gray-200 rounded-xl p-6 mb-6">
        <h2 className="text-xl font-bold mb-1">September 2026: where it came from</h2>
        <p className="text-sm text-gray-500 mb-4">My gross earnings by platform</p>
        <ul className="divide-y divide-gray-200">
          {EARNINGS.map(([name, amount]) => (
            <li key={name} className="flex justify-between py-2">
              <span>{name}</span>
              <span className="font-semibold">{amount}</span>
            </li>
          ))}
          <li className="flex justify-between py-3 font-bold text-lg">
            <span>Total gross</span>
            <span>$8,010.15</span>
          </li>
        </ul>
      </section>

      {/* Expenses */}
      <section className="bg-white/90 border border-gray-200 rounded-xl p-6 mb-6">
        <h2 className="text-xl font-bold mb-3">Now let&apos;s talk expenses</h2>
        <ul className="divide-y divide-gray-200 mb-3">
          <li className="flex justify-between py-2">
            <span>Rental car (about $250 a week)</span>
            <span className="font-semibold">$1,000</span>
          </li>
          <li className="flex justify-between py-2">
            <span>Insurance</span>
            <span className="font-semibold">$160</span>
          </li>
          <li className="flex justify-between py-2">
            <span>Gas (about $120 a week)</span>
            <span className="font-semibold">$480</span>
          </li>
          <li className="flex justify-between py-3 font-bold text-lg">
            <span>Total expenses</span>
            <span>$1,640</span>
          </li>
        </ul>
        <p className="text-gray-700 text-sm mb-2">
          I fill up about twice a week at around $60 a fill-up. Gas is $6 a gallon where I
          am, so the hybrid is a big reason it stays at $480.
        </p>
        <p className="text-gray-700 text-sm">
          In 2025, I could rent a vehicle for a full month for about $550 prepaid. Rates
          change, so always compare.
        </p>
      </section>

      {/* Take-home */}
      <section className="bg-gray-900 text-white rounded-xl p-6 mb-8 text-center">
        <p className="text-gray-300 mb-1">So what did I actually take home?</p>
        <p className="text-gray-300 text-sm mb-2">$8,010 gross minus $1,640 in expenses</p>
        <p className="text-4xl sm:text-5xl font-bold text-green-400 mb-2">$6,370</p>
        <p className="text-gray-200">
          One month. No car payment. No mechanic bills.
        </p>
        <p className="text-xs text-gray-400 mt-2">Before taxes and other business costs.</p>
      </section>

      {/* Why */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-3">Why I leave my own car at home</h2>
        <p className="text-gray-700">
          Most gig workers put thousands of miles on their personal vehicle. That means
          depreciation, constant maintenance, terrible gas mileage, and a car that&apos;s worth
          less every single day. A weekly rental turns all of that into one cost I can see and
          plan around.
        </p>
      </section>

      {/* Tips */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">4 tips to make this work</h2>
        <ol className="space-y-3">
          {TIPS.map((tip, i) => (
            <li
              key={tip.title}
              className="flex gap-3 bg-white/90 border border-gray-200 rounded-xl p-4"
            >
              <span className="flex-shrink-0 w-7 h-7 rounded-full bg-amber-500 text-white font-bold flex items-center justify-center">
                {i + 1}
              </span>
              <p className="text-gray-700">
                <strong>{tip.title}</strong> {tip.text}
              </p>
            </li>
          ))}
        </ol>
        <p className="text-sm text-gray-600 mt-3">
          Want to see where I book?{" "}
          <Link href="/rent-for-gig-work" className="text-blue-600 underline">
            Here&apos;s my booking page
          </Link>{" "}
          (it has an affiliate link, and you&apos;ll see the disclosure there).
        </p>
      </section>

      {/* Blueprint */}
      <section className="bg-amber-50 border-l-4 border-amber-500 rounded-xl p-6 mb-8">
        <h2 className="text-xl font-bold mb-2">
          {LIVE ? "The full blueprint" : "The full blueprint is coming soon"}
        </h2>
        <p className="text-gray-700 mb-3">Inside, I&apos;m covering:</p>
        <ul className="list-disc pl-5 space-y-1 text-gray-700 mb-4">
          {INSIDE.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        {LIVE ? (
          <>
            <Link
              href="/api/checkout"
              className="inline-block bg-amber-500 hover:bg-amber-600 text-white font-bold px-6 py-3 rounded-lg"
            >
              Get the full blueprint, $9.99
            </Link>
            <p className="text-xs text-gray-500 mt-2">
              Sign in, pay securely with Stripe, and get instant access.
            </p>
          </>
        ) : (
          <p className="text-gray-700 font-semibold">
            Get the free recap below, and subscribe to my YouTube channel so you don&apos;t
            miss it.
          </p>
        )}
      </section>

      {/* About Mamie */}
      <section className="bg-white/90 border border-gray-200 rounded-xl p-6 mb-8">
        <h2 className="text-xl font-bold mb-2">About Mamie</h2>
        <p className="text-gray-700">
          I&apos;m a former rental car manager with 10 years in the rental car industry, so I
          know how rental companies price their cars, how deposits work, and what to ask at
          the counter. I&apos;ve been a full-time gig worker since 2020 across more than 10
          platforms, and I&apos;m the author of <em>The 5-Star Gig Worker: Book 1</em>.
        </p>
      </section>

      {/* Free recap */}
      <section id="free" className="bg-white/90 border border-gray-200 rounded-xl p-6 mb-6">
        <h2 className="text-lg font-bold mb-1">Get the free one-page recap</h2>
        <p className="text-gray-700 text-sm mb-4">
          Grab the one-page version of this, and join the weekly GigWorldToday newsletter.
        </p>
        <SubscribeForm downloadHref="/downloads/No-Car-Gig-Blueprint-Overview.pdf" />
      </section>

      <p className="text-xs text-gray-500">
        These are my own results for September 2026 and are not typical. Your results will
        vary based on your area, the platforms available to you, and the hours you work.
        Earnings shown are before taxes. General information only, not legal, tax, insurance or
        financial advice. Rental terms, deposits, insurance coverage and app rules vary by
        company and location and change often, so verify before you book. Many credit cards
        exclude business or delivery use from rental coverage, so check yours.
      </p>
    </main>
  );
}
