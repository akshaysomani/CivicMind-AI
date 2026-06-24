import React from 'react';
import { AgentHealth } from '../../services/adminService';
import { Activity, Cpu, HardDrive, RefreshCw, Power } from 'lucide-react';
import { motion } from 'framer-motion';

interface AgentCardProps {
  agent: AgentHealth;
}

export const AgentCard: React.FC<AgentCardProps> = ({ agent }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-indigo-500/50 transition-all group"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-semibold text-white text-lg">{agent.name}</h3>
          <p className="text-xs text-slate-400">Version {agent.version}</p>
        </div>
        <div className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${
          agent.status === 'Healthy' ? 'bg-emerald-500/10 text-emerald-400' :
          agent.status === 'Degraded' ? 'bg-amber-500/10 text-amber-400' :
          'bg-rose-500/10 text-rose-400'
        }`}>
          <div className={`w-2 h-2 rounded-full ${
            agent.status === 'Healthy' ? 'bg-emerald-400 animate-pulse' :
            agent.status === 'Degraded' ? 'bg-amber-400' :
            'bg-rose-400'
          }`} />
          <span>{agent.status}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-5">
        <div className="bg-slate-800/50 rounded-lg p-3">
          <div className="flex items-center text-slate-400 text-xs mb-1">
            <Activity className="w-3.5 h-3.5 mr-1" /> Latency
          </div>
          <div className="font-semibold text-white">{agent.latencyMs}ms</div>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-3">
          <div className="flex items-center text-slate-400 text-xs mb-1">
            <Cpu className="w-3.5 h-3.5 mr-1" /> Success Rate
          </div>
          <div className="font-semibold text-white">{agent.successRate}%</div>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-3 col-span-2 flex justify-between items-center">
          <div className="flex items-center text-slate-400 text-xs">
            <HardDrive className="w-3.5 h-3.5 mr-1" /> Memory
          </div>
          <div className="font-semibold text-white">{agent.memoryUsageMb} MB</div>
        </div>
      </div>

      <div className="flex space-x-2 pt-4 border-t border-slate-800">
        <button className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm transition-colors">
          <RefreshCw className="w-4 h-4" />
          <span>Restart</span>
        </button>
        <button className="px-3 py-2 bg-slate-800 hover:bg-rose-500/20 text-slate-300 hover:text-rose-400 rounded-lg text-sm transition-colors">
          <Power className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
};
