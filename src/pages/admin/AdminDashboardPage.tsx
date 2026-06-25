import React from 'react';
import { useAdmin } from '../../context/AdminContext';
import { usePresentation } from '../../context/PresentationContext';
import { AdminKPICard } from '../../components/admin/AdminKPICard';
import { SystemHealthWidget } from '../../components/admin/SystemHealthWidget';
import { AgentCard } from '../../components/admin/AgentCard';
import { Users, Bot, ShieldAlert, Activity, FileText, Sparkles } from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const { systemHealth, users, agents, auditLogs, loading } = useAdmin();
  const { isDemoMode, toggleDemoMode, startTour } = usePresentation();

  if (loading || !systemHealth) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  const activeUsers = users.filter(u => u.status === 'Active').length;
  const activeAgents = agents.filter(a => a.status === 'Healthy').length;
  const errorLogs = auditLogs.filter(l => l.status === 'Failed').length;

  return (
    <div className="space-y-6 pb-10">
      {/* 0. Demo Mode Active Alert Banner */}
      {isDemoMode && (
        <div className="bg-gradient-to-r from-indigo-950/70 to-purple-950/70 backdrop-blur-md border border-indigo-500/30 rounded-2xl p-4.5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg shadow-indigo-500/5 mb-6">
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
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-305 text-xs font-bold rounded-xl border border-slate-800 transition-all cursor-pointer"
            >
              Exit Demo Mode
            </button>
          </div>
        </div>
      )}

      <div>
        <h1 className="text-2xl font-bold text-white">Enterprise Admin Dashboard</h1>
        <p className="text-slate-400">Platform operational status and overview.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AdminKPICard 
          title="Active Users" 
          value={activeUsers.toString()} 
          icon={Users} 
          trend="+12%" 
          trendDirection="up" 
          color="indigo" 
        />
        <AdminKPICard 
          title="Healthy Agents" 
          value={`${activeAgents}/${agents.length}`} 
          icon={Bot} 
          trend="All Systems Normal" 
          color="emerald" 
        />
        <AdminKPICard 
          title="System Health" 
          value={systemHealth.apiHealth} 
          icon={Activity} 
          color={systemHealth.apiHealth === 'Healthy' ? 'emerald' : 'amber'} 
        />
        <AdminKPICard 
          title="Security Alerts" 
          value={errorLogs.toString()} 
          icon={ShieldAlert} 
          trend="-2" 
          trendDirection="down" 
          color="rose" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold text-white">AI Agent Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {agents.map(agent => (
              <AgentCard key={agent.id} agent={agent} />
            ))}
          </div>
        </div>
        
        <div className="space-y-6">
          <SystemHealthWidget health={systemHealth} />
          
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <h3 className="font-semibold text-white mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-indigo-400" />
              Recent Audit Events
            </h3>
            <div className="space-y-4">
              {auditLogs.slice(0, 5).map(log => (
                <div key={log.id} className="flex items-start justify-between border-b border-slate-800 pb-3 last:border-0 last:pb-0">
                  <div>
                    <p className="text-sm font-medium text-white">{log.action}</p>
                    <p className="text-xs text-slate-400">{log.user}</p>
                  </div>
                  <span className={`text-xs font-medium ${log.status === 'Success' ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {log.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
