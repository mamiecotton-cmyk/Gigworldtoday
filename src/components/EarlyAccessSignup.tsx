"use client";
import React, { useState } from "react";

export default function EarlyAccessSignup() {
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
        setMessage("You're in! Check your inbox for confirmation.");
        setEmail("");
      } else {
        const data = await res.json();
        setStatus("error");
        setMessage(data.error || "Something went wrong. Please try again.");
      }
    } catch {
      setStatus("error");
      setMessage("Network error. Please try again.");
    }
  };

  return (
    <section className="bg-slate-900 border-b border-slate-800 py-2">
      <div className="container mx-auto px-4 flex flex-wrap items-center justify-end gap-x-4 gap-y-1 text-sm">
        <div className="flex flex-col items-end sm:flex-row sm:gap-2">
          <span className="text-slate-300 font-medium">Serious about maximizing gig income?</span>
          <span className="text-slate-500 text-xs">Early platform updates & weekly tips.</span>
        </div>
        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-2"
        >
          <input
            type="email"
            required
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="px-3 py-1.5 rounded-md text-sm text-gray-800 placeholder-gray-400 outline-none border border-slate-600 bg-white focus:ring-1 focus:ring-teal-500 w-48"
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="px-3 py-1.5 rounded-md bg-gradient-to-r from-teal-500 to-emerald-500 text-white text-sm font-semibold hover:opacity-90 transition disabled:opacity-60"
          >
            {status === "loading" ? "…" : "Get Early Access"}
          </button>
        </form>
        {message && (
          <span className={status === "success" ? "text-teal-400" : "text-red-400"}>{message}</span>
        )}
      </div>
    </section>
  );
}
