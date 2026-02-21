import { Search } from 'lucide-react';
import { useState, useRef } from 'react';

interface SmartSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  radius: number;
  onRadiusChange: (radius: number) => void;
  suggestions?: string[];
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onSuggestionSelect?: (value: string) => void;
}

export default function SmartSearchBar({
  value,
  onChange,
  radius = 60,
  onRadiusChange,
  suggestions = [],
  onKeyDown,
  onSuggestionSelect,
}: SmartSearchBarProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="relative flex gap-2 items-center w-full">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 100)}
          placeholder="Enter your city or ZIP code..."
          className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200 text-lg"
          onKeyDown={onKeyDown}
        />
        {showSuggestions && suggestions.length > 0 && (
          <ul className="absolute z-10 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
            {suggestions.map((s, idx) => (
              <li
                key={idx}
                className="px-4 py-2 hover:bg-primary-50 cursor-pointer"
                onMouseDown={() => {
                  onChange(s);
                  setShowSuggestions(false);
                  inputRef.current?.blur();
                  if (onSuggestionSelect) {
                    onSuggestionSelect(s);
                  }
                }}
              >
                {s}
              </li>
            ))}
          </ul>
        )}
      </div>
      <select
        value={radius}
        onChange={e => onRadiusChange(Number(e.target.value))}
        className="border-2 border-gray-200 rounded-lg px-3 py-2 text-lg focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200 bg-white"
      >
        {[10, 30, 60, 100].map(option => (
          <option key={option} value={option}>{option} miles</option>
        ))}
      </select>
    </div>
  );
}
