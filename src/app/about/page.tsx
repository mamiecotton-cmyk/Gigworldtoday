import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About GigWorldToday",
  description:
    "GigWorldToday provides structured insight, comparisons, and community-powered ratings for gig workers.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-6">
        <div className="bg-white/85 rounded-3xl shadow-2xl border border-white/40 p-10">
        <h1 className="text-4xl font-bold mb-6">
          About GigWorldToday
        </h1>

        <p className="text-gray-700 mb-6 leading-relaxed">
          GigWorldToday was created to bring structure and clarity
          to the gig economy.
        </p>

        <p className="text-gray-700 mb-6 leading-relaxed">
          Most gig workers operate independently. There are no team
          meetings, no supervisors for context, and no consistent
          peer group to compare notes with. Decisions about pay,
          scheduling, and platform changes are often made in
          isolation.
        </p>

        <p className="text-gray-700 mb-6 leading-relaxed">
          GigWorldToday exists to reduce that isolation by providing
          grounded, structured information about the gig landscape.
        </p>

        <h2 className="text-2xl font-semibold mt-12 mb-4">
          Built on Real Experience
        </h2>

        <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-6">
          <li>Over 20 years in management</li>
          <li>9 years in operations and logistics</li>
          <li>5 years working directly in the gig economy</li>
        </ul>

        <p className="text-gray-700 mb-6 leading-relaxed">
          This combination provides insight into both how systems are
          designed and how they feel when you're working inside them.
        </p>

        <h2 className="text-2xl font-semibold mt-12 mb-4">
          What This Platform Is Built To Do
        </h2>

        <ul className="list-disc pl-6 text-gray-700 space-y-2">
          <li>Provide clear, structured platform comparisons</li>
          <li>Highlight patterns instead of rumors</li>
          <li>Surface meaningful gig economy changes</li>
          <li>Support community-powered DriverScore ratings</li>
        </ul>

        <p className="text-gray-700 mt-8 leading-relaxed">
          Gig work should not feel like guesswork. Drivers deserve
          context, transparency, and reliable information without
          noise.
        </p>
        </div>
      </div>
    </div>
  );
}
