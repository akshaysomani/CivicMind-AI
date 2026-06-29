import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useNotifications } from './NotificationContext';

export interface Report {
  id: number;
  title: string;
  description: string;
  category: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Open' | 'In Progress' | 'Resolved' | 'Rejected';
  assigned_department?: string;
  citizen_id: number;
  city: string;
  state: string;
  country: string;
  progress: number;
  assigned_officer_id?: number | null;
  ward?: string;
  created_at: string;
  updated_at: string;
  is_saved: boolean;
}

export interface NotificationItem {
  id: number;
  user_id: number;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

export interface FeedPost {
  id: number;
  title: string;
  content: string;
  category: string;
  author_name: string;
  author_role: string;
  likes_count: number;
  comments_count: number;
  created_at: string;
  is_liked: boolean;
  is_bookmarked: boolean;
}

export interface Alert {
  id: number;
  title: string;
  message: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  location: string;
  city: string;
  state: string;
  distance: string;
  alert_type: string;
  status: string;
  created_at: string;
}

export interface DashboardStats {
  issues_reported: number;
  resolved_issues: number;
  pending_issues: number;
  nearby_alerts: number;
  ai_insights: number;
  participation_score: number;
}

export interface InsightCard {
  id: string;
  message: string;
  category: string;
  trend?: string;
}

export interface AchievementBadge {
  id: string;
  title: string;
  description: string;
  progress: number;
  unlocked: boolean;
  icon_name: string;
}

interface CitizenContextType {
  stats: DashboardStats | null;
  reports: Report[];
  savedReports: Report[];
  feedPosts: FeedPost[];
  alerts: Alert[];
  notifications: NotificationItem[];
  achievements: AchievementBadge[];
  insights: InsightCard[];
  isLoading: boolean;
  
  refreshDashboard: () => Promise<void>;
  fetchReports: (filters?: { search?: string; status?: string; priority?: string; category?: string }) => Promise<void>;
  toggleSaveReport: (reportId: number) => Promise<void>;
  toggleLikeFeedPost: (postId: number) => Promise<void>;
  toggleBookmarkFeedPost: (postId: number) => Promise<void>;
  markNotificationRead: (notificationId: number) => Promise<void>;
  deleteNotification: (notificationId: number) => Promise<void>;
  submitMockReport: (title: string, description: string, category: string, priority: string) => Promise<void>;
}

const CitizenContext = createContext<CitizenContextType | undefined>(undefined);

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

export const CitizenProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, isAuthenticated } = useAuth();
  const { showNotification } = useNotifications();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [savedReports, setSavedReports] = useState<Report[]>([]);
  const [feedPosts, setFeedPosts] = useState<FeedPost[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [achievements, setAchievements] = useState<AchievementBadge[]>([]);
  const [insights, setInsights] = useState<InsightCard[]>([]);
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
      
      const [statsRes, alertsRes, notiRes, achievementsRes, insightsRes, feedRes, savedRes] = await Promise.all([
        fetch(`${API_BASE}/citizen/dashboard/stats`, { headers }),
        fetch(`${API_BASE}/citizen/alerts`, { headers }),
        fetch(`${API_BASE}/citizen/notifications`, { headers }),
        fetch(`${API_BASE}/citizen/achievements`, { headers }),
        fetch(`${API_BASE}/citizen/insights`, { headers }),
        fetch(`${API_BASE}/citizen/feed`, { headers }),
        fetch(`${API_BASE}/citizen/saved-reports`, { headers })
      ]);

      if (statsRes.ok) setStats(await statsRes.json());
      if (alertsRes.ok) setAlerts(await alertsRes.json());
      if (notiRes.ok) setNotifications(await notiRes.json());
      if (achievementsRes.ok) setAchievements(await achievementsRes.json());
      if (insightsRes.ok) setInsights(await insightsRes.json());
      if (feedRes.ok) setFeedPosts(await feedRes.json());
      if (savedRes.ok) setSavedReports(await savedRes.json());
      
    } catch (error) {
      console.warn('Backend offline — loading offline demo data for citizen dashboard.', error);
      // Offline Demo Fallback: populate with mock data so the dashboard is interactive
      setStats({ issues_reported: 8, resolved_issues: 5, pending_issues: 3, nearby_alerts: 4, ai_insights: 12, participation_score: 78 });
      setAlerts([
        { id: 1, title: 'Road Closure: Main Street Pipeline Maintenance', message: 'Water pipeline repair on Main St. Road blocked between 4th Ave and 7th Ave.', severity: 'Medium', location: 'Main St & 5th Ave', city: 'San Francisco', state: 'California', distance: '0.4 miles', alert_type: 'Road Closure', status: 'Active', created_at: new Date().toISOString() },
        { id: 2, title: 'Flood Warning: Bay Area Shoreline', message: 'High tide and heavy rainfall may cause localized coastal flooding.', severity: 'High', location: 'Bay Area Shoreline', city: 'San Francisco', state: 'California', distance: '1.8 miles', alert_type: 'Flood', status: 'Active', created_at: new Date().toISOString() },
        { id: 3, title: 'Power Outage: Grid Sector 4B', message: 'Scheduled transformer upgrades. Outage expected to resolve by 6 PM.', severity: 'Medium', location: 'District 4', city: 'San Francisco', state: 'California', distance: '2.1 miles', alert_type: 'Power Outage', status: 'Active', created_at: new Date().toISOString() },
      ]);
      setNotifications([
        { id: 1, user_id: 1, title: 'Report Update', message: 'Your report "Clogged Storm Drain" has been assigned to the Water Supply dept.', type: 'gov_message', is_read: false, created_at: new Date().toISOString() },
        { id: 2, user_id: 1, title: 'New Alert', message: 'A new flood warning has been issued for your area.', type: 'emergency', is_read: false, created_at: new Date().toISOString() },
      ]);
      setAchievements([
        { id: 'first_report', title: 'First Reporter', description: 'Submit your first issue report', progress: 100, unlocked: true, icon_name: 'FileText' },
        { id: 'community_voice', title: 'Community Voice', description: 'Engage with 5 community feed posts', progress: 60, unlocked: false, icon_name: 'MessageCircle' },
        { id: 'watchdog', title: 'Neighborhood Watchdog', description: 'Report 10 local issues', progress: 80, unlocked: false, icon_name: 'Eye' },
      ]);
      setInsights([
        { id: '1', message: 'Water supply issues surged 23% this month in your ward.', category: 'Water Supply', trend: 'up' },
        { id: '2', message: 'Average resolution time improved to 3.8 days — a new ward best.', category: 'Performance', trend: 'down' },
        { id: '3', message: 'Sanitation complaints are at a 6-month low in your district.', category: 'Sanitation', trend: 'down' },
      ]);
      setFeedPosts([
        { id: 1, title: 'Pothole on 8th Avenue resolved!', content: 'Huge shoutout to the zoning department! Reported a critical pothole near the school zone and it was fully patched within 48 hours.', category: 'Community Issue', author_name: 'Sarah Jenkins', author_role: 'Citizen', likes_count: 18, comments_count: 4, created_at: new Date().toISOString(), is_liked: false, is_bookmarked: false },
        { id: 2, title: 'City Green Initiative Launch Event', content: 'Join us this Saturday at Golden Gate Park for the annual community tree planting drive.', category: 'Event', author_name: 'District 5 Council', author_role: 'Government', likes_count: 42, comments_count: 12, created_at: new Date().toISOString(), is_liked: false, is_bookmarked: false },
      ]);
      setSavedReports([]);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, token, getHeaders]);

  const fetchReports = useCallback(async (filters?: { search?: string; status?: string; priority?: string; category?: string }) => {
    if (!isAuthenticated || !token) return;
    try {
      const headers = getHeaders();
      let url = `${API_BASE}/citizen/reports?limit=50`;
      if (filters) {
        const params = new URLSearchParams();
        if (filters.search) params.append('search', filters.search);
        if (filters.status && filters.status !== 'All') params.append('status', filters.status);
        if (filters.priority && filters.priority !== 'All') params.append('priority', filters.priority);
        if (filters.category && filters.category !== 'All') params.append('category', filters.category);
        url += `&${params.toString()}`;
      }
      const res = await fetch(url, { headers });
      if (res.ok) {
        setReports(await res.json());
      }
    } catch (error) {
      console.warn('Backend offline — loading offline demo reports.', error);
      // Offline Demo Fallback: populate with mock reports
      setReports([
        { id: 1, title: 'Clogged Storm Drain on Market St', description: 'Heavy rain is causing water to accumulate on the sidewalk.', category: 'Water Supply', priority: 'High', status: 'In Progress', assigned_department: 'Water Supply', citizen_id: 1, city: 'San Francisco', state: 'California', country: 'USA', progress: 45, ward: 'Ward 3 - Financial', created_at: new Date().toISOString(), updated_at: new Date().toISOString(), is_saved: false },
        { id: 2, title: 'Flickering Streetlight near 22nd St Station', description: 'The streetlight is flashing rapidly, creating visibility issues at night.', category: 'Electricity', priority: 'Low', status: 'Open', assigned_department: 'Electricity', citizen_id: 1, city: 'San Francisco', state: 'California', country: 'USA', progress: 10, ward: 'Ward 1 - Richmond', created_at: new Date().toISOString(), updated_at: new Date().toISOString(), is_saved: false },
        { id: 3, title: 'Illegal Dumping in Alleyway', description: 'Multiple mattresses and electronic waste left in the alley behind 452 Mission Street.', category: 'Sanitation', priority: 'Medium', status: 'Resolved', assigned_department: 'Sanitation', citizen_id: 1, city: 'San Francisco', state: 'California', country: 'USA', progress: 100, ward: 'Ward 4 - Mission', created_at: new Date().toISOString(), updated_at: new Date().toISOString(), is_saved: true },
        { id: 4, title: 'Exposed Electrical Wiring near Public Park', description: 'Damaged ground junction box exposing high-voltage wiring right next to the children\'s play area.', category: 'Electricity', priority: 'Critical', status: 'Open', assigned_department: 'Electricity', citizen_id: 1, city: 'San Francisco', state: 'California', country: 'USA', progress: 0, ward: 'Ward 2 - Marina', created_at: new Date().toISOString(), updated_at: new Date().toISOString(), is_saved: false },
        { id: 5, title: 'Damaged Guardrail on Overpass', description: 'A collision has destroyed a 15-foot section of the safety guardrail.', category: 'Roads', priority: 'High', status: 'In Progress', assigned_department: 'Roads', citizen_id: 1, city: 'San Francisco', state: 'California', country: 'USA', progress: 20, ward: 'Ward 3 - Financial', created_at: new Date().toISOString(), updated_at: new Date().toISOString(), is_saved: false },
      ]);
    }
  }, [isAuthenticated, token, getHeaders]);

  const toggleSaveReport = useCallback(async (reportId: number) => {
    if (!isAuthenticated || !token) return;
    try {
      const headers = getHeaders();
      const res = await fetch(`${API_BASE}/citizen/reports/${reportId}/save`, {
        method: 'POST',
        headers
      });
      if (res.ok) {
        const data = await res.json();
        showNotification(data.message, 'success');
        
        // Optimistic state updates
        setReports(prev => prev.map(r => r.id === reportId ? { ...r, is_saved: data.is_saved } : r));
        
        // Reload saved items
        const savedRes = await fetch(`${API_BASE}/citizen/saved-reports`, { headers });
        if (savedRes.ok) setSavedReports(await savedRes.json());
        
        // Update stats
        const statsRes = await fetch(`${API_BASE}/citizen/dashboard/stats`, { headers });
        if (statsRes.ok) setStats(await statsRes.json());
      }
    } catch (error) {
      console.error('Failed to toggle save report', error);
    }
  }, [isAuthenticated, token, getHeaders, showNotification]);

  const toggleLikeFeedPost = useCallback(async (postId: number) => {
    if (!isAuthenticated || !token) return;
    try {
      const headers = getHeaders();
      const res = await fetch(`${API_BASE}/citizen/feed/${postId}/like`, {
        method: 'POST',
        headers
      });
      if (res.ok) {
        const data = await res.json();
        
        setFeedPosts(prev => prev.map(p => p.id === postId ? { ...p, is_liked: data.is_liked, likes_count: data.likes_count } : p));
        
        // Refresh achievements & stats since volunteer spirit depends on likes
        const [achRes, statsRes] = await Promise.all([
          fetch(`${API_BASE}/citizen/achievements`, { headers }),
          fetch(`${API_BASE}/citizen/dashboard/stats`, { headers })
        ]);
        if (achRes.ok) setAchievements(await achRes.json());
        if (statsRes.ok) setStats(await statsRes.json());
      }
    } catch (error) {
      console.error('Failed to like post', error);
    }
  }, [isAuthenticated, token, getHeaders]);

  const toggleBookmarkFeedPost = useCallback(async (postId: number) => {
    if (!isAuthenticated || !token) return;
    try {
      const headers = getHeaders();
      const res = await fetch(`${API_BASE}/citizen/feed/${postId}/bookmark`, {
        method: 'POST',
        headers
      });
      if (res.ok) {
        const data = await res.json();
        showNotification(data.message, 'success');
        setFeedPosts(prev => prev.map(p => p.id === postId ? { ...p, is_bookmarked: data.is_bookmarked } : p));
      }
    } catch (error) {
      console.error('Failed to bookmark post', error);
    }
  }, [isAuthenticated, token, getHeaders, showNotification]);

  const markNotificationRead = useCallback(async (notificationId: number) => {
    if (!isAuthenticated || !token) return;
    try {
      const headers = getHeaders();
      const res = await fetch(`${API_BASE}/citizen/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers
      });
      if (res.ok) {
        setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n));
      }
    } catch (error) {
      console.error('Failed to mark notification as read', error);
    }
  }, [isAuthenticated, token, getHeaders]);

  const deleteNotification = useCallback(async (notificationId: number) => {
    if (!isAuthenticated || !token) return;
    try {
      const headers = getHeaders();
      const res = await fetch(`${API_BASE}/citizen/notifications/${notificationId}`, {
        method: 'DELETE',
        headers
      });
      if (res.ok) {
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
        showNotification('Notification deleted.', 'info');
      }
    } catch (error) {
      console.error('Failed to delete notification', error);
    }
  }, [isAuthenticated, token, getHeaders, showNotification]);

  const submitMockReport = useCallback(async (title: string, description: string, category: string, priority: string) => {
    if (!isAuthenticated || !token) return;
    // Note: Actual Module 5 logic handles this, here we do a simple submit for testing/seed verification
    try {

      // Temporary post endpoint (Module 5 will implement full report create).
      // For now, we mock insert it via custom seed or test simulation on the backend.
      // But let's build the route in reports.py or here if needed, or simply return local success.
      // Since Module 5 covers creating issues, we simulate it here by logging locally and reloading reports.
      console.log('Submitting Mock Report:', { title, description, category, priority });
      showNotification('Mock issue logged! Full reporting comes in Module 5.', 'success');
    } catch (error) {
      console.error('Failed to submit report', error);
    }
  }, [isAuthenticated, token, getHeaders, showNotification]);

  // Auto-refresh when auth states load
  useEffect(() => {
    if (isAuthenticated && token) {
      refreshDashboard();
      fetchReports();
    }
  }, [isAuthenticated, token, refreshDashboard, fetchReports]);

  return (
    <CitizenContext.Provider
      value={{
        stats,
        reports,
        savedReports,
        feedPosts,
        alerts,
        notifications,
        achievements,
        insights,
        isLoading,
        refreshDashboard,
        fetchReports,
        toggleSaveReport,
        toggleLikeFeedPost,
        toggleBookmarkFeedPost,
        markNotificationRead,
        deleteNotification,
        submitMockReport
      }}
    >
      {children}
    </CitizenContext.Provider>
  );
};

export const useCitizen = () => {
  const context = useContext(CitizenContext);
  if (!context) {
    throw new Error('useCitizen must be used within a CitizenProvider');
  }
  return context;
};
