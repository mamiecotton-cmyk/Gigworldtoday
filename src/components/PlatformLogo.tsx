"use client";

import { useState } from "react";
import platformsData from "@/data/platforms.json";

const LOCAL_LOGOS: Record<string, string> = {
  doordash: "/logos/doordash.svg",
  ubereats: "/logos/ubereats.svg",
  instacart: "/logos/instacart.svg",
  uber: "/logos/uber.svg",
  lyft: "/logos/lyft.svg",
  thumbtack: "/logos/thumbtack.svg",
};

const DOMAIN_OVERRIDES: Record<string, string> = {
  doordash: "doordash.com",
  ubereats: "ubereats.com",
  drizly: "drizly.com",
  postmates: "postmates.com",
};

function getDomain(platform: any): string | null {
  if (DOMAIN_OVERRIDES[platform.id]) return DOMAIN_OVERRIDES[platform.id];
  if (!platform.websiteUrl) return null;
  try {
    const url = new URL(platform.websiteUrl);
    const parts = url.hostname.replace(/^www\./, "").split(".");
    return parts.length > 2 ? parts.slice(-2).join(".") : parts.join(".");
  } catch {
    return null;
  }
}

interface Props {
  platform_id: string;
  platform_name: string;
  size?: number; // pixels — default 24
  className?: string;
}

export default function PlatformLogo({ platform_id, platform_name, size = 24, className = "" }: Props) {
  const [imgError, setImgError] = useState(false);

  // Find platform from JSON
  const platform = (platformsData as any[]).find((p) => p.id === platform_id);

  let logoSrc: string | null = null;
  if (platform) {
    const localLogo = LOCAL_LOGOS[platform.id];
    const domain = getDomain(platform);
    logoSrc =
      localLogo ||
      platform.logoUrl ||
      (domain
        ? `https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://${domain}&size=128`
        : null);
  }

  const showImage = logoSrc && !imgError;

  return (
    <div
      className={`flex items-center justify-center rounded-full bg-gray-50 border border-gray-100 overflow-hidden flex-shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      {showImage ? (
        <img
          src={logoSrc!}
          alt={platform_name}
          onError={() => setImgError(true)}
          className="object-contain"
          style={{ width: size * 0.7, height: size * 0.7 }}
        />
      ) : (
        <span
          className="font-bold text-teal-600"
          style={{ fontSize: size * 0.45 }}
        >
          {platform_name?.charAt(0).toUpperCase() || "?"}
        </span>
      )}
    </div>
  );
}