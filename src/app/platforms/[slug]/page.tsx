import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { 
  MapPin, 
  DollarSign, 
  Clock, 
  Car, 
  CheckCircle, 
  XCircle, 
  ExternalLink,
  Calendar
} from 'lucide-react';
import { getPlatformBySlug, getAllPlatforms } from '@/lib/data';
import { WAITLIST_STATUS_COLORS } from '@/lib/constants';
import PlatformCard from '@/components/PlatformCard';

interface PlatformPageProps {
  params: {
    slug: string;
  };
}

export async function generateStaticParams() {
  const platforms = await getAllPlatforms();
  return platforms.map((platform) => ({
    slug: platform.slug,
  }));
}

export async function generateMetadata({ params }: PlatformPageProps): Promise<Metadata> {
  const platform = await getPlatformBySlug(params.slug);
  
  if (!platform) {
    return {
      title: 'Platform Not Found',
    };
  }

  return {
    title: `${platform.name} - Gig Platform Details`,
    description: platform.description,
  };
}

export default async function PlatformPage({ params }: PlatformPageProps) {
  const platform = await getPlatformBySlug(params.slug);
  
  if (!platform) {
    notFound();
  }

  const waitlistStatus = platform.regions[platform.countries[0]]?.waitlistStatus || 'unknown';
  const statusConfig = WAITLIST_STATUS_COLORS[waitlistStatus];
  
  const allPlatforms = await getAllPlatforms();
  const relatedPlatforms = allPlatforms
    .filter(p => 
      p.id !== platform.id && 
      p.categories.some(cat => platform.categories.includes(cat))
    )
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm">
          <Link href="/" className="text-primary-600 hover:underline">Home</Link>
          <span className="mx-2 text-gray-400">/</span>
          <Link href="/platforms" className="text-primary-600 hover:underline">Platforms</Link>
          <span className="mx-2 text-gray-400">/</span>
          <span className="text-gray-600">{platform.name}</span>
        </nav>

        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center text-4xl">
                {platform.logoUrl ? '🏢' : '📱'}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {platform.name}
                </h1>
                <div className="flex items-center space-x-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusConfig.bg} ${statusConfig.text}`}>
                    {statusConfig.label}
                  </span>
                  <span className="text-gray-500">
                    {platform.categories[0]?.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </div>
            <a
              href={platform.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors font-medium flex items-center"
            >
              Apply Now
              <ExternalLink className="ml-2" size={18} />
            </a>
          </div>
          
          <p className="text-lg text-gray-700 mb-6">
            {platform.description}
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {platform.estimatedHourlyMin && platform.estimatedHourlyMax && (
              <div className="flex items-center space-x-2">
                <DollarSign className="text-primary-600" size={20} />
                <div>
                  <div className="text-sm text-gray-500">Estimated Pay</div>
                  <div className="font-semibold">${platform.estimatedHourlyMin}-${platform.estimatedHourlyMax}/hr</div>
                </div>
              </div>
            )}
            <div className="flex items-center space-x-2">
              <Clock className="text-primary-600" size={20} />
              <div>
                <div className="text-sm text-gray-500">Payment</div>
                <div className="font-semibold capitalize">{platform.paymentFrequency}</div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Car className="text-primary-600" size={20} />
              <div>
                <div className="text-sm text-gray-500">Vehicle</div>
                <div className="font-semibold capitalize">{platform.vehicleTypes[0]}</div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <MapPin className="text-primary-600" size={20} />
              <div>
                <div className="text-sm text-gray-500">Countries</div>
                <div className="font-semibold">{platform.countries.join(', ')}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Requirements */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Requirements</h2>
              <div className="space-y-4">
                <div className="flex items-start">
                  <CheckCircle className="text-green-500 mr-3 mt-0.5 flex-shrink-0" size={20} />
                  <div>
                    <span className="font-medium">Age:</span> {platform.minAge}+ years old
                  </div>
                </div>
                <div className="flex items-start">
                  {platform.backgroundCheckRequired ? (
                    <CheckCircle className="text-green-500 mr-3 mt-0.5 flex-shrink-0" size={20} />
                  ) : (
                    <XCircle className="text-gray-400 mr-3 mt-0.5 flex-shrink-0" size={20} />
                  )}
                  <div>
                    <span className="font-medium">Background Check:</span>{' '}
                    {platform.backgroundCheckRequired ? 'Required' : 'Not Required'}
                  </div>
                </div>
                <div className="flex items-start">
                  {platform.licenseRequired ? (
                    <CheckCircle className="text-green-500 mr-3 mt-0.5 flex-shrink-0" size={20} />
                  ) : (
                    <XCircle className="text-gray-400 mr-3 mt-0.5 flex-shrink-0" size={20} />
                  )}
                  <div>
                    <span className="font-medium">Driver's License:</span>{' '}
                    {platform.licenseRequired ? 'Required' : 'Not Required'}
                  </div>
                </div>
                <div className="flex items-start">
                  {platform.insuranceRequired ? (
                    <CheckCircle className="text-green-500 mr-3 mt-0.5 flex-shrink-0" size={20} />
                  ) : (
                    <XCircle className="text-gray-400 mr-3 mt-0.5 flex-shrink-0" size={20} />
                  )}
                  <div>
                    <span className="font-medium">Vehicle Insurance:</span>{' '}
                    {platform.insuranceRequired ? 'Required' : 'Not Required'}
                  </div>
                </div>
                {platform.equipmentNeeded.length > 0 && (
                  <div className="flex items-start">
                    <CheckCircle className="text-green-500 mr-3 mt-0.5 flex-shrink-0" size={20} />
                    <div>
                      <span className="font-medium">Equipment Needed:</span>{' '}
                      {platform.equipmentNeeded.join(', ')}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Compensation */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Compensation</h2>
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Pay Model</span>
                  <span className="font-medium capitalize">{platform.payModel.replace('_', ' ')}</span>
                </div>
                {platform.estimatedPayMin && platform.estimatedPayMax && (
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Per Delivery</span>
                    <span className="font-medium">${platform.estimatedPayMin} - ${platform.estimatedPayMax}</span>
                  </div>
                )}
                {platform.estimatedHourlyMin && platform.estimatedHourlyMax && (
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Hourly Estimate</span>
                    <span className="font-medium">${platform.estimatedHourlyMin} - ${platform.estimatedHourlyMax}/hr</span>
                  </div>
                )}
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Tips</span>
                  <span className="font-medium">{platform.tipsAllowed ? 'Yes' : 'No'}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Payment Frequency</span>
                  <span className="font-medium capitalize">{platform.paymentFrequency}</span>
                </div>
              </div>
            </div>

            {/* Availability */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Availability</h2>
              {Object.entries(platform.regions).map(([country, details]) => (
                <div key={country} className="mb-4">
                  <h3 className="font-semibold text-lg mb-2">{country}</h3>
                  <p className="text-gray-600 mb-2">{details.status}</p>
                  {details.cities && details.cities.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {details.cities.map((city) => (
                        <span key={city} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                          {city}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-4 space-y-6">
              {/* Quick Actions */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="font-semibold text-lg mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <a
                    href={platform.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full text-center bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors font-medium"
                  >
                    Visit Website
                  </a>
                  {platform.iosAppUrl && (
                    <a
                      href={platform.iosAppUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full text-center border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Download iOS App
                    </a>
                  )}
                  {platform.androidAppUrl && (
                    <a
                      href={platform.androidAppUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full text-center border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Download Android App
                    </a>
                  )}
                </div>
              </div>

              {/* Metadata */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="font-semibold text-lg mb-4">Information</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center text-gray-600">
                    <Calendar className="mr-2" size={16} />
                    Last updated: {new Date(platform.lastUpdated).toLocaleDateString()}
                  </div>
                  <div>
                    <span className="text-gray-600">Verification:</span>{' '}
                    <span className="capitalize">{platform.verificationStatus.replace('_', ' ')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Platforms */}
        {relatedPlatforms.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Similar Platforms</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPlatforms.map((relatedPlatform) => (
                <PlatformCard key={relatedPlatform.id} platform={relatedPlatform} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
