import React from 'react';
import { Shield, Play, CheckCircle, AlertTriangle } from 'lucide-react';
import type { AIAgent } from '../../services/aiService';

interface AgentCardProps {
  agent: AIAgent;
  onExecuteClick?: () => void;
}

export const AgentCard: React.FC<AgentCardProps> = ({ agent, onExecuteClick }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Optimal':
        return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
      case 'Degraded':
        return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      default:
        return 'text-rose-500 bg-rose-500/10 border-rose-500/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Optimal':
        return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      case 'Degraded':
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-rose-500" />;
    }
  };

  return (
    <div className="bg-slate-900/30 border border-white/10 dark:border-white/5 rounded-2xl p-5 backdrop-blur-md shadow-sm relative overflow-hidden transition-all duration-300 hover:border-amber-500/20 group">
      <div className="absolute right-4 top-4 font-mono text-[10px] text-slate-500 bg-slate-950/40 px-2 py-0.5 border border-white/5 rounded">
        v{agent.version}
      </div>

      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-secondary to-amber-500 text-slate-950 flex items-center justify-center font-bold text-lg shadow-md shrink-0">
          <Shield className="w-6 h-6" />
        </div>
        <div className="space-y-1 min-w-0 pr-12">
          <h4 className="font-extrabold text-slate-900 dark:text-slate-100 truncate flex items-center gap-2">
            {agent.name.replace(/([A-Z])/g, ' $1').trim()}
          </h4>
          <span className="text-[10px] text-slate-400 bg-slate-950/40 px-2 py-0.5 border border-white/5 rounded inline-block font-semibold">
            Role: {agent.role}
          </span>
        </div>
      </div>

      <p className="text-xs text-slate-400 font-semibold leading-relaxed mt-4.5 min-h-[40px]">
        {agent.description}
      </p>

      {/* Tools List */}
      <div className="mt-4 space-y-2">
        <span className="text-[10px] uppercase font-bold text-slate-500 block">Equipped Tools</span>
        <div className="flex flex-wrap gap-1.5">
          {agent.tools.map((tool) => (
            <span
              key={tool}
              className="px-2 py-0.5 bg-slate-950/40 border border-white/5 text-slate-300 rounded text-[9px] font-bold uppercase tracking-wider"
            >
              {tool}
            </span>
          ))}
          {agent.tools.length === 0 && (
            <span className="text-[10px] font-semibold text-slate-500 italic">No external tools loaded</span>
          )}
        </div>
      </div>

      <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between gap-4">
        <div className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold flex items-center gap-1.5 ${getStatusColor(agent.status)}`}>
          {getStatusIcon(agent.status)}
          <span>{agent.status}</span>
        </div>

        {onExecuteClick && (
          <button
            onClick={onExecuteClick}
            className="text-[10px] font-bold text-secondary flex items-center gap-1 hover:underline bg-transparent border-0 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Invoke Sandbox</span>
          </button>
        )}
      </div>
    </div>
  );
};
export default AgentCard;
