import React, { useState } from 'react';
import { Terminal, ShieldAlert, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import type { AITool } from '../../services/aiService';

interface ToolCardProps {
  tool: AITool;
}

export const ToolCard: React.FC<ToolCardProps> = ({ tool }) => {
  const [expanded, setExpanded] = useState(false);

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Admin':
        return 'bg-rose-500/20 text-rose-500 border-rose-500/25';
      case 'Government':
        return 'bg-amber-500/20 text-amber-500 border-amber-500/25';
      case 'NGO':
        return 'bg-blue-500/20 text-blue-500 border-blue-500/25';
      default:
        return 'bg-emerald-500/20 text-emerald-500 border-emerald-500/25';
    }
  };

  return (
    <div className="bg-slate-900/30 border border-white/10 dark:border-white/5 rounded-2xl p-5 backdrop-blur-md shadow-sm relative overflow-hidden transition-all duration-300 hover:border-amber-500/20">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-slate-950/60 border border-white/5 flex items-center justify-center font-bold text-slate-400">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-extrabold text-sm text-slate-900 dark:text-slate-100 uppercase tracking-wider">
              {tool.name}
            </h4>
            <div className="flex items-center gap-3.5 mt-1">
              <span className="text-[9px] text-slate-500 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Timeout: {tool.timeout}s
              </span>
              <span className="text-[9px] text-slate-500">
                Retries: {tool.retry_policy?.retries ?? 2} (x{tool.retry_policy?.backoff ?? 1.5})
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="text-slate-500 hover:text-slate-300 p-1 border-0 bg-transparent cursor-pointer"
        >
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      <p className="text-xs text-slate-450 font-semibold leading-relaxed mt-4">
        {tool.description}
      </p>

      {/* Permission Guards */}
      <div className="mt-4 space-y-1.5">
        <span className="text-[9px] uppercase font-bold text-slate-500 flex items-center gap-1">
          <ShieldAlert className="w-3.5 h-3.5" />
          Authorization Scope
        </span>
        <div className="flex flex-wrap gap-1.5">
          {tool.permissions.map((role) => (
            <span
              key={role}
              className={`px-2 py-0.5 border rounded text-[9px] font-bold uppercase tracking-wider ${getRoleColor(role)}`}
            >
              {role}
            </span>
          ))}
        </div>
      </div>

      {expanded && (
        <div className="mt-5 pt-4 border-t border-white/5 space-y-4 animate-fadeIn">
          {/* Input Schema */}
          <div className="space-y-1.5">
            <span className="text-[9px] uppercase font-bold text-slate-400 block font-mono">Input Parameters Schema</span>
            <div className="bg-slate-950/60 p-3 rounded-lg border border-white/5 font-mono text-[10px] text-amber-500 overflow-x-auto">
              <pre>{JSON.stringify(tool.input_schema, null, 2)}</pre>
            </div>
          </div>

          {/* Output Schema */}
          <div className="space-y-1.5">
            <span className="text-[9px] uppercase font-bold text-slate-400 block font-mono">Return Output Schema</span>
            <div className="bg-slate-950/60 p-3 rounded-lg border border-white/5 font-mono text-[10px] text-emerald-500 overflow-x-auto">
              <pre>{JSON.stringify(tool.output_schema, null, 2)}</pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default ToolCard;
