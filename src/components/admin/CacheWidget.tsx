import React, { useState } from 'react';
import type { CacheStats } from '../../services/adminService';
import { Trash2, Cpu, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface CacheWidgetProps {
  stats: CacheStats | null;
  onClear: (namespace?: string) => Promise<void>;
}

export const CacheWidget: React.FC<CacheWidgetProps> = ({ stats, onClear }) => {
  const [clearing, setClearing] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleClear = async (namespace?: string) => {
    const key = namespace || 'ALL';
    setClearing(key);
    await onClear(namespace);
    setClearing(null);
    setSuccessMsg(`Successfully purged cache: ${key}`);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  if (!stats) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-xl p-5"
    >
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="font-semibold text-white flex items-center">
            <Cpu className="w-5 h-5 mr-2 text-indigo-400" />
            Distributed Cache Controller
          </h3>
          <p className="text-xs text-slate-400">Manage in-memory datasets and Redis caching keys</p>
        </div>
        <button
          disabled={clearing !== null}
          onClick={() => handleClear()}
          className="text-xs font-semibold text-rose-400 hover:text-white bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/25 px-3 py-1.5 rounded transition flex items-center disabled:opacity-50"
        >
          <Trash2 className="w-3.5 h-3.5 mr-1.5" />
          Purge All Cache
        </button>
      </div>

      {successMsg && (
        <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-lg flex items-center">
          <CheckCircle className="w-4 h-4 mr-2" />
          {successMsg}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-slate-950/40 p-4 border border-slate-800 rounded-lg">
          <p className="text-slate-400 text-xs font-medium">Cache Hit Rate</p>
          <h4 className="text-2xl font-bold text-white mt-1">{stats.hit_rate_percent.toFixed(1)}%</h4>
        </div>
        <div className="bg-slate-950/40 p-4 border border-slate-800 rounded-lg">
          <p className="text-slate-400 text-xs font-medium">Active Memory Keys</p>
          <h4 className="text-2xl font-bold text-white mt-1">{stats.total_keys}</h4>
        </div>
        <div className="bg-slate-950/40 p-4 border border-slate-800 rounded-lg">
          <p className="text-slate-400 text-xs font-medium">Memory Provider</p>
          <h4 className="text-sm font-semibold text-indigo-400 mt-2 truncate">{stats.storage_provider}</h4>
        </div>
      </div>

      <div className="border border-slate-800 bg-slate-950/40 rounded-lg p-4">
        <h4 className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-wider">Active Namespaces</h4>
        <div className="divide-y divide-slate-800">
          {stats.namespaces.map((ns) => (
            <div key={ns} className="flex justify-between items-center py-2.5 first:pt-0 last:pb-0">
              <span className="text-sm text-slate-300 font-mono">{ns}</span>
              <button
                disabled={clearing !== null}
                onClick={() => handleClear(ns)}
                className="text-xs font-medium text-slate-400 hover:text-rose-400 transition flex items-center space-x-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{clearing === ns ? 'Purging...' : 'Purge'}</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default CacheWidget;
