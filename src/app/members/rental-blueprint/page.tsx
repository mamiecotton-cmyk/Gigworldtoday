import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getMemberAccess, RENTAL_BLUEPRINT_SLUG } from "@/lib/purchases";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "The No-Car Gig Blueprint | Members",
  robots: { index: false, follow: false },
};

type Props = {
  searchParams: Promise<{ paid?: string }>;
};

export default async function MembersRentalBlueprintPage({ searchParams }: Props) {
  const { paid } = await searchParams;
  const { user, hasPurchase } = await getMemberAccess(RENTAL_BLUEPRINT_SLUG);

  if (!user) {
    redirect("/login?redirectTo=/members/rental-blueprint");
  }

  if (!hasPurchase) {
    return (
      <main className="max-w-2xl mx-auto px-4 py-12 text-center">
        {paid ? (
          <>
            <h1 className="text-2xl font-bold mb-3">Payment received</h1>
            <p className="text-gray-700 mb-4">
              We&apos;re unlocking your access now. This usually takes a few seconds.
            </p>
            <Link
              href="/members/rental-blueprint"
              className="inline-block bg-amber-500 text-white font-semibold px-5 py-2.5 rounded-lg"
            >
              Refresh
            </Link>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold mb-3">Members only</h1>
            <p className="text-gray-700 mb-4">
              The full No-Car Gig Blueprint is available for $9.99.
            </p>
            <Link
              href="/api/checkout"
              className="inline-block bg-amber-500 hover:bg-amber-600 text-white font-bold px-6 py-3 rounded-lg"
            >
              Get the full blueprint
            </Link>
            <p className="mt-4 text-sm">
              <Link href="/rental-blueprint" className="text-blue-600 underline">
                Read the free overview
              </Link>
            </p>
          </>
        )}
      </main>
    );
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">The No-Car Gig Blueprint</h1>
      <p className="text-gray-600 mb-8">Thanks for your purchase. Everything is below.</p>

      <section className="bg-white/90 border border-gray-200 rounded-xl p-6 mb-6">
        <h2 className="text-xl font-bold mb-2">1. Download the guide</h2>
        <p className="text-gray-700 mb-4">
          12 pages with the cost math, fine-print checklist, daily workflow, printable
          weekly tracker and 30-day plan.
        </p>
        <a
          href="/api/members/rental-blueprint/download"
          className="inline-block bg-amber-500 hover:bg-amber-600 text-white font-bold px-6 py-3 rounded-lg"
        >
          Download the PDF
        </a>
      </section>

      <section className="bg-white/90 border border-gray-200 rounded-xl p-6">
        <h2 className="text-xl font-bold mb-2">2. Book your rental</h2>
        <p className="text-gray-700 mb-4">
          My booking tips, what to compare, and the link I use are on this page.
        </p>
        <Link
          href="/rent-for-gig-work"
          className="inline-block border-2 border-amber-500 text-amber-700 font-bold px-6 py-3 rounded-lg hover:bg-amber-50"
        >
          Open the booking page
        </Link>
      </section>
    </main>
  );
}
