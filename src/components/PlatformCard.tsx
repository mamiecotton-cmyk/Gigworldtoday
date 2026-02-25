import Link from 'next/link';
import { WAITLIST_STATUS_COLORS } from '@/lib/constants';
interface PlatformCardProps {
  platform: Platform;
}

export default function PlatformCard({ platform }: PlatformCardProps) {
  let waitlistStatus = 'unknown';
  if (platform.countries && platform.countries.length > 0 && platform.regions && platform.regions[platform.countries[0]]) {
    waitlistStatus = platform.regions[platform.countries[0]]?.waitlistStatus || 'unknown';
  }
  const normalizedStatus = waitlistStatus in WAITLIST_STATUS_COLORS ? waitlistStatus : 'unknown';
  const statusConfig = WAITLIST_STATUS_COLORS[normalizedStatus as keyof typeof WAITLIST_STATUS_COLORS];
  const showWaitlistBadge = Boolean(statusConfig?.label);

  // Featured styling
  const isFeatured = platform.featured;
  const cardClass = `
    flex flex-col justify-between
    rounded-3xl
    border
    transition-all duration-300
    hover:shadow-2xl hover:-translate-y-1
    p-7
    ${
      platform.featured
        ? "bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-2xl scale-[1.02]"
        : "bg-white border-slate-300 shadow-md"
    }
  `;

  return (
    <div className={cardClass}>
      {/* Brand strip */}
      <div className="h-[3px] rounded-full mb-4 bg-gradient-to-r from-sky-400 via-blue-500 to-cyan-400" />

      {/* Featured badge */}
      {isFeatured && (
        <span className="absolute top-3 right-4 text-xs font-semibold bg-blue-100/80 text-blue-800 rounded-full px-2.5 py-1 z-10">
          Featured
        </span>
      )}

      {/* Header row */}
      <div className="flex items-center gap-4 mb-2">
        <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-2xl">
          {platform.logoUrl
            ? <img src={platform.logoUrl} alt={platform.name} className="w-10 h-10 object-contain rounded-xl" />
            : '📱'}
        </div>
        <div className="flex-1 min-w-0">
          <Link href={`/platforms/${platform.slug}`} className="block focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-lg min-w-0">
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              {platform.name}
            </h3>
            <p className="text-sm text-slate-500 truncate">
              {Array.isArray(platform.categories) && platform.categories.length > 0
                ? platform.categories[0].replace('_', ' ')
                : 'Gig Work'}
            </p>
          </Link>
        </div>
        {showWaitlistBadge && (
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}>
            {statusConfig.label}
          </span>
        )}
      </div>

      {/* Earnings badge */}
      {platform.estimatedHourlyMin && platform.estimatedHourlyMax && (
        <span className="bg-emerald-100 text-emerald-700 text-sm font-medium px-3 py-1 rounded-full mb-2">
          ${platform.estimatedHourlyMin}-{platform.estimatedHourlyMax}/hr estimated
        </span>
      )}

      {/* Tags/requirements */}
      <div className="flex flex-wrap gap-2 mb-2">
        {platform.minAge && (
          <span className="rounded-full bg-slate-100/80 text-slate-600 text-xs px-2.5 py-1">
            {platform.minAge}+ years
          </span>
        )}
        {platform.vehicleTypes && platform.vehicleTypes.length > 0 && platform.vehicleTypes[0] !== 'none' && (
          <span className="rounded-full bg-slate-100/80 text-slate-600 text-xs px-2.5 py-1">
            {platform.vehicleTypes[0]}
          </span>
        )}
        {platform.backgroundCheckRequired && (
          <span className="rounded-full bg-slate-100/80 text-slate-600 text-xs px-2.5 py-1">
            Background check
            {platform.id === "dispatch" && (
              <span className="text-orange-500"> ($40 fee may apply)</span>
            )}
          </span>
        )}
      </div>

      {/* Description */}
      <p className={`text-sm leading-relaxed ${platform.featured ? 'text-slate-700' : 'text-slate-600'} mb-2 line-clamp-3`}>
        {platform.description}
      </p>

      {/* Third-party delivery info */}
      {(platform.usesThirdPartyDelivery || platform.id === 'cornershop') && (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mt-4 rounded-xl">
          {/* ...existing info... */}
        </div>
      )}

      {/* Closed/merged info */}
      {(platform.id === 'drizly' || platform.id === 'postmates') && (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mt-4 rounded-xl">
          {/* ...existing info... */}
        </div>
      )}

      <div>
        <Link href={`/platforms/${platform.slug}`} className="
          w-full
          bg-blue-600
          hover:bg-blue-700
          text-white
          rounded-xl
          py-3
          text-sm
          font-semibold
          shadow-sm
          transition
        ">
          View Details
        </Link>
      </div>
    </div>
  );
}
