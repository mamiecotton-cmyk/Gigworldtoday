"use client";

import React from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  MapPin,
  DollarSign,
  Clock,
  Car,
  CheckCircle,
  XCircle,
  ExternalLink,
  ArrowLeft,
  Smartphone,
  Shield,
  Star,
} from "lucide-react";
import platformsData from "@/data/platforms.json";
import { Platform } from "@/lib/types";
import SignupBanner from "@/components/SignupBanner";
import TrackedLink from "@/components/TrackedLink";

const inactiveStatuses = [
  "no_longer_hiring",
  "shut_down",
  "acquired",
  "merged",
  "rebranded",
  "shutdown",
  "permanently_closed",
  "closed",
  "inactive",
  "defunct",
  "out_of_business",
];

export default function PlatformDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const platforms = platformsData as unknown as Platform[];
  const platform = platforms.find(
    (p) => p.slug === slug || p.id === slug
  );

  if (!platform) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Platform Not Found
        </h1>
        <p className="text-gray-500 mb-8">
          We couldn&apos;t find a platform matching &quot;{slug}&quot;.
        </p>
        <Link
          href="/platforms"
          className="inline-flex items-center gap-2 text-[#00C9B1] hover:underline"
        >
          <ArrowLeft size={18} />
          Back to All Platforms
        </Link>
      </div>
    );
  }

  const isInactive = inactiveStatuses.includes(
    (platform.driverStatus || "").toLowerCase()
  );

  const usaRegion = platform.regions?.USA || platform.regions?.US;
  const waitlistStatus = usaRegion?.waitlistStatus || (platform.driverStatus === "active" ? "open" : "unknown");
  const regionStatus = usaRegion?.status || "";
  const cities = usaRegion?.cities || [];

  const payRange =
    platform.estimatedHourlyMin && platform.estimatedHourlyMax
      ? `$${platform.estimatedHourlyMin}–$${platform.estimatedHourlyMax}/hr`
      : platform.estimatedPayMin && platform.estimatedPayMax
      ? `$${platform.estimatedPayMin}–$${platform.estimatedPayMax}`
      : null;

  const waitlistColors: Record<string, { bg: string; text: string; label: string }> = {
    open: { bg: "bg-green-100", text: "text-green-800", label: "Hiring" },
    waitlist: { bg: "bg-yellow-100", text: "text-yellow-800", label: "Waitlist" },
    closed: { bg: "bg-red-100", text: "text-red-800", label: "Closed" },
    unknown: { bg: "bg-gray-100", text: "text-gray-600", label: "Unknown" },
  };

  const statusStyle = waitlistColors[waitlistStatus] || waitlistColors.unknown;

  // Related platforms (same category, exclude current)
  const relatedPlatforms = platforms
    .filter(
      (p) =>
        p.id !== platform.id &&
        !inactiveStatuses.includes((p.driverStatus || "").toLowerCase()) &&
        p.categories?.some((c) => platform.categories?.includes(c))
    )
    .slice(0, 4);

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-6">
        <div className="bg-white/85 rounded-3xl shadow-2xl border border-white/40 p-10">
        {/* Back link */}
        <Link
          href="/platforms"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-[#00C9B1] mb-6 text-sm"
        >
          <ArrowLeft size={16} />
          Back to All Platforms
        </Link>

        {/* Inactive banner */}
        {isInactive && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800 font-medium">
              This platform is no longer active
              {platform.driverStatus && ` (${platform.driverStatus.replace(/_/g, " ")})`}.
              {platform.mergedWith && (
                <>
                  {" "}It has merged with{" "}
                  <strong>{platform.mergedWith}</strong>.
                </>
              )}
              {platform.redirectMessage && ` ${platform.redirectMessage}`}
            </p>
          </div>
        )}

        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-start gap-4">
              {(() => {
                const LOCAL_LOGOS: Record<string, string> = {
                  doordash: '/logos/doordash.svg',
                  ubereats: '/logos/ubereats.svg',
                  instacart: '/logos/instacart.svg',
                  uber: '/logos/uber.svg',
                  lyft: '/logos/lyft.svg',
                  thumbtack: '/logos/thumbtack.svg',
                };
                const DOMAIN_OVERRIDES: Record<string, string> = {
                  doordash: 'doordash.com',
                  ubereats: 'ubereats.com',
                  drizly: 'drizly.com',
                  postmates: 'postmates.com',
                };
                let domain = DOMAIN_OVERRIDES[platform.id] || null;
                if (!domain && platform.websiteUrl) {
                  try {
                    const parts = new URL(platform.websiteUrl).hostname.replace(/^www\./, '').split('.');
                    domain = parts.length > 2 ? parts.slice(-2).join('.') : parts.join('.');
                  } catch {}
                }
                const src = LOCAL_LOGOS[platform.id] || platform.logoUrl || (domain ? `https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://${domain}&size=128` : null);
                return src ? (
                  <img
                    src={src}
                    alt={platform.name}
                    className="w-16 h-16 rounded-lg object-contain bg-gray-50 border p-1"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center text-2xl font-bold text-teal-600">
                    {platform.name?.charAt(0)}
                  </div>
                );
              })()}
            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                  {platform.name}
                </h1>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${statusStyle.bg} ${statusStyle.text}`}
                >
                  {statusStyle.label}
                </span>
                {platform.rating && (
                  <span className="flex items-center gap-1 text-sm text-yellow-600">
                    <Star size={14} fill="currentColor" />
                    {platform.rating}
                  </span>
                )}
              </div>
              <p className="text-gray-500 text-sm mt-1">
                {platform.categories?.map(c => c.replace(/_/g, " ")).join(", ")}
              </p>
              <p className="text-gray-700 mt-3 text-sm sm:text-base leading-relaxed">{platform.description}</p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-3 mt-6">
            {platform.applyUrl && !isInactive && (
              <TrackedLink
                href={platform.applyUrl}
                linkType="platform"
                label={platform.name}
                sourcePage={`platform_${slug}`}
                className={`inline-flex items-center gap-2 px-5 py-2.5 text-white rounded-lg font-semibold transition ${platform.applyButtonColor ? '' : 'bg-[#00C9B1] hover:bg-[#00b5a0]'}`}
                style={platform.applyButtonColor ? { backgroundColor: platform.applyButtonColor } : undefined}
              >
                Apply Now <ExternalLink size={16} />
              </TrackedLink>
            )}
            {platform.websiteUrl && (
              <TrackedLink
                href={platform.websiteUrl}
                linkType="website"
                label={platform.name}
                sourcePage={`platform_${slug}`}
                className="inline-flex items-center gap-2 px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Visit Website <ExternalLink size={16} />
              </TrackedLink>
            )}
            {platform.iosAppUrl && (
              <TrackedLink
                href={platform.iosAppUrl}
                linkType="ios_app"
                label={`${platform.name} iOS App`}
                sourcePage={`platform_${slug}`}
                className="inline-flex items-center gap-2 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm"
              >
                <Smartphone size={16} /> iOS App
              </TrackedLink>
            )}
            {platform.androidAppUrl && (
              <TrackedLink
                href={platform.androidAppUrl}
                linkType="android_app"
                label={`${platform.name} Android App`}
                sourcePage={`platform_${slug}`}
                className="inline-flex items-center gap-2 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm"
              >
                <Smartphone size={16} /> Android App
              </TrackedLink>
            )}
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Pay & Compensation */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="font-semibold text-lg text-gray-900 mb-4 flex items-center gap-2">
              <DollarSign size={20} className="text-[#00C9B1]" />
              Pay & Compensation
            </h2>
            <div className="space-y-3 text-sm">
              {payRange && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Estimated Pay</span>
                  <span className="font-medium text-gray-900">{payRange}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500">Pay Model</span>
                <span className="font-medium text-gray-900">
                  {platform.payModel || "Not specified"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Tips</span>
                <span className="font-medium text-gray-900">
                  {platform.tipsAllowed ? "Yes" : "No"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Payment Frequency</span>
                <span className="font-medium text-gray-900">
                  {platform.paymentFrequency || "Not specified"}
                </span>
              </div>
              {platform.instantPayAvailable && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Instant Pay</span>
                  <span className="font-medium text-green-700">
                    Available{platform.instantPayLimit && ` (${platform.instantPayLimit})`}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Requirements */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="font-semibold text-lg text-gray-900 mb-4 flex items-center gap-2">
              <Shield size={20} className="text-[#00C9B1]" />
              Requirements
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Minimum Age</span>
                <span className="font-medium text-gray-900">
                  {platform.minAge || "Not specified"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Background Check</span>
                <span className="font-medium text-gray-900">
                  {platform.backgroundCheckRequired ? (
                    <span className="flex items-center gap-1">
                      <CheckCircle size={14} className="text-green-600" /> Required
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <XCircle size={14} className="text-gray-400" /> Not required
                    </span>
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Vehicle</span>
                <span className="font-medium text-gray-900">
                  {platform.vehicleTypes?.join(", ") || "None"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">License Required</span>
                <span className="font-medium text-gray-900">
                  {platform.licenseRequired ? "Yes" : "No"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Insurance Required</span>
                <span className="font-medium text-gray-900">
                  {platform.insuranceRequired ? "Yes" : "No"}
                </span>
              </div>
              {platform.equipmentNeeded && platform.equipmentNeeded.length > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Equipment</span>
                  <span className="font-medium text-gray-900">
                    {platform.equipmentNeeded.join(", ")}
                  </span>
                </div>
              )}
              {platform.otherRequirements && (
                <div className="pt-2 border-t">
                  <span className="text-gray-500 block mb-1">Other</span>
                  <span className="text-gray-700">{platform.otherRequirements}</span>
                </div>
              )}
            </div>
          </div>

          {/* Availability */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="font-semibold text-lg text-gray-900 mb-4 flex items-center gap-2">
              <MapPin size={20} className="text-[#00C9B1]" />
              Availability
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Countries</span>
                <span className="font-medium text-gray-900">
                  {platform.countries?.join(", ") || "Not specified"}
                </span>
              </div>
              {regionStatus && (
                <div className="flex justify-between">
                  <span className="text-gray-500">USA Status</span>
                  <span className="font-medium text-gray-900">{regionStatus}</span>
                </div>
              )}
              {cities.length > 0 && (
                <div className="pt-2 border-t">
                  <span className="text-gray-500 block mb-2">Cities</span>
                  <div className="flex flex-wrap gap-1.5">
                    {cities.map((city) => (
                      <span
                        key={city}
                        className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs"
                      >
                        {city}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Work Details */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="font-semibold text-lg text-gray-900 mb-4 flex items-center gap-2">
              <Clock size={20} className="text-[#00C9B1]" />
              Work Details
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Delivery Type</span>
                <span className="font-medium text-gray-900">
                  {platform.deliveryType?.replace(/_/g, " ") || "Not specified"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Setup Required</span>
                <span className="font-medium text-gray-900">
                  {platform.setupRequired ? "Yes" : "No"}
                </span>
              </div>
              {platform.usesThirdPartyDelivery && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Third-Party Delivery</span>
                  <span className="font-medium text-gray-900">
                    {platform.deliveryPartners?.join(", ") || "Yes"}
                  </span>
                </div>
              )}
              {platform.proTierProgram && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Pro Program</span>
                  <span className="font-medium text-gray-900">
                    {platform.proTierProgram}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Metadata */}
        <div className="inline-flex items-center gap-4 text-xs text-gray-400 mb-6 flex-wrap">
          <span>Last updated: {platform.lastUpdated || "Unknown"}</span>
          <span className="flex items-center gap-1">
            {platform.verificationStatus === "verified" ? (
              <>
                <CheckCircle size={12} className="text-green-500" /> Verified
              </>
            ) : platform.verificationStatus === "community" ? (
              "Community sourced"
            ) : (
              "Needs verification"
            )}
          </span>
        </div>

        <SignupBanner
          headline="Want Updates When New Platforms Are Added?"
          subtext="Subscribers get early access and weekly earning tips."
        />

        {/* Related Platforms */}
        {relatedPlatforms.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Similar Platforms
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {relatedPlatforms.map((p) => (
                <Link
                  key={p.id}
                  href={`/platforms/${p.slug || p.id}`}
                  className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition"
                >
                  <div className="flex items-center gap-3">
                    {(() => {
                      const LOCAL: Record<string, string> = {
                        doordash: '/logos/doordash.svg', ubereats: '/logos/ubereats.svg',
                        instacart: '/logos/instacart.svg', uber: '/logos/uber.svg',
                        lyft: '/logos/lyft.svg', thumbtack: '/logos/thumbtack.svg',
                      };
                      const DOMS: Record<string, string> = {
                        doordash: 'doordash.com', ubereats: 'ubereats.com',
                        drizly: 'drizly.com', postmates: 'postmates.com',
                      };
                      let d = DOMS[p.id] || null;
                      if (!d && p.websiteUrl) {
                        try { const h = new URL(p.websiteUrl).hostname.replace(/^www\./,'').split('.'); d = h.length > 2 ? h.slice(-2).join('.') : h.join('.'); } catch {}
                      }
                      const s = LOCAL[p.id] || (d ? `https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://${d}&size=128` : null);
                      return s ? (
                        <img src={s} alt={p.name} className="w-10 h-10 rounded object-contain bg-gray-50" />
                      ) : (
                        <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center text-lg font-bold text-teal-600">{p.name?.charAt(0)}</div>
                      );
                    })()}
                    <div>
                      <h3 className="font-semibold text-gray-900">{p.name}</h3>
                      <p className="text-xs text-gray-500">
                        {p.categories?.map((c) => c.replace(/_/g, " ")).join(", ")}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}