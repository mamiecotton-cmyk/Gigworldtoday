"use client";

import { Suspense } from "react";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

/* ── SVG Icons ─────────────────────────────────────── */

function GoogleIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

// Facebook removed — keep only Google OAuth

function AuthContent() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(false);
  const [optInNewsletter, setOptInNewsletter] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleOAuth = async (provider: "google") => {
    setError("");
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) setError(error.message);
  };

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

        {/* Social login buttons */}
        <div className="space-y-3">
          <button
            onClick={() => handleOAuth("google")}
            className="w-full flex items-center justify-center gap-3 border border-gray-300 bg-white text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 transition"
          >
            <GoogleIcon />
            Continue with Google
          </button>

          {/* Facebook sign-in removed */}
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs text-gray-400 uppercase tracking-wide">or continue with email</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

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
