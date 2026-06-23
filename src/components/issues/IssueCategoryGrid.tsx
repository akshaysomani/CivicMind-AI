import React from 'react';
import type { IssueCategory } from '../../types/issue';
import { ISSUE_CATEGORIES } from '../../types/issue';

interface Props {
  selected: string;
  onSelect: (id: string) => void;
}

const IssueCategoryGrid: React.FC<Props> = ({ selected, onSelect }) => {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
      {ISSUE_CATEGORIES.map((cat: IssueCategory) => {
        const isSelected = selected === cat.id;
        return (
          <button
            key={cat.id}
            id={`category-${cat.id.replace(/\s+/g, '-').toLowerCase()}`}
            onClick={() => onSelect(cat.id)}
            aria-pressed={isSelected}
            className={`
              relative flex flex-col items-center gap-2 p-3 rounded-xl border transition-all duration-200
              hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer
              ${isSelected
                ? `${cat.color} ${cat.borderColor} ring-2 ring-blue-500 shadow-lg shadow-blue-500/20`
                : 'bg-slate-800/60 border-slate-700 hover:border-slate-500'
              }
            `}
          >
            {isSelected && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </span>
            )}
            <span className="text-2xl leading-none" role="img" aria-label={cat.label}>{cat.icon}</span>
            <span className={`text-[11px] font-medium text-center leading-tight ${isSelected ? cat.textColor : 'text-slate-300'}`}>
              {cat.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default IssueCategoryGrid;
