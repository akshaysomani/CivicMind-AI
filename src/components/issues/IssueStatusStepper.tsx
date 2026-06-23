import React from 'react';
import type { IssueStatus } from '../../types/issue';
import { STATUS_STEPS, STATUS_CONFIG } from '../../types/issue';

interface Props {
  currentStatus: IssueStatus | string;
}

const IssueStatusStepper: React.FC<Props> = ({ currentStatus }) => {
  const isRejected = currentStatus === 'Rejected';
  const currentIndex = STATUS_STEPS.indexOf(currentStatus as IssueStatus);

  return (
    <div className="w-full">
      {isRejected ? (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-red-500/10 border border-red-500/30">
          <span className="text-2xl">❌</span>
          <div>
            <p className="text-red-400 font-semibold">Issue Rejected</p>
            <p className="text-slate-400 text-sm">This report was not accepted for processing.</p>
          </div>
        </div>
      ) : (
        <div className="flex items-start gap-1 overflow-x-auto pb-2">
          {STATUS_STEPS.map((step, idx) => {
            const cfg = STATUS_CONFIG[step];
            const isCompleted = currentIndex > idx;
            const isActive = currentIndex === idx;
            const isLast = idx === STATUS_STEPS.length - 1;

            return (
              <React.Fragment key={step}>
                <div className="flex flex-col items-center gap-1.5 min-w-[72px]">
                  {/* Circle */}
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 border-2
                    ${isCompleted
                      ? 'bg-green-500 border-green-400 text-white shadow-lg shadow-green-500/30'
                      : isActive
                        ? 'bg-blue-500 border-blue-400 text-white shadow-lg shadow-blue-500/40 ring-4 ring-blue-500/20'
                        : 'bg-slate-800 border-slate-600 text-slate-500'
                    }
                  `}>
                    {isCompleted ? '✓' : <span className="text-xs">{cfg.icon}</span>}
                  </div>
                  {/* Label */}
                  <span className={`text-[10px] text-center font-medium leading-tight max-w-[72px] ${
                    isCompleted ? 'text-green-400' : isActive ? 'text-blue-400' : 'text-slate-500'
                  }`}>
                    {step === 'Under Inspection' ? 'Inspection' : step}
                  </span>
                </div>
                {/* Connector */}
                {!isLast && (
                  <div className={`
                    h-0.5 mt-4 flex-1 min-w-[8px] transition-all duration-300 rounded-full
                    ${isCompleted ? 'bg-green-500' : 'bg-slate-700'}
                  `} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default IssueStatusStepper;
