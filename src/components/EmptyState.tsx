import React from 'react';
import { Inbox } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No data available',
  description = 'There is currently no information to display here.',
  icon = <Inbox className="w-12 h-12 text-slate-400 dark:text-slate-655" />,
  actionText,
  onAction,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center text-center p-8 rounded-3xl border border-dashed border-slate-700/50 light:border-slate-300 bg-slate-900/10 dark:bg-slate-900/10 light:bg-slate-50/50 max-w-md mx-auto ${className}`}>
      <div className="mb-4 p-4 bg-slate-800/40 dark:bg-slate-800/40 light:bg-slate-100 rounded-full border border-slate-700/30 light:border-slate-200">
        {icon}
      </div>
      <h3 className="text-lg font-bold font-heading text-slate-900 dark:text-slate-100 mb-2">
        {title}
      </h3>
      <p className="text-sm text-slate-700 dark:text-slate-400 mb-6 max-w-xs leading-relaxed">
        {description}
      </p>
      {actionText && onAction && (
        <Button variant="glass" size="sm" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
};
export default EmptyState;
