import React from 'react';
import { Play, CheckCircle, XCircle, Clock, Eye } from 'lucide-react';
import type { AIWorkflowResponse } from '../../services/aiService';

interface WorkflowCardProps {
  workflow: AIWorkflowResponse | null;
  isLoading: boolean;
}

export const WorkflowCard: React.FC<WorkflowCardProps> = ({ workflow, isLoading }) => {
  if (isLoading) {
    return (
      <div className="bg-slate-900/30 border border-white/10 dark:border-white/5 rounded-2xl p-6 backdrop-blur-md shadow-sm flex flex-col items-center justify-center py-12">
        <div className="w-12 h-12 rounded-full border-2 border-amber-500/20 border-t-amber-500 animate-spin mb-4" />
        <span className="text-xs text-slate-400 font-bold uppercase tracking-wider animate-pulse">
          Executing multi-agent coordination workflow...
        </span>
      </div>
    );
  }

  if (!workflow) {
    return (
      <div className="bg-slate-900/30 border border-white/10 dark:border-white/5 border-dashed rounded-2xl p-8 backdrop-blur-md shadow-sm text-center py-16">
        <div className="w-12 h-12 rounded-full bg-slate-950/40 border border-white/5 flex items-center justify-center text-slate-500 mx-auto mb-4">
          <Play className="w-5 h-5" />
        </div>
        <h4 className="font-extrabold text-sm text-slate-900 dark:text-slate-100 uppercase tracking-wider">
          Awaiting Execution Trigger
        </h4>
        <p className="text-xs text-slate-500 font-semibold mt-1 max-w-sm mx-auto">
          Input a multi-step query above and trigger the sandbox to visualize sequential and parallel node execution.
        </p>
      </div>
    );
  }

  const results = workflow.workflow_results;
  const isFallback = workflow.plan.length === 0;

  return (
    <div className="bg-slate-900/30 border border-white/10 dark:border-white/5 rounded-2xl p-6 backdrop-blur-md shadow-sm space-y-6">
      
      {/* Title & Status */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-white/5">
        <div className="space-y-1">
          <span className="text-[10px] text-amber-500 font-extrabold uppercase tracking-widest block">
            {isFallback ? 'LangGraph Fallback StateGraph Path' : 'Dynamic ADK Execution Plan'}
          </span>
          <h4 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
            Query: "{workflow.query}"
          </h4>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[9px] text-slate-500 block uppercase font-bold">Total Duration</span>
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-secondary" />
              {results.duration_ms.toFixed(1)} ms
            </span>
          </div>
          <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${
            workflow.status === 'success'
              ? 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20'
              : 'text-rose-500 bg-rose-500/10 border-rose-500/20'
          }`}>
            {workflow.status}
          </span>
        </div>
      </div>

      {/* Visual Workflow Steps */}
      <div className="relative pl-6 border-l border-white/10 dark:border-white/5 space-y-8 my-4">
        {results.trace.map((step) => {
          const isSuccess = step.status === 'completed';
          const nodeTypeColor = step.type === 'tool' ? 'text-amber-500 bg-amber-500/10 border-amber-500/20' : 'text-blue-500 bg-blue-500/10 border-blue-500/20';

          return (
            <div key={step.task_id} className="relative group">
              {/* Timeline dot */}
              <div className={`absolute -left-[31px] top-1 w-4 h-4 rounded-full border flex items-center justify-center bg-slate-950 transition-colors ${
                isSuccess ? 'border-emerald-500 bg-emerald-500/10' : 'border-rose-500 bg-rose-500/10'
              }`}>
                {isSuccess ? (
                  <CheckCircle className="w-2.5 h-2.5 text-emerald-500 fill-current" />
                ) : (
                  <XCircle className="w-2.5 h-2.5 text-rose-500 fill-current" />
                )}
              </div>

              {/* Box */}
              <div className="bg-slate-950/40 p-4 border border-white/5 rounded-xl space-y-3.5 hover:border-amber-500/10 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-slate-500">[{step.task_id}]</span>
                    <h5 className="font-extrabold text-xs text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
                      {step.target.replace(/([A-Z])/g, ' $1').trim()}
                    </h5>
                    <span className={`px-2 py-0.5 border rounded text-[9px] font-bold uppercase tracking-wider ${nodeTypeColor}`}>
                      {step.type}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {step.duration_ms.toFixed(1)} ms
                  </span>
                </div>

                {/* Node Output */}
                <div className="space-y-1.5">
                  <span className="text-[9px] uppercase font-bold text-slate-500 flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5" />
                    Node Output Results
                  </span>
                  <div className="bg-slate-950/65 p-3 rounded-lg border border-white/5 font-mono text-[10px] text-slate-400 overflow-x-auto max-h-[140px] custom-scrollbar">
                    {typeof step.output === 'object' ? (
                      <pre>{JSON.stringify(step.output, null, 2)}</pre>
                    ) : (
                      <p className="whitespace-pre-wrap">{step.output}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Context variables summary */}
      {results.context && Object.keys(results.context).length > 0 && (
        <div className="bg-slate-950/60 p-4 rounded-xl border border-white/5 space-y-2">
          <span className="text-[10px] font-extrabold uppercase text-slate-500 block tracking-wider">
            Execution Global Shared Memory Context Variables
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4.5 pt-2">
            {Object.entries(results.context).map(([k, v]) => {
              if (k.endsWith('_output') || k === 'query' || k === 'visited_nodes' || k === 'status' || k === 'safe') return null;
              return (
                <div key={k} className="p-2 bg-slate-900/30 rounded border border-white/5 space-y-1">
                  <span className="text-[9px] font-mono text-slate-500 block">{k}</span>
                  <span className="text-xs font-bold text-slate-300 truncate block">
                    {typeof v === 'object' ? JSON.stringify(v) : String(v)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
export default WorkflowCard;
