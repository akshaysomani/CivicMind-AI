import React, {
  createContext, useContext, useState, useCallback
} from 'react';
import type {
  Issue, IssueDetail, IssueFilters, IssueFormDraft, TrackingResult
} from '../types/issue';
import { useAuth } from './AuthContext';
import { useNotifications } from './NotificationContext';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';
const DRAFT_KEY = 'civicmind_issue_draft';

const DEFAULT_FILTERS: IssueFilters = {
  search: '', category: '', priority: '', severity: '',
  status: '', ward: '', date_from: '', date_to: '',
  sort_by: 'created_at', sort_order: 'desc',
};

interface IssueContextType {
  issues: Issue[];
  currentIssue: IssueDetail | null;
  isLoading: boolean;
  isSubmitting: boolean;
  totalCount: number;
  draft: Omit<IssueFormDraft, 'files'> | null;
  saveDraft: (draft: IssueFormDraft) => void;
  clearDraft: () => void;
  filters: IssueFilters;
  setFilters: (f: Partial<IssueFilters>) => void;
  resetFilters: () => void;
  fetchIssues: (params?: Partial<IssueFilters> & { limit?: number; offset?: number }) => Promise<void>;
  fetchIssue: (id: number) => Promise<IssueDetail | null>;
  createIssue: (payload: Omit<IssueFormDraft, 'files'>) => Promise<Issue | null>;
  updateIssue: (id: number, payload: Partial<Omit<IssueFormDraft, 'files'>>) => Promise<Issue | null>;
  deleteIssue: (id: number) => Promise<boolean>;
  updateStatus: (id: number, newStatus: string, note?: string) => Promise<Issue | null>;
  uploadAttachments: (issueId: number, files: File[]) => Promise<boolean>;
  deleteAttachment: (issueId: number, attId: number) => Promise<boolean>;
  trackIssue: (complaintId: string) => Promise<TrackingResult | null>;
  toggleSaveIssue: (issueId: number) => Promise<void>;
}

const IssueContext = createContext<IssueContextType | undefined>(undefined);

export const IssueProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token } = useAuth();
  const { showNotification } = useNotifications();

  const [issues, setIssues] = useState<Issue[]>([]);
  const [currentIssue, setCurrentIssue] = useState<IssueDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [filters, setFiltersState] = useState<IssueFilters>(DEFAULT_FILTERS);
  const [draft, setDraft] = useState<Omit<IssueFormDraft, 'files'> | null>(() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const saveDraft = useCallback((d: IssueFormDraft) => {
    const { files: _files, ...saveable } = d;
    localStorage.setItem(DRAFT_KEY, JSON.stringify(saveable));
    setDraft(saveable);
  }, []);

  const clearDraft = useCallback(() => {
    localStorage.removeItem(DRAFT_KEY);
    setDraft(null);
  }, []);

  const setFilters = useCallback((partial: Partial<IssueFilters>) => {
    setFiltersState(prev => ({ ...prev, ...partial }));
  }, []);

  const resetFilters = useCallback(() => setFiltersState(DEFAULT_FILTERS), []);

  const authHeaders = useCallback((): Record<string, string> => ({
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }), [token]);

  // ── Fetch Issues ────────────────────────────────────────────────────────────
  const fetchIssues = useCallback(async (
    params?: Partial<IssueFilters> & { limit?: number; offset?: number }
  ) => {
    setIsLoading(true);
    try {
      const merged = { ...filters, ...params };
      const qs = new URLSearchParams();
      if (merged.search)    qs.set('search', merged.search);
      if (merged.category)  qs.set('category', merged.category);
      if (merged.priority)  qs.set('priority', merged.priority);
      if (merged.severity)  qs.set('severity', merged.severity);
      if (merged.status)    qs.set('status', merged.status);
      if (merged.ward)      qs.set('ward', merged.ward);
      if (merged.date_from) qs.set('date_from', merged.date_from);
      if (merged.date_to)   qs.set('date_to', merged.date_to);
      qs.set('sort_by', merged.sort_by);
      qs.set('sort_order', merged.sort_order);
      qs.set('limit', String(params?.limit ?? 12));
      qs.set('offset', String(params?.offset ?? 0));

      const res = await fetch(`${API_BASE}/issues?${qs}`, { headers: authHeaders() });
      if (!res.ok) throw new Error('Failed to load issues.');
      const data: Issue[] = await res.json();
      setIssues(data);
      setTotalCount(data.length);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch issues.';
      showNotification(msg, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [filters, authHeaders, showNotification]);

  // ── Fetch single issue ──────────────────────────────────────────────────────
  const fetchIssue = useCallback(async (id: number): Promise<IssueDetail | null> => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/issues/${id}`, { headers: authHeaders() });
      if (!res.ok) throw new Error('Issue not found.');
      const data: IssueDetail = await res.json();
      setCurrentIssue(data);
      return data;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch issue.';
      showNotification(msg, 'error');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [authHeaders, showNotification]);

  // ── Create Issue ────────────────────────────────────────────────────────────
  const createIssue = useCallback(async (
    payload: Omit<IssueFormDraft, 'files'>
  ): Promise<Issue | null> => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/issues`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Failed to submit issue.');
      }
      const data: Issue = await res.json();
      setIssues(prev => [data, ...prev]);
      showNotification(`Issue submitted! Complaint ID: ${data.complaint_id}`, 'success');
      clearDraft();
      return data;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Submission failed.';
      showNotification(msg, 'error');
      return null;
    } finally {
      setIsSubmitting(false);
    }
  }, [authHeaders, showNotification, clearDraft]);

  // ── Update Issue ────────────────────────────────────────────────────────────
  const updateIssue = useCallback(async (
    id: number, payload: Partial<Omit<IssueFormDraft, 'files'>>
  ): Promise<Issue | null> => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/issues/${id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Update failed.');
      }
      const data: Issue = await res.json();
      setIssues(prev => prev.map(i => (i.id === id ? data : i)));
      showNotification('Issue updated.', 'success');
      return data;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Update failed.';
      showNotification(msg, 'error');
      return null;
    } finally {
      setIsSubmitting(false);
    }
  }, [authHeaders, showNotification]);

  // ── Delete Issue ────────────────────────────────────────────────────────────
  const deleteIssue = useCallback(async (id: number): Promise<boolean> => {
    try {
      const res = await fetch(`${API_BASE}/issues/${id}`, {
        method: 'DELETE', headers: authHeaders(),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Delete failed.');
      }
      setIssues(prev => prev.filter(i => i.id !== id));
      showNotification('Issue withdrawn.', 'info');
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Delete failed.';
      showNotification(msg, 'error');
      return false;
    }
  }, [authHeaders, showNotification]);

  // ── Update Status ───────────────────────────────────────────────────────────
  const updateStatus = useCallback(async (
    id: number, newStatus: string, note?: string
  ): Promise<Issue | null> => {
    try {
      const res = await fetch(`${API_BASE}/issues/${id}/status`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ new_status: newStatus, note }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Status update failed.');
      }
      const data: Issue = await res.json();
      setIssues(prev => prev.map(i => (i.id === id ? data : i)));
      if (currentIssue?.id === id) setCurrentIssue(prev => prev ? { ...prev, ...data } : null);
      showNotification(`Status updated to: ${newStatus}`, 'success');
      return data;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Status update failed.';
      showNotification(msg, 'error');
      return null;
    }
  }, [authHeaders, showNotification, currentIssue]);

  // ── Upload Attachments ──────────────────────────────────────────────────────
  const uploadAttachments = useCallback(async (issueId: number, files: File[]): Promise<boolean> => {
    if (!files.length) return true;
    try {
      const formData = new FormData();
      files.forEach(f => formData.append('files', f));
      const res = await fetch(`${API_BASE}/issues/${issueId}/attachments`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Upload failed.');
      }
      showNotification(`${files.length} file(s) uploaded.`, 'success');
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Upload failed.';
      showNotification(msg, 'error');
      return false;
    }
  }, [token, showNotification]);

  // ── Delete Attachment ───────────────────────────────────────────────────────
  const deleteAttachment = useCallback(async (issueId: number, attId: number): Promise<boolean> => {
    try {
      const res = await fetch(`${API_BASE}/issues/${issueId}/attachments/${attId}`, {
        method: 'DELETE', headers: authHeaders(),
      });
      if (!res.ok) throw new Error('Failed to remove attachment.');
      if (currentIssue?.id === issueId) {
        setCurrentIssue(prev =>
          prev ? { ...prev, attachments: prev.attachments.filter(a => a.id !== attId) } : null
        );
      }
      showNotification('Attachment removed.', 'info');
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Remove failed.';
      showNotification(msg, 'error');
      return false;
    }
  }, [authHeaders, showNotification, currentIssue]);

  // ── Track Issue ─────────────────────────────────────────────────────────────
  const trackIssue = useCallback(async (complaintId: string): Promise<TrackingResult | null> => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/issues/track/${complaintId.toUpperCase()}`);
      if (!res.ok) throw new Error('No report found with this complaint ID.');
      return await res.json();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Tracking failed.';
      showNotification(msg, 'error');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [showNotification]);

  // ── Toggle Save ─────────────────────────────────────────────────────────────
  const toggleSaveIssue = useCallback(async (issueId: number) => {
    try {
      const res = await fetch(`${API_BASE}/citizen/reports/${issueId}/save`, {
        method: 'POST', headers: authHeaders(),
      });
      if (!res.ok) throw new Error('Could not update saved status.');
      const { is_saved } = await res.json();
      setIssues(prev => prev.map(i => i.id === issueId ? { ...i, is_saved } : i));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to toggle save.';
      showNotification(msg, 'error');
    }
  }, [authHeaders, showNotification]);

  return (
    <IssueContext.Provider value={{
      issues, currentIssue, isLoading, isSubmitting, totalCount,
      draft, saveDraft, clearDraft,
      filters, setFilters, resetFilters,
      fetchIssues, fetchIssue, createIssue, updateIssue, deleteIssue,
      updateStatus, uploadAttachments, deleteAttachment, trackIssue, toggleSaveIssue,
    }}>
      {children}
    </IssueContext.Provider>
  );
};

export const useIssues = () => {
  const ctx = useContext(IssueContext);
  if (!ctx) throw new Error('useIssues must be used within IssueProvider');
  return ctx;
};

export default IssueContext;
