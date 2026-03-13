"use client";

import React, { useEffect, useRef, useState } from "react";

export default function ExitSurvey() {
  const [visible, setVisible] = useState(false);
  const [rideIn, setRideIn] = useState(false);
  const [showCard, setShowCard] = useState(false);
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
        // Stagger: ride in first, then show card
        setTimeout(() => setRideIn(true), 100);
        setTimeout(() => setShowCard(true), 1200);
      } catch {}
    }, 120000);

    return () => clearTimeout(t);
  }, []);

  const close = () => {
    setShowCard(false);
    setTimeout(() => setRideIn(false), 200);
    setTimeout(() => setVisible(false), 800);
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

  const stepEmojis: Record<number, string> = {
    1: "👋",
    2: "🎯",
    3: "💡",
    4: "🚀",
  };
  
  const dots = (
    <div className="flex justify-center gap-1.5 mt-4 pt-3 border-t border-gray-100">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className={`rounded-full transition-all duration-500 ${
            i === step
              ? "w-5 h-2 bg-gradient-to-r from-teal-400 to-teal-500"
              : i < step
              ? "w-2 h-2 bg-teal-300"
              : "w-2 h-2 bg-gray-200"
          }`}
        />
      ))}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-500 ${
          rideIn ? "opacity-100" : "opacity-0"
        }`}
        onClick={close}
      />

      {/* Container — avatar + card */}
      <div className="relative flex items-end">

        {/* Avatar riding in from right */}
        <div
          className="hidden sm:block flex-shrink-0 z-10"
          style={{
            transform: rideIn ? "translateX(0)" : "translateX(600px)",
            opacity: rideIn ? 1 : 0,
            transition: "transform 1s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.4s ease",
          }}
        >
          {/* Bounce animation after ride-in */}
          <div
            className={rideIn ? "animate-[subtleBounce_2.5s_ease-in-out_infinite_1.5s]" : ""}
          >
            <img
              src="/gigsidekick-avatar.png"
              alt="GigSidekick"
              className="h-64 w-auto object-contain drop-shadow-2xl -mr-6 mb-1"
            />
          </div>
        </div>

        {/* Speech bubble card */}
        <div
          className="relative z-20"
          style={{
            transform: showCard ? "translateX(0) scale(1)" : "translateX(80px) scale(0.9)",
            opacity: showCard ? 1 : 0,
            transition: "transform 0.6s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.4s ease",
          }}
        >
          {/* Speech bubble tail — points toward avatar */}
          <div className="hidden sm:block absolute -left-2 bottom-12 w-4 h-4 bg-white border-l border-b border-gray-200 rotate-45 z-0" />

          <div className="relative bg-white rounded-2xl border border-gray-200 shadow-2xl w-[320px] overflow-hidden">
            {/* Gradient top accent */}
            <div className="h-1.5 bg-gradient-to-r from-teal-400 via-[#00C9B1] to-orange-400" />

            <div className="p-5">
              {/* Close button */}
              <button
                onClick={close}
                className="absolute top-3.5 right-3 w-6 h-6 rounded-full bg-gray-100 hover:bg-red-50 hover:text-red-500 text-gray-400 flex items-center justify-center text-xs transition-all"
              >
                ✕
              </button>

              {/* Mobile avatar */}
              <div className="sm:hidden flex justify-center mb-3">
                <img
                  src="/gigsidekick-avatar.png"
                  alt="GigSidekick"
                  className="h-20 w-auto object-contain drop-shadow-lg"
                />
              </div>

              {/* Step heading */}
              <div className="flex items-center gap-2 mb-1">
                <span className="text-base">{stepEmojis[step]}</span>
                <p className="text-[10px] font-bold text-[#00C9B1] uppercase tracking-widest">
                  GigSidekick
                </p>
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-3 leading-snug">
                {stepLabels[step]}
              </h3>

              {/* Step 1: Did we help? */}
              {step === 1 && (
                <div>
                  <p className="text-xs text-gray-500 mb-3">
                    Did GigWorldToday help you discover a new gig platform today?
                  </p>
                  <div className="flex flex-col gap-2">
                    {([
                      { val: "Yes" as const, icon: "👍", label: "Yes, it did!" },
                      { val: "Still exploring" as const, icon: "👀", label: "Still exploring" },
                      { val: "Not yet" as const, icon: "🤔", label: "Not yet" },
                    ]).map((opt) => (
                      <button
                        key={opt.val}
                        onClick={() => {
                          setAnswer(opt.val);
                          setTimeout(nextStep, 350);
                        }}
                        className={`w-full text-left px-3.5 py-2.5 rounded-xl border text-sm font-medium transition-all duration-200 ${
                          answer === opt.val
                            ? "bg-gradient-to-r from-teal-500 to-[#00C9B1] text-white border-transparent shadow-md shadow-teal-500/20"
                            : "bg-gray-50 text-gray-700 border-gray-200 hover:border-[#00C9B1] hover:bg-teal-50/50 hover:shadow-sm"
                        }`}
                      >
                        <span className="mr-2">{opt.icon}</span>{opt.label}
                      </button>
                    ))}
                  </div>
                  {dots}
                </div>
              )}

              {/* Step 2: Gig type */}
              {step === 2 && (
                <div>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: "Food delivery", icon: "🍔" },
                      { label: "Grocery delivery", icon: "🛒" },
                      { label: "Mystery shopping", icon: "🕵️" },
                      { label: "Task apps", icon: "🔧" },
                      { label: "Remote gigs", icon: "💻" },
                      { label: "Other", icon: "✨" },
                    ].map((g) => (
                      <button
                        key={g.label}
                        onClick={() => {
                          setGigType(g.label);
                          setTimeout(nextStep, 350);
                        }}
                        className={`px-3 py-2.5 rounded-xl border text-xs font-medium transition-all duration-200 text-center ${
                          gigType === g.label
                            ? "bg-gray-900 text-white border-gray-900 shadow-md"
                            : "bg-gray-50 text-gray-700 border-gray-200 hover:border-gray-400 hover:bg-gray-100 hover:shadow-sm"
                        }`}
                      >
                        <span className="block text-base mb-0.5">{g.icon}</span>
                        {g.label}
                      </button>
                    ))}
                  </div>
                  {dots}
                </div>
              )}

              {/* Step 3: Suggestions */}
              {step === 3 && (
                <div>
                  <textarea
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    placeholder="What would make the site more useful for you?"
                    className="w-full border border-gray-200 rounded-xl p-3 text-sm min-h-[80px] focus:border-[#00C9B1] focus:ring-2 focus:ring-[#00C9B1]/20 outline-none transition-all resize-none bg-gray-50"
                  />
                  <div className="flex justify-between items-center mt-3">
                    <button
                      onClick={nextStep}
                      className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      Skip this
                    </button>
                    <button
                      disabled={submitting}
                      onClick={submitFeedback}
                      className="px-5 py-2 text-xs font-bold bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl transition-all shadow-md shadow-orange-500/20 hover:shadow-lg hover:shadow-orange-500/30 disabled:opacity-50"
                    >
                      {submitting ? "Sending..." : "Submit →"}
                    </button>
                  </div>
                  {dots}
                </div>
              )}

              {/* Step 4: Email */}
              {step === 4 && (
                <div>
                  <p className="text-xs text-gray-500 mb-3 leading-relaxed">
                    Be the first to know about new platforms and open waitlists before other drivers find them.
                  </p>
                  {thanks ? (
                    <div className="flex items-center gap-2 py-3 px-4 bg-green-50 rounded-xl border border-green-200">
                      <span className="text-green-500 text-lg">✓</span>
                      <p className="text-sm font-semibold text-green-700">{thanks}</p>
                    </div>
                  ) : (
                    <>
                      <input
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        type="email"
                        placeholder="you@email.com"
                        className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:border-[#00C9B1] focus:ring-2 focus:ring-[#00C9B1]/20 outline-none transition-all bg-gray-50"
                      />
                      <div className="flex justify-between items-center mt-3">
                        <button
                          onClick={close}
                          className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          No thanks
                        </button>
                        <button
                          disabled={submitting}
                          onClick={submitEmail}
                          className="px-5 py-2 text-xs font-bold bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl transition-all shadow-md shadow-orange-500/20 hover:shadow-lg hover:shadow-orange-500/30 disabled:opacity-50"
                        >
                          {submitting ? "Joining..." : "Subscribe →"}
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
      </div>

      {/* Keyframes for subtle bounce */}
      <style jsx>{`
        @keyframes subtleBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  );
}