import React from 'react';
import { TerminalSquare, Key, Activity, RefreshCw } from 'lucide-react';

export const ApiConsolePage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center">
            <TerminalSquare className="w-8 h-8 mr-3 text-indigo-500" />
            API Console
          </h1>
          <p className="text-slate-400 mt-1">Manage external integrations, rate limits, API keys, and gateway health.</p>
        </div>
        <button className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-indigo-500/20">
          <Key className="w-4 h-4" />
          <span>Generate New Key</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-center space-x-4">
          <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-lg">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-slate-400">Total API Calls (24h)</p>
            <h3 className="text-2xl font-bold text-white">1.2M</h3>
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-center space-x-4">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-lg">
            <RefreshCw className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-slate-400">Avg. Response Time</p>
            <h3 className="text-2xl font-bold text-white">124ms</h3>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-800/20">
          <h3 className="font-semibold text-white">Active API Keys</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-800/50 text-xs uppercase text-slate-400">
              <tr>
                <th className="px-4 py-3">Key Name</th>
                <th className="px-4 py-3">Created By</th>
                <th className="px-4 py-3">Created At</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: 'Production Mobile App', creator: 'admin@civicmind.ai', date: '2026-01-15', status: 'Active' },
                { name: 'External Partner Integration', creator: 'john.davis@gov.city', date: '2026-03-22', status: 'Active' },
                { name: 'Legacy Testing Key', creator: 'developer@civicmind.ai', date: '2025-11-05', status: 'Revoked' },
              ].map((keyItem, idx) => (
                <tr key={idx} className="border-b border-slate-800 hover:bg-slate-800/20">
                  <td className="px-4 py-3 font-medium text-white">{keyItem.name}</td>
                  <td className="px-4 py-3 text-slate-400">{keyItem.creator}</td>
                  <td className="px-4 py-3 text-slate-400">{keyItem.date}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium border ${
                      keyItem.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                      'bg-rose-500/10 text-rose-400 border-rose-500/20'
                    }`}>
                      {keyItem.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button className="text-indigo-400 hover:text-indigo-300 mr-3">Rotate</button>
                    <button className="text-rose-400 hover:text-rose-300">Revoke</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ApiConsolePage;
