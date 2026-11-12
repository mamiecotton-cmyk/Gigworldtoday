import type { Metadata } from "next";
import Link from "next/link";
import SubscribeForm from "./SubscribeForm";

export const metadata: Metadata = {
  title: "The No-Car Gig Blueprint | Free Overview",
  description:
    "How to work multiple gig apps from a weekly rental instead of your own car. Free one-page overview, plus the full blueprint for $9.99.",
};

export default function RentalBlueprintPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-10">
      <p className="text-sm font-semibold tracking-wide text-amber-600 uppercase">
        Free Overview
      </p>
      <h1 className="text-3xl sm:text-4xl font-bold mt-1 mb-3">The No-Car Gig Blueprint</h1>
      <p className="text-lg text-gray-700 mb-8">
        How to work multiple gig apps without putting miles on your own car.
      </p>

      <section className="bg-white/90 border border-gray-200 rounded-xl p-6 mb-6">
        <h2 className="text-xl font-bold mb-3">The big idea</h2>
        <p className="text-gray-700 mb-3">
          Using your own car feels free, but tires, brakes, oil, insurance changes and
          depreciation add up. A weekly rental turns all of that into one predictable
          cost you can see, plan around and cap, and your own car stays home.
        </p>
        <p className="text-gray-700">
          The goal is to stop asking &quot;how much did I make?&quot; and start asking
          &quot;how much did I keep after the car?&quot;
        </p>
      </section>

      <section className="bg-white/90 border border-gray-200 rounded-xl p-6 mb-6">
        <h2 className="text-xl font-bold mb-3">The 60-second math</h2>
        <ul className="list-disc pl-5 space-y-2 text-gray-700">
          <li>
            <strong>Weekly car cost</strong> = rental rate + fees + fuel + tolls/parking +
            any added insurance
          </li>
          <li>
            <strong>Hours to cover the car</strong> = weekly car cost ÷ your gross dollars
            per hour
          </li>
          <li>
            <strong>Net per hour</strong> = (gross pay − car cost − other expenses) ÷ hours
            worked
          </li>
        </ul>
        <p className="text-sm text-gray-500 mt-3">
          Example numbers only; yours will differ. A hybrid at about 50 mpg can cut your
          biggest variable cost roughly in half compared with a 25 mpg car.
        </p>
      </section>

      <section className="bg-white/90 border border-gray-200 rounded-xl p-6 mb-8">
        <h2 className="text-xl font-bold mb-3">The 4 rules in a nutshell</h2>
        <ol className="list-decimal pl-5 space-y-2 text-gray-700">
          <li>Check the rental contract and your insurance for delivery use before you book.</li>
          <li>Book weekly and prepay so your car cost is known up front.</li>
          <li>Build your day around one or two core apps, with fillers for slow periods.</li>
          <li>Track miles, pay and costs every day, and review net per hour every Sunday.</li>
        </ol>
      </section>

      <section className="bg-amber-50 border-l-4 border-amber-500 rounded-xl p-6 mb-8">
        <h2 className="text-xl font-bold mb-2">Want the full blueprint?</h2>
        <p className="text-gray-700 mb-3">The members guide (12 pages) adds:</p>
        <ul className="list-disc pl-5 space-y-1 text-gray-700 mb-4">
          <li>Rental vs. owning worksheet with formulas</li>
          <li>Fine-print checklist for contracts, insurance and app rules</li>
          <li>Pickup-day inspection checklist</li>
          <li>Daily multi-app workflow and the rules that keep it profitable</li>
          <li>Printable weekly tracker and break-even numbers</li>
          <li>Mistakes to avoid and a 30-day launch plan</li>
        </ul>
        <Link
          href="/api/checkout"
          className="inline-block bg-amber-500 hover:bg-amber-600 text-white font-bold px-6 py-3 rounded-lg"
        >
          Get the full blueprint, $9.99
        </Link>
        <p className="text-xs text-gray-500 mt-2">
          You&apos;ll sign in first, then pay securely with Stripe. Instant access.
        </p>
      </section>

      <section className="bg-white/90 border border-gray-200 rounded-xl p-6">
        <h2 className="text-lg font-bold mb-2">Not ready yet? Join the weekly newsletter.</h2>
        <SubscribeForm />
      </section>

      <p className="text-xs text-gray-500 mt-6">
        General information only, not legal, tax or insurance advice. Rental terms and app
        rules change; always verify with the company or your insurer.
      </p>
    </main>
  );
}
