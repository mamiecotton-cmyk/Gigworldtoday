'use client';

import { useState } from 'react';

export interface FilterState {
  waitlistStatuses: string[];
  vehicleTypes: string[];
  minAge: number | null;
  noBackgroundCheck: boolean;
}

interface FilterSidebarProps {
  onFilterChange?: (filters: FilterState) => void;
}

export default function FilterSidebar({ onFilterChange }: FilterSidebarProps) {
  const [waitlistStatuses, setWaitlistStatuses] = useState<string[]>([]);
  const [vehicleTypes, setVehicleTypes] = useState<string[]>([]);
  const [minAge, setMinAge] = useState<number | null>(null);
  const [noBackgroundCheck, setNoBackgroundCheck] = useState(false);

  const handleWaitlistChange = (status: string) => {
    setWaitlistStatuses(prev => 
      prev.includes(status) 
        ? prev.filter(s => s !== status)
        : [...prev, status]
    );
  };

  const handleVehicleChange = (vehicle: string) => {
    setVehicleTypes(prev => 
      prev.includes(vehicle) 
        ? prev.filter(v => v !== vehicle)
        : [...prev, vehicle]
    );
  };

  const handleAgeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setMinAge(value ? parseInt(value) : null);
  };

  const handleApplyFilters = () => {
    if (onFilterChange) {
      onFilterChange({
        waitlistStatuses,
        vehicleTypes,
        minAge,
        noBackgroundCheck
      });
    }
  };

  const handleClearFilters = () => {
    setWaitlistStatuses([]);
    setVehicleTypes([]);
    setMinAge(null);
    setNoBackgroundCheck(false);
    if (onFilterChange) {
      onFilterChange({
        waitlistStatuses: [],
        vehicleTypes: [],
        minAge: null,
        noBackgroundCheck: false
      });
    }
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (waitlistStatuses.length > 0) count += waitlistStatuses.length;
    if (vehicleTypes.length > 0) count += vehicleTypes.length;
    if (minAge !== null) count++;
    if (noBackgroundCheck) count++;
    return count;
  };

  const activeCount = getActiveFilterCount();

  const statusLabels: Record<string, string> = {
    open: 'Accepting',
    waitlist: 'Waitlist',
    closed: 'Closed'
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-lg">Filters</h3>
        {activeCount > 0 && (
          <span className="bg-primary-600 text-white text-xs font-medium px-2 py-1 rounded-full">
            {activeCount}
          </span>
        )}
      </div>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Waitlist Status
          </label>
          <div className="space-y-2">
            {['open', 'waitlist', 'closed'].map((status) => (
              <label key={status} className="flex items-center">
                <input
                  type="checkbox"
                  checked={waitlistStatuses.includes(status)}
                  onChange={() => handleWaitlistChange(status)}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="ml-2 text-sm text-gray-700">{statusLabels[status]}</span>
              </label>
            ))}
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Vehicle Requirements
          </label>
          <div className="space-y-2">
            {['none', 'bike', 'car', 'suv', 'van'].map((vehicle) => (
              <label key={vehicle} className="flex items-center">
                <input
                  type="checkbox"
                  checked={vehicleTypes.includes(vehicle)}
                  onChange={() => handleVehicleChange(vehicle)}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="ml-2 text-sm text-gray-700 capitalize">{vehicle}</span>
              </label>
            ))}
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Age Requirements
          </label>
          <select 
            value={minAge || ''} 
            onChange={handleAgeChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
          >
            <option value="">Any age</option>
            <option value="18">18+</option>
            <option value="21">21+</option>
          </select>
        </div>
        
        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={noBackgroundCheck}
              onChange={(e) => setNoBackgroundCheck(e.target.checked)}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <span className="ml-2 text-sm text-gray-700">No background check required</span>
          </label>
        </div>
        
        <button 
          onClick={handleApplyFilters}
          className="w-full bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700 transition-colors font-medium"
        >
          Apply Filters
        </button>
        
        <button 
          onClick={handleClearFilters}
          className="w-full text-sm text-gray-600 hover:text-gray-900"
        >
          Clear all filters
        </button>
      </div>
    </div>
  );
}
