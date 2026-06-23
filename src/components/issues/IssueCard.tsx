import React from 'react';
import type { Issue } from '../../types/issue';
import { ISSUE_CATEGORIES } from '../../types/issue';
import { IssuePriorityBadge, IssueSeverityBadge, IssueStatusBadge } from './IssueBadges';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../context/NotificationContext';

interface Props {
  issue: Issue;
  onSave?: (id: number) => void;
  onDelete?: (id: number) => void;
}

export const downloadIssueReceipt = (issue: Issue) => {
  const content = `===========================================================
               CIVICMIND AI COMPLAINT RECEIPT
===========================================================
Complaint ID              : ${issue.complaint_id}
Tracking Number           : ${issue.tracking_number}
Submitted On              : ${new Date(issue.created_at).toLocaleString('en-IN')}
Category                  : ${issue.category}
Title                     : ${issue.title}
Description               : ${issue.description}
-----------------------------------------------------------
LOCATION INFORMATION:
Address                   : ${issue.address || 'Not Specified'}
Ward                      : ${issue.ward || 'Not Specified'}
City                      : ${issue.city}
State                     : ${issue.state}
Postal Code               : ${issue.postal_code || 'Not Specified'}
Coordinates (Lat, Lon)    : ${issue.latitude !== null ? issue.latitude : 'N/A'}, ${issue.longitude !== null ? issue.longitude : 'N/A'}
Landmark                  : ${issue.nearby_landmark || 'Not Specified'}
-----------------------------------------------------------
TICKET METRICS & STATUS:
Current Status            : ${issue.status}
Zoning Priority           : ${issue.priority}
Impact Severity           : ${issue.severity}
Assigned Department       : ${issue.assigned_department || 'General Administration Department'}
Est. Resolution Duration  : ${issue.estimated_response_hours ? `${issue.estimated_response_hours} hours` : 'Pending Assessment'}
-----------------------------------------------------------
Report Privacy            : ${issue.is_anonymous ? 'Anonymous Submission' : 'Registered Citizen'}
Consent Checkbox          : True (Authorized for departmental routing)

Thank you for reporting this issue. Citizens like you make the community better!
CivicMind AI Platform — Connecting Citizens, Empowering Cities.
===========================================================`;

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `Receipt-${issue.complaint_id}.txt`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const IssueCard: React.FC<Props> = ({ issue, onSave, onDelete }) => {
  const navigate = useNavigate();
  const { showNotification } = useNotifications();
  const cat = ISSUE_CATEGORIES.find(c => c.id === issue.category);

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return 'just now';
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/track/${issue.complaint_id}`;
    navigator.clipboard.writeText(shareUrl)
      .then(() => {
        showNotification('Tracking URL copied to clipboard!', 'success');
      })
      .catch(() => {
        showNotification('Failed to copy link.', 'error');
      });
  };

  const handleDownloadReceipt = (e: React.MouseEvent) => {
    e.stopPropagation();
    downloadIssueReceipt(issue);
    showNotification('Complaint receipt downloaded successfully.', 'success');
  };

  return (
    <div
      className="group relative bg-slate-800/60 border border-slate-700 rounded-2xl p-5 hover:border-slate-600 hover:bg-slate-800/80 transition-all duration-200 cursor-pointer hover:shadow-xl hover:shadow-slate-900/50"
      onClick={() => navigate(`/dashboard/citizen/reports/${issue.id}`)}
      role="article"
      aria-label={`Issue: ${issue.title}`}
    >
      {/* Category accent bar */}
      <div className={`absolute top-0 left-0 w-1 h-full rounded-l-2xl ${cat?.color.replace('/20', '') ?? 'bg-slate-600'}`} />

      <div className="pl-2">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xl leading-none flex-shrink-0">{cat?.icon ?? '📋'}</span>
            <div className="min-w-0">
              <h3 className="text-white font-semibold text-sm truncate group-hover:text-blue-300 transition-colors">
                {issue.title}
              </h3>
              <p className="text-slate-500 text-xs mt-0.5 truncate">
                {issue.complaint_id} · {issue.category}
              </p>
            </div>
          </div>
          
          {/* Action Button Set */}
          <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              id={`btn-share-${issue.id}`}
              onClick={handleShare}
              aria-label="Share tracking link"
              className="p-1.5 rounded-lg hover:bg-slate-750 text-slate-400 hover:text-white transition-colors"
              title="Copy share link"
            >
              <span className="text-xs">🔗</span>
            </button>
            <button
              id={`btn-receipt-${issue.id}`}
              onClick={handleDownloadReceipt}
              aria-label="Download receipt"
              className="p-1.5 rounded-lg hover:bg-slate-750 text-slate-400 hover:text-white transition-colors"
              title="Download receipt"
            >
              <span className="text-xs">📥</span>
            </button>
            {onSave && (
              <button
                id={`btn-save-${issue.id}`}
                onClick={e => { e.stopPropagation(); onSave(issue.id); }}
                aria-label={issue.is_saved ? 'Unsave issue' : 'Save issue'}
                className="p-1.5 rounded-lg hover:bg-slate-750 transition-colors"
                title={issue.is_saved ? 'Remove from saved' : 'Save'}
              >
                <span className={issue.is_saved ? 'text-yellow-400' : 'text-slate-400'}>{issue.is_saved ? '🔖' : '🏷️'}</span>
              </button>
            )}
            {onDelete && issue.status === 'Submitted' && (
              <button
                id={`btn-delete-${issue.id}`}
                onClick={e => { e.stopPropagation(); onDelete(issue.id); }}
                aria-label="Withdraw issue"
                className="p-1.5 rounded-lg hover:bg-red-500/20 transition-colors"
                title="Withdraw report"
              >
                <span className="text-red-400 text-sm">🗑️</span>
              </button>
            )}
          </div>
        </div>

        {/* Description */}
        <p className="text-slate-400 text-xs leading-relaxed line-clamp-2 mb-3">
          {issue.description}
        </p>

        {/* Progress bar */}
        <div className="mb-3">
          <div className="flex justify-between text-[10px] text-slate-500 mb-1">
            <span>Progress</span>
            <span>{issue.progress}%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                issue.status === 'Rejected' ? 'bg-red-500' :
                issue.status === 'Resolved' || issue.status === 'Closed' ? 'bg-green-500' :
                'bg-gradient-to-r from-blue-500 to-cyan-500'
              }`}
              style={{ width: `${issue.progress}%` }}
            />
          </div>
        </div>

        {/* Badges row */}
        <div className="flex items-center gap-1.5 flex-wrap mb-3">
          <IssueStatusBadge status={issue.status} size="sm" />
          <IssuePriorityBadge priority={issue.priority} size="sm" />
          <IssueSeverityBadge severity={issue.severity} size="sm" />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-3">
            {issue.ward && <span>📍 {issue.ward}</span>}
            {issue.assigned_department && (
              <span className="truncate max-w-[120px]">🏢 {issue.assigned_department}</span>
            )}
          </div>
          <span>{timeAgo(issue.created_at)}</span>
        </div>
      </div>
    </div>
  );
};

export default IssueCard;
