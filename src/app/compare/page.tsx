import type { Metadata } from "next";
import CompareTool from "@/components/CompareTool";
import SignupBanner from "@/components/SignupBanner";

export const metadata: Metadata = {
  title: "Compare Gig Apps | GigWorldToday",
  description:
    "Compare Uber, DoorDash, Spark, Instacart and more before signing up.",
};

export default function ComparePage() {
  return (
    <div className="min-h-screen py-12">
      <div className="max-w-6xl mx-auto px-6">
        <div className="bg-white/85 rounded-3xl shadow-2xl border border-white/40 p-5 md:p-10">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">
          Compare Gig Platforms
        </h1>
        <p className="text-gray-600 mb-8">
          See how platforms stack up before you sign up.
        </p>

        <CompareTool />

        <SignupBanner
          headline="Stay Ahead of the Gig Economy"
          subtext="Early platform updates & weekly tips."
          variant="inline"
        />
        </div>
      </div>
    </div>
  );
}