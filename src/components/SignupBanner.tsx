"use client";
import React, { useState } from "react";

interface SignupBannerProps {
  headline: string;
  subtext?: string;
  buttonText?: string;
  variant?: "default" | "compact" | "inline";
}

export default function SignupBanner({
  headline,
  subtext,
  buttonText = "Get Early Access",
  variant = "default",
}: SignupBannerProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus("loading");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      if (res.ok) {
        setStatus("success");
        setMessage("You're in! Check your inbox.");
        setEmail("");
      } else {
        const data = await res.json();
        setStatus("error");
        setMessage(data.error || "Something went wrong.");
      }
    } catch {
      setStatus("error");
      setMessage("Network error. Please try again.");
    }
  };

  // Inline variant - thin bar
  if (variant === "inline") {
    return (
      <div className="bg-slate-100 border border-slate-200 rounded-lg py-2 px-3 mt-6">
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2">
          <span className="text-slate-800 font-semibold text-sm">{headline}</span>
          {subtext && <span className="text-slate-600 text-xs hidden sm:inline">{subtext}</span>}
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <input
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="px-3 py-1.5 rounded-md text-sm text-gray-800 placeholder-gray-400 outline-none border border-slate-300 bg-white focus:ring-1 focus:ring-teal-500 w-40"
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="px-4 py-1.5 rounded-md bg-gradient-to-r from-teal-500 to-emerald-500 text-white text-sm font-bold hover:opacity-90 transition disabled:opacity-60"
            >
              {status === "loading" ? "…" : buttonText}
            </button>
          </form>
          {message && (
            <span className={`text-xs ${status === "success" ? "text-teal-600" : "text-red-500"}`}>{message}</span>
          )}
        </div>
      </div>
    );
  }

  // Compact variant - smaller section
  if (variant === "compact") {
    return (
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-6 mt-10">
        <div className="text-center">
          <h3 className="text-lg font-bold text-white mb-1">{headline}</h3>
          {subtext && <p className="text-slate-400 text-sm mb-4">{subtext}</p>}
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center justify-center gap-2 max-w-sm mx-auto">
            <input
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full sm:flex-1 px-3 py-2 rounded-lg text-sm text-gray-800 placeholder-gray-400 outline-none border border-slate-600 bg-white focus:ring-2 focus:ring-teal-500"
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full sm:w-auto px-4 py-2 rounded-lg bg-gradient-to-r from-teal-500 to-emerald-500 text-white text-sm font-semibold hover:opacity-90 transition disabled:opacity-60"
            >
              {status === "loading" ? "…" : buttonText}
            </button>
          </form>
          {message && (
            <p className={`mt-3 text-xs ${status === "success" ? "text-teal-400" : "text-red-400"}`}>{message}</p>
          )}
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 mt-8">
      <div className="text-center">
        <h3 className="text-lg font-bold text-slate-900 mb-1">{headline}</h3>
        {subtext && <p className="text-slate-600 text-sm mb-4">{subtext}</p>}
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center justify-center gap-2 max-w-sm mx-auto">
          <input
            type="email"
            required
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full sm:flex-1 px-3 py-2 rounded-lg text-sm text-gray-800 placeholder-gray-400 outline-none border border-slate-300 bg-white focus:ring-2 focus:ring-teal-500"
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full sm:w-auto px-4 py-2 rounded-lg bg-gradient-to-r from-teal-500 to-emerald-500 text-white text-sm font-semibold hover:opacity-90 transition disabled:opacity-60"
          >
            {status === "loading" ? "…" : buttonText}
          </button>
        </form>
        {message && (
          <p className={`mt-3 text-xs ${status === "success" ? "text-teal-600" : "text-red-500"}`}>{message}</p>
        )}
      </div>
    </div>
  );
}
