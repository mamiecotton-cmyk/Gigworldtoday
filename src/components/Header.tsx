"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from 'next/link';
import { Menu } from 'lucide-react';

export default function Header() {
  const [user, setUser] = useState<any>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setOpen(false);
  };
  return (
    <header className="fixed top-0 left-0 w-full z-40 bg-gradient-to-b from-black/50 to-transparent">
      <nav className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo/Home link */}
          <Link href="/" className="flex items-center gap-2">
            <img src="/logos/logo-dark.svg" alt="Gig World Today" className="h-10 w-auto" />
            <span className="sr-only">Home</span>
          </Link>
          <div className="hidden md:flex items-center gap-1">
            <Link href="/platforms" className="px-4 py-2 text-white/80 hover:text-white text-sm font-medium rounded-lg hover:bg-white/10 transition-all">Browse Platforms</Link>
            <Link href="/categories" className="px-4 py-2 text-white/80 hover:text-white text-sm font-medium rounded-lg hover:bg-white/10 transition-all">Categories</Link>
            <Link href="/compare" className="px-4 py-2 text-white/80 hover:text-white text-sm font-medium rounded-lg hover:bg-emerald-600/10 transition-all">Compare</Link>
            <Link href="/about" className="hover:underline px-4 py-2 text-white/80 hover:text-white text-sm font-medium rounded-lg hover:bg-white/10 transition-all">About</Link>
            <div className="w-px h-6 bg-white/20 mx-2" />
            <div className="relative">
              {user ? (
                <>
                  <button
                    onClick={() => setOpen(!open)}
                    className="px-4 py-2 rounded-xl border text-sm font-semibold hover:bg-gray-100 transition-all"
                  >
                    Account ▾
                  </button>

                  {open && (
                    <div className="absolute right-0 mt-2 w-40 bg-white border rounded-xl shadow-lg">
                      <Link
                        href="/admin"
                        className="block px-4 py-2 text-sm hover:bg-gray-100"
                        onClick={() => setOpen(false)}
                      >
                        Dashboard
                      </Link>

                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <Link
                  href="/login"
                  className="px-4 py-2 rounded-xl border text-sm font-semibold hover:bg-gray-100 transition-all"
                >
                  Sign In
                </Link>
              )}
            </div>
            <Link
              href="/blog"
              className="px-5 py-2.5 rounded-xl bg-[#00C9B1] text-white text-sm font-semibold shadow-lg shadow-[#00C9B1]/25 hover:shadow-[#00C9B1]/40 hover:bg-[#00b5a0] transition-all hover:-translate-y-0.5"
            >
              Blog
            </Link>
          </div>
          <div className="md:hidden">
            <button className="text-white/80 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-all">
              <Menu size={24} />
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
}
