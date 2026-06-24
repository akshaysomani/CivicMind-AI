import React from 'react';
import { useAdmin } from '../../context/AdminContext';
import { SystemHealthWidget } from '../../components/admin/SystemHealthWidget';
import { Activity, Server, Database, Cloud } from 'lucide-react';

export const MonitoringPage: React.FC = () => {
  const { systemHealth, loading } = useAdmin();

  if (loading || !systemHealth) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center">
            <Activity className="w-8 h-8 mr-3 text-indigo-500" />
            System Monitoring
          </h1>
          <p className="text-slate-400 mt-1">Real-time health, performance metrics, and infrastructure observability.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SystemHealthWidget health={systemHealth} />
        
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h3 className="font-semibold text-white mb-4">Infrastructure Nodes</h3>
          <div className="space-y-4">
            {[
              { name: 'US-East Primary Cluster', status: 'Online', load: '42%', icon: Cloud },
              { name: 'US-East Replica', status: 'Online', load: '28%', icon: Cloud },
              { name: 'Vector DB Instance', status: 'Online', load: '65%', icon: Database },
              { name: 'Redis Cache', status: 'Online', load: '12%', icon: Server },
            ].map((node, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
                <div className="flex items-center space-x-3">
                  <node.icon className="w-5 h-5 text-indigo-400" />
                  <div>
                    <p className="text-sm font-medium text-white">{node.name}</p>
                    <p className="text-xs text-emerald-400">{node.status}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400 mb-1">Load</p>
                  <p className="text-sm font-semibold text-white">{node.load}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonitoringPage;
