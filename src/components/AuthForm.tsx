"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function AuthForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [optInNewsletter, setOptInNewsletter] = useState(true);
  const [message, setMessage] = useState("");

  const handleAuth = async () => {
    setMessage("");

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) setMessage(error.message);
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) {
        setMessage(error.message);
      } else {
        // If user opted in, subscribe them to the newsletter (triggers welcome email)
        if (optInNewsletter) {
          try {
            await fetch("/api/subscribe", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email }),
            });
          } catch {
            // Don't block signup if newsletter subscribe fails
          }
        }
        setMessage("Check your email to confirm signup.");
      }
    }
  };

  return (
    <div className="border p-6 rounded-xl max-w-md mx-auto space-y-4">
      <h2 className="text-xl font-semibold">
        {isLogin ? "Login" : "Sign Up"}
      </h2>

      <input
        className="border p-2 w-full rounded"
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        className="border p-2 w-full rounded"
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      {!isLogin && (
        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={optInNewsletter}
            onChange={(e) => setOptInNewsletter(e.target.checked)}
            className="w-4 h-4 accent-black rounded"
          />
          Subscribe to the GigWorldToday weekly newsletter
        </label>
      )}

      <button
        onClick={handleAuth}
        className="bg-black text-white px-4 py-2 rounded w-full"
      >
        {isLogin ? "Login" : "Create Account"}
      </button>

      <button
        onClick={() => setIsLogin(!isLogin)}
        className="text-sm text-gray-600 underline"
      >
        {isLogin
          ? "Need an account? Sign up"
          : "Already have an account? Login"}
      </button>

      {message && (
        <p className="text-sm text-red-500">{message}</p>
      )}
    </div>
  );
}
