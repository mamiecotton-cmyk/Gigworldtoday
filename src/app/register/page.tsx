"use client";

import { Suspense } from "react";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Link from "next/link";

function RegisterContent() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [optInNewsletter, setOptInNewsletter] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    setError("");
    setSuccess("");
    setLoading(true);

    const { error } = await supabase.auth.signUp({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // Subscribe to newsletter if opted in (triggers welcome email)
    if (optInNewsletter) {
      try {
        await fetch("/api/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
      } catch {
        // Don't block registration if newsletter subscribe fails
      }
    }

    setSuccess("Account created! Check your email to confirm your signup.");
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md p-8 bg-white border border-gray-200 rounded-2xl shadow-xl space-y-5">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Create Your Account</h1>
          <p className="text-sm text-gray-500 mt-1">
            Join the GigWorldToday community
          </p>
        </div>

        {error && (
          <p className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-lg p-3">
            {error}
          </p>
        )}

        {success && (
          <p className="text-green-700 text-sm bg-green-50 border border-green-200 rounded-lg p-3">
            {success}
          </p>
        )}

        <div className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <label className="flex items-start gap-2 text-sm text-gray-600 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={optInNewsletter}
              onChange={(e) => setOptInNewsletter(e.target.checked)}
              className="mt-0.5 w-4 h-4 accent-orange-600 rounded"
            />
            <span>
              Subscribe to the <strong>GigWorldToday Weekly Newsletter</strong>{" "}
              — new platforms, gig strategies, and resources for gig workers.
            </span>
          </label>

          <button
            onClick={handleRegister}
            disabled={loading}
            className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition disabled:opacity-50"
          >
            {loading ? "Creating Account…" : "Create Account"}
          </button>
        </div>

        <p className="text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link href="/login" className="text-orange-700 font-medium hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RegisterContent />
    </Suspense>
  );
}
