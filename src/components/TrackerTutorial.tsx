"use client";

import { useState } from "react";

const steps = [
  {
    number: 1,
    title: "Pick your platform",
    description:
      "Tap the platform you drove for — DoorDash, Uber, Expedite, or any of 70+ others. Then choose to upload a screenshot or enter manually.",
    image: "/tracker/step-1.jpg",
    callout: {
      text: "Tap any platform chip",
      position: "top-[38%] left-[2%]",
      arrowDir: "right",
    },
    accent: "#00C9B1",
  },
  {
    number: 2,
    title: "Upload your earnings screenshot",
    description:
      "Take a screenshot from any gig platform app — weekly summary, order receipt, or pay statement. Our system reads it automatically.",
    image: "/tracker/step-2.jpg",
    callout: {
      text: "AI reads your screenshot",
      position: "top-[34%] left-[2%]",
      arrowDir: "right",
    },
    accent: "#F97316",
  },
  {
    number: 3,
    title: "Review & save",
    description:
      "We pre-fill base pay, tips, bonuses, and state adjustments. Review the numbers, make any changes, then hit Save.",
    image: "/tracker/step-3.jpg",
    callout: {
      text: "Numbers extracted automatically",
      position: "top-[30%] left-[2%]",
      arrowDir: "right",
    },
    accent: "#1A1A2E",
  },
  {
    number: 4,
    title: "See your real earnings",
    description:
      "Your dashboard shows total earnings by week, month, or year — broken down by platform. Plus tax estimates and take-home pay.",
    image: "/tracker/step-4.jpg",
    callout: {
      text: "All platforms, one view",
      position: "top-[40%] left-[2%]",
      arrowDir: "right",
    },
    accent: "#00C9B1",
  },
];

export default function TrackerTutorial() {
  const [current, setCurrent] = useState(0);
  const step = steps[current];

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Step pills */}
      <div className="flex items-center justify-center gap-2 mb-10">
        {steps.map((s, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
              i === current
                ? "bg-[#1A1A2E] text-white shadow-lg scale-105"
                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            }`}
          >
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                i === current ? "bg-[#00C9B1] text-white" : "bg-gray-300 text-gray-600"
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
        {/* Phone mockup with screenshot */}
        <div className="relative flex justify-center">
          {/* Phone frame */}
          <div className="relative w-[260px] sm:w-[300px]">
            {/* Phone outer shell */}
            <div
              className="relative rounded-[40px] p-3 shadow-2xl"
              style={{ background: "#1A1A2E" }}
            >
              {/* Notch */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 w-20 h-5 bg-[#1A1A2E] rounded-full z-10" />

              {/* Screen */}
              <div className="rounded-[30px] overflow-hidden bg-white relative">
                <img
                  src={step.image}
                  alt={`Step ${step.number}: ${step.title}`}
                  className="w-full object-cover transition-all duration-500"
                  style={{ maxHeight: "520px", objectPosition: "top" }}
                />
              </div>

              {/* Home indicator */}
              <div className="flex justify-center mt-2">
                <div className="w-20 h-1 bg-white/30 rounded-full" />
              </div>
            </div>

            {/* Callout bubble */}
            <div
              className={`absolute ${step.callout.position} z-20 transition-all duration-300`}
            >
              <div
                className="text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg whitespace-nowrap flex items-center gap-1.5"
                style={{ background: step.accent }}
              >
                <span>👆</span>
                {step.callout.text}
              </div>
            </div>

            {/* Glow under phone */}
            <div
              className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-48 h-8 rounded-full blur-xl opacity-30"
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

          <h3 className="text-2xl sm:text-3xl font-bold text-[#1A1A2E] mb-4">
            {step.title}
          </h3>

          <p className="text-base text-gray-600 leading-relaxed mb-8">
            {step.description}
          </p>

          {/* Navigation */}
          <div className="flex items-center gap-4 justify-center md:justify-start">
            <button
              onClick={() => setCurrent((c) => Math.max(0, c - 1))}
              disabled={current === 0}
              className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 active:scale-95 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
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
                className={`rounded-full transition-all ${
                  i === current
                    ? "w-6 h-2.5"
                    : "w-2.5 h-2.5 bg-gray-200 hover:bg-gray-300"
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
