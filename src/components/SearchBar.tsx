import { Search } from 'lucide-react';

interface SearchBarProps {
  placeholder?: string;
  className?: string;
  value?: string;
  onChange?: (value: string) => void;
}

export default function SearchBar({ 
  placeholder = "Search platforms...",
  className = "",
  value,
  onChange
}: SearchBarProps) {
  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
      />
    </div>
  );
}
