"use client";
import React from "react";

export default function SocialSidebar() {
  const doorDashUrl = "https://dasher.doordash.com/en-us?utm_source=dx_signup_text_cx_home&_gl=1*hm49js*_gcl_au*MTExMDUzMDk4NS4xNzY5NDkxNTE2&_ga=2.231831004.237969923.1773030903-1365860410.1769491516";
  const gopuffUrl = "https://deliver.gopuff.com/signup";
  return (
    <div className="fixed right-4 bottom-24 z-50 flex flex-col gap-3">
      <a
        href={doorDashUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center bg-orange-500 hover:bg-orange-600 text-white font-medium px-4 py-2 rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-orange-300 transition"
        aria-label="Apply to DoorDash"
      >
        Apply to DoorDash
      </a>
      <a
        href={gopuffUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center bg-[#00A3E0] hover:bg-[#008fcf] text-white font-medium px-4 py-2 rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-[#7fd3ff] transition"
        aria-label="Apply to Gopuff"
      >
        Apply to Gopuff
      </a>
    </div>
  );
}