"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });
  }, []);

  const navLinks = [
    { href: "/platforms", label: "Browse Platforms" },
    { href: "/categories", label: "Categories" },
    { href: "/compare", label: "Compare" },
    { href: "/about", label: "About" },
    { href: "/products", label: "Products" },
    { href: "/blog", label: "Blog" },
  ];

  return (
    <nav className="relative z-50 flex flex-wrap items-center justify-between border-b bg-white px-6 py-4">
      <Link href="/" className="text-xl font-bold">
        GigWorldToday
      </Link>

      {/* Hamburger Button - visible on mobile */}
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="flex h-10 w-10 items-center justify-center rounded-md text-gray-700 hover:bg-gray-100 md:hidden"
        aria-label="Toggle menu"
      >
        {menuOpen ? (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        )}
      </button>

      {/* Desktop Links */}
      <div className="hidden items-center gap-6 md:flex">
        {navLinks.map((link) => (
          <Link key={link.href} href={link.href} className="text-sm font-medium text-gray-700 hover:text-gray-900">
            {link.label}
          </Link>
        ))}
        {user ? (
          <Link href="/admin" className="rounded bg-black px-4 py-2 text-sm text-white">
            Account
          </Link>
        ) : (
          <Link href="/login" className="rounded bg-black px-4 py-2 text-sm text-white">
            Sign In
          </Link>
        )}
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="mt-4 flex w-full flex-col gap-3 border-t pt-4 md:hidden">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              {link.label}
            </Link>
          ))}
          {user ? (
            <Link
              href="/admin"
              onClick={() => setMenuOpen(false)}
              className="rounded bg-black px-4 py-2 text-center text-sm text-white"
            >
              Account
            </Link>
          ) : (
            <Link
              href="/login"
              onClick={() => setMenuOpen(false)}
              className="rounded bg-black px-4 py-2 text-center text-sm text-white"
            >
              Sign In
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}