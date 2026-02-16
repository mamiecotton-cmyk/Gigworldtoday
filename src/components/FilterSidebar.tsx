'use client';

import { FilterOptions } from '@/lib/types';

interface FilterSidebarProps {
  filters: FilterOptions;
  onFilterChange: (key: keyof FilterOptions, value: unknown) => void;
  vehicleOptions: Array<{ value: string; label: string }>;
  categoryOptions: Array<{ value: string; label: string }>;
  countryOptions: Array<{ value: string; label: string }>;
  statusOptions: Array<{ value: string; label: string }>;
}

export default function FilterSidebar({
  filters,
  onFilterChange,
  vehicleOptions,
  categoryOptions,
  countryOptions,
  statusOptions,
}: FilterSidebarProps) {
  const vehicles = new Set(filters.vehicles || []);
  const categories = new Set(filters.categories || []);
  const countries = new Set(filters.countries || []);
  const statuses = new Set(filters.statuses || []);

  const toggleOption = (set: Set<string>, value: string) => {
    const next = new Set(set);
    if (next.has(value)) {
      next.delete(value);
    } else {
      next.add(value);
    }
    return Array.from(next);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="font-semibold text-lg mb-4">Filters</h3>
      
      <div className="space-y-6">
        {vehicleOptions.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vehicle Requirements
            </label>
            <div className="space-y-2">
              {vehicleOptions.map((vehicle) => (
                <label key={vehicle.value} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={vehicles.has(vehicle.value)}
                    onChange={() => onFilterChange('vehicles', toggleOption(vehicles, vehicle.value))}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">{vehicle.label}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {categoryOptions.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categories
            </label>
            <div className="space-y-2">
              {categoryOptions.map((category) => (
                <label key={category.value} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={categories.has(category.value)}
                    onChange={() => onFilterChange('categories', toggleOption(categories, category.value))}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">{category.label}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {countryOptions.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Countries
            </label>
            <div className="space-y-2">
              {countryOptions.map((country) => (
                <label key={country.value} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={countries.has(country.value)}
                    onChange={() => onFilterChange('countries', toggleOption(countries, country.value))}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">{country.label}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {statusOptions.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <div className="space-y-2">
              {statusOptions.map((status) => (
                <label key={status.value} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={statuses.has(status.value)}
                    onChange={() => onFilterChange('statuses', toggleOption(statuses, status.value))}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">{status.label}</span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
