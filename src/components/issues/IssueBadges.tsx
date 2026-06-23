import React from 'react';
import type { Priority, Severity, IssueStatus } from '../../types/issue';
import { PRIORITY_CONFIG, SEVERITY_CONFIG, STATUS_CONFIG } from '../../types/issue';

// ── Priority Badge ────────────────────────────────────────────────────────────
interface PriorityBadgeProps {
  priority: Priority | string;
  size?: 'sm' | 'md';
}
export const IssuePriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, size = 'md' }) => {
  const cfg = PRIORITY_CONFIG[priority as Priority] || { label: priority, color: 'text-slate-400', bg: 'bg-slate-500/20' };
  const px = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';
  return (
    <span className={`inline-flex items-center gap-1 rounded-full font-semibold ${px} ${cfg.color} ${cfg.bg}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      {cfg.label}
    </span>
  );
};

// ── Severity Badge ────────────────────────────────────────────────────────────
interface SeverityBadgeProps {
  severity: Severity | string;
  size?: 'sm' | 'md';
}
export const IssueSeverityBadge: React.FC<SeverityBadgeProps> = ({ severity, size = 'md' }) => {
  const cfg = SEVERITY_CONFIG[severity as Severity] || { label: severity, color: 'text-slate-400', bg: 'bg-slate-500/20' };
  const px = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';
  return (
    <span className={`inline-flex items-center gap-1 rounded-full font-semibold ${px} ${cfg.color} ${cfg.bg}`}>
      ⚡ {cfg.label}
    </span>
  );
};

// ── Status Badge ──────────────────────────────────────────────────────────────
interface StatusBadgeProps {
  status: IssueStatus | string;
  size?: 'sm' | 'md';
}
export const IssueStatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const cfg = STATUS_CONFIG[status as IssueStatus] || { label: status, color: 'text-slate-400', bg: 'bg-slate-500/20', icon: '•' };
  const px = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-semibold ${px} ${cfg.color} ${cfg.bg}`}>
      <span>{cfg.icon}</span>
      {cfg.label}
    </span>
  );
};
