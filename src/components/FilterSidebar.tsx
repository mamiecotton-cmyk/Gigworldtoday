interface FilterSidebarProps {
  onFilterChange?: (filters: any) => void;
}

export default function FilterSidebar({ onFilterChange }: FilterSidebarProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="font-semibold text-lg mb-4">Filters</h3>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Waitlist Status
          </label>
          <div className="space-y-2">
            {['Accepting', 'Waitlist', 'Closed'].map((status) => (
              <label key={status} className="flex items-center">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="ml-2 text-sm text-gray-700">{status}</span>
              </label>
            ))}
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Vehicle Requirements
          </label>
          <div className="space-y-2">
            {['None', 'Bike', 'Car', 'SUV', 'Van'].map((vehicle) => (
              <label key={vehicle} className="flex items-center">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="ml-2 text-sm text-gray-700">{vehicle}</span>
              </label>
            ))}
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Age Requirements
          </label>
          <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200">
            <option value="">Any age</option>
            <option value="18">18+</option>
            <option value="21">21+</option>
          </select>
        </div>
        
        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <span className="ml-2 text-sm text-gray-700">No background check required</span>
          </label>
        </div>
        
        <button className="w-full bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700 transition-colors font-medium">
          Apply Filters
        </button>
        
        <button className="w-full text-sm text-gray-600 hover:text-gray-900">
          Clear all filters
        </button>
      </div>
    </div>
  );
}
