import React from 'react';
import { motion } from 'framer-motion';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  animate?: boolean;
  onClick?: () => void;
  id?: string;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  animate = true,
  onClick,
  id,
}) => {
  const Card = onClick ? motion.button : motion.div;

  const hoverProps = (animate && onClick) || (animate && !onClick)
    ? {
        whileHover: { y: -6, scale: 1.01, transition: { duration: 0.2 } },
        initial: { opacity: 0, y: 15 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: '-50px' },
      }
    : {};

  return (
    <Card
      id={id}
      onClick={onClick}
      {...hoverProps}
      className={`glass dark:glass light:glass-light rounded-[24px] p-6 shadow-xl text-left border border-white/5 dark:border-white/5 light:border-slate-200/50 ${
        onClick ? 'cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary' : ''
      } ${className}`}
    >
      {children}
    </Card>
  );
};
export default GlassCard;
