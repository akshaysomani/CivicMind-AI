import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/Button';
import { GlassCard } from '../../components/GlassCard';
import { SectionHeader } from '../../components/SectionHeader';
import { Users2, Heart, Globe } from 'lucide-react';

export const NgoDashboard: React.FC = () => {
  const { currentUser, logout } = useAuth();

  return (
    <div className="space-y-8 py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold font-heading text-slate-900 dark:text-slate-100">
            NGO Workspace
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Representative Console: {currentUser?.first_name} {currentUser?.last_name}
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={logout}>
          Log Out
        </Button>
      </div>

      <SectionHeader
        title="Community Support & Programs"
        subtitle="Access local coordination heatmaps, register outreach programs, and review citizen requests."
        badge="NGO Integration"
        center={false}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* NGO Profile */}
        <GlassCard className="md:col-span-1 border-t-2 border-t-accent">
          <h3 className="text-lg font-bold font-heading text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
            <Globe className="w-5 h-5 text-accent" />
            Outreach Profile
          </h3>
          <div className="space-y-3 text-sm">
            <div>
              <span className="text-slate-500 block">Full Name</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{currentUser?.first_name} {currentUser?.last_name}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Registered Email</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{currentUser?.email}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Zoning Area</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{currentUser?.city}, {currentUser?.state}</span>
            </div>
            {currentUser?.organization && (
              <div>
                <span className="text-slate-500 block">NGO Organization</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{currentUser?.organization}</span>
              </div>
            )}
            <div className="pt-2">
              <span className="px-3 py-1 rounded-full bg-accent/20 text-accent border border-accent/20 text-xs font-semibold uppercase tracking-wider">
                {currentUser?.role}
              </span>
            </div>
          </div>
        </GlassCard>

        {/* Outreach Cards */}
        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <GlassCard className="flex flex-col justify-between">
            <div>
              <div className="p-3 bg-accent/10 rounded-xl w-fit text-accent mb-4 border border-accent/20">
                <Heart className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold font-heading text-slate-900 dark:text-slate-100 mb-2">
                Outreach Programs
              </h4>
              <p className="text-sm text-slate-655 dark:text-slate-400">
                Initiate neighborhood cleanup drives, review citizen volunteers lists, and register program milestones.
              </p>
            </div>
            <Button variant="glass" size="sm" className="mt-6 w-full sm:w-fit" disabled>
              Open Programs Console
            </Button>
          </GlassCard>

          <GlassCard className="flex flex-col justify-between">
            <div>
              <div className="p-3 bg-primary/10 rounded-xl w-fit text-primary mb-4 border border-primary/20">
                <Users2 className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold font-heading text-slate-900 dark:text-slate-100 mb-2">
                Community Initiatives
              </h4>
              <p className="text-sm text-slate-655 dark:text-slate-400">
                Engage in collaborative forums, track issue resolution bottlenecks, and compile outreach summaries.
              </p>
            </div>
            <Button variant="glass" size="sm" className="mt-6 w-full sm:w-fit" disabled>
              Open Initiative Desk
            </Button>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};
export default NgoDashboard;
