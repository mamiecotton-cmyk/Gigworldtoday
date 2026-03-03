"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { Menu, X } from "lucide-react";

export default function Header() {
  const [user, setUser] = useState<any>(null);
  const [open, setOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === "/";

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

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setOpen(false);
    setMobileMenuOpen(false);
  };

  const headerBg = "bg-white shadow-sm border-b border-gray-100";

  const linkColor = "text-orange-700 hover:text-orange-900 hover:bg-orange-50";

  const dividerColor = "bg-orange-200";

  const accountBorder = "border-orange-300 text-orange-700 hover:bg-orange-50";

  const menuColor = "text-orange-700 hover:text-orange-900 hover:bg-orange-50";

  return (
    <header className={`fixed top-0 left-0 w-full z-50 ${headerBg}`}>
      <nav className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <img
              src="/logos/logo.svg"
              alt="GigWorldToday"
              className="h-14 w-auto"
            />
            <img
              src="/gigsidekick-avatar.png"
              alt=""
              className="h-14 w-auto object-contain ml-2"
            />
            <span className="sr-only">Home</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            <Link
              href="/platforms"
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${linkColor}`}
            >
              Browse Platforms
            </Link>
            <Link
              href="/categories"
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${linkColor}`}
            >
              Categories
            </Link>
            <Link
              href="/compare"
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${linkColor}`}
            >
              Compare
            </Link>
            <Link
              href="/about"
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${linkColor}`}
            >
              About
            </Link>
            <Link
              href="/products"
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${linkColor}`}
            >
              Products
            </Link>

            <div className={`w-px h-6 mx-2 ${dividerColor}`} />

            {/* Account */}
            <div className="relative">
              {user ? (
                <>
                  <button
                    onClick={() => setOpen(!open)}
                    className={`px-4 py-2 rounded-xl border text-sm font-semibold transition-all ${accountBorder}`}
                  >
                    Account ▾
                  </button>

                  {open && (
                    <div className="absolute right-0 mt-2 w-40 bg-white border rounded-xl shadow-lg z-50">
                      <Link
                        href="/admin"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setOpen(false)}
                      >
                        Dashboard
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <Link
                  href="/login"
                  className={`px-4 py-2 rounded-xl border text-sm font-semibold transition-all ${accountBorder}`}
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

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`p-2 rounded-lg transition-all ${menuColor}`}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 pb-4">
            <div className="flex flex-col gap-1 pt-3">
              <Link
                href="/platforms"
                onClick={() => setMobileMenuOpen(false)}
                className={`px-4 py-3 text-sm font-medium rounded-lg transition-all ${linkColor}`}
              >
                Browse Platforms
              </Link>
              <Link
                href="/categories"
                onClick={() => setMobileMenuOpen(false)}
                className={`px-4 py-3 text-sm font-medium rounded-lg transition-all ${linkColor}`}
              >
                Categories
              </Link>
              <Link
                href="/compare"
                onClick={() => setMobileMenuOpen(false)}
                className={`px-4 py-3 text-sm font-medium rounded-lg transition-all ${linkColor}`}
              >
                Compare
              </Link>
              <Link
                href="/about"
                onClick={() => setMobileMenuOpen(false)}
                className={`px-4 py-3 text-sm font-medium rounded-lg transition-all ${linkColor}`}
              >
                About
              </Link>
              <Link
                href="/products"
                onClick={() => setMobileMenuOpen(false)}
                className={`px-4 py-3 text-sm font-medium rounded-lg transition-all ${linkColor}`}
              >
                Products
              </Link>
              <Link
                href="/blog"
                onClick={() => setMobileMenuOpen(false)}
                className={`px-4 py-3 text-sm font-medium rounded-lg transition-all ${linkColor}`}
              >
                Blog
              </Link>

              <div className={`h-px mx-4 my-2 ${dividerColor}`} />

              {user ? (
                <>
                  <Link
                    href="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-4 py-3 text-sm font-medium rounded-lg transition-all ${linkColor}`}
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className={`px-4 py-3 text-left text-sm font-medium rounded-lg transition-all ${linkColor}`}
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="mx-4 mt-2 px-4 py-2.5 rounded-xl border text-center text-sm font-semibold transition-all border-orange-300 text-orange-700 hover:bg-orange-50"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}