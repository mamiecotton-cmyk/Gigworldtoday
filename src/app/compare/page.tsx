import type { Metadata } from "next";
import CompareTool from "@/components/CompareTool";

export const metadata: Metadata = {
  title: "Compare Gig Apps | GigWorldToday",
  description:
    "Compare Uber, DoorDash, Spark, Instacart and more before signing up.",
};

export default function ComparePage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">
          Compare Gig Platforms
        </h1>
        <p className="text-gray-600 mb-8">
          See how platforms stack up before you sign up.
        </p>

        <CompareTool />
      </div>
    </div>
  );
}