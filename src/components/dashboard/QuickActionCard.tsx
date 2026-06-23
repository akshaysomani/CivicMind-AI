import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface QuickActionCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  onClick: () => void;
  colorClass?: string;
  disabled?: boolean;
}

export const QuickActionCard: React.FC<QuickActionCardProps> = ({
  title,
  description,
  icon: Icon,
  onClick,
  colorClass = 'text-primary bg-primary/10 border-primary/20',
  disabled = false
}) => {
  return (
    <motion.button
      whileHover={disabled ? {} : { scale: 1.025 }}
      whileTap={disabled ? {} : { scale: 0.975 }}
      onClick={disabled ? undefined : onClick}
      className={`w-full text-left p-5 rounded-2xl border backdrop-blur-md transition-all ${
        disabled 
          ? 'opacity-60 cursor-not-allowed bg-slate-900/10 border-white/5' 
          : 'bg-slate-900/30 dark:bg-slate-900/30 light:bg-white/40 border-white/10 dark:border-white/5 light:border-slate-200 hover:border-primary/30 hover:bg-slate-800/40 dark:hover:bg-slate-800/40 light:hover:bg-slate-100/60 shadow-sm hover:shadow-md'
      }`}
    >
      <div className="flex gap-4">
        <div className={`p-3 rounded-xl border shrink-0 ${colorClass}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h4 className="font-heading font-bold text-slate-900 dark:text-slate-100 text-base leading-tight">
            {title}
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {description}
          </p>
        </div>
      </div>
    </motion.button>
  );
};

export default QuickActionCard;
