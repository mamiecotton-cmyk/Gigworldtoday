"use client";
import React, { useState } from "react";
import StarRating from "@/components/StarRating";

export type Platform = {
  id?: string;
  name: string;
  slug?: string;
  logoUrl?: string;
  websiteUrl?: string;
  categories?: string[];
  estimatedHourlyMin?: number;
  estimatedHourlyMax?: number;
  vehicleTypes?: string[];
  tipsAllowed?: boolean;
  paymentFrequency?: string;
  instantPayAvailable?: boolean;
  backgroundCheckRequired?: boolean;
  minAge?: number;
  deliveryType?: string;
  keyFeatures?: string;
  userFeedback?: string;
};

interface PlatformComparisonCardProps {
  platform: Platform;
  highlight?: { [field: string]: boolean };
}

function getDomain(url?: string): string | null {
  if (!url) return null;
  try {
    const parts = new URL(url).hostname.replace(/^www\./, "").split(".");
    return parts.length > 2 ? parts.slice(-2).join(".") : parts.join(".");
  } catch { return null; }
}

const LOCAL_LOGOS: Record<string, string> = {
  doordash: '/logos/doordash.svg',
  ubereats: '/logos/ubereats.svg',
  instacart: '/logos/instacart.svg',
  uber: '/logos/uber.svg',
  lyft: '/logos/lyft.svg',
  thumbtack: '/logos/thumbtack.svg',
};

export const PlatformComparisonCard: React.FC<PlatformComparisonCardProps> = ({ platform, highlight = {} }) => {
  const [imgError, setImgError] = useState(false);
  const platformSlug = platform.slug || platform.name.toLowerCase().replace(/\s+/g, "-");
  const domain = getDomain(platform.websiteUrl);
  const localLogo = platform.id ? LOCAL_LOGOS[platform.id] : null;
  const logoSrc = localLogo || platform.logoUrl || (domain ? `https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://${domain}&size=128` : null);

  const payRange = platform.estimatedHourlyMin && platform.estimatedHourlyMax
    ? `$${platform.estimatedHourlyMin}–$${platform.estimatedHourlyMax}/hr`
    : "—";

  const vehicles = platform.vehicleTypes?.length
    ? platform.vehicleTypes.filter(v => v !== "none" && v !== "walking").map(v => v.replace(/_/g, " ")).slice(0, 3).join(", ") || "None needed"
    : "—";

  const categories = platform.categories?.length
    ? platform.categories.slice(0, 2).map(c => c.replace(/_/g, " ")).join(", ")
    : "—";

  const payFreq = platform.paymentFrequency?.replace(/_/g, " ") || "—";

  const rows = [
    { label: "Category", value: categories },
    { label: "Est. Pay", value: payRange, key: "pay" },
    { label: "Vehicle", value: vehicles },
    { label: "Tips", value: platform.tipsAllowed ? "Yes" : "No" },
    { label: "Pay Frequency", value: payFreq.charAt(0).toUpperCase() + payFreq.slice(1) },
    { label: "Instant Pay", value: platform.instantPayAvailable ? "Yes" : "No" },
    { label: "Background Check", value: platform.backgroundCheckRequired ? "Required" : "Not required" },
    { label: "Min Age", value: platform.minAge ? `${platform.minAge}+` : "—" },
    { label: "Schedule", value: platform.deliveryType?.replace(/_/g, " ") || "—" },
  ];

  return (
    <div className="rounded-xl border border-slate-200 bg-white px-2 py-3 sm:p-6 shadow-md flex flex-col items-center w-full mx-auto">
      <a href={`/platforms/${platformSlug}`} className="flex flex-col items-center hover:opacity-80 transition-opacity">
        <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center mb-2 overflow-hidden">
          {logoSrc && !imgError ? (
            <img src={logoSrc} alt={platform.name} className="w-10 h-10 object-contain" onError={() => setImgError(true)} />
          ) : (
            <span className="text-lg font-bold text-teal-600">{platform.name.charAt(0)}</span>
          )}
        </div>
        <h2 className="text-base sm:text-xl font-bold mb-1 text-center text-gray-900 hover:text-teal-600 transition-colors">{platform.name}</h2>
      </a>
      <div className="hidden sm:block">
        <StarRating platformSlug={platformSlug} />
      </div>
      <div className="w-full mt-3 space-y-2">
        {rows.map((row) => (
          <div key={row.label} className="border-b border-gray-50 pb-1.5">
            <p className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-wide">{row.label}</p>
            <p className={`text-[13px] sm:text-sm font-semibold capitalize leading-tight ${highlight[row.key || ""] ? "text-green-600" : "text-slate-800"}`}>
              {row.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlatformComparisonCard;