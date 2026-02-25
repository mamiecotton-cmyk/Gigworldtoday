'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Platform } from '@/lib/types';

// Fallback domains for platforms missing websiteUrl
const DOMAIN_OVERRIDES: Record<string, string> = {
  doordash: 'doordash.com',
  'uber-eats': 'ubereats.com',
  drizly: 'drizly.com',
  postmates: 'postmates.com',
};

function getDomain(platform: Platform): string | null {
  if (DOMAIN_OVERRIDES[platform.id]) return DOMAIN_OVERRIDES[platform.id];
  if (!platform.websiteUrl) return null;
  try {
    const url = new URL(platform.websiteUrl);
    // Strip subdomains like "shoppers.", "driver.", "web.", "flex." etc
    const parts = url.hostname.replace(/^www\./, '').split('.');
    if (parts.length > 2) {
      return parts.slice(-2).join('.');
    }
    return parts.join('.');
  } catch {
    return null;
  }
}

interface PlatformCardProps {
  platform: Platform;
}

export default function PlatformCard({ platform }: PlatformCardProps) {
  const [imgError, setImgError] = useState(false);
  const domain = getDomain(platform);
  const logoSrc = domain ? `https://logo.clearbit.com/${domain}` : null;

  const category =
    Array.isArray(platform.categories) && platform.categories.length > 0
      ? platform.categories[0].replace(/_/g, ' ')
      : 'Gig Work';

  return (
    <Link
      href={`/platforms/${platform.slug}`}
      className="group relative rounded-2xl border border-gray-200 bg-white shadow-md hover:shadow-xl hover:shadow-teal-500/10 hover:border-teal-300 transition-all duration-300 p-5 flex flex-col overflow-hidden"
    >
      {/* Teal top accent */}
      <div className="absolute top-0 left-4 right-4 h-[3px] rounded-b-full bg-gradient-to-r from-teal-400 to-teal-500" />

      {/* Logo + Name + Category */}
      <div className="flex items-center gap-3 mt-2 mb-4">
        <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
          {logoSrc && !imgError ? (
            <img
              src={logoSrc}
              alt={platform.name}
              className="w-10 h-10 object-contain"
              onError={() => setImgError(true)}
            />
          ) : (
            <span className="text-lg font-bold text-teal-600">
              {platform.name.charAt(0)}
            </span>
          )}
        </div>
        <div className="min-w-0">
          <h3 className="text-lg font-bold text-gray-900 leading-tight group-hover:text-teal-600 transition-colors">
            {platform.name}
          </h3>
          <p className="text-sm text-gray-400 capitalize">{category}</p>
        </div>
      </div>

      {/* Pay range */}
      {platform.estimatedHourlyMin && platform.estimatedHourlyMax && (
        <div className="mb-3">
          <span className="inline-block bg-emerald-50 border border-emerald-200 text-emerald-700 font-semibold rounded-full px-3.5 py-1 text-sm">
            ${platform.estimatedHourlyMin}–${platform.estimatedHourlyMax}/hr estimated
          </span>
        </div>
      )}

      {/* Requirements tags */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {platform.minAge && (
          <span className="rounded-full bg-gray-100 text-gray-600 text-xs px-2.5 py-1 font-medium">
            {platform.minAge}+ years
          </span>
        )}
        {platform.vehicleTypes &&
          platform.vehicleTypes.length > 0 &&
          platform.vehicleTypes[0] !== 'none' && (
            <span className="rounded-full bg-gray-100 text-gray-600 text-xs px-2.5 py-1 font-medium capitalize">
              {platform.vehicleTypes[0].replace(/_/g, ' ')}
            </span>
          )}
        {platform.backgroundCheckRequired && (
          <span className="rounded-full bg-gray-100 text-gray-600 text-xs px-2.5 py-1 font-medium">
            Background check
          </span>
        )}
      </div>

      {/* Description */}
      <p className="text-sm text-gray-500 leading-relaxed line-clamp-3 mb-5 flex-grow">
        {platform.description}
      </p>

      {/* View Details button */}
      <div className="mt-auto">
        <span className="block w-full text-center bg-orange-500 group-hover:bg-orange-600 text-white font-semibold rounded-lg px-5 py-2.5 transition-colors">
          View Details →
        </span>
      </div>
    </Link>
  );
}