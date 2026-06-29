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

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

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
      console.warn('Backend offline — loading offline demo data for government dashboard.', error);
      // Offline Demo Fallback: populate with mock data so the command center is interactive
      setKpis({ total_issues: 47, open_issues: 12, resolved_today: 5, pending_approval: 8, critical_issues: 3, avg_resolution_time: '4.2 days', citizen_satisfaction: 87, department_efficiency: 92 });
      setDepartments([
        { name: 'Water Supply', open_cases: 5, resolved_cases: 18, avg_response_time: '3.1 days', performance: 88 },
        { name: 'Electricity', open_cases: 3, resolved_cases: 22, avg_response_time: '2.5 days', performance: 94 },
        { name: 'Roads', open_cases: 4, resolved_cases: 15, avg_response_time: '5.2 days', performance: 78 },
        { name: 'Sanitation', open_cases: 2, resolved_cases: 20, avg_response_time: '1.8 days', performance: 96 },
        { name: 'Public Safety', open_cases: 1, resolved_cases: 12, avg_response_time: '4.0 days', performance: 85 },
      ]);
      setWards([
        { name: 'Ward 1 - Richmond', open_cases: 3, resolution_rate: 82, population_coverage: 62000, response_time: '3.5 days', trend: [5, 3, 4, 2, 3] },
        { name: 'Ward 2 - Marina', open_cases: 2, resolution_rate: 88, population_coverage: 48000, response_time: '2.8 days', trend: [4, 2, 3, 1, 2] },
        { name: 'Ward 3 - Financial', open_cases: 4, resolution_rate: 76, population_coverage: 55000, response_time: '4.1 days', trend: [6, 5, 4, 3, 4] },
        { name: 'Ward 4 - Mission', open_cases: 2, resolution_rate: 91, population_coverage: 72000, response_time: '2.1 days', trend: [3, 2, 1, 2, 2] },
        { name: 'Ward 5 - Sunset', open_cases: 1, resolution_rate: 94, population_coverage: 58000, response_time: '1.9 days', trend: [2, 1, 1, 1, 1] },
      ]);
      setResources({ available_officers: 45, active_teams: 12, emergency_vehicles: 8, maintenance_teams: 6, medical_units: 5, equipment_status: 'Optimal', budget_utilization: 68.5 });
      setAnnouncements([
        { id: 1, title: 'Road Repair Advisory: Ward 1', content: 'Main street road repairs scheduled from June 25 to June 30.', priority: 'Medium', target_audience: 'Ward 1 - Richmond', status: 'Published', created_at: new Date().toISOString() },
        { id: 2, title: 'Water Reservoir Cleaning Operation', content: 'Scheduled cleaning of the primary water reservoir. Low water pressure expected in Ward 2.', priority: 'High', target_audience: 'Ward 2 - Marina', status: 'Published', created_at: new Date().toISOString() },
      ]);
      setNotifications([
        { id: 1, user_id: 1, title: 'New Critical Report', message: 'A critical electrical hazard has been reported in Ward 2.', type: 'emergency', is_read: false, created_at: new Date().toISOString() },
        { id: 2, user_id: 1, title: 'Daily Digest', message: '5 reports resolved today. Citizen satisfaction trending upward.', type: 'gov_message', is_read: false, created_at: new Date().toISOString() },
      ]);
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
      console.warn('Backend offline — loading offline demo issues for government.', error);
      // Offline Demo Fallback: populate with mock triaging issues
      setIssues([
        { id: 1, title: 'Clogged Storm Drain on Market St', description: 'Heavy rain is causing water to accumulate on the sidewalk.', category: 'Water Supply', priority: 'High', status: 'In Progress', assigned_department: 'Water Supply', citizen_id: 1, city: 'San Francisco', state: 'California', country: 'USA', progress: 45, ward: 'Ward 3 - Financial', created_at: new Date().toISOString(), updated_at: new Date().toISOString(), is_saved: false },
        { id: 2, title: 'Flickering Streetlight near 22nd St Station', description: 'The streetlight is flashing rapidly, creating visibility issues.', category: 'Electricity', priority: 'Low', status: 'Open', assigned_department: 'Electricity', citizen_id: 1, city: 'San Francisco', state: 'California', country: 'USA', progress: 10, ward: 'Ward 1 - Richmond', created_at: new Date().toISOString(), updated_at: new Date().toISOString(), is_saved: false },
        { id: 3, title: 'Illegal Dumping in Alleyway', description: 'Multiple mattresses and e-waste in the alley behind 452 Mission Street.', category: 'Sanitation', priority: 'Medium', status: 'Resolved', assigned_department: 'Sanitation', citizen_id: 1, city: 'San Francisco', state: 'California', country: 'USA', progress: 100, ward: 'Ward 4 - Mission', created_at: new Date().toISOString(), updated_at: new Date().toISOString(), is_saved: false },
        { id: 4, title: 'Exposed Electrical Wiring near Public Park', description: 'Damaged junction box exposing high-voltage wiring.', category: 'Electricity', priority: 'Critical', status: 'Open', assigned_department: 'Electricity', citizen_id: 1, city: 'San Francisco', state: 'California', country: 'USA', progress: 0, ward: 'Ward 2 - Marina', created_at: new Date().toISOString(), updated_at: new Date().toISOString(), is_saved: false },
        { id: 5, title: 'Water Pipeline Burst on 19th Ave', description: 'Gushing water is flooding the street, threatening surrounding shop basements.', category: 'Water Supply', priority: 'Critical', status: 'In Progress', assigned_department: 'Water Supply', citizen_id: 1, city: 'San Francisco', state: 'California', country: 'USA', progress: 15, ward: 'Ward 5 - Sunset', created_at: new Date().toISOString(), updated_at: new Date().toISOString(), is_saved: false },
        { id: 6, title: 'Unregulated Construction Noise', description: 'Jackhammers and heavy trucks operating past 11 PM, violating city noise ordinances.', category: 'Public Safety', priority: 'Low', status: 'Open', assigned_department: 'Public Safety', citizen_id: 1, city: 'San Francisco', state: 'California', country: 'USA', progress: 30, ward: 'Ward 1 - Richmond', created_at: new Date().toISOString(), updated_at: new Date().toISOString(), is_saved: false },
        { id: 7, title: 'Damaged Guardrail on Overpass', description: 'A collision has destroyed a 15-foot section of the safety guardrail.', category: 'Roads', priority: 'High', status: 'In Progress', assigned_department: 'Roads', citizen_id: 1, city: 'San Francisco', state: 'California', country: 'USA', progress: 20, ward: 'Ward 3 - Financial', created_at: new Date().toISOString(), updated_at: new Date().toISOString(), is_saved: false },
      ]);
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
