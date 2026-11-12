import type { Metadata } from "next";
import Link from "next/link";
import TrackedOutboundLink from "@/components/TrackedOutboundLink";

export const metadata: Metadata = {
  title: "Rent a Car for Gig Work | GigWorldToday",
  description:
    "How I book weekly rentals for gig work: what to compare, what to ask, and where to book.",
};

// Set in Vercel env: NEXT_PUBLIC_PRICELINE_AFFILIATE_URL (CJ link)
const AFFILIATE_URL = process.env.NEXT_PUBLIC_PRICELINE_AFFILIATE_URL;

export default function RentForGigWorkPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl sm:text-4xl font-bold mb-3">Rent a Car for Gig Work</h1>
      <p className="text-lg text-gray-700 mb-4">
        How I book weekly rentals so my own car stays home.
      </p>

      <p className="text-sm bg-gray-100 border border-gray-200 rounded-lg p-3 mb-8 text-gray-600">
        Disclosure: This page contains an affiliate link. If you book through it, GigWorldToday
        may earn a commission at no extra cost to you.
      </p>

      <section className="bg-white/90 border border-gray-200 rounded-xl p-6 mb-6">
        <h2 className="text-xl font-bold mb-3">Before you book, always check</h2>
        <ul className="list-disc pl-5 space-y-2 text-gray-700">
          <li>
            The rental agreement allows delivery or business use (or the company offers a
            gig-approved rental). Get the answer in writing.
          </li>
          <li>Mileage cap, deposit amount and card type, and the toll policy.</li>
          <li>
            What insurance is included, and what your own policy or card does and does not
            cover for work use.
          </li>
          <li>The gig app&apos;s current vehicle and rental requirements.</li>
        </ul>
      </section>

      <section className="bg-white/90 border border-gray-200 rounded-xl p-6 mb-6">
        <h2 className="text-xl font-bold mb-3">What I look for</h2>
        <ul className="list-disc pl-5 space-y-2 text-gray-700">
          <li>Weekly rates, prepaid, so the cost is known before I drive.</li>
          <li>A hybrid (around 50 mpg) to keep fuel costs low.</li>
          <li>Major brands over small companies, which often have bigger deposits.</li>
          <li>A pickup location close to my best zone.</li>
        </ul>
      </section>

      {AFFILIATE_URL ? (
        <section className="bg-amber-50 border-l-4 border-amber-500 rounded-xl p-6 mb-6">
          <h2 className="text-xl font-bold mb-2">Where I book</h2>
          <p className="text-gray-700 mb-4">
            I book my weekly rentals through Priceline. Compare weekly totals (including
            fees) before you pay.
          </p>
          <TrackedOutboundLink
            href={AFFILIATE_URL}
            linkType="affiliate"
            label="priceline-rental-cars"
            className="inline-block bg-amber-500 hover:bg-amber-600 text-white font-bold px-6 py-3 rounded-lg"
          >
            Compare rental cars on Priceline
          </TrackedOutboundLink>
        </section>
      ) : null}

      <p className="text-sm text-gray-600">
        New to this?{" "}
        <Link href="/rental-blueprint" className="text-blue-600 underline">
          Read the free overview of the No-Car Gig Blueprint
        </Link>
        .
      </p>

      <p className="text-xs text-gray-500 mt-6">
        General information only, not legal, tax or insurance advice. Rental terms and app rules
        change; verify with the rental company, your insurer and each app.
      </p>
    </main>
  );
}
