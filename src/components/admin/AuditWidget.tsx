import React, { useState } from 'react';
import type { AuditLog } from '../../services/adminService';
import { Search, Shield, CheckCircle, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface AuditWidgetProps {
  logs: AuditLog[];
}

export const AuditWidget: React.FC<AuditWidgetProps> = ({ logs }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLogs = logs.filter(
    (log) =>
      log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.resource.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-xl p-5"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h3 className="font-semibold text-white flex items-center">
            <Shield className="w-5 h-5 mr-2 text-indigo-400" />
            Security & Operations Audit Trial
          </h3>
          <p className="text-xs text-slate-400">Chronological history of platform operations</p>
        </div>

        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search logs/correlation IDs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              <th className="pb-3">Timestamp</th>
              <th className="pb-3">Initiator / User</th>
              <th className="pb-3">Action</th>
              <th className="pb-3">Affected Target</th>
              <th className="pb-3 text-right">Result</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 text-xs">
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-6 text-center text-slate-500">
                  No matching audit records found.
                </td>
              </tr>
            ) : (
              filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-850/40 transition">
                  <td className="py-3 text-slate-400 font-mono">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </td>
                  <td className="py-3 text-white font-medium">{log.user}</td>
                  <td className="py-3">
                    <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700/30">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 text-slate-400 font-mono">{log.resource}</td>
                  <td className="py-3 text-right">
                    <span className={`inline-flex items-center space-x-1 font-semibold ${
                      log.status === 'Success' ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                      {log.status === 'Success' ? (
                        <CheckCircle className="w-3.5 h-3.5 mr-1" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 mr-1" />
                      )}
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

export default AuditWidget;
