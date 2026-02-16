'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import PlatformCard from '@/components/PlatformCard';
import FilterSidebar from '@/components/FilterSidebar';
import SearchBar from '@/components/SearchBar';
import type { Category, FilterOptions, Platform } from '@/lib/types';

interface PlatformsClientProps {
  platforms: Platform[];
  categories: Category[];
}

// Vehicle grouping configuration: maps 5 grouped categories to their constituent types
const VEHICLE_GROUPS = [
  { value: 'bike_scooter', label: 'Bike/Scooter', types: ['bike', 'scooter', 'motorcycle', 'walking', 'none'] },
  { value: 'car', label: 'Car', types: ['car', 'sedan'] },
  { value: 'suv', label: 'SUV', types: ['suv', 'suv_trailer'] },
  { value: 'van', label: 'Van', types: ['van', 'minivan', 'cargo_van', 'sprinter_van'] },
  { value: 'truck', label: 'Truck', types: ['truck', 'pickup', 'box_truck', 'flatbed'] }
];

// Create lookup map for quick group resolution
const VEHICLE_GROUP_LOOKUP: Record<string, string> = {};
VEHICLE_GROUPS.forEach(group => {
  group.types.forEach(type => {
    VEHICLE_GROUP_LOOKUP[type] = group.value;
  });
});

const getVehicleGroup = (vehicle: string) => VEHICLE_GROUP_LOOKUP[vehicle];

const matchesSearch = (platform: Platform, query: string | undefined) => {
  const lowerQuery = (query || '').trim().toLowerCase();
  if (!lowerQuery) {
    return true;
  }
  
  // Check platform name, description, and categories
  const basicMatch = (
    platform.name.toLowerCase().includes(lowerQuery) ||
    platform.description.toLowerCase().includes(lowerQuery) ||
    platform.categories.some(cat => cat.toLowerCase().includes(lowerQuery))
  );
  
  if (basicMatch) return true;
  
  // Check cities in regions and broader availability descriptions
  for (const country in platform.regions) {
    const region = platform.regions[country];
    if (region.cities) {
      const citiesString = region.cities.join(' ').toLowerCase();
      
      // Check for specific city match
      if (citiesString.includes(lowerQuery)) {
        return true;
      }
      
      // If platform is available "nationwide", "all 50 states", "statewide", etc., match any city search
      if (lowerQuery.length > 0 && (
        citiesString.includes('nationwide') ||
        citiesString.includes('all 50 states') ||
        citiesString.includes('statewide') ||
        citiesString.includes('nationwide') ||
        citiesString.includes('markets') ||
        citiesString.includes('entire') ||
        citiesString.includes('coverage')
      )) {
        return true;
      }
    }
  }
  
  return false;
};

const matchesVehicleTypes = (platform: Platform, vehicles: string[] | undefined) => {
  const vehicleList = vehicles || [];
  if (vehicleList.length === 0) {
    return true;
  }
  
  // Map platform vehicle types to their groups
  const platformGroups = new Set<string>();
  platform.vehicleTypes.forEach((vehicle) => {
    const group = getVehicleGroup(vehicle);
    if (group) {
      platformGroups.add(group);
    }
  });
  
  // Check if any selected group matches platform's groups
  return vehicleList.some((vehicle) => platformGroups.has(vehicle));
};

const matchesCategories = (platform: Platform, categories: string[] | undefined) => {
  const categoryList = categories || [];
  if (categoryList.length === 0) {
    return true;
  }
  return categoryList.some(cat =>
    platform.categories.some(pCat => pCat.toLowerCase() === cat.toLowerCase())
  );
};

const matchesCountries = (platform: Platform, countries: string[] | undefined, locale: string) => {
  const countryList = countries || [];
  if (countryList.length === 0) {
    return true;
  }
  return countryList.some(country =>
    platform.countries.some(pCountry => pCountry.toLowerCase() === country.toLowerCase())
  );
};

const matchesStatus = (platform: Platform, statuses: string[] | undefined) => {
  const statusList = statuses || [];
  if (statusList.length === 0) {
    return true;
  }
  // Get status from regions
  const regionKeys = Object.keys(platform.regions);
  if (regionKeys.length === 0) return false;
  
  const platformStatus = platform.regions[regionKeys[0]]?.status;
  return platformStatus ? statusList.includes(platformStatus) : false;
};

const PlatformsClient: React.FC<PlatformsClientProps> = ({
  platforms,
  categories: allCategories,
}) => {
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    vehicles: [],
    categories: [],
    countries: [],
    statuses: [],
  });
  const [sortBy, setSortBy] = useState<'name' | 'rating'>('name');
  const [locale, setLocale] = useState('');

  // Determine user's country from browser language
  useEffect(() => {
    const userLocale = navigator.language || 'en-US';
    setLocale(userLocale);
  }, []);

  // Initialize filters from URL params
  useEffect(() => {
    const newFilters: FilterOptions = {
      search: searchParams.get('search') || '',
      vehicles: searchParams.getAll('vehicles') || [],
      categories: searchParams.getAll('categories') || [],
      countries: searchParams.getAll('countries') || [],
      statuses: searchParams.getAll('statuses') || [],
    };
    setFilters(newFilters);
  }, [searchParams]);

  // Determine country from locale
  const userCountry = useMemo(() => {
    if (!locale) return '';
    const parts = locale.split('-');
    return parts[parts.length - 1] === 'US' ? 'USA' : 'Canada';
  }, [locale]);

  // Available vehicle options generated from VEHICLE_GROUPS
  const vehicleOptions = useMemo(() => {
    return VEHICLE_GROUPS.map(group => ({
      value: group.value,
      label: group.label,
    }));
  }, []);

  // Available category options
  const categoryOptions = useMemo(() => {
    return allCategories.map(c => ({ value: c.id, label: c.name }));
  }, [allCategories]);

  // Available country options
  const countryOptions = useMemo(() => {
    const countries = new Set<string>();
    platforms.forEach(p => {
      p.countries.forEach(c => countries.add(c));
    });
    return Array.from(countries).sort().map(c => ({ value: c, label: c }));
  }, [platforms]);

  // Available status options
  const statusOptions = useMemo(() => {
    const statuses = new Set<string>();
    platforms.forEach(p => {
      // Get status from first region if available
      const regionKeys = Object.keys(p.regions);
      if (regionKeys.length > 0) {
        const firstRegion = p.regions[regionKeys[0]];
        if (firstRegion && firstRegion.status) {
          statuses.add(firstRegion.status);
        }
      }
    });
    return Array.from(statuses).sort().map(s => ({ value: s, label: s }));
  }, [platforms]);

  // Filter and sort platforms
  const filteredPlatforms = useMemo(() => {
    return platforms
      .filter(platform =>
        matchesSearch(platform, filters.search) &&
        matchesVehicleTypes(platform, filters.vehicles) &&
        matchesCategories(platform, filters.categories) &&
        matchesCountries(platform, filters.countries, locale) &&
        matchesStatus(platform, filters.statuses)
      )
      .sort((a, b) => {
        if (sortBy === 'rating') {
          return (b.rating || 0) - (a.rating || 0);
        }
        return a.name.localeCompare(b.name);
      });
  }, [platforms, filters, sortBy, locale]);

  const handleFilterChange = (key: keyof FilterOptions, value: unknown) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Gig Platforms</h1>
          <p className="text-gray-600">
            Find delivery and gig platforms in {userCountry || 'your country'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <FilterSidebar
              filters={filters}
              onFilterChange={handleFilterChange}
              vehicleOptions={vehicleOptions}
              categoryOptions={categoryOptions}
              countryOptions={countryOptions}
              statusOptions={statusOptions}
            />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="mb-6">
              <SearchBar
                value={filters.search || ''}
                onChange={value => handleFilterChange('search', value)}
              />
            </div>

            <div className="mb-6 flex justify-between items-center">
              <p className="text-gray-600">
                Showing {filteredPlatforms.length} of {platforms.length} platforms
              </p>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as 'name' | 'rating')}
                className="px-4 py-2 border border-gray-300 rounded-lg bg-white"
              >
                <option value="name">Sort by Name</option>
                <option value="rating">Sort by Rating</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredPlatforms.length > 0 ? (
                filteredPlatforms.map(platform => (
                  <PlatformCard key={platform.id} platform={platform} />
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <p className="text-gray-500 text-lg">No platforms match your filters.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlatformsClient;
