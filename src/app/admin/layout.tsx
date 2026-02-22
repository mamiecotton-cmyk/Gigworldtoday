"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAdmin = async () => {
      const { data } = await supabase.auth.getSession();
      const user = data.session?.user;

      if (!user || user.email !== "mamiecotton@gmail.com") {
        router.push("/login");
      } else {
        setLoading(false);
      }
    };

    checkAdmin();
  }, []);

  if (loading) return <div className="p-10">Loading...</div>;

  return <div>{children}</div>;
}
