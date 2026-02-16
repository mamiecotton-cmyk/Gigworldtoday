import Link from 'next/link';
import { Platform } from '@/lib/types';
import { WAITLIST_STATUS_COLORS } from '@/lib/constants';

interface PlatformCardProps {
  platform: Platform;
}

export default function PlatformCard({ platform }: PlatformCardProps) {
  const waitlistStatus = platform.regions[platform.countries[0]]?.waitlistStatus || 'unknown';
  const statusConfig = WAITLIST_STATUS_COLORS[waitlistStatus];

  return (
    <Link href={`/platforms/${platform.slug}`}>
      <div className="group bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-all duration-200 hover:border-primary-300">
        <div className="flex items-start justify-between mb-4">
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
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}>
            {statusConfig.label}
          </span>
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
            </span>
          )}
        </div>
        
        {platform.estimatedHourlyMin && platform.estimatedHourlyMax && (
          <div className="text-sm font-medium text-primary-600">
            ${platform.estimatedHourlyMin}-${platform.estimatedHourlyMax}/hr estimated
          </div>
        )}
      </div>
    </Link>
  );
}
