import React, { useState } from 'react';
import type { SystemError } from '../../services/adminService';
import { AlertCircle, ChevronDown, ChevronUp, RefreshCw, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ErrorTimelineProps {
  errors: SystemError[];
  onRetry?: (id: string) => void;
}

export const ErrorTimeline: React.FC<ErrorTimelineProps> = ({ errors, onRetry }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-xl p-5"
    >
      <h3 className="font-semibold text-white mb-4 flex items-center">
        <AlertCircle className="w-5 h-5 mr-2 text-rose-500 animate-pulse" />
        Critical Exceptions & Error Timeline
      </h3>

      {errors.length === 0 ? (
        <p className="text-slate-500 text-sm text-center py-6">No server exceptions captured in this cycle.</p>
      ) : (
        <div className="space-y-4">
          {errors.map((err) => (
            <div
              key={err.id}
              className="border border-slate-800 bg-slate-950/40 rounded-lg p-4 transition hover:border-slate-700"
            >
              <div className="flex justify-between items-start">
                <div className="flex space-x-3">
                  <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 mt-0.5">
                    <AlertCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">{err.error_message}</h4>
                    <p className="text-xs text-slate-500 mt-1 flex items-center">
                      <Layers className="w-3.5 h-3.5 mr-1 text-slate-600" />
                      Correlation ID: <span className="font-mono text-slate-400 ml-1">{err.correlation_id}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${
                    err.retry_status === 'Success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                    err.retry_status === 'Processing' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                    'bg-slate-800 text-slate-400 border border-slate-700/50'
                  }`}>
                    Retry: {err.retry_status}
                  </span>

                  <button
                    onClick={() => toggleExpand(err.id)}
                    className="p-1 text-slate-400 hover:text-white transition"
                  >
                    {expandedId === err.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <AnimatePresence>
                {expandedId === err.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-4 pt-4 border-t border-slate-800">
                      <p className="text-xs font-semibold text-slate-400 mb-1">Stack Traceback:</p>
                      <pre className="bg-slate-900 border border-slate-800 rounded p-3 text-[10px] text-rose-300 font-mono overflow-x-auto max-h-48 leading-relaxed">
                        {err.traceback}
                      </pre>
                      {onRetry && err.retry_status !== 'Success' && (
                        <button
                          onClick={() => onRetry(err.id)}
                          className="mt-3 inline-flex items-center text-xs font-semibold text-indigo-400 hover:text-white bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/25 px-2.5 py-1 rounded transition"
                        >
                          <RefreshCw className="w-3 h-3 mr-1.5" />
                          Retry Job Execution
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default ErrorTimeline;
