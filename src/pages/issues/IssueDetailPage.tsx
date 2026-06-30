import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const getBackendHost = () => {
  const base = localStorage.getItem('VITE_API_BASE_URL') || 'http://localhost:8000/api/v1';
  try {
    const url = new URL(base);
    return `${url.protocol}//${url.host}`;
  } catch {
    return 'http://localhost:8000';
  }
};

import { useIssues } from '../../context/IssueContext';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { ISSUE_CATEGORIES } from '../../types/issue';
import IssueStatusStepper from '../../components/issues/IssueStatusStepper';
import IssueTimeline from '../../components/issues/IssueTimeline';
import { IssuePriorityBadge, IssueSeverityBadge, IssueStatusBadge } from '../../components/issues/IssueBadges';
import type { IssueDetail } from '../../types/issue';
import { downloadIssueReceipt } from '../../components/issues/IssueCard';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default Leaflet icon paths in Vite builds
const customMarkerIcon = L.divIcon({
  html: `
    <div class="relative flex items-center justify-center">
      <div class="absolute w-8 h-8 bg-blue-500/30 rounded-full animate-ping"></div>
      <div class="relative w-6 h-6 bg-blue-600 rounded-full border-2 border-white shadow-xl flex items-center justify-center">
        <span class="text-xs">📍</span>
      </div>
    </div>
  `,
  className: 'custom-map-marker-div',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const IssueDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { fetchIssue, deleteIssue, toggleSaveIssue } = useIssues();
  const { currentUser } = useAuth();
  const { showNotification } = useNotifications();

  const [issue, setIssue] = useState<IssueDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'timeline' | 'attachments'>('overview');

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      setIsLoading(true);
      const data = await fetchIssue(Number(id));
      setIssue(data);
      setIsLoading(false);
    };
    load();
  }, [id, fetchIssue]);

  const handleDelete = async () => {
    if (!issue) return;
    if (!window.confirm('Are you sure you want to withdraw this report?')) return;
    const ok = await deleteIssue(issue.id);
    if (ok) navigate('/dashboard/citizen/reports');
  };

  const handleShare = () => {
    if (!issue) return;
    const shareUrl = `${window.location.origin}/track/${issue.complaint_id}`;
    navigator.clipboard.writeText(shareUrl)
      .then(() => {
        showNotification('Complaint tracking URL copied to clipboard!', 'success');
      })
      .catch(() => {
        showNotification('Failed to copy tracking link.', 'error');
      });
  };

  const handleDownloadReceipt = () => {
    if (!issue) return;
    downloadIssueReceipt(issue);
    showNotification('Official receipt downloaded!', 'success');
  };

  const cat = ISSUE_CATEGORIES.find(c => c.id === issue?.category);

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="space-y-4 animate-pulse">
          <div className="h-8 bg-slate-800 rounded-xl w-1/2" />
          <div className="h-48 bg-slate-800 rounded-2xl" />
          <div className="h-32 bg-slate-800 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!issue) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <span className="text-5xl mb-4 block">🔍</span>
        <h2 className="text-xl font-bold text-white mb-2">Issue Not Found</h2>
        <p className="text-slate-400 mb-6">The report you're looking for doesn't exist or has been withdrawn.</p>
        <button
          id="btn-back-to-reports"
          onClick={() => navigate('/dashboard/citizen/reports')}
          className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium transition-all"
        >
          ← Back to My Reports
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      {/* Back navigation & action header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <button
          id="btn-detail-back"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm"
        >
          ← Back
        </button>
        <div className="flex items-center gap-2">
          <button
            id="btn-detail-share"
            onClick={handleShare}
            className="px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 hover:border-slate-500 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-all"
            title="Share complaint tracking link"
          >
            <span>🔗</span> Share
          </button>
          <button
            id="btn-detail-receipt"
            onClick={handleDownloadReceipt}
            className="px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 hover:border-slate-500 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-all"
            title="Download official receipt"
          >
            <span>📥</span> Receipt
          </button>
          <button
            id="btn-detail-save"
            onClick={() => toggleSaveIssue(issue.id)}
            className="p-2 rounded-lg bg-slate-800 border border-slate-700 hover:border-yellow-500 transition-all"
            aria-label={issue.is_saved ? 'Unsave' : 'Save'}
          >
            <span className={issue.is_saved ? 'text-yellow-400' : 'text-slate-400'}>
              {issue.is_saved ? '🔖' : '🏷️'}
            </span>
          </button>
          {issue.status === 'Submitted' && currentUser?.id === issue.citizen_id && (
            <button
              id="btn-detail-delete"
              onClick={handleDelete}
              className="px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm hover:bg-red-500/20 transition-all font-semibold"
            >
              Withdraw
            </button>
          )}
        </div>
      </div>

      {/* Hero Card */}
      <div className={`rounded-2xl border p-6 ${cat?.color ?? 'bg-slate-800/60'} ${cat?.borderColor ?? 'border-slate-700'}`}>
        <div className="flex items-start gap-4">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl bg-slate-900/60 flex-shrink-0`}>
            {cat?.icon ?? '📋'}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-bold text-white mb-1 leading-tight">{issue.title}</h1>
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <IssueStatusBadge status={issue.status} />
              <IssuePriorityBadge priority={issue.priority} />
              <IssueSeverityBadge severity={issue.severity} />
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-slate-400 mt-2">
              <span>🎫 <strong className="text-slate-300">{issue.complaint_id}</strong></span>
              <span>🔍 {issue.tracking_number}</span>
              <span>📁 {issue.category}</span>
              <span>🏢 {issue.assigned_department ?? '—'}</span>
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="mt-5">
          <div className="flex justify-between text-xs text-slate-400 mb-1.5">
            <span>Resolution Progress</span>
            <span>{issue.progress}%</span>
          </div>
          <div className="w-full h-2 bg-slate-900/60 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                issue.status === 'Rejected' ? 'bg-red-500' :
                issue.status === 'Resolved' || issue.status === 'Closed' ? 'bg-green-500' :
                'bg-gradient-to-r from-blue-500 to-cyan-500'
              }`}
              style={{ width: `${issue.progress}%` }}
            />
          </div>
        </div>

        {/* Status Stepper */}
        <div className="mt-5 pt-5 border-t border-slate-700/50">
          <IssueStatusStepper currentStatus={issue.status} />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-800/60 p-1 rounded-xl border border-slate-700">
        {(['overview', 'timeline', 'attachments'] as const).map(tab => (
          <button
            key={tab}
            id={`tab-${tab}`}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
              activeTab === tab
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {tab === 'overview' ? '📋 Overview' : tab === 'timeline' ? '⏱️ Timeline' : `📎 Files (${issue.attachments.length})`}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-4 animate-fadeIn">
          {/* Description */}
          <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-5">
            <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-3">Description</h3>
            <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{issue.description}</p>
          </div>

          {/* Map Preview & Location Details */}
          <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-5">
            <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-3">📍 Location Information</h3>
            
            {issue.latitude && issue.longitude && (
              <div className="w-full h-48 rounded-xl border border-slate-700 overflow-hidden relative mb-4 z-0 bg-slate-900">
                <MapContainer
                  center={[issue.latitude, issue.longitude]}
                  zoom={15}
                  scrollWheelZoom={false}
                  className="w-full h-full"
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <Marker
                    position={[issue.latitude, issue.longitude]}
                    icon={customMarkerIcon}
                  />
                </MapContainer>
              </div>
            )}

            <div className="space-y-2 text-sm">
              {issue.address && <p className="text-white font-semibold">{issue.address}</p>}
              <p className="text-slate-300">
                {[issue.ward, issue.city, issue.state, issue.postal_code].filter(Boolean).join(' · ')}
              </p>
              {issue.nearby_landmark && (
                <p className="text-slate-400 text-xs bg-slate-900/40 p-2 rounded-lg border border-slate-750 inline-block">
                  🏛️ Landmark: {issue.nearby_landmark}
                </p>
              )}
              {issue.latitude && (
                <p className="text-slate-500 text-[10px] font-mono mt-2">GPS Location: {issue.latitude}, {issue.longitude}</p>
              )}
            </div>
          </div>

          {/* Meta Info */}
          <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-5">
            <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-3">Report Details</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-500 text-xs">Submitted Date</p>
                <p className="text-slate-300">{new Date(issue.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
              </div>
              <div>
                <p className="text-slate-500 text-xs">Last Actioned</p>
                <p className="text-slate-300">{new Date(issue.updated_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
              </div>
              <div>
                <p className="text-slate-500 text-xs">Target Department</p>
                <p className="text-blue-300 font-semibold">{issue.assigned_department || 'General Administration Department'}</p>
              </div>
              <div>
                <p className="text-slate-500 text-xs">Est. Response Period</p>
                <p className="text-amber-400 font-medium">
                  {issue.estimated_response_hours
                    ? issue.estimated_response_hours < 24
                      ? `${issue.estimated_response_hours}h`
                      : `${Math.round(issue.estimated_response_hours / 24)} days`
                    : '2–5 days'}
                </p>
              </div>
              {issue.resolved_at && (
                <div className="col-span-2 pt-2 border-t border-slate-700/50">
                  <p className="text-slate-500 text-xs">Resolved Timestamp</p>
                  <p className="text-green-400 font-semibold">{new Date(issue.resolved_at).toLocaleString('en-IN')}</p>
                </div>
              )}
              {issue.resolution_note && (
                <div className="col-span-2 pt-2 border-t border-slate-700/50 bg-green-500/5 p-3 rounded-xl border border-green-500/20">
                  <p className="text-green-400 text-xs font-semibold">Resolution Official Note</p>
                  <p className="text-slate-300 text-xs leading-relaxed mt-1">{issue.resolution_note}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'timeline' && (
        <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-5 animate-fadeIn">
          <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-4">Official Status Timeline</h3>
          <IssueTimeline history={issue.status_history} />
        </div>
      )}

      {activeTab === 'attachments' && (
        <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-5 animate-fadeIn">
          <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-4">
            Evidence Files ({issue.attachments.length})
          </h3>
          {issue.attachments.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <span className="text-4xl mb-3 block">📂</span>
              <p className="text-sm">No evidence attachments uploaded with this report.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {issue.attachments.map(att => (
                <a
                  key={att.id}
                  href={`${getBackendHost()}${att.file_path}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded-xl overflow-hidden border border-slate-700 bg-slate-900/60 hover:border-blue-500 transition-all group"
                >
                  {att.file_type === 'image' ? (
                    <img
                      src={`${getBackendHost()}${att.file_path}`}
                      alt={att.original_name}
                      className="w-full h-24 object-cover group-hover:opacity-90 transition-opacity"
                    />
                  ) : (
                    <div className="w-full h-24 flex flex-col items-center justify-center gap-1 bg-slate-850">
                      <span className="text-3xl">{att.file_type === 'video' ? '🎥' : '📄'}</span>
                      <span className="text-slate-500 text-[10px] uppercase font-bold">{att.file_type}</span>
                    </div>
                  )}
                  <div className="p-2 bg-slate-900/80">
                    <p className="text-slate-300 text-xs truncate font-medium" title={att.original_name}>{att.original_name}</p>
                    <p className="text-slate-500 text-[10px]">{(att.file_size / 1024).toFixed(0)} KB</p>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default IssueDetailPage;
