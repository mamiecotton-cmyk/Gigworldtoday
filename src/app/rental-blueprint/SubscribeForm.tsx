"use client";

import { useState } from "react";

export default function SubscribeForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setStatus("done");
        setMessage("You're in! Check your inbox for a welcome email.");
      } else if (res.status === 409) {
        setStatus("done");
        setMessage("You're already on the list. Welcome back!");
      } else {
        setStatus("error");
        setMessage("Something went wrong. Please try again.");
      }
    } catch {
      setStatus("error");
      setMessage("Something went wrong. Please try again.");
    }
  };

  if (status === "done") {
    return <p className="text-green-700 font-semibold">{message}</p>;
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col sm:flex-row gap-3">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Your email"
        className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5"
      />
      <button
        type="submit"
        disabled={status === "loading"}
        className="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-5 py-2.5 rounded-lg disabled:opacity-60"
      >
        {status === "loading" ? "Joining..." : "Get Weekly Gig Tips"}
      </button>
      {status === "error" && <p className="text-red-600 text-sm">{message}</p>}
    </form>
  );
}
