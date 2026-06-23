import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/Button';
import { GlassCard } from '../../components/GlassCard';
import { SectionHeader } from '../../components/SectionHeader';
import { Settings, Users, ShieldAlert } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { currentUser, logout } = useAuth();

  return (
    <div className="space-y-8 py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold font-heading text-slate-900 dark:text-slate-100">
            System Administration
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Super Administrator: {currentUser?.first_name} {currentUser?.last_name}
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={logout}>
          Log Out
        </Button>
      </div>

      <SectionHeader
        title="Central Control Console"
        subtitle="Manage user accounts, adjust system settings, review model routing pipelines, and audit API requests."
        badge="Platform Root Controls"
        center={false}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Admin Details */}
        <GlassCard className="md:col-span-1 border-t-2 border-t-rose-500">
          <h3 className="text-lg font-bold font-heading text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-500" />
            Security Profile
          </h3>
          <div className="space-y-3 text-sm">
            <div>
              <span className="text-slate-500 block">Full Name</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{currentUser?.first_name} {currentUser?.last_name}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Root Email</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{currentUser?.email}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Auth Domain</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{currentUser?.city}, {currentUser?.country}</span>
            </div>
            <div className="pt-2">
              <span className="px-3 py-1 rounded-full bg-rose-500/20 text-rose-500 border border-rose-500/20 text-xs font-semibold uppercase tracking-wider">
                {currentUser?.role}
              </span>
            </div>
          </div>
        </GlassCard>

        {/* Administration Actions */}
        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <GlassCard className="flex flex-col justify-between">
            <div>
              <div className="p-3 bg-rose-500/10 rounded-xl w-fit text-rose-500 mb-4 border border-rose-500/20">
                <Users className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold font-heading text-slate-900 dark:text-slate-100 mb-2">
                User & Roles
              </h4>
              <p className="text-sm text-slate-655 dark:text-slate-400">
                Audit system registrations, assign administrative role permissions, and override account lockouts.
              </p>
            </div>
            <Button variant="glass" size="sm" className="mt-6 w-full sm:w-fit" disabled>
              Manage Users (Module 16)
            </Button>
          </GlassCard>

          <GlassCard className="flex flex-col justify-between">
            <div>
              <div className="p-3 bg-slate-800/40 rounded-xl w-fit text-slate-350 mb-4 border border-slate-700">
                <Settings className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold font-heading text-slate-900 dark:text-slate-100 mb-2">
                Platform Settings
              </h4>
              <p className="text-sm text-slate-655 dark:text-slate-400">
                Adjust API rate limits, toggle debug flags, update database connections, and clear system caches.
              </p>
            </div>
            <Button variant="glass" size="sm" className="mt-6 w-full sm:w-fit" disabled>
              Open Settings
            </Button>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};
export default AdminDashboard;
