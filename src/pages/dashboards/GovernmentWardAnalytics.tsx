import React, { useEffect } from 'react';
import { useGovernment } from '../../context/GovernmentContext';
import { SectionHeader } from '../../components/SectionHeader';
import { LoadingSkeleton } from '../../components/dashboard/LoadingSkeleton';
import { MapPin, Flame, TrendingUp } from 'lucide-react';
import { GlassCard } from '../../components/GlassCard';

export const GovernmentWardAnalytics: React.FC = () => {
  const { wards, isLoading, refreshDashboard } = useGovernment();

  useEffect(() => {
    refreshDashboard();
  }, [refreshDashboard]);

  const getHeatColor = (openCases: number) => {
    if (openCases >= 4) return 'bg-rose-500 text-white';
    if (openCases >= 2) return 'bg-orange-500 text-slate-950';
    return 'bg-emerald-500 text-slate-950';
  };

  const getHeatLabel = (openCases: number) => {
    if (openCases >= 4) return 'Critical Volume';
    if (openCases >= 2) return 'Moderate Volume';
    return 'Optimal Density';
  };

  const getSparklinePoints = (trend: number[]) => {
    const width = 120;
    const height = 40;
    const max = Math.max(...trend);
    const min = Math.min(...trend);
    const range = max - min || 1;
    
    return trend.map((val, idx) => {
      const x = (idx / (trend.length - 1)) * width;
      const y = height - ((val - min) / range) * height;
      return `${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    }).join(' ');
  };

  return (
    <div className="space-y-6 pb-10">
      <SectionHeader
        title="Municipal Ward Analytics"
        subtitle="Visualize ticket density distributions, resolution rate metrics, and population coverages across zoning sectors."
        badge="Ward Analytics"
        center={false}
      />

      {isLoading && wards.length === 0 ? (
        <LoadingSkeleton type="card" count={3} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {wards.map((ward) => (
            <GlassCard 
              key={ward.name}
              className="p-6 border-t-2 border-t-secondary space-y-6 flex flex-col justify-between"
            >
              {/* Header */}
              <div className="flex justify-between items-start gap-4">
                <div className="flex gap-3 items-center">
                  <div className="p-2.5 bg-secondary/10 border border-secondary/20 text-secondary rounded-xl shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-heading font-bold text-base text-slate-900 dark:text-slate-100">{ward.name}</h4>
                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">San Francisco Triage Zone</span>
                  </div>
                </div>
                
                {/* Heat Indicator */}
                <div className={`px-3 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-wider flex items-center gap-1 ${getHeatColor(ward.open_cases)}`}>
                  <Flame className="w-3.5 h-3.5 animate-pulse" />
                  <span>{getHeatLabel(ward.open_cases)}</span>
                </div>
              </div>

              {/* Stats Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-white/5">
                <div className="space-y-1">
                  <span className="text-[9px] uppercase font-bold text-slate-500 block">Open Incidents</span>
                  <span className="text-xl font-extrabold text-slate-850 dark:text-slate-150 block">{ward.open_cases} cases</span>
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] uppercase font-bold text-slate-500 block">Resolution SLA</span>
                  <span className="text-xl font-extrabold text-emerald-500 block">{ward.resolution_rate}%</span>
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] uppercase font-bold text-slate-500 block">Population</span>
                  <span className="text-xl font-extrabold text-slate-850 dark:text-slate-150 block">{ward.population_coverage.toLocaleString()}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] uppercase font-bold text-slate-500 block">Avg Response</span>
                  <span className="text-xl font-extrabold text-slate-850 dark:text-slate-150 block">{ward.response_time}</span>
                </div>
              </div>

              {/* Sparkline trend & coverages */}
              <div className="flex items-center justify-between gap-6 pt-4 border-t border-white/5">
                <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-wider">
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                  <span>Weekly Triage Trend</span>
                </div>
                
                {/* Sparkline SVG */}
                <div className="w-32 h-10 pb-1 pr-1">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 120 40">
                    <path
                      d={getSparklinePoints(ward.trend)}
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>

            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
};

export default GovernmentWardAnalytics;
