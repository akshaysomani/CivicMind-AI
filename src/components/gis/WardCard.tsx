import React from 'react';
import { X, Users, CheckSquare, BarChart, AlertTriangle } from 'lucide-react';
import type { WardAnalytics } from '../../services/mapService';

interface WardCardProps {
  ward: WardAnalytics;
  onClose: () => void;
}

export const WardCard: React.FC<WardCardProps> = ({ ward, onClose }) => {
  return (
    <div className="absolute bottom-4 left-4 z-40 w-80 sm:w-96 bg-slate-950/85 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-2xl space-y-4 text-xs max-h-[480px] overflow-y-auto custom-scrollbar">
      {/* Header */}
      <div className="flex justify-between items-start pb-2.5 border-b border-white/5">
        <div>
          <span className="text-[9px] font-extrabold text-slate-500 uppercase tracking-wider">Ward GIS Insight</span>
          <h3 className="font-heading font-extrabold text-base text-slate-100">{ward.name}</h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-white/5 text-slate-400 hover:text-slate-100 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-slate-900/40 border border-white/5 rounded-xl p-2.5 text-center">
          <Users className="w-4 h-4 text-primary mx-auto mb-1" />
          <span className="text-[9px] font-bold text-slate-500 block uppercase tracking-wider">Population</span>
          <span className="text-xs font-heading font-extrabold text-slate-200">
            {ward.population.toLocaleString()}
          </span>
        </div>
        <div className="bg-slate-900/40 border border-white/5 rounded-xl p-2.5 text-center">
          <AlertTriangle className="w-4 h-4 text-amber-500 mx-auto mb-1" />
          <span className="text-[9px] font-bold text-slate-500 block uppercase tracking-wider">Active Issues</span>
          <span className="text-xs font-heading font-extrabold text-slate-200">
            {ward.issue_count}
          </span>
        </div>
        <div className="bg-slate-900/40 border border-white/5 rounded-xl p-2.5 text-center">
          <CheckSquare className="w-4 h-4 text-emerald-500 mx-auto mb-1" />
          <span className="text-[9px] font-bold text-slate-500 block uppercase tracking-wider">Resolution</span>
          <span className="text-xs font-heading font-extrabold text-emerald-400">
            {ward.resolved_pct}%
          </span>
        </div>
      </div>

      {/* Resolution Rate Progress bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center text-[10px]">
          <span className="font-bold text-slate-400">Resolution Speed Ratio</span>
          <span className="font-extrabold text-emerald-400">{ward.resolved_pct}% Resolved</span>
        </div>
        <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-emerald-500 rounded-full"
            style={{ width: `${ward.resolved_pct}%` }}
          />
        </div>
      </div>

      {/* Top Categories */}
      <div className="space-y-2">
        <h4 className="font-heading font-bold text-xs text-slate-350 flex items-center gap-1.5">
          <BarChart className="w-3.5 h-3.5 text-primary" />
          <span>Common Grievances</span>
        </h4>
        {ward.top_categories.length === 0 ? (
          <p className="text-slate-500 text-[10px] italic">No active reports registered.</p>
        ) : (
          <div className="space-y-1.5">
            {ward.top_categories.map((cat, idx) => (
              <div key={idx} className="flex justify-between items-center bg-slate-900/20 border border-white/3 px-3 py-1.5 rounded-lg">
                <span className="text-slate-300 font-bold">{cat.category}</span>
                <span className="px-2 py-0.5 rounded bg-primary/20 text-primary font-bold text-[9px]">
                  {cat.count} reports
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Department Performance */}
      <div className="space-y-2">
        <h4 className="font-heading font-bold text-xs text-slate-350">Department Resolution SLA</h4>
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(ward.department_performance).map(([dept, score]) => (
            <div key={dept} className="space-y-1">
              <div className="flex justify-between items-center text-[9px]">
                <span className="text-slate-400 block truncate max-w-[100px]">{dept}</span>
                <span className="font-bold text-slate-200">{score}%</span>
              </div>
              <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary"
                  style={{ width: `${score}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
export default WardCard;
