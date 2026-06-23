import React from 'react';

interface ProgressCardProps {
  title: string;
  description?: string;
  progress: number; // 0 to 100
  scoreLabel?: string;
  badgeText?: string;
  colorClass?: string;
}

export const ProgressCard: React.FC<ProgressCardProps> = ({
  title,
  description,
  progress,
  scoreLabel,
  badgeText,
  colorClass = 'from-primary to-secondary'
}) => {
  return (
    <div className="bg-slate-900/30 dark:bg-slate-900/30 light:bg-white/40 border border-white/10 dark:border-white/5 light:border-slate-200/80 rounded-2xl p-5 backdrop-blur-md shadow-sm space-y-4">
      {/* Title block */}
      <div className="flex justify-between items-start gap-2">
        <div className="space-y-1">
          <h4 className="font-heading font-bold text-sm text-slate-900 dark:text-slate-100">
            {title}
          </h4>
          {description && (
            <p className="text-[11px] text-slate-500">
              {description}
            </p>
          )}
        </div>
        {badgeText && (
          <span className="px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 text-[9px] font-bold uppercase tracking-wider">
            {badgeText}
          </span>
        )}
      </div>

      {/* Progress slider */}
      <div className="space-y-2">
        <div className="w-full bg-slate-800 dark:bg-slate-800 light:bg-slate-200 h-2.5 rounded-full overflow-hidden">
          <div 
            className={`bg-gradient-to-r ${colorClass} h-full rounded-full transition-all duration-700`}
            style={{ width: `${progress}%` }}
          />
        </div>
        
        <div className="flex justify-between items-center text-[10px] font-bold text-slate-500">
          <span>{scoreLabel || 'Goal Progress:'}</span>
          <span className="text-slate-900 dark:text-slate-200">{progress}%</span>
        </div>
      </div>
    </div>
  );
};

export default ProgressCard;
