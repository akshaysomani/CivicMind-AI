import React from 'react';
import { motion } from 'framer-motion';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  badge?: string;
  center?: boolean;
  className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  badge,
  center = true,
  className = '',
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={`max-w-3xl mb-12 ${center ? 'text-center mx-auto' : 'text-left'} ${className}`}
    >
      {badge && (
        <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase bg-primary/10 text-primary border border-primary/20 mb-4 select-none animate-pulse-slow">
          {badge}
        </span>
      )}
      
      <h2 className="text-3xl md:text-5xl font-extrabold font-heading text-slate-900 dark:text-slate-100 tracking-tight leading-tight mb-4">
        {title}
      </h2>
      
      {subtitle && (
        <p className="text-base md:text-lg text-slate-700 dark:text-slate-350 leading-relaxed font-normal">
          {subtitle}
        </p>
      )}
    </motion.div>
  );
};
export default SectionHeader;
