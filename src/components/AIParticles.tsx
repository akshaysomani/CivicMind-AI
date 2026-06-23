import React from 'react';
import { motion } from 'framer-motion';

export const AIParticles: React.FC = () => {
  // Generate a set of stable configurations for floating particles
  const particles = [
    { id: 1, size: 80, x: '10%', y: '20%', duration: 18, delay: 0, color: 'bg-primary/10' },
    { id: 2, size: 120, x: '80%', y: '15%', duration: 25, delay: 2, color: 'bg-secondary/8 animate-pulse-slow' },
    { id: 3, size: 60, x: '40%', y: '60%', duration: 20, delay: 1, color: 'bg-accent/8' },
    { id: 4, size: 90, x: '75%', y: '70%', duration: 22, delay: 3, color: 'bg-primary/5' },
    { id: 5, size: 140, x: '15%', y: '75%', duration: 28, delay: 0, color: 'bg-secondary/12' },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 select-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className={`absolute rounded-full filter blur-3xl ${p.color}`}
          style={{
            width: p.size,
            height: p.size,
            left: p.x,
            top: p.y,
          }}
          animate={{
            x: [0, 40, -20, 0],
            y: [0, -30, 20, 0],
            scale: [1, 1.1, 0.9, 1],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
};
export default AIParticles;
