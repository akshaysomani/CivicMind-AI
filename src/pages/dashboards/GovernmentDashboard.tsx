import React, { useEffect } from 'react';
import { useGovernment } from '../../context/GovernmentContext';
import { useAuth } from '../../context/AuthContext';
import { usePresentation } from '../../context/PresentationContext';
import { GovernmentKpiCard } from '../../components/government/GovernmentKpiCard';
import { LoadingSkeleton } from '../../components/dashboard/LoadingSkeleton';
import { 
  FileText, Clock, CheckCircle, AlertTriangle, Activity, 
  Sparkles, Heart, Building2, Shield, Rss, ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const GovernmentDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const { kpis, issues, departments, notifications, isLoading, refreshDashboard } = useGovernment();
  const { isDemoMode, toggleDemoMode, startTour } = usePresentation();
  const navigate = useNavigate();

  useEffect(() => {
    refreshDashboard();
  }, [refreshDashboard]);

  if (isLoading && !kpis) {
    return <LoadingSkeleton type="card" count={4} />;
  }

  // Fallbacks for KPIs
  const total = kpis?.total_issues ?? 0;
  const open = kpis?.open_issues ?? 0;
  const resolved = kpis?.resolved_today ?? 0;
  const pending = kpis?.pending_approval ?? 0;
  const critical = kpis?.critical_issues ?? 0;

  const kpiCards = [
    { title: 'Total Issues', value: total, icon: FileText, trend: { value: '+8.4%', isPositive: true }, description: 'Cumulative reports queue', color: 'text-blue-500 bg-blue-500/10 border-blue-500/20' },
    { title: 'Open Issues', value: open, icon: Clock, trend: { value: '-4.2%', isPositive: true }, description: 'Active triage work', color: 'text-amber-500 bg-amber-500/10 border-amber-500/20' },
    { title: 'Resolved Today', value: resolved, icon: CheckCircle, trend: { value: '+12.5%', isPositive: true }, description: 'Closed citizen tickets', color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' },
    { title: 'Pending Approval', value: pending, icon: Activity, trend: { value: '+2.1%', isPositive: false }, description: 'Reports under review', color: 'text-purple-500 bg-purple-500/10 border-purple-500/20' },
    { title: 'Critical Issues', value: critical, icon: AlertTriangle, trend: { value: '-15%', isPositive: true }, description: 'High-severity hazards', color: 'text-rose-500 bg-rose-500/10 border-rose-500/20' },
    { title: 'Avg Resolution Time', value: 4.2, icon: Sparkles, trend: { value: '98%', isPositive: true }, description: 'Target: < 6 hours', color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20', suffix: 'h' },
    { title: 'Citizen Satisfaction', value: 84.5, icon: Heart, trend: { value: '+3.1%', isPositive: true }, description: 'Post-resolution audits', color: 'text-pink-500 bg-pink-500/10 border-pink-500/20', suffix: '%' },
    { title: 'Department Efficiency', value: 91.2, icon: Building2, trend: { value: 'Optimal', isPositive: true }, description: 'SLA commitment score', color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20', suffix: '%' }
  ];

  // Operations metrics
  const unassignedIssues = issues.filter(i => !i.assigned_officer_id && i.status !== 'Resolved');
  const criticalIssues = issues.filter(i => i.priority === 'Critical' && i.status !== 'Resolved');

  return (
    <div className="space-y-8 pb-10">
      
      {/* 0. Demo Mode Active Alert Banner */}
      {isDemoMode && (
        <div className="bg-gradient-to-r from-indigo-950/70 to-purple-950/70 backdrop-blur-md border border-indigo-500/30 rounded-2xl p-4.5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg shadow-indigo-500/5 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div className="text-left">
              <h4 className="text-sm font-extrabold text-white">Hackathon Presentation & Demo Mode Active</h4>
              <p className="text-2xs text-slate-400 font-semibold mt-0.5">Showing simulated telemetry data for presentation purposes.</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <button 
              onClick={startTour}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-md shadow-indigo-600/15 hover:shadow-indigo-600/30"
            >
              Launch Guided Tour
            </button>
            <button 
              onClick={toggleDemoMode}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold rounded-xl border border-slate-800 transition-all cursor-pointer"
            >
              Exit Demo Mode
            </button>
          </div>
        </div>
      )}

      {/* 1. Header context banner */}
      <div className="bg-slate-900/30 dark:bg-slate-900/30 light:bg-white/40 border border-white/10 dark:border-white/5 light:border-slate-200/80 rounded-3xl p-6 backdrop-blur-md shadow-sm relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="absolute -right-24 -top-24 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex items-center gap-4.5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-secondary to-amber-500 text-slate-950 flex items-center justify-center font-bold text-2xl uppercase shrink-0 shadow-md">
            <Shield className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span>Government Command Center</span>
              <span className="px-2.5 py-0.5 rounded-full bg-secondary/20 text-secondary border border-secondary/20 text-[10px] font-bold uppercase tracking-wider">
                {currentUser?.sub_role || 'Officer'}
              </span>
            </h1>
            <p className="text-xs text-slate-500 font-semibold">
              Operational Zone: {currentUser?.city}, {currentUser?.state} | SLA Clearance Level Active
            </p>
          </div>
        </div>
      </div>

      {/* 2. Executive Overview (8 KPI Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiCards.map((kpi, idx) => (
          <div key={idx} className="h-full">
            <GovernmentKpiCard
              title={kpi.title}
              value={kpi.value}
              icon={kpi.icon}
              trend={kpi.trend}
              description={kpi.description}
              colorClass={kpi.color}
              suffix={kpi.suffix}
            />
          </div>
        ))}
      </div>

      {/* 3. Live Operations Panel Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Triage Operations Queues */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Triaging queues overview */}
          <div className="bg-slate-900/30 dark:bg-slate-900/30 light:bg-white/40 border border-white/10 dark:border-white/5 light:border-slate-200/80 rounded-2xl p-6 backdrop-blur-md shadow-sm space-y-6">
            <div className="flex justify-between items-center pb-3 border-b border-white/5">
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-amber-500 flex items-center gap-2">
                <Activity className="w-5 h-5 text-secondary" />
                Live Operational Queue
              </h3>
              <button 
                onClick={() => navigate('/dashboard/government/issues')} 
                className="text-xs font-bold text-secondary hover:underline flex items-center gap-0.5"
              >
                <span>Triage Desk</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              {/* Box 1: Awaiting Assignment */}
              <div className="bg-slate-950/40 p-4 border border-white/5 rounded-xl text-center space-y-1.5 hover:border-amber-500/20 transition-colors">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Awaiting Assignment</span>
                <span className="text-3xl font-extrabold text-amber-500 block">
                  {unassignedIssues.length}
                </span>
                <span className="text-[9px] text-slate-450 block">Requires officer triage</span>
              </div>

              {/* Box 2: Critical Escalations */}
              <div className="bg-slate-950/40 p-4 border border-white/5 rounded-xl text-center space-y-1.5 hover:border-rose-500/20 transition-colors">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Critical Hazards</span>
                <span className="text-3xl font-extrabold text-rose-500 block">
                  {criticalIssues.length}
                </span>
                <span className="text-[9px] text-slate-450 block">Requires instant dispatch</span>
              </div>

              {/* Box 3: Total Issues */}
              <div className="bg-slate-950/40 p-4 border border-white/5 rounded-xl text-center space-y-1.5 hover:border-blue-500/20 transition-colors">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Total active queue</span>
                <span className="text-3xl font-extrabold text-blue-500 block">
                  {issues.filter(i => i.status !== 'Resolved').length}
                </span>
                <span className="text-[9px] text-slate-450 block">Currently unresolved tickets</span>
              </div>

            </div>

            {/* List snippet of high-priority triages */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Critical Unassigned Triage</h4>
              {issues.filter(i => i.priority === 'Critical' && i.status !== 'Resolved').slice(0, 3).map((issue) => (
                <div 
                  key={issue.id} 
                  onClick={() => navigate('/dashboard/government/issues')}
                  className="bg-rose-500/5 hover:bg-rose-500/10 border border-rose-500/15 rounded-xl p-3.5 flex items-center justify-between gap-4 cursor-pointer transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <span className="text-[9px] font-bold text-rose-500 uppercase tracking-widest block">{issue.category} • {issue.ward}</span>
                    <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate mt-0.5">{issue.title}</h5>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-rose-500/25 text-rose-500 text-[9px] font-bold uppercase tracking-wider">
                    Critical
                  </span>
                </div>
              ))}
              {criticalIssues.length === 0 && (
                <div className="text-center py-4 text-xs text-slate-500 border border-dashed border-white/5 rounded-xl">
                  No pending critical alerts registered.
                </div>
              )}
            </div>
          </div>

          {/* Department Triage Workload summary */}
          <div className="bg-slate-900/30 dark:bg-slate-900/30 light:bg-white/40 border border-white/10 dark:border-white/5 light:border-slate-200/80 rounded-2xl p-6 backdrop-blur-md shadow-sm space-y-4">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-secondary flex items-center gap-2">
              <Building2 className="w-5 h-5 text-secondary" />
              Department Workload triages
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {departments.slice(0, 4).map((dept) => {
                const totalCases = dept.open_cases + dept.resolved_cases || 1;
                const percent = Math.round((dept.resolved_cases / totalCases) * 100);
                return (
                  <div key={dept.name} className="p-4 bg-slate-950/40 rounded-xl border border-white/5 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{dept.name}</span>
                      <span className="text-[10px] font-bold text-amber-500">{dept.open_cases} open cases</span>
                    </div>
                    <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full" style={{ width: `${percent}%` }} />
                    </div>
                    <div className="flex justify-between items-center text-[9px] text-slate-500">
                      <span>Performance SLA: {percent}%</span>
                      <span>Avg response: {dept.avg_response_time}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Real-time logs and Announcements widget */}
        <div className="space-y-8">
          
          {/* Real-time Activity Feed placeholder */}
          <div className="bg-slate-900/30 dark:bg-slate-900/30 light:bg-white/40 border border-white/10 dark:border-white/5 light:border-slate-200/80 rounded-2xl p-6 backdrop-blur-md shadow-sm space-y-4">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-secondary flex items-center gap-2">
              <Activity className="w-5 h-5 text-secondary animate-pulse" />
              Real-time Activity Feed
            </h3>
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {notifications.slice(0, 4).map((noti) => (
                <div key={noti.id} className="p-3 bg-slate-950/40 rounded-xl border border-white/5 text-[11px] space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-900 dark:text-slate-100 uppercase text-[9px] tracking-wider">
                      {noti.type.replace('_', ' ')}
                    </span>
                    <span className="text-[9px] text-slate-500">
                      {new Date(noti.created_at).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-slate-400 font-semibold leading-normal">{noti.title}</p>
                  <p className="text-slate-500 leading-normal">{noti.message}</p>
                </div>
              ))}
              {notifications.length === 0 && (
                <div className="text-center py-8 text-xs text-slate-500">
                  No active logs streaming currently.
                </div>
              )}
            </div>
          </div>

          {/* Announcements Overview */}
          <div className="bg-slate-900/30 dark:bg-slate-900/30 light:bg-white/40 border border-white/10 dark:border-white/5 light:border-slate-200/80 rounded-2xl p-6 backdrop-blur-md shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-secondary flex items-center gap-2">
                <Rss className="w-5 h-5 text-secondary" />
                Latest Announcements
              </h3>
              <button 
                onClick={() => navigate('/dashboard/government/announcements')}
                className="text-[10px] font-bold text-secondary hover:underline flex items-center gap-0.5"
              >
                <span>Compose</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Seeded Announcements List */}
            <div className="space-y-3.5">
              {issues.filter(i => i.status === 'Resolved').slice(0, 2).map((post, idx) => (
                <div key={idx} className="p-3 bg-slate-950/40 border border-white/5 rounded-xl space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-bold uppercase text-emerald-500">Broadcasted</span>
                    <span className="text-[9px] text-slate-500">Public Release</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">{post.title}</h4>
                  <p className="text-[10px] text-slate-500 leading-normal line-clamp-2">{post.description}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default GovernmentDashboard;
