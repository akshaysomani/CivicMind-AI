const API_BASE = localStorage.getItem('VITE_API_BASE_URL') || import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

export interface CivicDashboardIndex {
  community_health_score: number;
  infrastructure_health_score: number;
  public_safety_score: number;
  government_response_score: number;
  citizen_satisfaction_index: number;
  community_participation: number;
  environmental_score: number;
  emergency_readiness_score: number;
  ai_confidence_score: number;
  overall_civic_intelligence_index: number;
}

export interface AnalyticsKPIs {
  total_reports: number;
  open_reports: number;
  resolved_reports: number;
  avg_resolution_time: string;
  critical_incidents: number;
  active_emergencies: number;
  healthcare_requests: number;
  government_scheme_requests: number;
  active_ai_sessions: number;
  citizen_engagement: number;
  department_efficiency: number;
}

export interface AnalyticsTrends {
  labels: string[];
  reports_trend: number[];
  emergencies_trend: number[];
  healthcare_trend: number[];
  schemes_trend: number[];
  resolution_trend: number[];
  categories: string[];
  category_counts: number[];
  ward_trends: Record<string, number[]>;
}

export interface AIInsight {
  id: number;
  title: string;
  description: string;
  confidence: number;
  trend: 'up' | 'down' | 'stable';
  category: string;
  affected_wards: string[];
  suggested_actions: string[];
}

export interface DecisionRecommendation {
  id: number;
  title: string;
  description: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  impact: string;
  confidence_score: number;
  affected_departments: string[];
  supporting_evidence: string;
  implemented?: boolean; // local action tracking
}

export interface WardScorecard {
  scope: string;
  kpis: {
    total_reports: number;
    resolved_rate: string;
    satisfaction: number;
  };
  trend: 'improving' | 'stable' | 'excellent' | 'critical';
  strengths: string[];
  weaknesses: string[];
  ai_recommendation: string;
}

export interface CommunityEngagement {
  participation_index: number;
  ngo_active_count: number;
  feed_posts_count: number;
  announcements_count: number;
  total_notifications_sent: number;
  audit_logs_count: number;
  user_satisfaction: number;
}

export interface ExecutiveSummary {
  scope: string;
  summary: string;
  timestamp: string;
}

class AnalyticsService {
  private getHeaders(token?: string | null): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  public async getDashboard(token: string | null): Promise<CivicDashboardIndex> {
    const res = await fetch(`${API_BASE}/analytics/dashboard`, {
      method: 'GET',
      headers: this.getHeaders(token),
    });
    if (!res.ok) throw new Error('Failed to fetch analytics dashboard summary.');
    return res.json();
  }

  public async getKPIs(token: string | null): Promise<AnalyticsKPIs> {
    const res = await fetch(`${API_BASE}/analytics/kpis`, {
      method: 'GET',
      headers: this.getHeaders(token),
    });
    if (!res.ok) throw new Error('Failed to fetch analytics KPIs.');
    return res.json();
  }

  public async getTrends(ward: string | null, token: string | null): Promise<AnalyticsTrends> {
    let url = `${API_BASE}/analytics/trends`;
    if (ward && ward !== 'All') url += `?ward=${encodeURIComponent(ward)}`;
    
    const res = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders(token),
    });
    if (!res.ok) throw new Error('Failed to fetch trend analytics.');
    return res.json();
  }

  public async getInsights(token: string | null): Promise<AIInsight[]> {
    const res = await fetch(`${API_BASE}/analytics/insights`, {
      method: 'GET',
      headers: this.getHeaders(token),
    });
    if (!res.ok) throw new Error('Failed to fetch AI insights.');
    return res.json();
  }

  public async getRecommendations(token: string | null): Promise<DecisionRecommendation[]> {
    const res = await fetch(`${API_BASE}/analytics/recommendations`, {
      method: 'GET',
      headers: this.getHeaders(token),
    });
    if (!res.ok) throw new Error('Failed to fetch decision recommendations.');
    return res.json();
  }

  public async getScorecards(token: string | null): Promise<WardScorecard[]> {
    const res = await fetch(`${API_BASE}/analytics/scorecards`, {
      method: 'GET',
      headers: this.getHeaders(token),
    });
    if (!res.ok) throw new Error('Failed to fetch scorecards.');
    return res.json();
  }

  public async getCommunity(token: string | null): Promise<CommunityEngagement> {
    const res = await fetch(`${API_BASE}/analytics/community`, {
      method: 'GET',
      headers: this.getHeaders(token),
    });
    if (!res.ok) throw new Error('Failed to fetch community engagement.');
    return res.json();
  }

  public async getSummary(scope: string, token: string | null): Promise<ExecutiveSummary> {
    const res = await fetch(`${API_BASE}/analytics/summary?scope=${encodeURIComponent(scope)}`, {
      method: 'GET',
      headers: this.getHeaders(token),
    });
    if (!res.ok) throw new Error('Failed to fetch executive summary.');
    return res.json();
  }
}

export const analyticsService = new AnalyticsService();
