import { useState, useRef, useEffect } from "react";
import { Filter, X, ChevronDown } from "lucide-react";

export interface FilterOption {
  key: string;
  label: string;
  type: 'select' | 'text' | 'boolean';
  options?: { value: string; label: string }[];
}

interface AdvancedFiltersProps {
  filters: FilterOption[];
  activeFilters: Record<string, any>;
  onFiltersChange: (filters: Record<string, any>) => void;
  onClearFilters: () => void;
}

export default function AdvancedFilters({ 
  filters, 
  activeFilters, 
  onFiltersChange, 
  onClearFilters 
}: AdvancedFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...activeFilters };
    if (value === '' || value === null || value === undefined) {
      delete newFilters[key];
    } else {
      newFilters[key] = value;
    }
    onFiltersChange(newFilters);
  };

  const activeFilterCount = Object.keys(activeFilters).length;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`btn-outline flex items-center gap-1.5 text-xs transition-all ${
          activeFilterCount > 0 
            ? 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100' 
            : 'hover:bg-gray-50'
        }`}
      >
        <Filter className="w-3.5 h-3.5" />
        Filters
        {activeFilterCount > 0 && (
          <span className="bg-blue-600 text-white rounded-full px-1.5 py-0.5 text-xs min-w-[18px] h-[18px] flex items-center justify-center font-medium">
            {activeFilterCount}
          </span>
        )}
        <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl p-4 min-w-[320px] z-[100] max-h-[400px] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm text-gray-900">Filter Options</h3>
            {activeFilterCount > 0 && (
              <button
                onClick={onClearFilters}
                className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1 px-2 py-1 rounded hover:bg-red-50"
              >
                <X className="w-3 h-3" />
                Clear All ({activeFilterCount})
              </button>
            )}
          </div>

          <div className="space-y-4">
            {filters.map((filter) => (
              <div key={filter.key} className="space-y-2">
                <label className="text-xs font-semibold text-gray-700 block">{filter.label}</label>
                {filter.type === 'select' && filter.options ? (
                  <select
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                    value={activeFilters[filter.key] || ''}
                    onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                  >
                    <option value="">All {filter.label}</option>
                    {filter.options.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : filter.type === 'boolean' ? (
                  <select
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                    value={activeFilters[filter.key] || ''}
                    onChange={(e) => handleFilterChange(filter.key, e.target.value === 'true' ? true : e.target.value === 'false' ? false : '')}
                  >
                    <option value="">All</option>
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                ) : (
                  <input
                    type="text"
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={`Filter by ${filter.label.toLowerCase()}...`}
                    value={activeFilters[filter.key] || ''}
                    onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}