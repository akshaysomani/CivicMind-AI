import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { usePresentation } from '../../context/PresentationContext';

interface AdminKPICardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendDirection?: 'up' | 'down' | 'neutral';
  color?: string;
}

export const AdminKPICard: React.FC<AdminKPICardProps> = ({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  trendDirection = 'neutral',
  color = 'indigo'
}) => {
  const { isDemoMode } = usePresentation();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-colors"
    >
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-slate-400 text-sm font-medium">{title}</p>
            {isDemoMode && (
              <span className="bg-indigo-500/10 text-indigo-400 px-1.5 py-0.5 text-[8px] font-bold rounded border border-indigo-500/20 lowercase tracking-normal">
                demo
              </span>
            )}
          </div>
          <h3 className="text-2xl font-bold text-white mt-1">{value}</h3>
          
          {trend && (
            <div className="mt-2 flex items-center">
              <span className={`text-sm font-medium ${
                trendDirection === 'up' ? 'text-emerald-400' :
                trendDirection === 'down' ? 'text-rose-400' :
                'text-slate-400'
              }`}>
                {trend}
              </span>
              <span className="text-slate-500 text-xs ml-2">vs last week</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg bg-${color}-505/10 text-${color}-400`.replace('-505', '-500')}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </motion.div>
  );
};
