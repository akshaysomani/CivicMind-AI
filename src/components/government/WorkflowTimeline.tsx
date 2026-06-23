import React from 'react';
import { Check, AlertTriangle, XCircle, Clock } from 'lucide-react';

interface WorkflowTimelineProps {
  currentStatus: string;
}

export const WorkflowTimeline: React.FC<WorkflowTimelineProps> = ({ currentStatus }) => {
  const steps = [
    { label: 'New', desc: 'Awaiting triage' },
    { label: 'Under Review', desc: 'Analyzing details' },
    { label: 'Assigned', desc: 'Officer appointed' },
    { label: 'In Progress', desc: 'Work under way' },
    { label: 'Waiting for Citizen', desc: 'Citizen clarification' },
    { label: 'Resolved', desc: 'Resolution logged' },
    { label: 'Closed', desc: 'Archived cases' }
  ];

  // Adjust index based on status (e.g. Rejected acts as final resolved/closed state)
  const getActiveIndex = (status: string) => {
    switch (status) {
      case 'New': return 0;
      case 'Under Review': return 1;
      case 'Assigned': return 2;
      case 'In Progress': return 3;
      case 'Waiting for Citizen': return 4;
      case 'Resolved': return 5;
      case 'Rejected': return 5; // maps to triage terminate
      case 'Closed': return 6;
      default: return 0;
    }
  };

  const activeIndex = getActiveIndex(currentStatus);

  const getStepIcon = (idx: number, status: string) => {
    if (idx < activeIndex) return <Check className="w-3.5 h-3.5" />;
    
    if (idx === activeIndex) {
      if (status === 'Rejected') return <XCircle className="w-3.5 h-3.5 text-rose-500 animate-pulse" />;
      if (status === 'Waiting for Citizen') return <AlertTriangle className="w-3.5 h-3.5 text-orange-500 animate-pulse" />;
      return <Clock className="w-3.5 h-3.5 text-secondary animate-pulse" />;
    }
    
    return <span className="text-[10px] font-bold">{idx + 1}</span>;
  };

  const getStepColorClass = (idx: number) => {
    if (idx < activeIndex) {
      return 'bg-emerald-500 text-slate-950 border-emerald-500';
    }
    if (idx === activeIndex) {
      if (currentStatus === 'Rejected') return 'bg-rose-500/20 text-rose-500 border-rose-500';
      if (currentStatus === 'Waiting for Citizen') return 'bg-orange-500/20 text-orange-500 border-orange-500';
      return 'bg-secondary/20 text-secondary border-secondary';
    }
    return 'bg-slate-900/40 text-slate-500 border-white/10';
  };

  return (
    <div className="py-4">
      {/* Horizontal workflow timeline */}
      <div className="relative flex items-center justify-between w-full">
        {/* Track Line */}
        <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-0.5 bg-white/5 dark:bg-white/5 light:bg-slate-200 z-0">
          <div 
            className="h-full bg-emerald-500 transition-all duration-500" 
            style={{ width: `${(Math.min(activeIndex, steps.length - 2) / (steps.length - 2)) * 100}%` }}
          />
        </div>

        {/* Steps */}
        {steps.map((step, idx) => {
          const isTerminalFail = idx === 5 && currentStatus === 'Rejected';
          const labelText = isTerminalFail ? 'Rejected' : step.label;
          
          return (
            <div key={idx} className="flex flex-col items-center z-10 relative group">
              <div className={`w-8 h-8 rounded-full border flex items-center justify-center font-bold text-xs transition-colors duration-300 bg-slate-950 ${getStepColorClass(idx)}`}>
                {getStepIcon(idx, currentStatus)}
              </div>
              
              {/* Tooltip detail */}
              <div className="absolute top-10 bg-slate-900 border border-white/5 rounded-lg px-2.5 py-1 text-[10px] font-bold text-slate-300 opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 shadow-md whitespace-nowrap z-30">
                {step.desc}
              </div>
              
              <span className={`text-[10px] font-bold uppercase tracking-wider mt-2.5 ${
                idx === activeIndex 
                  ? 'text-secondary font-extrabold' 
                  : idx < activeIndex ? 'text-emerald-500' : 'text-slate-500'
              }`}>
                {labelText}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WorkflowTimeline;
