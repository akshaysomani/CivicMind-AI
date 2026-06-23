import React from 'react';
import type { StatusHistoryEntry } from '../../types/issue';
import { STATUS_CONFIG } from '../../types/issue';
import type { IssueStatus } from '../../types/issue';

interface Props {
  history: StatusHistoryEntry[];
}

const IssueTimeline: React.FC<Props> = ({ history }) => {
  if (!history.length) {
    return (
      <div className="text-center py-6 text-slate-500 text-sm">No status history yet.</div>
    );
  }

  return (
    <div className="relative">
      {/* Vertical line */}
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-700/60 rounded-full" />

      <div className="space-y-4 pl-10">
        {history.map((entry, idx) => {
          const cfg = STATUS_CONFIG[entry.new_status as IssueStatus] || {
            icon: '•', color: 'text-slate-400', bg: 'bg-slate-500/20'
          };
          const isFirst = idx === 0;
          const date = new Date(entry.created_at);

          return (
            <div key={entry.id} className="relative">
              {/* Dot */}
              <div className={`
                absolute -left-10 w-8 h-8 rounded-full flex items-center justify-center text-sm border-2
                ${isFirst
                  ? 'bg-blue-500 border-blue-400 shadow-lg shadow-blue-500/30'
                  : `${cfg.bg} border-slate-600`
                }
              `}>
                {cfg.icon}
              </div>

              {/* Content */}
              <div className={`
                rounded-xl p-3 border transition-all
                ${isFirst ? 'bg-blue-500/10 border-blue-500/30' : 'bg-slate-800/60 border-slate-700'}
              `}>
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    {entry.old_status && (
                      <>
                        <span className="text-slate-400 text-xs font-medium">{entry.old_status}</span>
                        <svg className="w-3 h-3 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </>
                    )}
                    <span className={`text-xs font-semibold ${cfg.color}`}>{entry.new_status}</span>
                  </div>
                  <time className="text-slate-500 text-[11px]">
                    {date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    {' · '}
                    {date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </time>
                </div>
                {entry.note && (
                  <p className="text-slate-400 text-xs mt-1.5 leading-relaxed">{entry.note}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default IssueTimeline;
