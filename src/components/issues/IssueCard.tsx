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
  const receiptWindow = window.open('', '_blank', 'width=800,height=900');
  if (!receiptWindow) {
    alert('Please allow popups to download the receipt.');
    return;
  }

  const receiptHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>CivicMind AI - Complaint Receipt ${issue.complaint_id}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #f8fafc; color: #1e293b; padding: 0; }
    .page { max-width: 800px; margin: 0 auto; background: #fff; min-height: 100vh; }
    .header { background: linear-gradient(135deg, #2563eb 0%, #06b6d4 100%); color: white; padding: 32px 40px; }
    .header-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
    .brand { display: flex; align-items: center; gap: 12px; }
    .brand-icon { width: 48px; height: 48px; background: rgba(255,255,255,0.2); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 24px; }
    .brand-name { font-size: 22px; font-weight: 800; letter-spacing: -0.5px; }
    .brand-sub { font-size: 11px; opacity: 0.8; margin-top: 2px; font-weight: 500; }
    .receipt-badge { background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.3); border-radius: 8px; padding: 8px 16px; font-size: 11px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; }
    .complaint-id { font-size: 28px; font-weight: 800; letter-spacing: -0.5px; }
    .tracking { font-size: 13px; opacity: 0.85; margin-top: 4px; }
    .body { padding: 32px 40px; }
    .status-bar { display: flex; gap: 12px; margin-bottom: 28px; flex-wrap: wrap; }
    .badge { display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: 700; }
    .badge-blue { background: #dbeafe; color: #1d4ed8; }
    .badge-amber { background: #fef3c7; color: #d97706; }
    .badge-rose { background: #fee2e2; color: #dc2626; }
    .badge-green { background: #dcfce7; color: #16a34a; }
    .badge-purple { background: #f3e8ff; color: #7c3aed; }
    .section { margin-bottom: 24px; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; }
    .section-title { background: #f1f5f9; padding: 12px 20px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #64748b; border-bottom: 1px solid #e2e8f0; }
    .section-body { padding: 16px 20px; }
    .field-row { display: flex; justify-content: space-between; align-items: flex-start; padding: 8px 0; border-bottom: 1px solid #f1f5f9; }
    .field-row:last-child { border-bottom: none; }
    .field-label { font-size: 12px; color: #94a3b8; font-weight: 600; min-width: 160px; }
    .field-value { font-size: 13px; color: #1e293b; font-weight: 600; text-align: right; max-width: 380px; }
    .description-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px 16px; font-size: 13px; color: #334155; line-height: 1.6; margin-top: 4px; }
    .divider { border: none; border-top: 2px dashed #e2e8f0; margin: 24px 0; }
    .footer-note { background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 12px; padding: 16px 20px; display: flex; gap: 12px; align-items: flex-start; }
    .footer-note-icon { font-size: 20px; }
    .footer-note-text { font-size: 12px; color: #0c4a6e; line-height: 1.5; }
    .footer-note-title { font-weight: 700; font-size: 13px; margin-bottom: 4px; }
    .page-footer { background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 40px; text-align: center; }
    .page-footer-text { font-size: 11px; color: #94a3b8; line-height: 1.6; }
    .priority-critical { color: #dc2626; font-weight: 700; }
    .priority-high { color: #ea580c; font-weight: 700; }
    .priority-medium { color: #d97706; font-weight: 700; }
    .priority-low { color: #16a34a; font-weight: 700; }
    @media print {
      body { background: white; }
      .page { max-width: 100%; }
      .print-btn { display: none; }
    }
  </style>
</head>
<body>
<div class="page">
  <div class="header">
    <div class="header-top">
      <div class="brand">
        <div class="brand-icon">🏛️</div>
        <div>
          <div class="brand-name">CivicMind AI</div>
          <div class="brand-sub">Enterprise Civic Intelligence Platform</div>
        </div>
      </div>
      <div class="receipt-badge">Official Receipt</div>
    </div>
    <div class="complaint-id">${issue.complaint_id}</div>
    <div class="tracking">Tracking Number: ${issue.tracking_number} &nbsp;|&nbsp; Submitted: ${new Date(issue.created_at).toLocaleString('en-IN')}</div>
  </div>

  <div class="body">
    <div class="status-bar">
      <span class="badge badge-blue">📋 ${issue.category}</span>
      <span class="badge ${issue.status === 'Resolved' ? 'badge-green' : issue.status === 'In Progress' ? 'badge-blue' : 'badge-amber'}">⚡ ${issue.status}</span>
      <span class="badge ${issue.priority === 'Critical' ? 'badge-rose' : issue.priority === 'High' ? 'badge-amber' : 'badge-blue'}">🎯 ${issue.priority} Priority</span>
      <span class="badge badge-purple">⚠️ ${issue.severity || 'Moderate'} Severity</span>
    </div>

    <div class="section">
      <div class="section-title">📄 Issue Details</div>
      <div class="section-body">
        <div class="field-row">
          <span class="field-label">Title</span>
          <span class="field-value">${issue.title}</span>
        </div>
        <div class="field-row">
          <span class="field-label">Description</span>
          <span class="field-value"></span>
        </div>
        <div class="description-box">${issue.description || 'No description provided.'}</div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">📍 Location Information</div>
      <div class="section-body">
        <div class="field-row">
          <span class="field-label">Address</span>
          <span class="field-value">${issue.address || 'Not Specified'}</span>
        </div>
        <div class="field-row">
          <span class="field-label">Ward</span>
          <span class="field-value">${issue.ward || 'Not Specified'}</span>
        </div>
        <div class="field-row">
          <span class="field-label">City</span>
          <span class="field-value">${issue.city}</span>
        </div>
        <div class="field-row">
          <span class="field-label">State</span>
          <span class="field-value">${issue.state}</span>
        </div>
        <div class="field-row">
          <span class="field-label">Postal Code</span>
          <span class="field-value">${issue.postal_code || 'Not Specified'}</span>
        </div>
        <div class="field-row">
          <span class="field-label">Coordinates</span>
          <span class="field-value">${issue.latitude !== null ? `${issue.latitude}°N, ${issue.longitude}°E` : 'Not captured'}</span>
        </div>
        <div class="field-row">
          <span class="field-label">Landmark</span>
          <span class="field-value">${issue.nearby_landmark || 'None'}</span>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">🎫 Ticket Status & Metrics</div>
      <div class="section-body">
        <div class="field-row">
          <span class="field-label">Current Status</span>
          <span class="field-value">${issue.status}</span>
        </div>
        <div class="field-row">
          <span class="field-label">Zoning Priority</span>
          <span class="field-value priority-${(issue.priority || '').toLowerCase()}">${issue.priority}</span>
        </div>
        <div class="field-row">
          <span class="field-label">Impact Severity</span>
          <span class="field-value">${issue.severity || 'Moderate'}</span>
        </div>
        <div class="field-row">
          <span class="field-label">Assigned Department</span>
          <span class="field-value">${issue.assigned_department || 'General Administration'}</span>
        </div>
        <div class="field-row">
          <span class="field-label">Est. Resolution</span>
          <span class="field-value">${issue.estimated_response_hours ? `${issue.estimated_response_hours} hours` : 'Pending Assessment'}</span>
        </div>
        <div class="field-row">
          <span class="field-label">Submission Type</span>
          <span class="field-value">${issue.is_anonymous ? '🔒 Anonymous Submission' : '👤 Registered Citizen'}</span>
        </div>
      </div>
    </div>

    <hr class="divider" />

    <div class="footer-note">
      <div class="footer-note-icon">ℹ️</div>
      <div class="footer-note-text">
        <div class="footer-note-title">Thank you for making your community better!</div>
        This is your official CivicMind AI complaint receipt. Keep it for your records. You can track the status of this complaint at any time using Complaint ID <strong>${issue.complaint_id}</strong> or Tracking Number <strong>${issue.tracking_number}</strong>. For support, contact support@civicmind.ai
      </div>
    </div>
  </div>

  <div class="page-footer">
    <div class="page-footer-text">
      CivicMind AI Platform — Connecting Citizens, Empowering Cities<br />
      &copy; ${new Date().getFullYear()} CivicMind AI. All rights reserved. &nbsp;|&nbsp; support@civicmind.ai
    </div>
    <button class="print-btn" onclick="window.print()" style="margin-top:12px;padding:10px 24px;background:#2563eb;color:white;border:none;border-radius:8px;font-weight:700;cursor:pointer;font-size:13px;">🖨️ Print / Save as PDF</button>
  </div>
</div>
<script>window.onload = function() { document.querySelector('.print-btn').scrollIntoView(); }<\/script>
</body>
</html>`;

  receiptWindow.document.write(receiptHtml);
  receiptWindow.document.close();
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
