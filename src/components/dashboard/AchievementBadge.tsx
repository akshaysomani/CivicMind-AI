import React from 'react';
import { Award, Shield, CheckCircle, Leaf, Heart, Zap, Lock, Unlock } from 'lucide-react';
import type { AchievementBadge as BadgeType } from '../../context/CitizenContext';

interface AchievementBadgeProps {
  badge: BadgeType;
}

export const AchievementBadge: React.FC<AchievementBadgeProps> = ({ badge }) => {
  const getBadgeIcon = (iconName: string) => {
    const iconClass = 'w-6 h-6';
    switch (iconName) {
      case 'Users':
        return <Shield className={iconClass} />;
      case 'CheckSquare':
        return <CheckCircle className={iconClass} />;
      case 'Leaf':
        return <Leaf className={iconClass} />;
      case 'Heart':
        return <Heart className={iconClass} />;
      case 'Zap':
        return <Zap className={iconClass} />;
      default:
        return <Award className={iconClass} />;
    }
  };

  return (
    <div 
      className={`relative p-5 rounded-2xl border backdrop-blur-md transition-all flex gap-4 items-center ${
        badge.unlocked
          ? 'bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20 dark:border-primary/10 shadow-sm hover:shadow-md'
          : 'bg-slate-900/10 dark:bg-slate-900/10 light:bg-slate-50 border-white/5 dark:border-white/5 light:border-slate-200 opacity-60'
      }`}
    >
      {/* Icon frame */}
      <div 
        className={`p-3.5 rounded-xl border shrink-0 ${
          badge.unlocked
            ? 'bg-gradient-to-tr from-primary to-secondary text-white border-primary/25 shadow-md shadow-primary/10'
            : 'bg-slate-800 dark:bg-slate-800 light:bg-slate-250 text-slate-500 border-white/5 dark:border-white/5 light:border-slate-300'
        }`}
      >
        {getBadgeIcon(badge.icon_name)}
      </div>

      {/* Details */}
      <div className="flex-1 space-y-1.5 min-w-0">
        <div className="flex justify-between items-center gap-2">
          <h4 className="font-heading font-bold text-sm text-slate-900 dark:text-slate-100 truncate">
            {badge.title}
          </h4>
          {badge.unlocked ? (
            <Unlock className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
          ) : (
            <Lock className="w-3.5 h-3.5 text-slate-505 shrink-0" />
          )}
        </div>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
          {badge.description}
        </p>

        {/* Mini progress bar */}
        <div className="space-y-1 pt-1">
          <div className="w-full bg-slate-800 dark:bg-slate-800 light:bg-slate-200 h-1 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full ${badge.unlocked ? 'bg-emerald-500' : 'bg-primary'}`} 
              style={{ width: `${badge.progress}%` }}
            />
          </div>
          <div className="flex justify-between text-[8px] font-bold text-slate-500">
            <span>Progress</span>
            <span>{badge.progress}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AchievementBadge;
