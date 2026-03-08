"use client";

import React, { useEffect, useRef, useState } from "react";

export default function ExitSurvey() {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(1);
  const [ready, setReady] = useState(false);
  const sessionIdRef = useRef<string>("");
  const shownKey = "gwt_exit_survey_shown_session";

  // Step 1 fields
  const [answer, setAnswer] = useState<"Yes" | "Not yet" | "Still exploring">("Not yet");
  const [gigType, setGigType] = useState<string>("Food delivery");
  const [feedbackText, setFeedbackText] = useState("");

  // Step 2 fields
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [thanks, setThanks] = useState("");

  useEffect(() => {
    // create a per-tab session id in sessionStorage
    let sid = sessionStorage.getItem("gwt_session_id");
    if (!sid) {
      sid = Math.random().toString(36).slice(2);
      sessionStorage.setItem("gwt_session_id", sid);
    }
    sessionIdRef.current = sid;

    // 20s timer
    const t = setTimeout(() => setReady(true), 20000);

    const onMove = (e: MouseEvent) => {
      try {
        const lastShown = localStorage.getItem(shownKey);
        if (!ready) return;
        if (lastShown === sessionIdRef.current) return; // already shown this session
        // exit intent: mouse near top of viewport
        const y = (e as MouseEvent).clientY || 0;
        if (y <= 60) {
          setVisible(true);
          localStorage.setItem(shownKey, sessionIdRef.current);
        }
      } catch {
        // ignore
      }
    };

    window.addEventListener("mousemove", onMove);

    return () => {
      clearTimeout(t);
      window.removeEventListener("mousemove", onMove);
    };
  }, [ready]);

  const close = () => {
    setVisible(false);
  };

  const submitFeedback = async () => {
    setSubmitting(true);
    try {
      await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answer, gig_type: gigType, feedback: feedbackText }),
      });
    } catch (err) {
      // ignore
    }
    setSubmitting(false);
    setStep(2);
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
      setThanks("Thanks — you’re subscribed!");
    } catch (err) {
      setThanks("Thanks — we'll be in touch.");
    }
    setSubmitting(false);
    setTimeout(() => {
      setVisible(false);
      setStep(1);
      setThanks("");
    }, 1400);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={close}
      />

      <div className="relative w-full mx-4 md:mx-0 flex items-center justify-center">
        <div className="relative bg-white rounded-2xl border border-gray-200 shadow-md hover:shadow-xl hover:shadow-teal-500/10 hover:border-teal-300 transition-all duration-300 p-4 max-w-[340px] w-full overflow-hidden">
          {/* Teal top accent */}
          <div className="absolute top-0 left-4 right-4 h-[3px] rounded-b-full bg-gradient-to-r from-teal-400 to-teal-500" />
          {step === 1 ? (
            <div className="flex flex-col md:flex-row items-center gap-4">
              <img
                src="/images/gigsidekick-avatar.png"
                alt="GigSideKick Assistant"
                className="w-12 h-12 object-contain"
              />

              <div className="flex-1">
                <h3 className="text-sm font-semibold mb-1">Quick question from GigSideKick</h3>
                <p className="text-xs text-gray-600 mb-2">Did GigWorldToday help you discover a new gig platform today?</p>

                <div className="flex gap-2 flex-wrap">
                  <label className={`flex-1 text-center px-2 py-1.5 border rounded-lg cursor-pointer text-xs ${answer==='Yes' ? 'bg-[#00C9B1] text-white' : 'bg-white'}`}>
                    <input className="hidden" name="answer" type="radio" value="Yes" checked={answer==='Yes'} onChange={() => setAnswer('Yes')} />
                    👍 Yes
                  </label>

                  <label className={`flex-1 text-center px-2 py-1.5 border rounded-lg cursor-pointer text-xs ${answer==='Still exploring' ? 'bg-[#00C9B1] text-white' : 'bg-white'}`}>
                    <input className="hidden" name="answer" type="radio" value="Still exploring" checked={answer==='Still exploring'} onChange={() => setAnswer('Still exploring')} />
                    👀 Still looking
                  </label>

                  <label className={`flex-1 text-center px-2 py-1.5 border rounded-lg cursor-pointer text-xs ${answer==='Not yet' ? 'bg-[#00C9B1] text-white' : 'bg-white'}`}>
                    <input className="hidden" name="answer" type="radio" value="Not yet" checked={answer==='Not yet'} onChange={() => setAnswer('Not yet')} />
                    ❌ Not yet
                  </label>
                </div>

                <div className="mt-3">
                  <p className="font-medium text-sm mb-1">What type of gigs are you most interested in?</p>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {[
                      "Food delivery",
                      "Grocery delivery",
                      "Mystery shopping",
                      "Task apps",
                      "Remote gigs",
                      "Other",
                    ].map((g) => (
                      <label key={g} className={`px-2 py-1.5 border rounded-lg cursor-pointer text-xs ${gigType===g? 'bg-gray-900 text-white':'bg-white'}`}>
                        <input className="hidden" name="gigType" type="radio" value={g} checked={gigType===g} onChange={() => setGigType(g)} />
                        {g}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="mt-3">
                  <p className="font-medium text-sm">Any suggestions to make the site more useful?</p>
                  <textarea value={feedbackText} onChange={(e) => setFeedbackText(e.target.value)} placeholder="Your suggestions" className="w-full mt-1 border rounded-md p-2 text-xs min-h-[60px]" />
                </div>

                <div className="flex items-center justify-end gap-3 mt-4">
                  <button onClick={close} className="px-3 py-1.5 text-xs">Skip</button>
                  <button disabled={submitting} onClick={submitFeedback} className="px-3 py-1.5 text-xs font-semibold bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors">{submitting? 'Sending...':'Send Feedback'}</button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col md:flex-row items-center gap-4">
              <img
                src="/images/gigsidekick-avatar.png"
                alt="GigSideKick Assistant"
                className="w-12 h-12 object-contain"
              />

              <div className="flex-1">
                <h3 className="text-sm font-semibold mb-1">Want new gig apps before other drivers find them?</h3>
                <p className="text-xs text-gray-500 mb-2">Each week we send newly discovered gig platforms, earning tips, and tools to help gig workers maximize income.</p>

                <div className="flex gap-2">
                  <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="you@workmail.com" className="flex-1 border rounded-md p-2 text-xs" />
                  <button disabled={submitting} onClick={submitEmail} className="px-3 py-1.5 text-xs font-semibold bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors">{submitting? 'Joining...':'Get Weekly Gig Updates'}</button>
                </div>

                {thanks && <p className="text-sm text-green-700 mt-3">{thanks}</p>}

                <div className="flex items-center justify-end mt-4">
                  <button onClick={close} className="text-sm">Close</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
