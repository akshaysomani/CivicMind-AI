import React from 'react';

interface PriorityBadgeProps {
  priority: string;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority }) => {
  const getStyles = (prio: string) => {
    switch (prio) {
      case 'Low':
        return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
      case 'Medium':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'High':
        return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      case 'Critical':
        return 'bg-rose-500/10 text-rose-500 border-rose-500/20 animate-pulse';
      default:
        return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
    }
  };

  return (
    <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-extrabold uppercase tracking-wider ${getStyles(priority)}`}>
      {priority}
    </span>
  );
};

export default PriorityBadge;
