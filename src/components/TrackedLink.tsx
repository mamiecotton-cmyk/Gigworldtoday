"use client";

import React, { type MouseEvent, type ReactNode } from "react";

export type TrackedLinkProps = {
  /** The external URL to navigate to */
  href: string;
  /** Classification of the link — e.g. "book", "product", "platform", "affiliate" */
  linkType: string;
  /** Human-readable label for analytics — e.g. "The 5 Star Gig Worker" */
  label: string;
  /** Page or section where the link appears — e.g. "homepage", "blog", "platform_page" */
  sourcePage: string;
  /** Any additional class names for the anchor element */
  className?: string;
  /** Optional inline styles */
  style?: React.CSSProperties;
  children: ReactNode;
};

/**
 * A drop-in replacement for `<a>` that logs outbound clicks to
 * `/api/track-click` before opening the destination URL.
 *
 * The redirect always fires even if the tracking request fails,
 * so user experience is never blocked.
 */
export default function TrackedLink({
  href,
  linkType,
  label,
  sourcePage,
  className,
  style,
  children,
}: TrackedLinkProps) {
  const handleClick = async (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();

    // Fire-and-forget: tracking must never block navigation
    try {
      fetch("/api/track-click", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destination_url: href,
          link_type: linkType,
          label,
          source_page: sourcePage,
        }),
      }).catch(() => {
        // Silently ignore tracking failures
      });
    } catch {
      // Silently ignore tracking failures
    }

    // Always open destination regardless of tracking outcome
    window.open(href, "_blank", "noopener,noreferrer");
  };

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      style={style}
      onClick={handleClick}
    >
      {children}
    </a>
  );
}
