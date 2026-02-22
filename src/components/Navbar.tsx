"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

export default function Navbar() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });
  }, []);

  return (
    <nav className="flex justify-between items-center px-6 py-4 border-b">
      <Link href="/" className="font-bold text-xl">
        GigWorldToday
      </Link>

      <div className="flex gap-6 items-center">
        <Link href="/compare">Compare</Link>
        <Link href="/blog">Blog</Link>
        <Link href="/about">About</Link>

        {user ? (
          <Link
            href="/admin"
            className="px-4 py-2 bg-black text-white rounded"
          >
            Account
          </Link>
        ) : (
          <Link
            href="/login"
            className="px-4 py-2 bg-black text-white rounded"
          >
            Sign In
          </Link>
        )}
      </div>
    </nav>
  );
}
