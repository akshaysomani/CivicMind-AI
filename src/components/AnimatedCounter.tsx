import React, { useEffect, useState, useRef } from 'react';
import { useInView } from 'framer-motion';

interface AnimatedCounterProps {
  value: number;
  duration?: number; // in milliseconds
  prefix?: string;
  suffix?: string;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  duration = 2000,
  prefix = '',
  suffix = '',
}) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!isInView || hasAnimated.current) return;
    hasAnimated.current = true;

    let startTimestamp: number | null = null;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      
      // Easing function: easeOutQuad
      const easedProgress = progress * (2 - progress);
      
      setCount(Math.floor(easedProgress * value));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [value, duration, isInView]);

  return (
    <span ref={ref} className="font-heading font-bold select-none">
      {prefix}
      {count.toLocaleString()}
      {suffix}
    </span>
  );
};
export default AnimatedCounter;
