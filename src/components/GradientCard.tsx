import React from 'react';
import { motion } from 'framer-motion';

interface GradientCardProps {
  children: React.ReactNode;
  className?: string;
  gradient?: string;
  animate?: boolean;
}

export const GradientCard: React.FC<GradientCardProps> = ({
  children,
  className = '',
  gradient = 'from-primary/10 via-secondary/5 to-accent/5',
  animate = true,
}) => {
  const animations = animate
    ? {
        initial: { opacity: 0, scale: 0.95 },
        whileInView: { opacity: 1, scale: 1 },
        viewport: { once: true },
        whileHover: { y: -5, transition: { duration: 0.2 } },
      }
    : {};

  return (
    <motion.div
      {...animations}
      className={`relative overflow-hidden rounded-[24px] p-6 border border-white/10 dark:border-white/5 light:border-slate-200 bg-gradient-to-br ${gradient} shadow-xl ${className}`}
    >
      {/* Decorative Blur Orb */}
      <div className="absolute -right-16 -top-16 w-36 h-36 rounded-full bg-secondary/15 blur-2xl pointer-events-none" />
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
};
export default GradientCard;
