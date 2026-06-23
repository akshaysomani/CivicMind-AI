import React from 'react';
import { Search } from 'lucide-react';

interface SearchComponentProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
}

export const SearchComponent: React.FC<SearchComponentProps> = ({
  value,
  onChange,
  placeholder = 'Search community issues, announcements, alerts...',
  className = ''
}) => {
  return (
    <div className={`relative w-full ${className}`}>
      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
        <Search className="w-4.5 h-4.5" />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/40 dark:bg-slate-900/40 light:bg-white border border-white/10 dark:border-white/5 light:border-slate-205 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-slate-900 dark:text-slate-100 shadow-sm"
      />
    </div>
  );
};

export default SearchComponent;
