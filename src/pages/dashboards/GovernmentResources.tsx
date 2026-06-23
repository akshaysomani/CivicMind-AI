import React, { useEffect } from 'react';
import { useGovernment } from '../../context/GovernmentContext';
import { SectionHeader } from '../../components/SectionHeader';
import { LoadingSkeleton } from '../../components/dashboard/LoadingSkeleton';
import { ShieldCheck, Truck, Users, Activity, Settings, DollarSign, Award } from 'lucide-react';
import { GlassCard } from '../../components/GlassCard';

export const GovernmentResources: React.FC = () => {
  const { resources, isLoading, refreshDashboard } = useGovernment();

  useEffect(() => {
    refreshDashboard();
  }, [refreshDashboard]);

  if (isLoading && !resources) {
    return <LoadingSkeleton type="card" count={3} />;
  }

  // Fallbacks
  const officers = resources?.available_officers ?? 45;
  const activeTeams = resources?.active_teams ?? 12;
  const vehicles = resources?.emergency_vehicles ?? 8;
  const maintenance = resources?.maintenance_teams ?? 6;
  const medical = resources?.medical_units ?? 5;
  const equipment = resources?.equipment_status ?? '92% Optimal';
  const budget = resources?.budget_utilization ?? 68.5;

  const resourceGrid = [
    { name: 'Available Officers', value: `${officers} Active`, desc: 'Administrative & response dispatch', icon: Users, color: 'text-blue-500 bg-blue-500/10 border-blue-500/20' },
    { name: 'Active Teams', value: `${activeTeams} Teams`, desc: 'On-site maintenance triages', icon: Activity, color: 'text-amber-500 bg-amber-500/10 border-amber-500/20' },
    { name: 'Emergency Vehicles', value: `${vehicles} Units`, desc: 'Rescue trucks & patrol dispatch', icon: Truck, color: 'text-rose-500 bg-rose-500/10 border-rose-500/20' },
    { name: 'Maintenance Teams', value: `${maintenance} Active`, desc: 'Pothole patchers & utility repair', icon: Settings, color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20' },
    { name: 'Medical Emergency Units', value: `${medical} Teams`, desc: 'First responders & healthcare cars', icon: ShieldCheck, color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' },
  ];

  return (
    <div className="space-y-6 pb-10">
      <SectionHeader
        title="Municipal Resource Directory"
        subtitle="Manage active personnel staffing, emergency response vehicles, equipment status, and budget allocations."
        badge="Resource Management"
        center={false}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Resource counters grid */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
          {resourceGrid.map((res, i) => (
            <GlassCard key={i} className="p-5 flex gap-4 items-center border-t border-white/5 hover:border-secondary/20 transition-colors">
              <div className={`p-3.5 border rounded-xl shrink-0 ${res.color}`}>
                <res.icon className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">{res.name}</span>
                <h4 className="text-lg font-extrabold text-slate-900 dark:text-slate-100 block">{res.value}</h4>
                <p className="text-[10px] text-slate-450">{res.desc}</p>
              </div>
            </GlassCard>
          ))}
        </div>

        {/* Right side: Budget & Equipment status */}
        <div className="space-y-6">
          
          {/* Budget Card */}
          <GlassCard className="p-6 border-t-2 border-t-emerald-500 space-y-4">
            <div className="flex gap-3 items-center">
              <div className="p-2.5 bg-emerald-500/15 border border-emerald-500/20 text-emerald-500 rounded-xl shrink-0">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-heading font-bold text-sm text-slate-900 dark:text-slate-100">Annual Triage Budget</h4>
                <span className="text-[9px] text-slate-500 uppercase font-bold">San Francisco zoning zone</span>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-slate-500">Utilization Rate</span>
                <span className="text-emerald-500">{budget}%</span>
              </div>
              <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-white/5">
                <div className="h-full bg-emerald-500" style={{ width: `${budget}%` }} />
              </div>
              <div className="flex justify-between items-center text-[10px] text-slate-500 pt-1 font-semibold">
                <span>Spent: $850k</span>
                <span>Total Budget: $1.24M</span>
              </div>
            </div>
          </GlassCard>

          {/* Equipment Status Card */}
          <GlassCard className="p-6 border-t-2 border-t-secondary space-y-3">
            <div className="flex justify-between items-center">
              <h4 className="font-heading font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <Award className="w-4.5 h-4.5 text-secondary" />
                Equipment Status
              </h4>
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[9px] font-bold uppercase tracking-wider">
                Stable
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Diagnostic systems check indicates {equipment} performance rate across municipal routers, communication desks, and emergency trucks.
            </p>
          </GlassCard>

        </div>

      </div>
    </div>
  );
};

export default GovernmentResources;
