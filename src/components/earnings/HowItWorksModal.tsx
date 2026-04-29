"use client";

import { useState } from "react";
import { X } from "lucide-react";

const steps = [
  {
    number: 1,
    title: "Select your platform",
    description:
      "Tap the platform you drove for from your saved chips. Then choose to upload a screenshot or enter earnings manually.",
    image: "/tracker/step-2.jpg",
    callout: { text: "Tap a platform chip", position: "top-[36%] -left-2" },
    accent: "#00C9B1",
  },
  {
    number: 2,
    title: "Upload your screenshot",
    description:
      "Take a screenshot from any gig platform app — weekly summary, order receipt, or pay statement. Our AI reads it automatically.",
    image: "/tracker/step-3.jpg",
    callout: { text: "AI reading screenshot", position: "top-[36%] -left-2" },
    accent: "#F97316",
  },
  {
    number: 3,
    title: "Review & save",
    description:
      "We pre-fill base pay, tips, bonuses, and state adjustments automatically. Review the numbers, make any edits, then hit Save.",
    image: "/tracker/step-4.jpg",
    callout: { text: "Numbers auto-extracted", position: "top-[28%] -left-2" },
    accent: "#1A1A2E",
  },
];

export default function HowItWorksModal() {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState(0);
  const step = steps[current];

  const openModal = () => {
    setCurrent(0);
    setOpen(true);
  };

  if (!open) {
    return (
      <button
        onClick={openModal}
        className="text-xs text-gray-400 hover:text-teal-600 transition-colors underline underline-offset-2"
      >
        How it works
      </button>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      onClick={() => setOpen(false)}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <p className="text-sm font-bold text-[#1A1A2E]">How it works</p>
          <button
            onClick={() => setOpen(false)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Phone mockup + content */}
        <div className="p-5">
          <div className="flex gap-5 items-start">
            {/* Mini phone mockup */}
            <div className="flex-shrink-0 relative w-[110px]">
              <div className="relative rounded-[24px] p-2 shadow-lg" style={{ background: "#1A1A2E" }}>
                <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-10 h-3 bg-[#1A1A2E] rounded-full z-10" />
                <div className="rounded-[18px] overflow-hidden bg-white">
                  <img
                    key={step.image}
                    src={step.image}
                    alt={step.title}
                    className="w-full object-cover object-top"
                    style={{ maxHeight: "200px" }}
                  />
                </div>
                <div className="flex justify-center mt-1">
                  <div className="w-8 h-0.5 bg-white/30 rounded-full" />
                </div>
              </div>
              {/* Callout */}
              <div
                className="absolute -bottom-3 left-1/2 -translate-x-1/2 text-white text-[9px] font-bold px-2 py-1 rounded-full shadow whitespace-nowrap"
                style={{ background: step.accent }}
              >
                Step {step.number} of {steps.length}
              </div>
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0">
              <div
                className="inline-block text-white text-[10px] font-bold px-2 py-1 rounded-full mb-2"
                style={{ background: step.accent }}
              >
                Step {step.number} of {steps.length}
              </div>
              <h3 className="text-base font-bold text-[#1A1A2E] mb-2 leading-tight">
                {step.title}
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                {step.description}
              </p>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-5">
            <button
              onClick={() => setCurrent((c) => Math.max(0, c - 1))}
              disabled={current === 0}
              className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 active:scale-95 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              ← Back
            </button>

            {/* Dots */}
            <div className="flex items-center gap-1.5">
              {steps.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`rounded-full transition-all duration-300 ${
                    i === current ? "w-5 h-2" : "w-2 h-2 bg-gray-200"
                  }`}
                  style={i === current ? { background: step.accent } : {}}
                />
              ))}
            </div>

            {current < steps.length - 1 ? (
              <button
                onClick={() => setCurrent((c) => c + 1)}
                className="px-4 py-2 rounded-xl text-white text-xs font-bold active:scale-95 transition-all shadow"
                style={{ background: step.accent }}
              >
                Next →
              </button>
            ) : (
              <button
                onClick={() => setOpen(false)}
                className="px-4 py-2 rounded-xl text-white text-xs font-bold active:scale-95 transition-all shadow"
                style={{ background: "#00C9B1" }}
              >
                Got it ✓
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
