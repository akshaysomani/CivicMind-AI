import React from 'react';
import type { ThreatEvent } from '../../services/adminService';
import { ShieldAlert, AlertTriangle, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

interface ThreatCardProps {
  threats: ThreatEvent[];
}

export const ThreatCard: React.FC<ThreatCardProps> = ({ threats }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-xl p-5"
    >
      <h3 className="font-semibold text-white mb-4 flex items-center">
        <ShieldAlert className="w-5 h-5 mr-2 text-rose-500" />
        Zero-Trust WAF Threat Violations
      </h3>

      {threats.length === 0 ? (
        <p className="text-slate-500 text-sm text-center py-6">No threat violations captured in this window.</p>
      ) : (
        <div className="space-y-4">
          {threats.map((threat, idx) => (
            <div
              key={idx}
              className="border border-slate-800 bg-slate-950/40 rounded-lg p-4 flex flex-col gap-2 transition hover:border-slate-700"
            >
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded">
                  {threat.event_type}
                </span>
                <span className="text-xs font-bold text-rose-500 flex items-center">
                  <AlertTriangle className="w-3.5 h-3.5 mr-1" />
                  Severity: {threat.severity}
                </span>
              </div>

              <div className="text-sm font-medium text-white">{threat.reason}</div>

              <div className="mt-2 text-xs">
                <span className="text-slate-500 block mb-1">Payload Sample:</span>
                <code className="bg-slate-900 border border-slate-850 p-2 rounded block font-mono text-rose-300 overflow-x-auto">
                  {threat.data_preview}
                </code>
              </div>

              <div className="flex items-center text-[10px] text-slate-500 mt-1">
                <Clock className="w-3.5 h-3.5 mr-1" />
                Detected: {new Date(threat.timestamp * 1000).toLocaleTimeString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default ThreatCard;
