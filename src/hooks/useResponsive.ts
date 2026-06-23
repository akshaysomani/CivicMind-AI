import { useState, useEffect } from 'react';

export const useResponsive = () => {
  const [width, setWidth] = useState<number>(() => (typeof window !== 'undefined' ? window.innerWidth : 1200));

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      setWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return {
    width,
    isMobile: width < 768,
    isTablet: width >= 768 && width < 1024,
    isDesktop: width >= 1024,
  };
};
