import React from 'react';
import { FilterComponent } from '../dashboard/FilterComponent';

interface AdvancedFilterProps {
  category: string;
  setCategory: (val: string) => void;
  priority: string;
  setPriority: (val: string) => void;
  status: string;
  setStatus: (val: string) => void;
  ward: string;
  setWard: (val: string) => void;
  onClear: () => void;
}

export const AdvancedFilter: React.FC<AdvancedFilterProps> = ({
  category,
  setCategory,
  priority,
  setPriority,
  status,
  setStatus,
  ward,
  setWard,
  onClear
}) => {
  return (
    <div className="bg-slate-900/20 dark:bg-slate-900/20 light:bg-white/40 border border-white/10 dark:border-white/5 light:border-slate-205 rounded-2xl p-5 backdrop-blur-md shadow-sm space-y-4">
      <div className="flex flex-wrap gap-4 items-end justify-between">
        <div className="flex flex-wrap gap-4 flex-1">
          <FilterComponent
            label="Category"
            value={category}
            onChange={setCategory}
            options={['All', 'Infrastructure', 'Waste Supply', 'Water Supply', 'Electricity', 'Healthcare', 'Education', 'Sanitation', 'Environment', 'Traffic', 'Public Safety']}
          />
          <FilterComponent
            label="Priority"
            value={priority}
            onChange={setPriority}
            options={['All', 'Low', 'Medium', 'High', 'Critical']}
          />
          <FilterComponent
            label="Status"
            value={status}
            onChange={setStatus}
            options={['All', 'New', 'Under Review', 'Assigned', 'In Progress', 'Waiting for Citizen', 'Resolved', 'Rejected', 'Closed']}
          />
          <FilterComponent
            label="Zoning Ward"
            value={ward}
            onChange={setWard}
            options={['All', 'Ward 1 - Richmond', 'Ward 2 - Marina', 'Ward 3 - Financial', 'Ward 4 - Mission', 'Ward 5 - Sunset']}
          />
        </div>
        
        <button
          onClick={onClear}
          className="px-4 py-2 border border-slate-700/60 light:border-slate-300 text-slate-450 hover:text-slate-900 dark:hover:text-slate-100 text-xs font-bold rounded-xl bg-slate-950/30 hover:bg-slate-800/40 transition-colors shrink-0"
        >
          Reset Filters
        </button>
      </div>
    </div>
  );
};

export default AdvancedFilter;
