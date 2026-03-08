"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

const ADMIN_EMAILS = ["mamie@gigworldtoday.com", "mamie.cotton@gmail.com"]; // add more later

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session && ADMIN_EMAILS.includes(session.user.email || "")) {
        setAuthorized(true);
      } else {
        router.replace("/");
      }
      setChecking(false);
    });
  }, [router]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading…</p>
      </div>
    );
  }

  if (!authorized) return null;

  return <>{children}</>;
}

