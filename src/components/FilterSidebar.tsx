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

const GIG_TYPE_PILLS: Array<{
  id: string;
  label: string;
  group: 'Delivery' | 'Services';
  dataCategories: string[];
}> = [
  { id: 'food_delivery',         label: 'Restaurant',    group: 'Delivery', dataCategories: ['food_delivery'] },
  { id: 'grocery_delivery',      label: 'Grocery',       group: 'Delivery', dataCategories: ['grocery_delivery', 'quick_commerce'] },
  { id: 'alcohol_delivery',      label: 'Alcohol',       group: 'Delivery', dataCategories: ['alcohol_delivery'] },
  { id: 'catering_delivery',     label: 'Catering',      group: 'Delivery', dataCategories: ['catering_delivery'] },
  { id: 'package_delivery',      label: 'Packages',      group: 'Delivery', dataCategories: ['specialty_courier','package_delivery', 'ecommerce_delivery', 'last_mile', 'same_day_delivery', 'courier', 'auto_parts_delivery'] },
  { id: 'prescription_delivery', label: 'Prescription',  group: 'Delivery', dataCategories: ['prescription_delivery'] },
  { id: 'rideshare',             label: 'Rideshare',     group: 'Services', dataCategories: ['rideshare'] },
  { id: 'task_based',            label: 'Tasks',         group: 'Services', dataCategories: ['task_based'] },
  { id: 'pet_care',              label: 'Pet Care',      group: 'Services', dataCategories: ['pet_care'] },
  { id: 'moving',                label: 'Moving',        group: 'Services', dataCategories: ['moving'] },
];

export const PILL_TO_DATA_CATEGORIES: Record<string, string[]> = Object.fromEntries(
  GIG_TYPE_PILLS.map((p) => [p.id, p.dataCategories])
);

const VEHICLE_GROUPS: Record<string, string[]> = {
  'No Vehicle Needed': ['none', 'walking', 'bike', 'scooter'],
  'Car / Sedan': ['car', 'sedan', 'motorcycle'],
  'SUV / Van': ['suv', 'minivan', 'van', 'cargo_van', 'sprinter_van'],
  'Truck / Large': ['pickup', 'truck', 'box_truck', 'flatbed', 'suv_trailer', 'refrigerated_van'],
};

const VEHICLE_LABELS: Record<string, string> = {
  none: 'No vehicle', walking: 'Walking', bike: 'Bicycle', scooter: 'Scooter',
  motorcycle: 'Motorcycle', car: 'Car', sedan: 'Sedan',
  suv: 'SUV', minivan: 'Minivan', van: 'Van', cargo_van: 'Cargo Van',
  sprinter_van: 'Sprinter', pickup: 'Pickup', truck: 'Truck', box_truck: 'Box Truck',
  flatbed: 'Flatbed', suv_trailer: 'SUV + Trailer', refrigerated_van: 'Refrigerated',
};

const PILL_LABEL_MAP: Record<string, string> = Object.fromEntries(
  GIG_TYPE_PILLS.map((p) => [p.id, p.label])
);

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
  countryOptions,
  payFrequencyOptions,
}: FilterSidebarProps) {
  const selectedVehicles = new Set<string>(filters.vehicles || []);
  const selectedCategories = new Set<string>(filters.categories || []);
  const selectedCountries = new Set<string>(filters.countries || []);
  const selectedPayFreq = new Set<string>(filters.payFrequency || []);
  const instantFilter = typeof filters.instantPayout === 'boolean' ? filters.instantPayout : undefined;

  const toggleInSet = (set: Set<string>, value: string): string[] => {
    const next = new Set<string>(set);
    next.has(value) ? next.delete(value) : next.add(value);
    return Array.from(next);
  };

  const totalFilters =
    (filters.vehicles?.length || 0) +
    (filters.categories?.length || 0) +
    (filters.countries?.length || 0) +
    (filters.payFrequency?.length || 0) +
    (filters.deliveryType ? 1 : 0) +
    (typeof filters.instantPayout === 'boolean' ? 1 : 0);

  const clearAll = () => {
    onFilterChange('vehicles', []);
    onFilterChange('categories', []);
    onFilterChange('countries', []);
    onFilterChange('deliveryType', '');
    onFilterChange('payFrequency', []);
    onFilterChange('instantPayout', undefined);
  };

  const availableVehs = new Set<string>(vehicleOptions.map((v) => v.value));

  const deliveryPills = GIG_TYPE_PILLS.filter((p) => p.group === 'Delivery');
  const servicePills = GIG_TYPE_PILLS.filter((p) => p.group === 'Services');

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
            <div>
              <p className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold mb-1">Delivery</p>
              <div className="flex flex-wrap gap-1.5">
                {deliveryPills.map((pill) => (
                  <Pill
                    key={pill.id}
                    label={pill.label}
                    selected={selectedCategories.has(pill.id)}
                    onClick={() => onFilterChange('categories', toggleInSet(selectedCategories, pill.id))}
                  />
                ))}
              </div>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold mb-1">Services</p>
              <div className="flex flex-wrap gap-1.5">
                {servicePills.map((pill) => (
                  <Pill
                    key={pill.id}
                    label={pill.label}
                    selected={selectedCategories.has(pill.id)}
                    onClick={() => onFilterChange('categories', toggleInSet(selectedCategories, pill.id))}
                  />
                ))}
              </div>
            </div>
          </div>
        </Section>

        {/* Vehicle */}
        <Section title="Vehicle" count={filters.vehicles?.length || 0}>
          <div className="space-y-2.5">
            {Object.entries(VEHICLE_GROUPS).map(([group, vehs]) => {
              const available = vehs.filter((v: string) => availableVehs.has(v));
              if (!available.length) return null;
              return (
                <div key={group}>
                  <p className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold mb-1">{group}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {available.map((veh: string) => (
                      <Pill
                        key={veh}
                        label={VEHICLE_LABELS[veh] || veh.replace(/_/g, ' ')}
                        selected={selectedVehicles.has(veh)}
                        onClick={() => onFilterChange('vehicles', toggleInSet(selectedVehicles, veh))}
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
              { value: 'instant', label: 'Instant' },
            ]).map((opt) => (
              <Pill
                key={opt.value}
                label={opt.label}
                selected={selectedPayFreq.has(opt.value)}
                onClick={() => onFilterChange('payFrequency', toggleInSet(selectedPayFreq, opt.value))}
              />
            ))}
          </div>
        </Section>

        {/* Instant Cash Out Available */}
        <Section title="Instant Cash Out Available" count={typeof instantFilter === 'boolean' ? 1 : 0}>
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
                  onClick={() => onFilterChange('countries', toggleInSet(selectedCountries, c.value))}
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
            {(filters.categories || []).map((cat: string) => (
              <span key={cat} className="inline-flex items-center gap-1 px-2 py-0.5 bg-teal-500/10 text-teal-600 rounded-full text-[11px] font-medium">
                {PILL_LABEL_MAP[cat] || cat.replace(/_/g, ' ')}
                <button onClick={() => onFilterChange('categories', (filters.categories || []).filter((c: string) => c !== cat))} className="hover:text-red-500">✕</button>
              </span>
            ))}
            {(filters.vehicles || []).map((veh: string) => (
              <span key={veh} className="inline-flex items-center gap-1 px-2 py-0.5 bg-teal-500/10 text-teal-600 rounded-full text-[11px] font-medium">
                {VEHICLE_LABELS[veh] || veh.replace(/_/g, ' ')}
                <button onClick={() => onFilterChange('vehicles', (filters.vehicles || []).filter((v: string) => v !== veh))} className="hover:text-red-500">✕</button>
              </span>
            ))}
            {(filters.payFrequency || []).map((freq: string) => (
              <span key={freq} className="inline-flex items-center gap-1 px-2 py-0.5 bg-teal-500/10 text-teal-600 rounded-full text-[11px] font-medium">
                {freq.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())}
                <button onClick={() => onFilterChange('payFrequency', (filters.payFrequency || []).filter((f: string) => f !== freq))} className="hover:text-red-500">✕</button>
              </span>
            ))}
            {(filters.countries || []).map((c: string) => (
              <span key={c} className="inline-flex items-center gap-1 px-2 py-0.5 bg-teal-500/10 text-teal-600 rounded-full text-[11px] font-medium">
                {c}
                <button onClick={() => onFilterChange('countries', (filters.countries || []).filter((x: string) => x !== c))} className="hover:text-red-500">✕</button>
              </span>
            ))}
            {filters.deliveryType && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-teal-500/10 text-teal-600 rounded-full text-[11px] font-medium">
                {filters.deliveryType === 'on_demand' ? 'On Demand' : 'Scheduled'}
                <button onClick={() => onFilterChange('deliveryType', '')} className="hover:text-red-500">✕</button>
              </span>
            )}
            {typeof filters.instantPayout === 'boolean' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-teal-500/10 text-teal-600 rounded-full text-[11px] font-medium">
                Instant Cash Out: {filters.instantPayout ? 'Yes' : 'No'}
                <button onClick={() => onFilterChange('instantPayout', undefined)} className="hover:text-red-500">✕</button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}