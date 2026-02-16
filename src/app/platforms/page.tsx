import { Metadata } from 'next';
import PlatformCard from '@/components/PlatformCard';
import FilterSidebar from '@/components/FilterSidebar';
import SearchBar from '@/components/SearchBar';
import { getAllPlatforms } from '@/lib/data';

export const metadata: Metadata = {
  title: 'Browse All Platforms',
  description: 'Explore all gig economy platforms. Filter by category, location, requirements, and more.',
};

export default async function PlatformsPage() {
  const platforms = await getAllPlatforms();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Browse All Platforms
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Discover {platforms.length} gig opportunities. Filter to find the perfect match for you.
          </p>
          <SearchBar placeholder="Search by platform name..." className="max-w-2xl" />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <aside className="lg:col-span-1">
            <div className="sticky top-4">
              <FilterSidebar />
            </div>
          </aside>
          
          <div className="lg:col-span-3">
            <div className="mb-4 flex justify-between items-center">
              <p className="text-gray-600">
                Showing {platforms.length} platforms
              </p>
              <select className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:border-primary-500 focus:outline-none">
                <option>Sort by: Featured</option>
                <option>Sort by: Name</option>
                <option>Sort by: Newest</option>
              </select>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {platforms.map((platform) => (
                <PlatformCard key={platform.id} platform={platform} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
