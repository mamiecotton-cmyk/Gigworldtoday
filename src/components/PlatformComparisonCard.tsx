import React from "react";
import StarRating from "@/components/StarRating";

export type Platform = {
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

export const PlatformComparisonCard: React.FC<PlatformComparisonCardProps> = ({ platform, highlight = {} }) => {
  const platformSlug = platform.slug || platform.name.toLowerCase().replace(/\s+/g, "-");
  const domain = getDomain(platform.websiteUrl);
  const logoSrc = platform.logoUrl || (domain ? `https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://${domain}&size=128` : null);

  const payRange = platform.estimatedHourlyMin && platform.estimatedHourlyMax
    ? `$${platform.estimatedHourlyMin}–$${platform.estimatedHourlyMax}/hr`
    : "—";

  const vehicles = platform.vehicleTypes?.length
    ? platform.vehicleTypes.filter(v => v !== "none" && v !== "walking").map(v => v.replace(/_/g, " ")).slice(0, 3).join(", ") || "None needed"
    : "—";

  const categories = platform.categories?.length
    ? platform.categories.slice(0, 3).map(c => c.replace(/_/g, " ")).join(", ")
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
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-md flex flex-col items-center w-full max-w-xs mx-auto">
      <div className="w-14 h-14 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center mb-3 overflow-hidden">
        {logoSrc ? (
          <img src={logoSrc} alt={platform.name} className="w-10 h-10 object-contain" />
        ) : (
          <span className="text-lg font-bold text-teal-600">{platform.name.charAt(0)}</span>
        )}
      </div>
      <h2 className="text-xl font-bold mb-1 text-center">{platform.name}</h2>
      <StarRating platformSlug={platformSlug} />
      <div className="w-full mt-3">
        <table className="w-full text-sm">
          <tbody>
            {rows.map((row) => (
              <tr key={row.label}>
                <td className="py-1.5 pr-2 text-slate-500">{row.label}</td>
                <td className={`py-1.5 font-medium capitalize ${highlight[row.key || ""] ? "text-green-600" : "text-slate-900"}`}>
                  {row.value}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PlatformComparisonCard;