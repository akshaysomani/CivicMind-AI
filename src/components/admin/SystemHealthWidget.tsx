import React from 'react';
import type { SystemHealth } from '../../services/adminService';
import { Activity, Database, Server } from 'lucide-react';

interface SystemHealthWidgetProps {
  health: SystemHealth;
}

export const SystemHealthWidget: React.FC<SystemHealthWidgetProps> = ({ health }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
      <h3 className="font-semibold text-white mb-4 flex items-center">
        <Activity className="w-5 h-5 mr-2 text-indigo-400" />
        Live System Health
      </h3>

      <div className="space-y-4">
        {/* CPU Usage */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-slate-400">CPU Usage</span>
            <span className="text-white font-medium">{health.cpuUsage}%</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${health.cpuUsage > 80 ? 'bg-rose-500' : health.cpuUsage > 60 ? 'bg-amber-500' : 'bg-indigo-500'}`} 
              style={{ width: `${health.cpuUsage}%` }} 
            />
          </div>
        </div>

        {/* Memory Usage */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-slate-400">Memory Usage</span>
            <span className="text-white font-medium">{health.memoryUsage}%</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${health.memoryUsage > 80 ? 'bg-rose-500' : health.memoryUsage > 60 ? 'bg-amber-500' : 'bg-indigo-500'}`} 
              style={{ width: `${health.memoryUsage}%` }} 
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
            <div className="flex items-center space-x-2 mb-1 text-slate-400 text-sm">
              <Database className="w-4 h-4" />
              <span>Database</span>
            </div>
            <div className={`font-semibold ${
              health.databaseHealth === 'Healthy' ? 'text-emerald-400' :
              health.databaseHealth === 'Warning' ? 'text-amber-400' : 'text-rose-400'
            }`}>
              {health.databaseHealth}
            </div>
          </div>
          <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
            <div className="flex items-center space-x-2 mb-1 text-slate-400 text-sm">
              <Server className="w-4 h-4" />
              <span>API Gateway</span>
            </div>
            <div className={`font-semibold ${
              health.apiHealth === 'Healthy' ? 'text-emerald-400' :
              health.apiHealth === 'Warning' ? 'text-amber-400' : 'text-rose-400'
            }`}>
              {health.apiHealth}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
