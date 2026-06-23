import React from 'react';

interface FilterComponentProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  options: string[];
}

export const FilterComponent: React.FC<FilterComponentProps> = ({
  label,
  value,
  onChange,
  options
}) => {
  return (
    <div className="flex flex-col gap-1 w-full sm:w-auto">
      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="px-3.5 py-2.5 rounded-xl bg-slate-900/40 dark:bg-slate-900/40 light:bg-white border border-white/10 dark:border-white/5 light:border-slate-205 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-slate-900 dark:text-slate-100 shadow-sm"
      >
        {options.map((opt) => (
          <option key={opt} value={opt} className="bg-slate-950 dark:bg-slate-950 light:bg-white text-slate-900 dark:text-slate-100">
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
};

export default FilterComponent;
