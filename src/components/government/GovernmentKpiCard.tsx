import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { AnimatedCounter } from '../AnimatedCounter';

interface GovernmentKpiCardProps {
  title: string;
  value: number;
  prefix?: string;
  suffix?: string;
  icon: LucideIcon;
  trend: {
    value: string;
    isPositive: boolean;
  };
  description: string;
  colorClass?: string; // e.g. 'text-primary bg-primary/10 border-primary/20'
  sparklineData?: number[];
}

export const GovernmentKpiCard: React.FC<GovernmentKpiCardProps> = ({
  title,
  value,
  prefix = '',
  suffix = '',
  icon: Icon,
  trend,
  description,
  colorClass = 'text-primary bg-primary/10 border-primary/20',
  sparklineData = [10, 15, 8, 12, 20, 15, 25]
}) => {
  // SVG Sparkline path generator
  const getSparklinePath = (data: number[]) => {
    const width = 100;
    const height = 30;
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    
    return data.map((val, idx) => {
      const x = (idx / (data.length - 1)) * width;
      const y = height - ((val - min) / range) * height;
      return `${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    }).join(' ');
  };

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      className="bg-slate-900/30 dark:bg-slate-900/30 light:bg-white/40 border border-white/10 dark:border-white/5 light:border-slate-200/80 rounded-2xl p-5 backdrop-blur-md shadow-sm transition-all flex flex-col justify-between h-full"
    >
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">
            {title}
          </span>
          <h3 className="text-2xl font-extrabold font-heading text-slate-900 dark:text-slate-100 block">
            <AnimatedCounter value={value} prefix={prefix} suffix={suffix} />
          </h3>
        </div>
        <div className={`p-2.5 rounded-xl border shrink-0 ${colorClass}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="flex items-end justify-between mt-6">
        <div className="space-y-1.5 flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={`flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
              trend.isPositive 
                ? 'text-emerald-500 bg-emerald-500/10' 
                : 'text-rose-500 bg-rose-500/10'
            }`}>
              {trend.isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              {trend.value}
            </span>
            <span className="text-[10px] text-slate-500 font-semibold truncate">
              {description}
            </span>
          </div>
        </div>

        {/* Mini Sparkline Graph */}
        <div className="w-24 h-8 shrink-0 pb-1 pr-1">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 100 30">
            <path
              d={getSparklinePath(sparklineData)}
              fill="none"
              stroke={trend.isPositive ? '#10b981' : '#f43f5e'}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    </motion.div>
  );
};

export default GovernmentKpiCard;
