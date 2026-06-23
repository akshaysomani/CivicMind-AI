import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useIssues } from '../../context/IssueContext';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import type { IssueFormDraft, Priority, Severity } from '../../types/issue';
import { DEFAULT_DRAFT, ISSUE_CATEGORIES } from '../../types/issue';
import IssueCategoryGrid from '../../components/issues/IssueCategoryGrid';
import LocationPicker from '../../components/issues/LocationPicker';
import MediaUploader from '../../components/issues/MediaUploader';
import { IssuePriorityBadge, IssueSeverityBadge } from '../../components/issues/IssueBadges';
import type { Issue } from '../../types/issue';
import { downloadIssueReceipt } from '../../components/issues/IssueCard';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { motion, AnimatePresence } from 'framer-motion';

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

// ── Step labels ──────────────────────────────────────────────────────────────
const STEPS = [
  { label: 'Category',  icon: '🏷️' },
  { label: 'Details',   icon: '📝' },
  { label: 'Location',  icon: '📍' },
  { label: 'Evidence',  icon: '📸' },
  { label: 'Review',    icon: '👁️' },
  { label: 'Submit',    icon: '🚀' },
];

// ── Validation ───────────────────────────────────────────────────────────────
function validateStep(step: number, draft: IssueFormDraft): string[] {
  switch (step) {
    case 0: return draft.category ? [] : ['Please select a category.'];
    case 1: {
      const e: string[] = [];
      if (!draft.title.trim() || draft.title.length < 10) e.push('Title must be at least 10 characters.');
      if (!draft.description.trim() || draft.description.length < 30) e.push('Description must be at least 30 characters.');
      return e;
    }
    case 2: {
      const e: string[] = [];
      if (!draft.address.trim()) e.push('Street address is required.');
      if (!draft.city.trim()) e.push('City is required.');
      if (!draft.state.trim()) e.push('State is required.');
      if (draft.postal_code && !/^\d{6}$/.test(draft.postal_code.trim())) {
        e.push('Postal Code must be a valid 6-digit number (e.g. 400001).');
      }
      if (draft.latitude === null || draft.longitude === null) {
        e.push('Please pinpoint coordinates on the map or request device GPS detection.');
      }
      return e;
    }
    case 4: return draft.consent_given ? [] : ['You must agree to the data consent policy before submitting.'];
    default: return [];
  }
}

const ReportIssuePage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { showNotification } = useNotifications();
  const { createIssue, uploadAttachments, isSubmitting, draft, saveDraft } = useIssues();

  const [step, setStep] = useState(0);
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [submittedIssue, setSubmittedIssue] = useState<Issue | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [formData, setFormData] = useState<IssueFormDraft>(() => ({
    ...DEFAULT_DRAFT,
    city: currentUser?.city ?? '',
    state: currentUser?.state ?? '',
    country: currentUser?.country ?? 'India',
    ...(draft ? { ...draft, files: [] } : {}),
  }));

  // Autosave draft dynamically
  useEffect(() => {
    saveDraft(formData);
  }, [formData, saveDraft]);

  const update = useCallback((partial: Partial<IssueFormDraft>) => {
    setFormData(prev => ({ ...prev, ...partial }));
    setFormErrors([]);
  }, []);

  const goNext = useCallback(() => {
    const errors = validateStep(step, formData);
    if (errors.length) { setFormErrors(errors); return; }
    setFormErrors([]);
    setStep(s => Math.min(s + 1, STEPS.length - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step, formData]);

  const goBack = useCallback(() => {
    setFormErrors([]);
    setStep(s => Math.max(s - 1, 0));
  }, []);

  const handleSubmit = useCallback(async () => {
    const errors = validateStep(4, formData);
    if (errors.length) { setFormErrors(errors); return; }

    const { files, ...payload } = formData;
    const issue = await createIssue(payload);
    if (!issue) return;

    // Upload attachments asynchronously if files are added
    if (files.length > 0) {
      setUploadProgress(10);
      const interval = setInterval(() => {
        setUploadProgress(p => Math.min(p + 15, 95));
      }, 250);
      await uploadAttachments(issue.id, files);
      clearInterval(interval);
      setUploadProgress(100);
    }

    setSubmittedIssue(issue);
    setStep(5); // Success step
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [formData, createIssue, uploadAttachments]);

  const cat = ISSUE_CATEGORIES.find(c => c.id === formData.category);

  // ── Success Step (Step 6) ───────────────────────────────────────────────────
  if (step === 5 && submittedIssue) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Success Animation Container */}
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <span className="text-4xl">✅</span>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Report Submitted!</h1>
            <p className="text-slate-400 text-sm">Your civic complaint is officially registered with the authorities.</p>
          </div>

          {/* Receipt Card Component */}
          <div className="bg-slate-800/80 border border-green-500/30 rounded-2xl p-6 mb-6 shadow-xl">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-700">
              <span className="text-green-400 text-lg">📋</span>
              <span className="text-green-400 font-semibold text-sm">Official Complaint Receipt</span>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Complaint ID</span>
                <span className="text-white font-mono font-bold text-blue-400">{submittedIssue.complaint_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Tracking No.</span>
                <span className="text-white font-mono">{submittedIssue.tracking_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Category</span>
                <span className="text-white">{cat?.icon} {submittedIssue.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Department</span>
                <span className="text-white text-right max-w-[180px]">{submittedIssue.assigned_department}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Expected Response</span>
                <span className="text-amber-400 font-semibold">
                  {submittedIssue.estimated_response_hours
                    ? submittedIssue.estimated_response_hours < 24
                      ? `${submittedIssue.estimated_response_hours} hours`
                      : `${Math.round(submittedIssue.estimated_response_hours / 24)} days`
                    : '2–5 days'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Submitted</span>
                <span className="text-white">
                  {new Date(submittedIssue.created_at).toLocaleString('en-IN', {
                    day: 'numeric', month: 'short', year: 'numeric',
                    hour: '2-digit', minute: '2-digit'
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            <button
              id="btn-success-receipt"
              onClick={() => {
                downloadIssueReceipt(submittedIssue);
                showNotification('Complaint receipt downloaded!', 'success');
              }}
              className="flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-750 text-white font-bold transition-all text-xs"
            >
              📥 Download Receipt
            </button>
            <button
              id="btn-success-share"
              onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}/track/${submittedIssue.complaint_id}`);
                showNotification('Tracking link copied!', 'success');
              }}
              className="flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-750 text-white font-bold transition-all text-xs"
            >
              🔗 Share Report
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              id="btn-view-my-reports"
              onClick={() => navigate('/dashboard/citizen/reports')}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all text-xs"
            >
              📂 View My Reports
            </button>
            <button
              id="btn-report-another"
              onClick={() => {
                setSubmittedIssue(null);
                setStep(0);
                setFormData({
                  ...DEFAULT_DRAFT,
                  city: currentUser?.city ?? '',
                  state: currentUser?.state ?? '',
                  country: currentUser?.country ?? 'India'
                });
              }}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-semibold transition-all text-xs"
            >
              ➕ Report Another
            </button>
            <button
              id="btn-go-dashboard"
              onClick={() => navigate('/dashboard/citizen')}
              className="col-span-2 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-900 border border-slate-850 hover:border-slate-700 text-slate-400 hover:text-white font-semibold transition-all text-xs"
            >
              🏠 Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Wizard View ─────────────────────────────────────────────────────────────
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Progress Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-2xl font-bold text-white">Report an Issue</h1>
            <p className="text-slate-400 text-sm mt-0.5">
              Step {step + 1} of {STEPS.length - 1} — <span className="text-blue-400">{STEPS[step].icon} {STEPS[step].label}</span>
            </p>
          </div>
          {/* Draft indicator */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-800 px-3 py-1.5 rounded-full">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            Draft saved
          </div>
        </div>

        {/* Step Progress Bar */}
        <div className="flex items-center gap-1">
          {STEPS.slice(0, -1).map((s, idx) => (
            <React.Fragment key={s.label}>
              <button
                type="button"
                onClick={() => idx < step && setStep(idx)}
                className={`
                  flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold transition-all flex-shrink-0
                  ${idx < step ? 'bg-green-500 text-white cursor-pointer hover:bg-green-400' :
                    idx === step ? 'bg-blue-500 text-white ring-4 ring-blue-500/20' :
                    'bg-slate-800 text-slate-500 cursor-default border border-slate-700'}
                `}
                aria-label={`${s.label} step`}
              >
                {idx < step ? '✓' : s.icon}
              </button>
              {idx < STEPS.length - 2 && (
                <div className={`flex-1 h-0.5 rounded-full transition-all duration-500 ${idx < step ? 'bg-green-500' : 'bg-slate-700'}`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Error messages */}
      {formErrors.length > 0 && (
        <div className="mb-5 p-4 rounded-xl bg-red-500/10 border border-red-500/30">
          {formErrors.map((e, i) => (
            <p key={i} className="text-red-400 text-sm flex items-center gap-2">
              <span>⚠️</span> {e}
            </p>
          ))}
        </div>
      )}

      {/* AnimatePresence for smooth transitions between Wizard steps */}
      <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6 mb-6 backdrop-blur-sm shadow-xl overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {/* ── Step 0: Category ────────────────────────────────────────── */}
            {step === 0 && (
              <div>
                <h2 className="text-lg font-semibold text-white mb-1">Choose a Category</h2>
                <p className="text-slate-400 text-sm mb-5">Select the type of issue you want to report.</p>
                <IssueCategoryGrid selected={formData.category} onSelect={id => update({ category: id })} />
                {formData.category && (
                  <div className="mt-4 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-sm text-blue-300 flex items-center gap-2">
                    <span>{cat?.icon}</span>
                    <span>
                      <strong>{formData.category}</strong> will be routed to <strong>{cat?.department}</strong>
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* ── Step 1: Details ─────────────────────────────────────────── */}
            {step === 1 && (
              <div className="space-y-5">
                <h2 className="text-lg font-semibold text-white">Issue Details</h2>

                <div>
                  <label htmlFor="issue-title" className="block text-sm font-medium text-slate-400 mb-1.5">
                    Issue Title <span className="text-red-400">*</span>
                  </label>
                  <input
                    id="issue-title"
                    type="text"
                    value={formData.title}
                    onChange={e => update({ title: e.target.value })}
                    maxLength={150}
                    placeholder="Brief, descriptive title (min 10 characters)"
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                  <div className="flex justify-between mt-1">
                    <span className="text-slate-600 text-xs">Min. 10 characters</span>
                    <span className="text-slate-600 text-xs">{formData.title.length}/150</span>
                  </div>
                </div>

                <div>
                  <label htmlFor="issue-description" className="block text-sm font-medium text-slate-400 mb-1.5">
                    Description <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    id="issue-description"
                    value={formData.description}
                    onChange={e => update({ description: e.target.value })}
                    rows={5}
                    maxLength={2000}
                    placeholder="Provide a detailed description of the issue — when it started, how it affects you, any relevant observations (min 30 characters)"
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
                  />
                  <div className="flex justify-between mt-1">
                    <span className="text-slate-600 text-xs">Min. 30 characters</span>
                    <span className="text-slate-600 text-xs">{formData.description.length}/2000</span>
                  </div>
                </div>

                {/* Priority & Severity */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1.5">Priority</label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {(['Low', 'Medium', 'High', 'Critical'] as Priority[]).map(p => (
                        <button
                          key={p}
                          type="button"
                          id={`priority-${p.toLowerCase()}`}
                          onClick={() => update({ priority: p })}
                          className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                            formData.priority === p
                              ? 'bg-blue-600 border-blue-500 text-white'
                              : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500'
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                    <div className="mt-2">
                      <IssuePriorityBadge priority={formData.priority} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1.5">Severity</label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {(['Minor', 'Moderate', 'Major', 'Emergency'] as Severity[]).map(s => (
                        <button
                          key={s}
                          type="button"
                          id={`severity-${s.toLowerCase()}`}
                          onClick={() => update({ severity: s })}
                          className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                            formData.severity === s
                              ? 'bg-blue-600 border-blue-500 text-white'
                              : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500'
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                    <div className="mt-2">
                      <IssueSeverityBadge severity={formData.severity} />
                    </div>
                  </div>
                </div>

                {/* Contact Preferences */}
                <div className="space-y-3 pt-3 border-t border-slate-700">
                  <h3 className="text-sm font-medium text-slate-400">Contact & Privacy</h3>
                  <div>
                    <label className="block text-xs text-slate-500 mb-2">Preferred contact method</label>
                    <div className="flex gap-2">
                      {['email', 'phone', 'none'].map(m => (
                        <button
                          key={m}
                          type="button"
                          id={`contact-${m}`}
                          onClick={() => update({ contact_method: m })}
                          className={`flex-1 py-2 rounded-xl text-xs font-medium border capitalize transition-all ${
                            formData.contact_method === m
                              ? 'bg-blue-600 border-blue-500 text-white'
                              : 'bg-slate-900 border-slate-700 text-slate-400'
                          }`}
                        >
                          {m === 'email' ? '📧 Email' : m === 'phone' ? '📱 Phone' : '🚫 None'}
                        </button>
                      ))}
                    </div>
                  </div>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      id="checkbox-anonymous"
                      type="checkbox"
                      checked={formData.is_anonymous}
                      onChange={e => update({ is_anonymous: e.target.checked })}
                      className="w-4 h-4 rounded bg-slate-700 border-slate-600 text-blue-500 focus:ring-blue-500"
                    />
                    <span className="text-sm text-slate-300">Report anonymously (your identity will not be shared)</span>
                  </label>
                </div>
              </div>
            )}

            {/* ── Step 2: Location ────────────────────────────────────────── */}
            {step === 2 && (
              <div>
                <h2 className="text-lg font-semibold text-white mb-1">Issue Location</h2>
                <p className="text-slate-400 text-sm mb-5">Help authorities locate the issue quickly.</p>
                <LocationPicker
                  value={{
                    address: formData.address,
                    ward: formData.ward,
                    city: formData.city,
                    state: formData.state,
                    postal_code: formData.postal_code,
                    latitude: formData.latitude,
                    longitude: formData.longitude,
                    nearby_landmark: formData.nearby_landmark,
                  }}
                  onChange={partial => update(partial)}
                />
              </div>
            )}

            {/* ── Step 3: Media Upload ─────────────────────────────────────── */}
            {step === 3 && (
              <div>
                <h2 className="text-lg font-semibold text-white mb-1">Upload Evidence</h2>
                <p className="text-slate-400 text-sm mb-5">
                  Attach photos, videos, or documents to strengthen your report. <span className="text-slate-500">(Optional)</span>
                </p>
                <MediaUploader
                  files={formData.files}
                  onChange={files => update({ files })}
                  maxFiles={6}
                  maxSizeMB={10}
                />
              </div>
            )}

            {/* ── Step 4: Review ──────────────────────────────────────────── */}
            {step === 4 && (
              <div className="space-y-5">
                <h2 className="text-lg font-semibold text-white">Review Your Report</h2>

                {/* Category */}
                <div className={`flex items-center gap-3 p-3 rounded-xl ${cat?.color ?? 'bg-slate-700/40'} border ${cat?.borderColor ?? 'border-slate-600'}`}>
                  <span className="text-3xl">{cat?.icon}</span>
                  <div>
                    <p className={`font-semibold text-sm ${cat?.textColor ?? 'text-slate-300'}`}>{formData.category}</p>
                    <p className="text-slate-400 text-xs">{cat?.department}</p>
                  </div>
                </div>

                {/* Core details */}
                <div className="bg-slate-900/50 rounded-xl p-4 space-y-2.5 text-sm">
                  <h3 className="font-semibold text-white">{formData.title}</h3>
                  <p className="text-slate-400 text-xs leading-relaxed">{formData.description}</p>
                  <div className="flex gap-2 pt-1 flex-wrap">
                    <IssuePriorityBadge priority={formData.priority} />
                    <IssueSeverityBadge severity={formData.severity} />
                  </div>
                </div>

                {/* Map Preview of Coordinates */}
                {formData.latitude && formData.longitude && (
                  <div className="space-y-2">
                    <p className="text-slate-400 text-xs uppercase tracking-wider font-semibold">🗺️ Review Coordinate Map</p>
                    <div className="w-full h-44 rounded-xl border border-slate-700 overflow-hidden relative">
                      <MapContainer
                        center={[formData.latitude, formData.longitude]}
                        zoom={15}
                        zoomControl={false}
                        scrollWheelZoom={false}
                        doubleClickZoom={false}
                        dragging={false}
                        className="w-full h-full z-0"
                      >
                        <TileLayer
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <Marker
                          position={[formData.latitude, formData.longitude]}
                          icon={customMarkerIcon}
                        />
                      </MapContainer>
                    </div>
                  </div>
                )}

                {/* Location Text */}
                <div className="bg-slate-900/50 rounded-xl p-4 text-sm space-y-1">
                  <p className="text-slate-400 text-xs uppercase tracking-wider font-medium mb-2">📍 Location</p>
                  {formData.address && <p className="text-white">{formData.address}</p>}
                  <p className="text-slate-300">{[formData.ward, formData.city, formData.state, formData.postal_code].filter(Boolean).join(', ')}</p>
                  {formData.nearby_landmark && <p className="text-slate-400 text-xs">Near: {formData.nearby_landmark}</p>}
                  {formData.latitude && <p className="text-slate-500 text-xs font-mono">GPS: {formData.latitude}, {formData.longitude}</p>}
                </div>

                {/* Files */}
                {formData.files.length > 0 && (
                  <div className="bg-slate-900/50 rounded-xl p-4 text-sm">
                    <p className="text-slate-400 text-xs uppercase tracking-wider font-medium mb-2">📎 Attachments ({formData.files.length})</p>
                    <div className="space-y-1.5">
                      {formData.files.map((f, i) => (
                        <div key={i} className="flex items-center gap-2 text-slate-300 text-xs">
                          <span>{f.type.startsWith('image/') ? '🖼️' : f.type.startsWith('video/') ? '🎥' : '📄'}</span>
                          <span className="truncate">{f.name}</span>
                          <span className="text-slate-500 ml-auto flex-shrink-0">({(f.size / 1024 / 1024).toFixed(1)}MB)</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Privacy */}
                <div className="bg-slate-900/50 rounded-xl p-4 text-sm space-y-1">
                  <p className="text-slate-400 text-xs uppercase tracking-wider font-medium mb-2">🔒 Privacy Settings</p>
                  <p className="text-slate-300">Anonymous: <span className={formData.is_anonymous ? 'text-green-400' : 'text-slate-400'}>{formData.is_anonymous ? 'Yes' : 'No'}</span></p>
                  <p className="text-slate-300">Contact via: <span className="text-blue-400 capitalize">{formData.contact_method}</span></p>
                </div>

                {/* Consent */}
                <label className="flex items-start gap-3 cursor-pointer p-4 rounded-xl bg-blue-500/5 border border-blue-500/20">
                  <input
                    id="checkbox-consent"
                    type="checkbox"
                    checked={formData.consent_given}
                    onChange={e => update({ consent_given: e.target.checked })}
                    className="mt-0.5 w-4 h-4 rounded bg-slate-700 border-slate-600 text-blue-500 focus:ring-blue-500"
                  />
                  <span className="text-sm text-slate-300 leading-relaxed">
                    I confirm that the information provided is accurate to the best of my knowledge, and I consent to CivicMind AI sharing this report with the relevant government department for processing. <span className="text-red-400">*</span>
                  </span>
                </label>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between gap-3">
        <button
          id="btn-wizard-back"
          type="button"
          onClick={step === 0 ? () => navigate('/dashboard/citizen') : goBack}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 font-medium hover:bg-slate-700 transition-all text-xs"
        >
          ← {step === 0 ? 'Cancel' : 'Back'}
        </button>

        {step < 4 ? (
          <button
            id="btn-wizard-next"
            type="button"
            onClick={goNext}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold transition-all shadow-lg shadow-blue-500/20 text-xs font-bold"
          >
            Next → {STEPS[step + 1]?.icon}
          </button>
        ) : (
          <button
            id="btn-wizard-submit"
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || !formData.consent_given}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-semibold transition-all shadow-lg shadow-green-500/20 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-bold"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                {uploadProgress > 0 && uploadProgress < 100 ? `Uploading (${uploadProgress}%)…` : 'Submitting…'}
              </>
            ) : (
              '🚀 Submit Report'
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default ReportIssuePage;
