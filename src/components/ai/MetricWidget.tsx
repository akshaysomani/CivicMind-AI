import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface MetricWidgetProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description: string;
  colorClass: string;
  suffix?: string;
}

export const MetricWidget: React.FC<MetricWidgetProps> = ({
  title,
  value,
  icon: Icon,
  description,
  colorClass,
  suffix = '',
}) => {
  return (
    <div className="bg-slate-900/30 border border-white/10 dark:border-white/5 rounded-2xl p-5 backdrop-blur-md shadow-sm relative overflow-hidden transition-all duration-300 hover:border-amber-500/10 flex flex-col justify-between h-full">
      <div className="flex justify-between items-start gap-4">
        <div className="space-y-1 min-w-0">
          <span className="text-[10px] uppercase font-bold text-slate-500 block tracking-wider truncate">
            {title}
          </span>
          <span className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 block truncate">
            {value}
            {suffix && <span className="text-sm font-bold text-slate-500 ml-0.5">{suffix}</span>}
          </span>
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 ${colorClass}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <p className="text-[10px] text-slate-500 font-semibold mt-4">
        {description}
      </p>
    </div>
  );
};
export default MetricWidget;
