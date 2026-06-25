import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  subtext?: string;
  trend?: string;
  color?: 'indigo' | 'emerald' | 'amber' | 'rose' | 'sky';
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  icon: Icon,
  subtext,
  trend,
  color = 'indigo'
}) => {
  const colorMap = {
    indigo: 'border-l-indigo-500 text-indigo-400 bg-indigo-500/10',
    emerald: 'border-l-emerald-500 text-emerald-400 bg-emerald-500/10',
    amber: 'border-l-amber-500 text-amber-400 bg-amber-500/10',
    rose: 'border-l-rose-500 text-rose-400 bg-rose-500/10',
    sky: 'border-l-sky-500 text-sky-400 bg-sky-500/10',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-xl p-5 border-l-4 ${colorMap[color]}`}
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">{title}</p>
          <h3 className="text-3xl font-extrabold text-white mt-2 font-heading tracking-tight">{value}</h3>
          {subtext && <p className="text-slate-500 text-xs mt-1">{subtext}</p>}
          {trend && (
            <span className="inline-flex items-center text-xs font-medium text-emerald-400 mt-2 bg-emerald-500/10 px-2 py-0.5 rounded">
              {trend}
            </span>
          )}
        </div>
        <div className={`p-3 rounded-xl ${colorMap[color].split(' ')[2]} ${colorMap[color].split(' ')[1]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </motion.div>
  );
};

export default MetricCard;
