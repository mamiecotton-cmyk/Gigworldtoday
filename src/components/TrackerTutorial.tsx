"use client";

import { useState } from "react";

const steps = [
  {
    number: 1,
    title: "Add your platforms",
    description:
      "When you first sign up, search for the platforms you drive for and add them. You can always add more later — we support 70+ gig platforms.",
    image: "/tracker/step-1.jpg",
    callout: { text: "Search & add platforms", position: "top-[24%] -left-2" },
    accent: "#00C9B1",
  },
  {
    number: 2,
    title: "Select your platform",
    description:
      "Tap the platform you drove for from your saved chips. Then choose to upload a screenshot or enter earnings manually.",
    image: "/tracker/step-2.jpg",
    callout: { text: "Tap a platform chip", position: "top-[36%] -left-2" },
    accent: "#F97316",
  },
  {
    number: 3,
    title: "Upload your screenshot",
    description:
      "Take a screenshot from any gig platform app — weekly summary, order receipt, or pay statement. Our AI reads it automatically.",
    image: "/tracker/step-3.jpg",
    callout: { text: "AI reading screenshot", position: "top-[36%] -left-2" },
    accent: "#1A1A2E",
  },
  {
    number: 4,
    title: "Review & save",
    description:
      "We pre-fill base pay, tips, bonuses, and state adjustments automatically. Review the numbers, make any edits, then hit Save.",
    image: "/tracker/step-4.jpg",
    callout: { text: "Numbers auto-extracted", position: "top-[28%] -left-2" },
    accent: "#00C9B1",
  },
  {
    number: 5,
    title: "See your weekly earnings",
    description:
      "Your dashboard shows total earnings broken down by base pay, tips, and bonuses — plus tax estimates and estimated take-home pay.",
    image: "/tracker/step-5.jpg",
    callout: { text: "Tax + take-home calculated", position: "top-[42%] -left-2" },
    accent: "#F97316",
  },
  {
    number: 6,
    title: "Compare by platform",
    description:
      "See which platforms pay you the most. Tap any platform row to drill into individual entries, edit amounts, or delete entries.",
    image: "/tracker/step-6.jpg",
    callout: { text: "Tap to drill down", position: "top-[72%] -left-2" },
    accent: "#1A1A2E",
  },
];

export default function TrackerTutorial() {
  const [current, setCurrent] = useState(0);
  const step = steps[current];

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Step pills */}
      <div className="flex items-center justify-center gap-2 mb-10 flex-wrap">
        {steps.map((s, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`flex items-center gap-2 px-3 py-2 rounded-full text-xs font-semibold transition-all ${
              i === current
                ? "bg-[#00C9B1] text-white shadow-lg scale-105"
                : "bg-white/10 text-white/60 hover:bg-white/20"
            }`}
          >
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${
                i === current ? "bg-white text-[#00C9B1]" : "bg-white/20 text-white/60"
              }`}
            >
              {s.number}
            </span>
            <span className="hidden sm:inline">{s.title}</span>
          </button>
        ))}
      </div>

      {/* Main content */}
      <div className="grid md:grid-cols-2 gap-10 items-center">
        {/* Phone mockup */}
        <div className="relative flex justify-center">
          <div className="relative w-[260px] sm:w-[300px]">
            <div className="relative rounded-[40px] p-3 shadow-2xl" style={{ background: "#1A1A2E" }}>
              <div className="absolute top-4 left-1/2 -translate-x-1/2 w-20 h-5 bg-[#1A1A2E] rounded-full z-10" />
              <div className="rounded-[30px] overflow-hidden bg-white">
                <img
                  key={step.image}
                  src={step.image}
                  alt={`Step ${step.number}: ${step.title}`}
                  className="w-full object-cover transition-all duration-500"
                  style={{ maxHeight: "520px", objectPosition: "top" }}
                />
              </div>
              <div className="flex justify-center mt-2">
                <div className="w-20 h-1 bg-white/30 rounded-full" />
              </div>
            </div>

            {/* Callout */}
            <div className={`absolute ${step.callout.position} z-20`}>
              <div
                className="text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg whitespace-nowrap flex items-center gap-1.5"
                style={{ background: step.accent }}
              >
                <span>👆</span>
                {step.callout.text}
              </div>
            </div>

            {/* Glow */}
            <div
              className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-48 h-8 rounded-full blur-xl opacity-30 transition-all duration-500"
              style={{ background: step.accent }}
            />
          </div>
        </div>

        {/* Step info */}
        <div className="text-center md:text-left px-4 md:px-0">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-white text-xs font-bold mb-4"
            style={{ background: step.accent }}
          >
            Step {step.number} of {steps.length}
          </div>

          <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            {step.title}
          </h3>

          <p className="text-base text-white/70 leading-relaxed mb-8">
            {step.description}
          </p>

          <div className="flex items-center gap-4 justify-center md:justify-start">
            <button
              onClick={() => setCurrent((c) => Math.max(0, c - 1))}
              disabled={current === 0}
              className="px-5 py-2.5 rounded-xl border border-white/20 text-sm font-semibold text-white/70 hover:bg-white/10 active:scale-95 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              ← Back
            </button>

            {current < steps.length - 1 ? (
              <button
                onClick={() => setCurrent((c) => c + 1)}
                className="px-6 py-2.5 rounded-xl text-white text-sm font-bold hover:opacity-90 hover:-translate-y-0.5 active:scale-95 transition-all shadow-lg"
                style={{ background: step.accent }}
              >
                Next →
              </button>
            ) : (
              <a
                href="/dashboard/earnings"
                className="px-6 py-2.5 rounded-xl text-white text-sm font-bold hover:opacity-90 hover:-translate-y-0.5 active:scale-95 transition-all shadow-lg"
                style={{ background: "#00C9B1" }}
              >
                Start tracking free →
              </a>
            )}
          </div>

          {/* Dot indicators */}
          <div className="flex items-center gap-2 mt-6 justify-center md:justify-start">
            {steps.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`rounded-full transition-all duration-300 ${
                  i === current ? "w-6 h-2.5" : "w-2.5 h-2.5 bg-white/20 hover:bg-white/30"
                }`}
                style={i === current ? { background: step.accent } : {}}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
