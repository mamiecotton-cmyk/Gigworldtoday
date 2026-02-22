"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function AuthForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
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
      if (error) setMessage(error.message);
      else setMessage("Check your email to confirm signup.");
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
