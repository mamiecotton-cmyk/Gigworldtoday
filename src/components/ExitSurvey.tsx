"use client";

import React, { useEffect, useRef, useState } from "react";

export default function ExitSurvey() {
  const [visible, setVisible] = useState(false);
  const [entered, setEntered] = useState(false);
  const [step, setStep] = useState(1);
  const sessionIdRef = useRef<string>("");
  const shownKey = "gwt_exit_survey_shown_session";

  // Step 1
  const [answer, setAnswer] = useState<"Yes" | "Not yet" | "Still exploring" | "">("");
  // Step 2
  const [gigType, setGigType] = useState<string>("");
  // Step 3
  const [feedbackText, setFeedbackText] = useState("");
  // Step 4
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [thanks, setThanks] = useState("");

  useEffect(() => {
    let sid = sessionStorage.getItem("gwt_session_id");
    if (!sid) {
      sid = Math.random().toString(36).slice(2);
      sessionStorage.setItem("gwt_session_id", sid);
    }
    sessionIdRef.current = sid;

    const t = setTimeout(() => {
      try {
        const lastShown = localStorage.getItem(shownKey);
        if (lastShown === sessionIdRef.current) return;
        setVisible(true);
        localStorage.setItem(shownKey, sessionIdRef.current);
        setTimeout(() => setEntered(true), 50);
      } catch {}
    }, 120000);

    return () => clearTimeout(t);
  }, []);

  const close = () => {
    setEntered(false);
    setTimeout(() => setVisible(false), 300);
  };

  const nextStep = () => setStep((s) => s + 1);

  const submitFeedback = async () => {
    setSubmitting(true);
    try {
      await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answer, gig_type: gigType, feedback: feedbackText }),
      });
    } catch {}
    setSubmitting(false);
    setStep(4);
  };

  const submitEmail = async () => {
    if (!email) return;
    setSubmitting(true);
    try {
      await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setThanks("You're in! Check your inbox.");
    } catch {
      setThanks("Thanks — we'll be in touch.");
    }
    setSubmitting(false);
    setTimeout(() => {
      close();
      setStep(1);
      setThanks("");
    }, 1400);
  };

  if (!visible) return null;

  const stepLabels: Record<number, string> = {
    1: "Hey! Quick question...",
    2: "What interests you most?",
    3: "Help us improve!",
    4: "Stay ahead of the game",
  };

  const dots = (
    <div className="flex justify-center gap-1.5 mt-3">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className={`h-1.5 rounded-full transition-all duration-300 ${
            i === step ? "w-4 bg-[#00C9B1]" : "w-1.5 bg-gray-200"
          }`}
        />
      ))}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={close}
      />

      <div
        className={`relative flex items-end gap-0 transition-all duration-500 ${
          entered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        {/* Avatar — slides in from left */}
        <div
          className={`hidden sm:block flex-shrink-0 transition-all duration-700 ${
            entered ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-12"
          }`}
        >
          <img
            src="/gigsidekick-avatar.png"
            alt="GigSidekick"
            className="h-48 w-auto object-contain drop-shadow-lg -mr-4 mb-2"
          />
        </div>

        {/* Speech bubble card */}
        <div
          className={`relative bg-white rounded-2xl border border-gray-200 shadow-md transition-all duration-500 p-5 w-[300px] overflow-hidden ${
            entered ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"
          }`}
        >
          {/* Teal top accent */}
          <div className="absolute top-0 left-4 right-4 h-[3px] rounded-b-full bg-gradient-to-r from-teal-400 to-teal-500" />

          {/* Close button */}
          <button
            onClick={close}
            className="absolute top-2 right-2 w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center text-xs transition-colors"
          >
            ✕
          </button>

          {/* Mobile avatar */}
          <div className="sm:hidden flex justify-center mb-2">
            <img
              src="/gigsidekick-avatar.png"
              alt="GigSidekick"
              className="h-16 w-auto object-contain"
            />
          </div>

          {/* Step heading */}
          <p className="text-xs font-bold text-[#00C9B1] uppercase tracking-wide mb-1 mt-1">
            GigSidekick
          </p>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">
            {stepLabels[step]}
          </h3>

          {/* Step 1: Did we help? */}
          {step === 1 && (
            <div className="space-y-2">
              <p className="text-xs text-gray-600 mb-2">
                Did GigWorldToday help you discover a new gig platform today?
              </p>
              <div className="flex flex-col gap-1.5">
                {([
                  { val: "Yes" as const, icon: "👍", label: "Yes!" },
                  { val: "Still exploring" as const, icon: "👀", label: "Still looking" },
                  { val: "Not yet" as const, icon: "❌", label: "Not yet" },
                ]).map((opt) => (
                  <button
                    key={opt.val}
                    onClick={() => {
                      setAnswer(opt.val);
                      setTimeout(nextStep, 300);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg border text-xs font-medium transition-all ${
                      answer === opt.val
                        ? "bg-[#00C9B1] text-white border-[#00C9B1]"
                        : "bg-white text-gray-700 border-gray-200 hover:border-[#00C9B1] hover:bg-teal-50"
                    }`}
                  >
                    {opt.icon} {opt.label}
                  </button>
                ))}
              </div>
              {dots}
            </div>
          )}

          {/* Step 2: Gig type */}
          {step === 2 && (
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  "Food delivery",
                  "Grocery delivery",
                  "Mystery shopping",
                  "Task apps",
                  "Remote gigs",
                  "Other",
                ].map((g) => (
                  <button
                    key={g}
                    onClick={() => {
                      setGigType(g);
                      setTimeout(nextStep, 300);
                    }}
                    className={`px-2 py-2 rounded-lg border text-xs font-medium transition-all ${
                      gigType === g
                        ? "bg-gray-900 text-white border-gray-900"
                        : "bg-white text-gray-700 border-gray-200 hover:border-gray-400 hover:bg-gray-50"
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
              {dots}
            </div>
          )}

          {/* Step 3: Suggestions */}
          {step === 3 && (
            <div className="space-y-2">
              <textarea
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="What would make the site more useful?"
                className="w-full border border-gray-200 rounded-lg p-2 text-xs min-h-[60px] focus:border-[#00C9B1] focus:ring-1 focus:ring-[#00C9B1] outline-none transition-colors"
              />
              <div className="flex justify-between items-center">
                <button onClick={nextStep} className="text-xs text-gray-400 hover:text-gray-600">
                  Skip
                </button>
                <button
                  disabled={submitting}
                  onClick={submitFeedback}
                  className="px-4 py-1.5 text-xs font-semibold bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
                >
                  {submitting ? "Sending..." : "Submit"}
                </button>
              </div>
              {dots}
            </div>
          )}

          {/* Step 4: Email */}
          {step === 4 && (
            <div className="space-y-2">
              <p className="text-xs text-gray-600">
                Get new gig platforms and earning tips before other drivers.
              </p>
              {thanks ? (
                <p className="text-xs font-semibold text-green-600 py-2">{thanks}</p>
              ) : (
                <>
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
                    placeholder="you@email.com"
                    className="w-full border border-gray-200 rounded-lg p-2 text-xs focus:border-[#00C9B1] focus:ring-1 focus:ring-[#00C9B1] outline-none transition-colors"
                  />
                  <div className="flex justify-between items-center">
                    <button onClick={close} className="text-xs text-gray-400 hover:text-gray-600">
                      No thanks
                    </button>
                    <button
                      disabled={submitting}
                      onClick={submitEmail}
                      className="px-4 py-1.5 text-xs font-semibold bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
                    >
                      {submitting ? "Joining..." : "Subscribe"}
                    </button>
                  </div>
                </>
              )}
              {dots}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
