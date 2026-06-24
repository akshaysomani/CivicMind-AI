import React from 'react';
import { useAdmin } from '../../context/AdminContext';
import { AgentCard } from '../../components/admin/AgentCard';
import { Bot, RefreshCw, AlertTriangle } from 'lucide-react';

export const AiOperationsPage: React.FC = () => {
  const { agents, loading } = useAdmin();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  const degradedAgents = agents.filter(a => a.status !== 'Healthy');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center">
            <Bot className="w-8 h-8 mr-3 text-indigo-500" />
            AI Operations Center
          </h1>
          <p className="text-slate-400 mt-1">Monitor, configure, and manage the fleet of Google ADK Agents.</p>
        </div>
        <button className="flex items-center space-x-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-medium transition-colors border border-slate-700">
          <RefreshCw className="w-4 h-4" />
          <span>Refresh Fleet</span>
        </button>
      </div>

      {degradedAgents.length > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-amber-500">Attention Required</h4>
            <p className="text-sm text-amber-500/80 mt-1">
              {degradedAgents.length} agent(s) are currently running in a degraded state. Please review their metrics and consider restarting the affected services.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {agents.map(agent => (
          <AgentCard key={agent.id} agent={agent} />
        ))}
      </div>
    </div>
  );
};

export default AiOperationsPage;
