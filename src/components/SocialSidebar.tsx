"use client";

import React from "react";
import { FaFacebookF, FaInstagram, FaTiktok, FaRedditAlien } from "react-icons/fa";

export default function SocialSidebar() {
  return (
    <div className="fixed left-4 top-1/2 -translate-y-1/2 z-40 hidden md:flex flex-col gap-3">

      <a
        href="https://www.facebook.com/profile.php?id=61585011383587&sk=followers"
        target="_blank"
        rel="noopener noreferrer"
        className="bg-white shadow-md rounded-full p-3 hover:scale-110 transition"
        aria-label="Facebook"
      >
        <FaFacebookF size={18} />
      </a>

      <a
        href="https://www.instagram.com/gigworldtoday/"
        target="_blank"
        rel="noopener noreferrer"
        className="bg-white shadow-md rounded-full p-3 hover:scale-110 transition"
        aria-label="Instagram"
      >
        <FaInstagram size={18} />
      </a>

      <a
        href="https://www.tiktok.com/@gigworldtoday"
        target="_blank"
        rel="noopener noreferrer"
        className="bg-white shadow-md rounded-full p-3 hover:scale-110 transition"
        aria-label="TikTok"
      >
        <FaTiktok size={18} />
      </a>

      {/* Reddit (kept) */}
      <a
        href="https://www.reddit.com/user/Mamie-GigWorldToday/"
        target="_blank"
        rel="noopener noreferrer"
        className="bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-lg rounded-full p-3 hover:scale-110 transition"
        aria-label="Reddit"
      >
        <FaRedditAlien size={18} />
      </a>

    </div>
  );
}
