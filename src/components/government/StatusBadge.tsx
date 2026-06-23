import React from 'react';

interface StatusBadgeProps {
  status: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getStyles = (stat: string) => {
    switch (stat) {
      case 'New':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'Under Review':
        return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      case 'Assigned':
        return 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20';
      case 'In Progress':
        return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'Waiting for Citizen':
        return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      case 'Resolved':
        return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'Rejected':
        return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
      case 'Closed':
        return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
      default:
        return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
    }
  };

  return (
    <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-extrabold uppercase tracking-wider ${getStyles(status)}`}>
      {status}
    </span>
  );
};

export default StatusBadge;
