import React, { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCitizen } from '../../context/CitizenContext';
import { DashboardCard } from '../../components/dashboard/DashboardCard';
import { QuickActionCard } from '../../components/dashboard/QuickActionCard';
import { AchievementBadge } from '../../components/dashboard/AchievementBadge';
import { LoadingSkeleton } from '../../components/dashboard/LoadingSkeleton';
import { AnimatedCounter } from '../../components/AnimatedCounter';
import { 
  FileText, Bot, BellRing, MapPin, Calendar, Clock, 
  ArrowUpRight, Award, Activity, Sparkles, BookOpen, 
  Map, PhoneCall, AlertTriangle, CheckCircle, PlusCircle, ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const CitizenDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const { stats, insights, achievements, notifications, isLoading, refreshDashboard } = useCitizen();
  const navigate = useNavigate();

  useEffect(() => {
    refreshDashboard();
  }, [refreshDashboard]);

  const getGreeting = () => {
    const hr = new Date().getHours();
    if (hr < 12) return 'Good Morning';
    if (hr < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getGreetingEmoji = () => {
    const hr = new Date().getHours();
    if (hr < 12) return '🌅';
    if (hr < 17) return '☀️';
    return '🌙';
  };

  const formattedDate = new Date().toLocaleDateString(undefined, { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  const getStatusIcon = (type: string) => {
    switch (type) {
      case 'emergency':
        return <AlertTriangle className="w-4 h-4 text-rose-500" />;
      case 'gov_message':
        return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      default:
        return <Activity className="w-4 h-4 text-primary" />;
    }
  };

  if (isLoading && !stats) {
    return <LoadingSkeleton type="card" count={3} />;
  }

  // Quick Action navigation list
  const actions = [
    { title: 'Report New Issue', desc: 'Submit a concern with GPS tagging', icon: PlusCircle, path: '/dashboard/citizen/report-issue', color: 'text-primary bg-primary/10 border-primary/20' },
    { title: 'Ask AI Assistant', desc: 'Consult bylaws & eligibility queries', icon: Bot, path: '/dashboard/citizen/help', color: 'text-accent bg-accent/10 border-accent/20' },
    { title: 'View Nearby Alerts', desc: 'Map active utility outages & hazards', icon: BellRing, path: '/dashboard/citizen/alerts', color: 'text-orange-500 bg-orange-500/10 border-orange-500/20' },
    { title: 'Track My Reports', desc: 'Check administrative resolution status', icon: FileText, path: '/dashboard/citizen/reports', color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' },
    { title: 'Government Schemes', desc: 'Explore personalized grants & support', icon: BookOpen, path: '/dashboard/citizen/help', color: 'text-sky-500 bg-sky-500/10 border-sky-500/20' },
    { title: 'Community Map', desc: 'Interactive local coordination pins', icon: Map, path: '/dashboard/citizen/alerts', color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20' },
    { title: 'Emergency Contacts', desc: 'Direct municipal crisis lines', icon: PhoneCall, path: '/dashboard/citizen/help', color: 'text-rose-500 bg-rose-500/10 border-rose-500/20' },
  ];

  return (
    <div className="space-y-8 pb-10">
      
      {/* 1. Welcome Header Block */}
      <div className="bg-slate-900/30 dark:bg-slate-900/30 light:bg-white/40 border border-white/10 dark:border-white/5 light:border-slate-200/80 rounded-3xl p-6 md:p-8 backdrop-blur-md shadow-sm relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        
        {/* Glow vector effect */}
        <div className="absolute -right-24 -top-24 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex items-center gap-4.5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary to-secondary text-white flex items-center justify-center font-bold text-2xl uppercase shrink-0 shadow-md">
            {currentUser?.profile_image ? (
              <img
                src={`${import.meta.env.VITE_API_BASE_URL?.replace('/api/v1', '') || ''}${currentUser.profile_image}`}
                alt="Avatar"
                className="w-full h-full object-cover rounded-2xl"
              />
            ) : (
              <span>{currentUser?.first_name[0]}{currentUser?.last_name[0]}</span>
            )}
          </div>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-slate-100">
                {getGreeting()}, {currentUser?.first_name}! {getGreetingEmoji()}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/20 text-[10px] font-bold uppercase tracking-wider">
                {currentUser?.role}
              </span>
            </div>
            <p className="text-xs text-slate-500 flex items-center gap-1.5 font-semibold">
              <MapPin className="w-4 h-4 text-primary shrink-0" />
              <span>Registered City: {currentUser?.city}, {currentUser?.state}</span>
            </p>
          </div>
        </div>

        {/* Date / Time Card */}
        <div className="text-right shrink-0 border-t md:border-t-0 md:border-l border-white/10 dark:border-white/5 light:border-slate-205 pt-4 md:pt-0 md:pl-6 space-y-1 text-slate-500 font-semibold text-xs">
          <div className="flex items-center gap-2 justify-end">
            <Calendar className="w-4 h-4 text-primary" />
            <span>{formattedDate}</span>
          </div>
          <div className="flex items-center gap-2 justify-end">
            <Clock className="w-4 h-4 text-primary" />
            <span>Active Command Center Zone</span>
          </div>
        </div>
      </div>

      {/* 2. Aggregated Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Reported count */}
        <DashboardCard className="p-6 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Issues Reported</span>
            <div className="p-2.5 bg-primary/10 border border-primary/20 text-primary rounded-xl shrink-0">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 space-y-1">
            <h3 className="text-3xl font-extrabold font-heading text-slate-900 dark:text-slate-100">
              <AnimatedCounter value={stats?.issues_reported || 0} />
            </h3>
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-500">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>Real-time DB Connection</span>
            </div>
          </div>
        </DashboardCard>

        {/* Resolved count */}
        <DashboardCard className="p-6 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Resolved Issues</span>
            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-xl shrink-0">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 space-y-1">
            <h3 className="text-3xl font-extrabold font-heading text-slate-900 dark:text-slate-100">
              <AnimatedCounter value={stats?.resolved_issues || 0} />
            </h3>
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500">
              <span>Resolution Rate:</span>
              <span className="text-emerald-500">
                {stats?.issues_reported ? Math.round((stats.resolved_issues / stats.issues_reported) * 100) : 0}%
              </span>
            </div>
          </div>
        </DashboardCard>

        {/* Score count */}
        <DashboardCard className="p-6 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Participation Score</span>
            <div className="p-2.5 bg-accent/10 border border-accent/20 text-accent rounded-xl shrink-0">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 space-y-1">
            <h3 className="text-3xl font-extrabold font-heading text-slate-900 dark:text-slate-100">
              <AnimatedCounter value={stats?.participation_score || 0} />
            </h3>
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-accent">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Level 1 Resident Contributor</span>
            </div>
          </div>
        </DashboardCard>
      </div>

      {/* 3. Main Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left column: Actions & Timeline */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Quick Actions */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold font-heading text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Quick Command Center Triggers
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {actions.map((act, i) => (
                <QuickActionCard
                  key={i}
                  title={act.title}
                  description={act.desc}
                  icon={act.icon}
                  colorClass={act.color}
                  onClick={() => navigate(act.path)}
                />
              ))}
            </div>
          </div>

          {/* Activity Logs Timeline */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold font-heading text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Recent Activity Logs
            </h3>
            <div className="bg-slate-900/30 dark:bg-slate-900/30 light:bg-white/40 border border-white/10 dark:border-white/5 light:border-slate-205 rounded-2xl p-6 backdrop-blur-md shadow-sm space-y-6">
              {notifications.slice(0, 3).map((noti, idx) => (
                <div key={noti.id} className="flex gap-4 relative">
                  {/* Timeline track vertical line */}
                  {idx < 2 && (
                    <div className="absolute left-[17px] top-9 bottom-[-24px] w-0.5 bg-white/10" />
                  )}
                  <div className="p-1.5 rounded-full border border-white/10 dark:border-white/5 light:border-slate-200 bg-slate-950 dark:bg-slate-950 light:bg-white z-10 shrink-0">
                    {getStatusIcon(noti.type)}
                  </div>
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex justify-between items-center gap-2">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                        {noti.title}
                      </h4>
                      <span className="text-[9px] text-slate-500">
                        {new Date(noti.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-550 dark:text-slate-400">
                      {noti.message}
                    </p>
                  </div>
                </div>
              ))}
              {notifications.length === 0 && (
                <div className="text-center py-6 text-xs text-slate-500">
                  No active logs. Seed data or report an issue.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right column: Achievements & AI Insights */}
        <div className="space-y-8">
          
          {/* AI-Ready Insights */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold font-heading text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-accent" />
              AI Decision Insights
            </h3>
            <div className="space-y-4">
              {insights.map((ins) => (
                <DashboardCard key={ins.id} className="p-4 hover:border-accent/30">
                  <div className="flex gap-3">
                    <div className="p-2 bg-accent/15 border border-accent/20 text-accent rounded-lg shrink-0 w-fit h-fit">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-accent block">
                        {ins.category} Recommendation
                      </span>
                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-normal">
                        {ins.message}
                      </p>
                    </div>
                  </div>
                </DashboardCard>
              ))}
            </div>
          </div>

          {/* Gamified Achievements Widget */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold font-heading text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Award className="w-5 h-5 text-primary" />
                Achievements
              </h3>
              <button 
                onClick={() => navigate('/dashboard/citizen/achievements')}
                className="text-xs font-bold text-primary hover:underline flex items-center gap-0.5"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
            
            <div className="space-y-4">
              {achievements.slice(0, 3).map((ach) => (
                <AchievementBadge key={ach.id} badge={ach} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CitizenDashboard;
