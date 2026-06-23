import React, { useState } from 'react';
import { BarChart3, ChevronDown, ChevronUp, AlertCircle, PieChart, TrendingUp } from 'lucide-react';
import { useMap } from '../../context/MapContext';

export const AnalyticsPanel: React.FC = () => {
  const { statistics, filteredIssues } = useMap();
  const [isOpen, setIsOpen] = useState(false);

  if (!statistics) return null;

  // Use values from statistics, but scale total to the active filtered list count
  const totalVisible = filteredIssues.length;
  
  // Recalculate priority counts locally from filteredIssues list for exact real-time compliance
  const priorities = { Critical: 0, High: 0, Medium: 0, Low: 0 };
  filteredIssues.forEach(i => {
    if (i.priority in priorities) {
      priorities[i.priority as keyof typeof priorities]++;
    }
  });

  return (
    <div className="absolute bottom-4 right-4 z-40">
      {/* Toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-white/10 bg-slate-950/80 backdrop-blur-md text-xs font-bold text-slate-100 hover:bg-slate-900 transition-colors shadow-lg cursor-pointer"
        aria-label="Toggle Analytics Panel"
      >
        <BarChart3 className="w-4 h-4 text-emerald-500" />
        <span>Map Analytics</span>
        {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
      </button>

      {/* Popover content */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-35" onClick={() => setIsOpen(false)} />
          
          <div className="absolute right-0 bottom-12 w-80 bg-slate-950/90 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl z-40 space-y-4 text-xs max-h-[380px] overflow-y-auto custom-scrollbar">
            <div className="flex justify-between items-center pb-2 border-b border-white/5">
              <h4 className="font-heading font-extrabold text-xs text-slate-100 uppercase tracking-wider">GIS Map Analytics</h4>
              <span className="text-[10px] font-bold text-slate-500">Live Viewport</span>
            </div>

            {/* Total complaints */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-900/40 border border-white/5 rounded-xl text-center">
                <AlertCircle className="w-4 h-4 text-primary mx-auto mb-1" />
                <span className="text-[9px] font-bold text-slate-500 uppercase block tracking-wider">Total Complaints</span>
                <span className="text-sm font-heading font-extrabold text-slate-200">{totalVisible}</span>
              </div>
              <div className="p-3 bg-slate-900/40 border border-white/5 rounded-xl text-center">
                <TrendingUp className="w-4 h-4 text-emerald-500 mx-auto mb-1" />
                <span className="text-[9px] font-bold text-slate-500 uppercase block tracking-wider">Resolution Rate</span>
                <span className="text-sm font-heading font-extrabold text-emerald-400">{statistics.resolution_rate}%</span>
              </div>
            </div>

            {/* Priority Distribution */}
            <div className="space-y-2">
              <h5 className="font-heading font-bold text-xs text-slate-350 flex items-center gap-1.5">
                <PieChart className="w-3.5 h-3.5 text-primary" />
                <span>Priority Breakdown</span>
              </h5>
              <div className="space-y-1.5">
                {Object.entries(priorities).map(([priority, count]) => {
                  const pct = totalVisible > 0 ? (count / totalVisible) * 100 : 0;
                  const colorMap = {
                    Critical: 'bg-rose-500',
                    High: 'bg-orange-500',
                    Medium: 'bg-amber-500',
                    Low: 'bg-blue-500',
                  };
                  return (
                    <div key={priority} className="space-y-1">
                      <div className="flex justify-between items-center text-[9px] font-bold">
                        <span className="text-slate-400">{priority} ({count})</span>
                        <span className="text-slate-300">{Math.round(pct)}%</span>
                      </div>
                      <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${colorMap[priority as keyof typeof colorMap] || 'bg-slate-500'}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Top Categories */}
            <div className="space-y-1 bg-slate-900/20 border border-white/3 p-3 rounded-xl">
              <div className="flex justify-between items-center text-[9px]">
                <span className="font-bold text-slate-500 uppercase tracking-wider">Most Common Grievance</span>
                <span className="text-slate-300 font-bold">{statistics.most_common_category}</span>
              </div>
              <div className="flex justify-between items-center text-[9px] mt-1.5 pt-1.5 border-t border-white/5">
                <span className="font-bold text-slate-500 uppercase tracking-wider">Highest Complaint Ward</span>
                <span className="text-slate-300 font-bold">{statistics.top_ward}</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
export default AnalyticsPanel;
