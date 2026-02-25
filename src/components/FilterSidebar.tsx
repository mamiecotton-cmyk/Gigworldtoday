'use client';

import { useState } from 'react';
import { FilterOptions } from '@/lib/types';

interface FilterSidebarProps {
  filters: FilterOptions;
  onFilterChange: (key: keyof FilterOptions, value: unknown) => void;
  vehicleOptions: Array<{ value: string; label: string }>;
  categoryOptions: Array<{ value: string; label: string }>;
  countryOptions: Array<{ value: string; label: string }>;
  statusOptions: Array<{ value: string; label: string }>;
  payFrequencyOptions?: Array<{ value: string; label: string }>;
  deliveryTypeOptions?: Array<{ value: string; label: string }>;
  availabilityOptions?: Array<{ value: string; label: string }>;
}

// Group categories into logical sections
const CATEGORY_GROUPS: Record<string, string[]> = {
  'Delivery': ['food_delivery', 'grocery_delivery', 'alcohol_delivery', 'package_delivery', 'ecommerce_delivery', 'same_day_delivery', 'quick_commerce', 'last_mile', 'catering_delivery'],
  'Services': ['rideshare', 'task_based', 'pet_care', 'moving', 'courier'],
};

// Group vehicles into logical sections
const VEHICLE_GROUPS: Record<string, string[]> = {
  'No Vehicle Needed': ['none', 'walking', 'bike', 'scooter'],
  'Car / Sedan': ['car', 'sedan', 'motorcycle'],
  'SUV / Van': ['suv', 'minivan', 'van', 'cargo_van', 'sprinter_van'],
  'Truck / Large': ['pickup', 'truck', 'box_truck', 'flatbed', 'suv_trailer', 'refrigerated_van'],
};

const CATEGORY_LABELS: Record<string, string> = {
  food_delivery: 'Fast Food', grocery_delivery: 'Grocery', alcohol_delivery: 'Alcohol',
  package_delivery: 'Packages', ecommerce_delivery: 'E-Commerce', same_day_delivery: 'Same Day',
  quick_commerce: 'Quick Commerce', last_mile: 'Last Mile', auto_parts_delivery: 'Auto Parts',
  catering_delivery: 'Catering', rideshare: 'Rideshare', task_based: 'Tasks',
  pet_care: 'Pet Care', moving: 'Moving', courier: 'Courier',
};

const VEHICLE_LABELS: Record<string, string> = {
  none: 'No vehicle', walking: 'Walking', bike: 'Bicycle', scooter: 'Scooter',
  motorcycle: 'Motorcycle', car: 'Car', sedan: 'Sedan',
  suv: 'SUV', minivan: 'Minivan', van: 'Van', cargo_van: 'Cargo Van',
  sprinter_van: 'Sprinter', pickup: 'Pickup', truck: 'Truck', box_truck: 'Box Truck',
  flatbed: 'Flatbed', suv_trailer: 'SUV + Trailer', refrigerated_van: 'Refrigerated',
};

function Section({
  title,
  children,
  defaultOpen = false,
  count = 0,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  count?: number;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-gray-100 last:border-b-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full py-3 text-sm font-semibold text-gray-800 hover:text-teal-600 transition-colors"
      >
        <span className="flex items-center gap-2">
          {title}
          {count > 0 && (
            <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[10px] font-bold text-white bg-teal-500 rounded-full">
              {count}
            </span>
          )}
        </span>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div
        className={`overflow-hidden transition-all duration-200 ${open ? 'max-h-96 opacity-100 pb-3' : 'max-h-0 opacity-0'}`}
      >
        {children}
      </div>
    </div>
  );
}

function Pill({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
        selected
          ? 'bg-teal-500 text-white shadow-sm'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      }`}
    >
      {label}
    </button>
  );
}

export default function FilterSidebar({
  filters,
  onFilterChange,
  vehicleOptions,
  categoryOptions,
  countryOptions,
  payFrequencyOptions,
}: FilterSidebarProps) {
  const selectedVehicles = new Set(filters.vehicles || []);
  const selectedCategories = new Set(filters.categories || []);
  const selectedCountries = new Set(filters.countries || []);
  const selectedPayFreq = new Set(filters.payFrequency || []);
  const instantFilter = typeof filters.instantPayout === 'boolean' ? filters.instantPayout : undefined;

  const toggle = (set: Set<string>, value: string) => {
    const next = new Set(set);
    next.has(value) ? next.delete(value) : next.add(value);
    return Array.from(next);
  };

  const totalFilters =
    (filters.vehicles?.length || 0) +
    (filters.categories?.length || 0) +
    (filters.countries?.length || 0) +
    (filters.deliveryType ? 1 : 0);

  const clearAll = () => {
    onFilterChange('vehicles', []);
    onFilterChange('categories', []);
    onFilterChange('countries', []);
    onFilterChange('deliveryType', '');
  };

  const availableCats = new Set(categoryOptions.map((c) => c.value));
  const availableVehs = new Set(vehicleOptions.map((v) => v.value));

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <span className="font-bold text-sm text-gray-900">Filters</span>
        {totalFilters > 0 && (
          <button
            onClick={clearAll}
            className="text-[11px] text-gray-400 hover:text-red-500 transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      <div className="px-4">
        {/* Gig Type */}
        <Section title="Gig Type" defaultOpen={true} count={filters.categories?.length || 0}>
          <div className="space-y-2.5">
            {Object.entries(CATEGORY_GROUPS).map(([group, cats]) => {
              const available = cats.filter((c) => availableCats.has(c));
              if (!available.length) return null;
              return (
                <div key={group}>
                  <p className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold mb-1">{group}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {available.map((cat) => (
                      <Pill
                        key={cat}
                        label={CATEGORY_LABELS[cat] || cat.replace(/_/g, ' ')}
                        selected={selectedCategories.has(cat)}
                        onClick={() => onFilterChange('categories', toggle(selectedCategories, cat))}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </Section>

        {/* Vehicle */}
        <Section title="Vehicle" count={filters.vehicles?.length || 0}>
          <div className="space-y-2.5">
            {Object.entries(VEHICLE_GROUPS).map(([group, vehs]) => {
              const available = vehs.filter((v) => availableVehs.has(v));
              if (!available.length) return null;
              return (
                <div key={group}>
                  <p className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold mb-1">{group}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {available.map((veh) => (
                      <Pill
                        key={veh}
                        label={VEHICLE_LABELS[veh] || veh.replace(/_/g, ' ')}
                        selected={selectedVehicles.has(veh)}
                        onClick={() => onFilterChange('vehicles', toggle(selectedVehicles, veh))}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </Section>

        {/* Schedule */}
        <Section title="Schedule" count={filters.deliveryType ? 1 : 0}>
          <div className="flex flex-wrap gap-1.5">
            {[
              { value: '', label: 'Any' },
              { value: 'on_demand', label: 'On Demand' },
              { value: 'scheduled', label: 'Scheduled' },
            ].map((opt) => (
              <Pill
                key={opt.value}
                label={opt.label}
                selected={opt.value === '' ? !filters.deliveryType : filters.deliveryType === opt.value}
                onClick={() => onFilterChange('deliveryType', opt.value)}
              />
            ))}
          </div>
        </Section>

        {/* Pay Frequency */}
        <Section title="Pay Frequency" count={filters.payFrequency?.length || 0}>
          <div className="flex flex-wrap gap-1.5">
            {(payFrequencyOptions || [
              { value: 'weekly', label: 'Weekly' },
              { value: 'twice_weekly', label: 'Twice Weekly' },
              { value: 'daily', label: 'Daily' },
              { value: 'per_delivery', label: 'Per Delivery' },
            ]).map((opt) => (
              <Pill
                key={opt.value}
                label={opt.label}
                selected={selectedPayFreq.has(opt.value)}
                onClick={() => onFilterChange('payFrequency', selectedPayFreq.has(opt.value) ? Array.from(selectedPayFreq).filter((v) => v !== opt.value) : [...Array.from(selectedPayFreq), opt.value])}
              />
            ))}
          </div>
        </Section>

        {/* Instant Cash Out Available */}
        <Section title="Instant Cash Out Available" count={instantFilter ? 1 : 0}>
          <div className="flex flex-wrap gap-1.5">
            <Pill
              key="instant_yes"
              label="Yes"
              selected={instantFilter === true}
              onClick={() => onFilterChange('instantPayout', instantFilter === true ? undefined : true)}
            />
            <Pill
              key="instant_no"
              label="No"
              selected={instantFilter === false}
              onClick={() => onFilterChange('instantPayout', instantFilter === false ? undefined : false)}
            />
          </div>
        </Section>

        {/* Country */}
        {countryOptions.length > 1 && (
          <Section title="Country" count={filters.countries?.length || 0}>
            <div className="flex flex-wrap gap-1.5">
              {countryOptions.map((c) => (
                <Pill
                  key={c.value}
                  label={c.label}
                  selected={selectedCountries.has(c.value)}
                  onClick={() => onFilterChange('countries', toggle(selectedCountries, c.value))}
                />
              ))}
            </div>
          </Section>
        )}
      </div>

      {/* Active filters summary */}
      {totalFilters > 0 && (
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
          <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold mb-1.5">Active</p>
          <div className="flex flex-wrap gap-1">
            {(filters.categories || []).map((cat) => (
              <span key={cat} className="inline-flex items-center gap-1 px-2 py-0.5 bg-teal-500/10 text-teal-600 rounded-full text-[11px] font-medium">
                {CATEGORY_LABELS[cat] || cat.replace(/_/g, ' ')}
                <button onClick={() => onFilterChange('categories', (filters.categories || []).filter((c) => c !== cat))} className="hover:text-red-500">✕</button>
              </span>
            ))}
            {(filters.vehicles || []).map((veh) => (
              <span key={veh} className="inline-flex items-center gap-1 px-2 py-0.5 bg-teal-500/10 text-teal-600 rounded-full text-[11px] font-medium">
                {VEHICLE_LABELS[veh] || veh.replace(/_/g, ' ')}
                <button onClick={() => onFilterChange('vehicles', (filters.vehicles || []).filter((v) => v !== veh))} className="hover:text-red-500">✕</button>
              </span>
            ))}
            {(filters.countries || []).map((c) => (
              <span key={c} className="inline-flex items-center gap-1 px-2 py-0.5 bg-teal-500/10 text-teal-600 rounded-full text-[11px] font-medium">
                {c}
                <button onClick={() => onFilterChange('countries', (filters.countries || []).filter((x) => x !== c))} className="hover:text-red-500">✕</button>
              </span>
            ))}
            {filters.deliveryType && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-teal-500/10 text-teal-600 rounded-full text-[11px] font-medium">
                {filters.deliveryType === 'on_demand' ? 'On Demand' : 'Scheduled'}
                <button onClick={() => onFilterChange('deliveryType', '')} className="hover:text-red-500">✕</button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
