import React, { useEffect } from 'react';
import { useGovernment } from '../../context/GovernmentContext';
import { SectionHeader } from '../../components/SectionHeader';
import { LoadingSkeleton } from '../../components/dashboard/LoadingSkeleton';
import { Building2, CheckCircle2, AlertCircle, Clock, Award } from 'lucide-react';

export const GovernmentDepartments: React.FC = () => {
  const { departments, isLoading, refreshDashboard } = useGovernment();

  useEffect(() => {
    refreshDashboard();
  }, [refreshDashboard]);

  const getPerformanceColor = (perf: number) => {
    if (perf >= 90) return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
    if (perf >= 75) return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
    return 'text-rose-500 bg-rose-500/10 border-rose-500/20';
  };

  const getProgressColor = (perf: number) => {
    if (perf >= 90) return 'bg-emerald-500';
    if (perf >= 75) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  return (
    <div className="space-y-6 pb-10">
      <SectionHeader
        title="Department Workloads & SLAs"
        subtitle="Monitor triage volumes, resolution latencies, and service performance metrics across all municipal sectors."
        badge="Departments Workspace"
        center={false}
      />

      {isLoading && departments.length === 0 ? (
        <LoadingSkeleton type="card" count={4} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments.map((dept) => {
            const total = dept.open_cases + dept.resolved_cases || 1;
            const completionRate = Math.round((dept.resolved_cases / total) * 100);
            
            return (
              <div 
                key={dept.name} 
                className="bg-slate-900/30 dark:bg-slate-900/30 light:bg-white/40 border border-white/10 dark:border-white/5 light:border-slate-200/80 rounded-2xl p-5 backdrop-blur-md shadow-sm space-y-4 hover:border-secondary/20 transition-all"
              >
                {/* Header */}
                <div className="flex justify-between items-start">
                  <div className="flex gap-3 items-center">
                    <div className="p-2.5 bg-secondary/15 border border-secondary/20 text-secondary rounded-xl shrink-0">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">{dept.name}</h4>
                      <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Workload overview</span>
                    </div>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-extrabold uppercase tracking-wider ${getPerformanceColor(dept.performance)}`}>
                    {dept.performance.toFixed(1)}% Performance
                  </span>
                </div>

                {/* Counters */}
                <div className="grid grid-cols-3 gap-2 pt-2 text-center border-t border-white/5">
                  <div className="space-y-0.5">
                    <span className="text-[9px] uppercase font-bold text-slate-500 flex items-center justify-center gap-0.5">
                      <AlertCircle className="w-3 h-3 text-amber-500" /> Open
                    </span>
                    <span className="text-base font-extrabold text-slate-800 dark:text-slate-200">{dept.open_cases}</span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[9px] uppercase font-bold text-slate-500 flex items-center justify-center gap-0.5">
                      <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Resolved
                    </span>
                    <span className="text-base font-extrabold text-slate-800 dark:text-slate-200">{dept.resolved_cases}</span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[9px] uppercase font-bold text-slate-500 flex items-center justify-center gap-0.5">
                      <Clock className="w-3 h-3 text-secondary" /> Latency
                    </span>
                    <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 truncate block mt-0.5">{dept.avg_response_time}</span>
                  </div>
                </div>

                {/* SLA bar */}
                <div className="space-y-1.5 pt-2 border-t border-white/5">
                  <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold uppercase">
                    <span>Resolution Rate</span>
                    <span className="text-secondary">{completionRate}%</span>
                  </div>
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-white/5">
                    <div className={`h-full ${getProgressColor(completionRate)}`} style={{ width: `${completionRate}%` }} />
                  </div>
                </div>

                {/* Bottom detail tags */}
                <div className="flex justify-between items-center text-[9px] text-slate-500 pt-1 font-semibold">
                  <span className="flex items-center gap-1"><Award className="w-3 h-3 text-secondary" /> SLA Committed: 24h</span>
                  <span>SF District Area</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default GovernmentDepartments;
