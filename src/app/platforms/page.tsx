'use client';

import { useState, useEffect } from 'react';
import PlatformCard from '@/components/PlatformCard';
import FilterSidebar, { FilterState } from '@/components/FilterSidebar';
import SearchBar from '@/components/SearchBar';
import { getAllPlatforms } from '@/lib/data';
import { Platform } from '@/lib/types';

type SortOption = 'featured' | 'name' | 'newest' | 'pay';

export default function PlatformsPage() {
  const [allPlatforms, setAllPlatforms] = useState<Platform[]>([]);
  const [filteredPlatforms, setFilteredPlatforms] = useState<Platform[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>('featured');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadPlatforms() {
      const platforms = await getAllPlatforms();
      setAllPlatforms(platforms);
      setFilteredPlatforms(platforms);
      setIsLoading(false);
    }
    loadPlatforms();
  }, []);

  const applyFilters = (filters: FilterState) => {
    let filtered = [...allPlatforms];

    // Filter by waitlist status
    if (filters.waitlistStatuses.length > 0) {
      filtered = filtered.filter(platform => {
        // Check the USA region's waitlist status (or first available region)
        const usaRegion = platform.regions['USA'];
        const firstRegion = Object.values(platform.regions)[0];
        const waitlistStatus = usaRegion?.waitlistStatus || firstRegion?.waitlistStatus || 'unknown';
        return filters.waitlistStatuses.includes(waitlistStatus);
      });
    }

    // Filter by vehicle types
    if (filters.vehicleTypes.length > 0) {
      filtered = filtered.filter(platform => {
        // Check if platform has any of the selected vehicle types
        // "none" means no vehicle required (empty vehicleTypes array or includes 'none')
        if (filters.vehicleTypes.includes('none')) {
          if (platform.vehicleTypes.length === 0 || platform.vehicleTypes.includes('none')) {
            return true;
          }
        }
        // Check for overlap between platform's vehicle types and selected filters
        return platform.vehicleTypes.some(vType => 
          filters.vehicleTypes.includes(vType.toLowerCase())
        );
      });
    }

    // Filter by age requirement
    // User selects their age (e.g., 21+), show platforms they qualify for (minAge <= user's age)
    if (filters.minAge !== null) {
      filtered = filtered.filter(platform => platform.minAge <= filters.minAge!);
    }

    // Filter by background check
    if (filters.noBackgroundCheck) {
      filtered = filtered.filter(platform => !platform.backgroundCheckRequired);
    }

    // Apply sorting
    filtered = sortPlatforms(filtered, sortBy);

    setFilteredPlatforms(filtered);
  };

  const sortPlatforms = (platforms: Platform[], sort: SortOption): Platform[] => {
    const sorted = [...platforms];
    
    switch (sort) {
      case 'name':
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case 'newest':
        return sorted.sort((a, b) => 
          new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
        );
      case 'pay':
        return sorted.sort((a, b) => {
          const aMax = a.estimatedHourlyMax || 0;
          const bMax = b.estimatedHourlyMax || 0;
          return bMax - aMax;
        });
      case 'featured':
      default:
        return sorted; // Keep original order for featured
    }
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSort = e.target.value as SortOption;
    setSortBy(newSort);
    setFilteredPlatforms(prev => sortPlatforms(prev, newSort));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-600">Loading platforms...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Browse All Platforms
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Discover {allPlatforms.length} gig opportunities. Filter to find the perfect match for you.
          </p>
          <SearchBar placeholder="Search by platform name..." className="max-w-2xl" />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <aside className="lg:col-span-1">
            <div className="sticky top-4">
              <FilterSidebar onFilterChange={applyFilters} />
            </div>
          </aside>
          
          <div className="lg:col-span-3">
            <div className="mb-4 flex justify-between items-center">
              <p className="text-gray-600">
                Showing {filteredPlatforms.length} of {allPlatforms.length} platforms
              </p>
              <select 
                value={sortBy}
                onChange={handleSortChange}
                className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:border-primary-500 focus:outline-none"
              >
                <option value="featured">Sort by: Featured</option>
                <option value="name">Sort by: Name</option>
                <option value="newest">Sort by: Newest</option>
                <option value="pay">Sort by: Pay</option>
              </select>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredPlatforms.map((platform) => (
                <PlatformCard key={platform.id} platform={platform} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
