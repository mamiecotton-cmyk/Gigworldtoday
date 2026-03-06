"use client";

import React from "react";
import { trackOutboundClick } from "@/lib/trackOutboundClick";

type Props = {
  href: string;
  linkType: string;
  label: string;
  className?: string;
  children: React.ReactNode;
};

export default function TrackedOutboundLink({ href, linkType, label, className, children }: Props) {
  const handleClick = () => {
    try {
      trackOutboundClick({ destination_url: href, link_type: linkType, label });
    } catch {
      // ignore
    }
  };

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className={className}
    >
      {children}
    </a>
  );
}
