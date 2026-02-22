import React from "react";
import Image from "next/image";
import StarRating from "@/components/StarRating";

export type Platform = {
  name: string;
  logoUrl?: string;
  category?: string;
  averageHourly?: number;
  schedulingType?: string;
  vehicleRequired?: boolean;
  tipsIncluded?: boolean;
  payoutSpeed?: string;
  signupDifficulty?: string;
  rating?: number;
};

interface PlatformComparisonCardProps {
  platform: Platform;
  highlight?: {
    [field: string]: boolean;
  };
}

const fieldLabels: { [key: string]: string } = {
  logoUrl: "Logo",
  name: "Platform Name",
  category: "Category",
  averageHourly: "Avg Hourly Earnings",
  schedulingType: "Scheduling Type",
  vehicleRequired: "Vehicle Required",
  tipsIncluded: "Tips Included",
  payoutSpeed: "Payout Speed",
  signupDifficulty: "Signup Difficulty",
  rating: "Rating",
};

export const PlatformComparisonCard: React.FC<PlatformComparisonCardProps> = ({ platform, highlight = {} }) => {
  // Determine platformSlug: use platform.slug if available, else fallback to name lowercased with spaces removed
  const platformSlug = (platform as any).slug || platform.name.toLowerCase().replace(/\s/g, "");
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-md flex flex-col items-center w-full max-w-xs mx-auto">
      {platform.logoUrl && (
        <Image src={platform.logoUrl} alt={platform.name} width={64} height={64} className="mb-4 rounded-full" />
      )}
      <h2 className="text-xl font-bold mb-2 text-center">{platform.name}</h2>
      <StarRating platformSlug={platformSlug} />
      <div className="w-full">
        <table className="w-full text-sm">
          <tbody>
            {Object.entries(fieldLabels).map(([field, label]) => {
              if (field === "logoUrl" || field === "name") return null;
              const value = platform[field as keyof Platform];
              let displayValue = value;
              if (typeof value === "boolean") displayValue = value ? "Yes" : "No";
              if (field === "averageHourly" && typeof value === "number") displayValue = `$${value.toFixed(2)}`;
              if (field === "rating" && typeof value === "number") displayValue = value.toFixed(1);
              return (
                <tr key={field}>
                  <td className="py-1 pr-2 text-slate-500">{label}</td>
                  <td className={`py-1 font-medium ${highlight[field] ? "text-green-600" : "text-slate-900"}`}>{displayValue ?? "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PlatformComparisonCard;
