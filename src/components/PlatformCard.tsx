import Link from 'next/link';
import { Platform } from '@/lib/types';
import { WAITLIST_STATUS_COLORS } from '@/lib/constants';

interface PlatformCardProps {
  platform: Platform;
}


export default function PlatformCard({ platform }: PlatformCardProps) {
  // Defensive: handle missing or empty countries/regions
  let waitlistStatus = 'unknown';
  if (platform.countries && platform.countries.length > 0 && platform.regions && platform.regions[platform.countries[0]]) {
    waitlistStatus = platform.regions[platform.countries[0]]?.waitlistStatus || 'unknown';
  }
  const normalizedStatus = waitlistStatus in WAITLIST_STATUS_COLORS ? waitlistStatus : 'unknown';
  const statusConfig = WAITLIST_STATUS_COLORS[normalizedStatus as keyof typeof WAITLIST_STATUS_COLORS];
  const showWaitlistBadge = Boolean(statusConfig?.label);

  return (
    <div className="group bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-all duration-200 hover:border-primary-300">
      <div className="flex items-start justify-between mb-4">
        <Link href={`/platforms/${platform.slug}`} className="block focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-lg flex-1 min-w-0">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-2xl">
              {platform.logoUrl ? '🏢' : '📱'}
            </div>
            <div>
              <h3 className="font-semibold text-lg text-gray-900 group-hover:text-primary-600 transition-colors">
                {platform.name}
              </h3>
              <p className="text-sm text-gray-500">
                {platform.categories.length > 0 ? platform.categories[0].replace('_', ' ') : 'Gig Work'}
              </p>
            </div>
          </div>
        </Link>
        {showWaitlistBadge && (
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}>
            {statusConfig.label}
          </span>
        )}
      </div>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {platform.description}
        </p>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {platform.minAge && (
            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
              {platform.minAge}+ years
            </span>
          )}
          {platform.vehicleTypes && platform.vehicleTypes.length > 0 && platform.vehicleTypes[0] !== 'none' && (
            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
              {platform.vehicleTypes[0]}
            </span>
          )}
          {platform.backgroundCheckRequired && (
            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
              Background check
              {platform.id === "dispatch" && (
                <span className="text-orange-500"> ($40 fee may apply)</span>
              )}
            </span>
          )}
        </div>
        
        {platform.estimatedHourlyMin && platform.estimatedHourlyMax && (
          <div className="text-sm font-medium text-primary-600">
            ${platform.estimatedHourlyMin}-${platform.estimatedHourlyMax}/hr estimated
          </div>
        )}

        {/* Third-party delivery info for platforms like Saucey and Caviar, and Uber Eats signup info for Cornershop */}
        {(platform.usesThirdPartyDelivery || platform.id === 'cornershop') && (
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mt-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-blue-800">
                  {platform.id === 'cornershop'
                    ? 'Cornershop no longer hires drivers directly. To deliver Cornershop orders, sign up as an Uber Eats driver.'
                    : platform.redirectMessage || 'This platform no longer hires drivers directly'}
                </p>
                {platform.deliveryPartners && platform.deliveryPartners.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs text-blue-700 mb-2">Apply to these platforms instead:</p>
                    <div className="flex flex-wrap gap-2">
                      {platform.deliveryPartners.map(partner => (
                        <span key={partner} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {partner}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {(platform.id === 'drizly' || platform.id === 'postmates') && (
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mt-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-blue-800">
                  {platform.id === 'drizly'
                    ? 'Drizly is permanently closed. To deliver alcohol orders, sign up as an Uber Eats driver.'
                    : 'Postmates is permanently closed. To deliver Postmates orders, sign up as an Uber Eats driver.'}
                </p>
                {typeof platform.mergedWith === 'string' && platform.mergedWith.length > 0 && (
                  <div className="mt-2">
                    <button
                      type="button"
                      className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                      onClick={() => window.location.href = `/platforms/${platform.mergedWith!.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      Sign up for {platform.mergedWith}
                    </button>
                    <span className="inline-block ml-2">
                      <a
                        href={`https://www.${platform.mergedWith!.toLowerCase().replace(/\s+/g, '')}.com`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md border border-blue-300 text-blue-700 bg-white hover:bg-blue-50"
                      >
                        Visit {platform.mergedWith} Website ↗
                      </a>
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
  );
}
