import React from 'react';
import { Activity, Database, Server, Cpu, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface HealthCardProps {
  dbStatus: 'Healthy' | 'Warning' | 'Critical';
  apiStatus: 'Healthy' | 'Warning' | 'Critical';
  cacheStatus: string;
  connections: number;
}

export const HealthCard: React.FC<HealthCardProps> = ({
  dbStatus,
  apiStatus,
  cacheStatus,
  connections
}) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Healthy':
        return <CheckCircle className="w-5 h-5 text-emerald-400" />;
      case 'Warning':
        return <AlertTriangle className="w-5 h-5 text-amber-400" />;
      default:
        return <XCircle className="w-5 h-5 text-rose-400" />;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'Healthy':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'Warning':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      default:
        return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-xl p-5"
    >
      <h3 className="font-semibold text-white mb-4 flex items-center">
        <Activity className="w-5 h-5 mr-2 text-indigo-400 animate-pulse" />
        Infrastructure Integrity Check
      </h3>

      <div className="space-y-4">
        {/* Database Node */}
        <div className="flex items-center justify-between p-3 bg-slate-800/40 border border-slate-800/60 rounded-lg">
          <div className="flex items-center space-x-3">
            <Database className="w-5 h-5 text-indigo-400" />
            <div>
              <p className="text-sm font-medium text-white">PostgreSQL Connection Pool</p>
              <p className="text-xs text-slate-400">Size: 20 | Timeout: 15s</p>
            </div>
          </div>
          <span className={`text-xs px-2.5 py-1 rounded-full border font-medium flex items-center space-x-1.5 ${getStatusClass(dbStatus)}`}>
            {getStatusIcon(dbStatus)}
            <span>{dbStatus}</span>
          </span>
        </div>

        {/* API Gateway */}
        <div className="flex items-center justify-between p-3 bg-slate-800/40 border border-slate-800/60 rounded-lg">
          <div className="flex items-center space-x-3">
            <Server className="w-5 h-5 text-sky-400" />
            <div>
              <p className="text-sm font-medium text-white">Reverse Proxy API Gateway</p>
              <p className="text-xs text-slate-400">Nginx / Cloud Run Boundary</p>
            </div>
          </div>
          <span className={`text-xs px-2.5 py-1 rounded-full border font-medium flex items-center space-x-1.5 ${getStatusClass(apiStatus)}`}>
            {getStatusIcon(apiStatus)}
            <span>{apiStatus}</span>
          </span>
        </div>

        {/* Cache Pool */}
        <div className="flex items-center justify-between p-3 bg-slate-800/40 border border-slate-800/60 rounded-lg">
          <div className="flex items-center space-x-3">
            <Cpu className="w-5 h-5 text-purple-400" />
            <div>
              <p className="text-sm font-medium text-white">Redis Cluster Replica</p>
              <p className="text-xs text-slate-400">In-Memory Cache Cache Store</p>
            </div>
          </div>
          <span className={`text-xs px-2.5 py-1 rounded-full border font-medium flex items-center space-x-1.5 ${getStatusClass(cacheStatus)}`}>
            {getStatusIcon(cacheStatus)}
            <span>{cacheStatus}</span>
          </span>
        </div>

        {/* Active Connections summary */}
        <div className="pt-2 flex justify-between text-xs text-slate-500">
          <span>Active Connections: {connections}</span>
          <span>Self-Recovery: Activated</span>
        </div>
      </div>
    </motion.div>
  );
};

export default HealthCard;
