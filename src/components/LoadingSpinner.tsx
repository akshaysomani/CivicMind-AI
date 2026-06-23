import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  text,
  className = '',
}) => {
  const sizes = {
    sm: 'w-6 h-6 border-2',
    md: 'w-10 h-10 border-3',
    lg: 'w-16 h-16 border-4',
  };

  return (
    <div className={`flex flex-col items-center justify-center gap-4 ${className}`}>
      <div
        className={`${sizes[size]} border-slate-700/30 dark:border-slate-800/30 light:border-slate-200 border-t-primary rounded-full animate-spin`}
        role="status"
        aria-label="loading"
      />
      {text && (
        <p className="text-sm font-medium text-slate-550 dark:text-slate-400 select-none animate-pulse">
          {text}
        </p>
      )}
    </div>
  );
};
export default LoadingSpinner;
