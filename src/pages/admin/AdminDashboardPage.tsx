import React from 'react';
import { useAdmin } from '../../context/AdminContext';
import { AdminKPICard } from '../../components/admin/AdminKPICard';
import { SystemHealthWidget } from '../../components/admin/SystemHealthWidget';
import { AgentCard } from '../../components/admin/AgentCard';
import { Users, Bot, ShieldAlert, Activity, FileText } from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const { systemHealth, users, agents, auditLogs, loading } = useAdmin();

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
    <div className="space-y-6">
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
