import React from 'react';

interface LoadingSkeletonProps {
  type: 'card' | 'table' | 'feed' | 'list';
  count?: number;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ type, count = 3 }) => {
  const items = Array.from({ length: count });

  if (type === 'card') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {items.map((_, i) => (
          <div key={i} className="animate-pulse bg-slate-800/30 border border-white/5 rounded-2xl p-6 h-36 flex flex-col justify-between">
            <div className="flex justify-between items-center">
              <div className="w-12 h-4 bg-slate-700/50 rounded" />
              <div className="w-8 h-8 bg-slate-700/50 rounded-xl" />
            </div>
            <div className="space-y-2">
              <div className="w-24 h-6 bg-slate-700/50 rounded" />
              <div className="w-36 h-3.5 bg-slate-700/50 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'table') {
    return (
      <div className="animate-pulse w-full overflow-hidden rounded-2xl border border-white/10 bg-slate-800/10 p-4 space-y-4">
        <div className="flex gap-4 border-b border-white/10 pb-4">
          <div className="flex-1 h-4 bg-slate-700/50 rounded" />
          <div className="w-24 h-4 bg-slate-700/50 rounded" />
          <div className="w-20 h-4 bg-slate-700/50 rounded" />
          <div className="w-20 h-4 bg-slate-700/50 rounded" />
        </div>
        {items.map((_, i) => (
          <div key={i} className="flex gap-4 items-center py-2">
            <div className="flex-1 h-5 bg-slate-700/30 rounded" />
            <div className="w-24 h-5 bg-slate-700/30 rounded" />
            <div className="w-20 h-5 bg-slate-700/30 rounded" />
            <div className="w-20 h-5 bg-slate-700/30 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (type === 'feed') {
    return (
      <div className="space-y-6">
        {items.map((_, i) => (
          <div key={i} className="animate-pulse bg-slate-800/30 border border-white/5 rounded-2xl p-6 space-y-4">
            <div className="flex justify-between">
              <div className="flex gap-3">
                <div className="w-10 h-10 bg-slate-700/50 rounded-full" />
                <div className="space-y-1.5 py-1">
                  <div className="w-28 h-3.5 bg-slate-700/50 rounded" />
                  <div className="w-20 h-2 bg-slate-700/50 rounded" />
                </div>
              </div>
              <div className="w-16 h-5 bg-slate-700/50 rounded-full" />
            </div>
            <div className="space-y-2">
              <div className="w-2/3 h-5 bg-slate-700/50 rounded" />
              <div className="w-full h-4 bg-slate-700/30 rounded" />
              <div className="w-4/5 h-4 bg-slate-700/30 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // default list list skeleton
  return (
    <div className="space-y-3">
      {items.map((_, i) => (
        <div key={i} className="animate-pulse bg-slate-850/40 p-4 rounded-xl border border-white/5 h-16 flex items-center justify-between">
          <div className="flex gap-3 items-center">
            <div className="w-8 h-8 bg-slate-700/50 rounded-lg" />
            <div className="space-y-1">
              <div className="w-32 h-3 bg-slate-700/50 rounded" />
              <div className="w-48 h-2 bg-slate-700/30 rounded" />
            </div>
          </div>
          <div className="w-12 h-3 bg-slate-700/50 rounded" />
        </div>
      ))}
    </div>
  );
};

export default LoadingSkeleton;
