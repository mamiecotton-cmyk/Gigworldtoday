"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";

const STORAGE_KEY = "gwt_tracker_banner_dismissed";

export default function HomepageTrackerBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const dismissed = localStorage.getItem(STORAGE_KEY);
      if (!dismissed) setVisible(true);
    } catch {
      setVisible(true);
    }
  }, []);

  const dismiss = () => {
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {}
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="bg-gradient-to-r from-[#1A1A2E] via-[#0f3460] to-[#1A1A2E] text-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <span className="hidden sm:inline-block bg-[#00C9B1] text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded">
            New
          </span>
          <p className="text-sm sm:text-base font-medium truncate">
            <span className="hidden sm:inline">Free Earnings Tracker — </span>
            Track DoorDash, Uber, Instacart, Lyft, Spark + 70 more
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Link
            href="/tracker"
            className="px-3 sm:px-4 py-1.5 sm:py-2 bg-[#00C9B1] hover:bg-[#00b5a0] hover:-translate-y-0.5 active:scale-95 transition-all rounded-lg text-xs sm:text-sm font-bold whitespace-nowrap"
          >
            Try it free →
          </Link>
          <button
            onClick={dismiss}
            aria-label="Dismiss banner"
            className="text-white/60 hover:text-white p-1 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
