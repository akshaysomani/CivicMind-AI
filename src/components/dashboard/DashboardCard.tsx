import React from 'react';
import { GlassCard } from '../GlassCard';

interface DashboardCardProps {
  children: React.ReactNode;
  className?: string;
  hoverScale?: boolean;
}

export const DashboardCard: React.FC<DashboardCardProps> = ({
  children,
  className = '',
  hoverScale = true
}) => {
  return (
    <GlassCard 
      className={`relative overflow-hidden transition-all duration-350 border border-white/10 dark:border-white/5 light:border-slate-200/80 shadow-md ${
        hoverScale ? 'hover:scale-[1.02] hover:shadow-lg hover:border-primary/20' : ''
      } ${className}`}
    >
      {children}
    </GlassCard>
  );
};

export default DashboardCard;
