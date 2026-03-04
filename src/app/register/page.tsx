"use client";

import { Suspense } from "react";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

function AuthContent() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(false);
  const [optInNewsletter, setOptInNewsletter] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError("");
    setSuccess("");
    setLoading(true);

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      router.push("/");
      return;
    }

    // Register
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
          <h1 className="text-2xl font-bold">
            {isLogin ? "Sign In" : "Create Your Account"}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {isLogin
              ? "Welcome back to GigWorldToday"
              : "Join the GigWorldToday community"}
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

          {!isLogin && (
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
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition disabled:opacity-50"
          >
            {loading
              ? isLogin
                ? "Signing In…"
                : "Creating Account…"
              : isLogin
              ? "Sign In"
              : "Create Account"}
          </button>
        </div>

        <p className="text-center text-sm text-gray-500">
          {isLogin ? (
            <>
              Don&apos;t have an account?{" "}
              <button
                onClick={() => { setIsLogin(false); setError(""); setSuccess(""); }}
                className="text-orange-700 font-medium hover:underline"
              >
                Register
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                onClick={() => { setIsLogin(true); setError(""); setSuccess(""); }}
                className="text-orange-700 font-medium hover:underline"
              >
                Sign In
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthContent />
    </Suspense>
  );
}
