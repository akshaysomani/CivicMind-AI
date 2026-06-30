import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useNotifications } from './NotificationContext';
import type { Report, NotificationItem } from './CitizenContext';

export interface DashboardKPIs {
  total_issues: number;
  open_issues: number;
  resolved_today: number;
  pending_approval: number;
  critical_issues: number;
  avg_resolution_time: string;
  citizen_satisfaction: number;
  department_efficiency: number;
}

export interface DepartmentStats {
  name: string;
  open_cases: number;
  resolved_cases: number;
  avg_response_time: string;
  performance: number;
}

export interface WardStats {
  name: string;
  open_cases: number;
  resolution_rate: number;
  population_coverage: number;
  response_time: string;
  trend: number[];
}

export interface ResourceStats {
  available_officers: number;
  active_teams: number;
  emergency_vehicles: number;
  maintenance_teams: number;
  medical_units: number;
  equipment_status: string;
  budget_utilization: number;
}

export interface CitizenRecord {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  community_score: number;
  reported_issues_count: number;
  created_at: string;
}

export interface Announcement {
  id: number;
  title: string;
  content: string;
  priority: string;
  target_audience: string;
  status: string;
  created_at: string;
}

export interface OfficerRecord {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  sub_role: string;
  organization?: string;
}

interface GovernmentContextType {
  kpis: DashboardKPIs | null;
  issues: Report[];
  departments: DepartmentStats[];
  wards: WardStats[];
  resources: ResourceStats | null;
  citizens: CitizenRecord[];
  officers: OfficerRecord[];
  announcements: Announcement[];
  notifications: NotificationItem[];
  isLoading: boolean;

  refreshDashboard: () => Promise<void>;
  fetchIssues: (filters?: { search?: string; status?: string; priority?: string; category?: string; ward?: string }) => Promise<void>;
  assignOfficer: (issueId: number, officerId: number | null) => Promise<void>;
  updateIssueStatus: (issueId: number, status: string, progress?: number) => Promise<void>;
  publishAnnouncement: (title: string, content: string, priority: string, targetAudience: string) => Promise<void>;
  fetchCitizens: (search?: string) => Promise<void>;
  fetchOfficers: () => Promise<void>;
  exportReport: (type: string, format: string) => Promise<void>;
}

const GovernmentContext = createContext<GovernmentContextType | undefined>(undefined);

const API_BASE = localStorage.getItem('VITE_API_BASE_URL') || import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

export const GovernmentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, isAuthenticated } = useAuth();
  const { showNotification } = useNotifications();

  const [kpis, setKpis] = useState<DashboardKPIs | null>(null);
  const [issues, setIssues] = useState<Report[]>([]);
  const [departments, setDepartments] = useState<DepartmentStats[]>([]);
  const [wards, setWards] = useState<WardStats[]>([]);
  const [resources, setResources] = useState<ResourceStats | null>(null);
  const [citizens, setCitizens] = useState<CitizenRecord[]>([]);
  const [officers, setOfficers] = useState<OfficerRecord[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const getHeaders = useCallback(() => {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }, [token]);

  const refreshDashboard = useCallback(async () => {
    if (!isAuthenticated || !token) return;
    setIsLoading(true);
    try {
      const headers = getHeaders();
      const [kpiRes, deptRes, wardRes, resRes, annRes, notiRes] = await Promise.all([
        fetch(`${API_BASE}/government/dashboard/stats`, { headers }),
        fetch(`${API_BASE}/government/departments`, { headers }),
        fetch(`${API_BASE}/government/wards`, { headers }),
        fetch(`${API_BASE}/government/resources`, { headers }),
        fetch(`${API_BASE}/government/announcements`, { headers }),
        fetch(`${API_BASE}/government/notifications`, { headers })
      ]);

      if (kpiRes.ok) setKpis(await kpiRes.json());
      if (deptRes.ok) setDepartments(await deptRes.json());
      if (wardRes.ok) setWards(await wardRes.json());
      if (resRes.ok) setResources(await resRes.json());
      if (annRes.ok) setAnnouncements(await annRes.json());
      if (notiRes.ok) setNotifications(await notiRes.json());

    } catch (error) {
      console.error('Error refreshing government dashboard:', error);
      showNotification('Failed to retrieve dashboard stats from backend.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, token, getHeaders]);

  const fetchIssues = useCallback(async (filters?: { search?: string; status?: string; priority?: string; category?: string; ward?: string }) => {
    if (!isAuthenticated || !token) return;
    try {
      const headers = getHeaders();
      let url = `${API_BASE}/government/issues?limit=100`;
      if (filters) {
        const params = new URLSearchParams();
        if (filters.search) params.append('search', filters.search);
        if (filters.status && filters.status !== 'All') params.append('status', filters.status);
        if (filters.priority && filters.priority !== 'All') params.append('priority', filters.priority);
        if (filters.category && filters.category !== 'All') params.append('category', filters.category);
        if (filters.ward && filters.ward !== 'All') params.append('ward', filters.ward);
        url += `&${params.toString()}`;
      }
      const res = await fetch(url, { headers });
      if (res.ok) {
        setIssues(await res.json());
      }
    } catch (error) {
      console.error('Error fetching government issues:', error);
      showNotification('Failed to retrieve issues from backend.', 'error');
    }
  }, [isAuthenticated, token, getHeaders]);

  const assignOfficer = useCallback(async (issueId: number, officerId: number | null) => {
    if (!isAuthenticated || !token) return;
    try {
      const headers = getHeaders();
      const res = await fetch(`${API_BASE}/government/issues/${issueId}/assign`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ officer_id: officerId })
      });
      if (res.ok) {
        showNotification('Officer assigned successfully!', 'success');
        await fetchIssues();
        await refreshDashboard();
      } else {
        const errorData = await res.json();
        showNotification(errorData.detail || 'Assignment failed.', 'error');
      }
    } catch (error) {
      console.error('Failed to assign officer', error);
    }
  }, [isAuthenticated, token, getHeaders, fetchIssues, refreshDashboard, showNotification]);

  const updateIssueStatus = useCallback(async (issueId: number, status: string, progress?: number) => {
    if (!isAuthenticated || !token) return;
    try {
      const headers = getHeaders();
      const res = await fetch(`${API_BASE}/government/issues/${issueId}/status`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ status, progress })
      });
      if (res.ok) {
        showNotification(`Ticket progressed to ${status}`, 'success');
        await fetchIssues();
        await refreshDashboard();
      } else {
        const errorData = await res.json();
        showNotification(errorData.detail || 'Status update failed.', 'error');
      }
    } catch (error) {
      console.error('Failed to update status', error);
    }
  }, [isAuthenticated, token, getHeaders, fetchIssues, refreshDashboard, showNotification]);

  const publishAnnouncement = useCallback(async (title: string, content: string, priority: string, targetAudience: string) => {
    if (!isAuthenticated || !token) return;
    try {
      const headers = getHeaders();
      const res = await fetch(`${API_BASE}/government/announcements`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ title, content, priority, target_audience: targetAudience })
      });
      if (res.ok) {
        showNotification('Announcement broadcasted successfully!', 'success');
        await refreshDashboard();
      } else {
        const errorData = await res.json();
        showNotification(errorData.detail || 'Broadcasting failed.', 'error');
      }
    } catch (error) {
      console.error('Failed to broadcast announcement', error);
    }
  }, [isAuthenticated, token, getHeaders, refreshDashboard, showNotification]);

  const fetchCitizens = useCallback(async (search?: string) => {
    if (!isAuthenticated || !token) return;
    try {
      const headers = getHeaders();
      let url = `${API_BASE}/government/citizens`;
      if (search) {
        url += `?search=${encodeURIComponent(search)}`;
      }
      const res = await fetch(url, { headers });
      if (res.ok) {
        setCitizens(await res.json());
      }
    } catch (error) {
      console.error('Failed to fetch citizens directory', error);
    }
  }, [isAuthenticated, token, getHeaders]);

  const fetchOfficers = useCallback(async () => {
    if (!isAuthenticated || !token) return;
    try {
      const headers = getHeaders();
      const res = await fetch(`${API_BASE}/government/officers`, { headers });
      if (res.ok) {
        setOfficers(await res.json());
      }
    } catch (error) {
      console.error('Failed to fetch officers directory', error);
    }
  }, [isAuthenticated, token, getHeaders]);

  const exportReport = useCallback(async (type: string, format: string) => {
    if (!isAuthenticated || !token) return;
    try {
      const headers = getHeaders();
      const res = await fetch(`${API_BASE}/government/reports/generate?type=${type}&format=${format}`, { headers });
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `civicmind_${type.toLowerCase()}_report.${format === 'CSV' ? 'csv' : 'xlsx'}`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        showNotification('Report generated and downloaded successfully.', 'success');
      } else {
        showNotification('Failed to generate report.', 'error');
      }
    } catch (error) {
      console.error('Failed to export report', error);
    }
  }, [isAuthenticated, token, getHeaders, showNotification]);

  useEffect(() => {
    if (isAuthenticated && token) {
      refreshDashboard();
      fetchIssues();
      fetchOfficers();
    }
  }, [isAuthenticated, token, refreshDashboard, fetchIssues, fetchOfficers]);

  return (
    <GovernmentContext.Provider
      value={{
        kpis,
        issues,
        departments,
        wards,
        resources,
        citizens,
        officers,
        announcements,
        notifications,
        isLoading,
        refreshDashboard,
        fetchIssues,
        assignOfficer,
        updateIssueStatus,
        publishAnnouncement,
        fetchCitizens,
        fetchOfficers,
        exportReport
      }}
    >
      {children}
    </GovernmentContext.Provider>
  );
};

export const useGovernment = () => {
  const context = useContext(GovernmentContext);
  if (!context) {
    throw new Error('useGovernment must be used within a GovernmentProvider');
  }
  return context;
};
