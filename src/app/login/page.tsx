"use client";

import { Suspense } from 'react';
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter, useSearchParams } from "next/navigation";

function LoginContent() {
  const router = useRouter();
  "use client";

  import { Suspense } from 'react';
  import { useState } from "react";
  import { supabase } from "@/lib/supabaseClient";
  import { useRouter, useSearchParams } from "next/navigation";

  function LoginContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleLogin = async () => {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
      } else {
        const redirectTo = searchParams.get("redirectTo") ?? "/admin";
        router.push(redirectTo);
      }
    };

    const handleGoogleLogin = async () => {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) setError(error.message);
    };

    return (
      <div className="min-h-screen flex items-center justify-center py-12">
        <div className="w-full max-w-md p-6 bg-white/90 border border-white/40 rounded-xl shadow-2xl">
          <h1 className="text-2xl font-bold mb-6">Sign In</h1>

          {error && (
            <p className="text-red-500 text-sm mb-4">{error}</p>
          )}

          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-semibold py-2.5 rounded-lg mb-6 transition-all shadow-sm"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400">or sign in with email</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <input
            type="email"
            placeholder="Email"
            className="w-full border p-2 mb-4 rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full border p-2 mb-6 rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            onClick={handleLogin}
            className="w-full bg-[#00C9B1] hover:bg-[#00b5a0] text-white font-semibold py-2.5 rounded-lg transition-all"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  export default function LoginPage() {
    return (
      <Suspense fallback={<div>Loading...</div>}>
        <LoginContent />
      </Suspense>
    );
  }

