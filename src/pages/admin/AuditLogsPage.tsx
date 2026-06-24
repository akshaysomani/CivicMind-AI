import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { Search, Download, Calendar, Filter } from 'lucide-react';

export const AuditLogsPage: React.FC = () => {
  const { auditLogs, loading } = useAdmin();
  const [searchTerm, setSearchTerm] = useState('');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  const filteredLogs = auditLogs.filter(log => 
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) || 
    log.user.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-white">Enterprise Audit Logs</h1>
          <p className="text-slate-400">Immutable record of all critical system actions for governance and compliance.</p>
        </div>
        <button className="flex items-center space-x-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-medium transition-colors border border-slate-700">
          <Download className="w-4 h-4" />
          <span>Export Logs</span>
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row gap-4 justify-between bg-slate-800/20">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search by action or user..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div className="flex space-x-2">
            <button className="flex items-center space-x-2 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-300">
              <Calendar className="w-4 h-4" />
              <span>Date Range</span>
            </button>
            <button className="flex items-center space-x-2 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-300">
              <Filter className="w-4 h-4" />
              <span>Filter</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-800/50 text-xs uppercase text-slate-400">
              <tr>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Resource Target</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map(log => (
                <tr key={log.id} className="border-b border-slate-800 hover:bg-slate-800/20">
                  <td className="px-4 py-3 text-slate-400 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 font-medium text-white">{log.action}</td>
                  <td className="px-4 py-3 text-slate-400">{log.user}</td>
                  <td className="px-4 py-3 font-mono text-xs text-indigo-300 bg-indigo-500/10 px-2 py-1 rounded inline-block mt-2">
                    {log.resource}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      log.status === 'Success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                      'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}>
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                    No audit logs found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AuditLogsPage;
