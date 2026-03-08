"use client";

import React from "react";
import { FaFacebookF, FaInstagram, FaTiktok, FaRedditAlien } from "react-icons/fa";

export default function SocialSidebar() {
  const items = [
    { href: "https://facebook.com/gigworldtoday", label: "Facebook", icon: <FaFacebookF /> },
    { href: "https://instagram.com/gigworldtoday", label: "Instagram", icon: <FaInstagram /> },
    { href: "https://tiktok.com/@gigworldtoday", label: "TikTok", icon: <FaTiktok /> },
  ];

  return (
    <div className="fixed left-4 top-1/2 -translate-y-1/2 z-40 hidden md:flex">
      <div className="flex flex-col gap-3 items-start">
        {items.map((it) => (
          <a
            key={it.label}
            href={it.href}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative flex items-center"
            aria-label={it.label}
          >
            <span className="bg-white shadow-md rounded-full p-3 hover:bg-blue-50 transition flex items-center justify-center text-gray-800">
              <span className="text-lg">{it.icon}</span>
            </span>

            {/* Tooltip on hover */}
            <span className="ml-3 whitespace-nowrap px-2 py-1 rounded-md bg-gray-900 text-white text-xs font-medium opacity-0 group-hover:opacity-100 transform translate-x-1 group-hover:translate-x-0 transition-all duration-200 pointer-events-none">
              {it.label}
            </span>
          </a>
        ))}

        {/* Reddit widget moved here */}
        <a
          href="https://www.reddit.com/user/Mamie-GigWorldToday/"
          target="_blank"
          rel="noopener noreferrer"
          className="group relative flex items-center mt-2"
          aria-label="Reddit"
        >
          <span className="bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-lg rounded-full p-3 flex items-center justify-center w-12 h-12">
            <FaRedditAlien />
          </span>

          <span className="ml-3 whitespace-nowrap px-2 py-1 rounded-md bg-gray-900 text-white text-xs font-medium opacity-0 group-hover:opacity-100 transform translate-x-1 group-hover:translate-x-0 transition-all duration-200 pointer-events-none">
            Reddit
          </span>
        </a>
      </div>
    </div>
  );
}
