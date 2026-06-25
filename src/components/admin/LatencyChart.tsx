import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

interface LatencyChartProps {
  data?: Array<{ time: string; apiLatency: number; aiLatency: number }>;
}

const DEFAULT_DATA = [
  { time: '10:00', apiLatency: 120, aiLatency: 750 },
  { time: '10:05', apiLatency: 145, aiLatency: 820 },
  { time: '10:10', apiLatency: 95, aiLatency: 690 },
  { time: '10:15', apiLatency: 130, aiLatency: 880 },
  { time: '10:20', apiLatency: 110, aiLatency: 710 },
  { time: '10:25', apiLatency: 180, aiLatency: 920 },
  { time: '10:30', apiLatency: 125, aiLatency: 840 },
];

export const LatencyChart: React.FC<LatencyChartProps> = ({ data = DEFAULT_DATA }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-xl p-5"
    >
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="font-semibold text-white">API & Agent Response Latency</h3>
          <p className="text-xs text-slate-400">Response rates measured in milliseconds</p>
        </div>
        <div className="flex space-x-4 text-xs font-semibold">
          <div className="flex items-center">
            <span className="w-3 h-3 bg-indigo-500 rounded mr-1.5" />
            <span className="text-slate-300">Gateway API</span>
          </div>
          <div className="flex items-center">
            <span className="w-3 h-3 bg-purple-500 rounded mr-1.5" />
            <span className="text-slate-300">Gemini LLM</span>
          </div>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorApi" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorAi" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#a855f7" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.3} />
            <XAxis dataKey="time" stroke="#64748b" fontSize={11} tickLine={false} />
            <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
            <Tooltip
              contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }}
              labelClassName="text-white font-semibold text-xs mb-1"
              itemStyle={{ fontSize: '11px', color: '#94a3b8' }}
            />
            <Area
              type="monotone"
              dataKey="apiLatency"
              stroke="#6366f1"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorApi)"
            />
            <Area
              type="monotone"
              dataKey="aiLatency"
              stroke="#a855f7"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorAi)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

export default LatencyChart;
