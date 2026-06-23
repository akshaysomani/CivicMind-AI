import React from 'react';
import { GlassCard } from './GlassCard';
import { AnimatedCounter } from './AnimatedCounter';

interface StatCardProps {
  icon: React.ReactNode;
  value: number;
  label: string;
  description: string;
  suffix?: string;
  prefix?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  icon,
  value,
  label,
  description,
  suffix = '',
  prefix = '',
}) => {
  return (
    <GlassCard className="flex flex-col justify-between h-full border-t-2 border-t-primary/30 relative overflow-hidden group">
      {/* Decorative Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      
      <div className="flex justify-between items-start mb-6 relative z-10">
        <div className="p-3 bg-slate-800/80 dark:bg-slate-800/80 light:bg-slate-100 rounded-2xl border border-slate-700/50 light:border-slate-300/50 text-primary transition-transform group-hover:scale-110 duration-300">
          {icon}
        </div>
      </div>
      
      <div className="relative z-10">
        <div className="text-3xl md:text-4xl font-extrabold font-heading text-slate-900 dark:text-slate-100 mb-2">
          <AnimatedCounter value={value} prefix={prefix} suffix={suffix} />
        </div>
        <div className="text-sm font-semibold tracking-wide uppercase text-slate-800 dark:text-slate-200 mb-1">
          {label}
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-400">
          {description}
        </p>
      </div>
    </GlassCard>
  );
};
export default StatCard;
