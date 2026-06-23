const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

export interface EmergencyIncident {
  id: number;
  report_id?: number;
  title: string;
  description: string;
  type: string;
  severity: 'Minor' | 'Moderate' | 'High' | 'Critical' | 'Catastrophic';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent' | 'Emergency' | 'Critical';
  status: 'Reported' | 'Verified' | 'Assigned' | 'Response Started' | 'Resources Deployed' | 'Citizen Updated' | 'Resolved' | 'Closed';
  address?: string;
  ward?: string;
  latitude?: number;
  longitude?: number;
  affected_radius_meters: number;
  ai_confidence: number;
  ai_reasoning?: string;
  suggested_departments?: string[];
  estimated_response_minutes: number;
  escalation_level: number;
  assigned_officer_id?: number;
  created_at: string;
  updated_at: string;
}

export interface EmergencyTimelineEvent {
  id: number;
  incident_id: number;
  event: string;
  note?: string;
  timestamp: string;
}

export interface EmergencyResource {
  id: number;
  incident_id: number;
  name: string;
  type: string;
  status: 'Standby' | 'Dispatched' | 'On Site' | 'Released';
  allocated_count: number;
  confidence: number;
  timestamp: string;
}

export interface EmergencyDashboardStats {
  total_incidents: number;
  active_incidents: number;
  critical_incidents: number;
  avg_response_time: string;
  escalated_count: number;
  severity_distribution: Record<string, number>;
  department_usage: Record<string, number>;
  ai_average_confidence: number;
}

export interface AIAnalysisResult {
  is_emergency: boolean;
  incident_type: string;
  severity: string;
  priority: string;
  confidence_score: number;
  radius_meters: number;
  suggested_departments: string[];
  recommended_resources: { type: string; count: number }[];
  reasoning_summary: string;
  citizen_guidance: string;
  government_guidance: string;
}

class EmergencyService {
  private getHeaders(token?: string | null): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  public async analyzeEmergency(query: string, location: string | null, token: string | null): Promise<AIAnalysisResult> {
    const res = await fetch(`${API_BASE}/ai/emergency/analyze`, {
      method: 'POST',
      headers: this.getHeaders(token),
      body: JSON.stringify({ query, location }),
    });
    if (!res.ok) throw new Error('Emergency AI analysis failed.');
    return res.json();
  }

  public async classifyIncident(
    payload: { report_id?: number; title: string; description: string; latitude: number; longitude: number; address?: string; ward?: string },
    token: string | null
  ): Promise<EmergencyIncident> {
    const res = await fetch(`${API_BASE}/ai/emergency/classify`, {
      method: 'POST',
      headers: this.getHeaders(token),
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to classify and log emergency incident.');
    return res.json();
  }

  public async respondToIncident(
    incidentId: number,
    playbookName: string,
    assignedOfficerId: number | null,
    token: string | null
  ): Promise<{ status: string; incident: EmergencyIncident }> {
    const res = await fetch(`${API_BASE}/ai/emergency/respond`, {
      method: 'POST',
      headers: this.getHeaders(token),
      body: JSON.stringify({ incident_id: incidentId, playbook_name: playbookName, assigned_officer_id: assignedOfficerId }),
    });
    if (!res.ok) throw new Error('Failed to deploy response actions.');
    return res.json();
  }

  public async getIncidents(status: string | null, token: string | null): Promise<EmergencyIncident[]> {
    let url = `${API_BASE}/ai/emergency/incidents`;
    if (status) {
      url += `?status=${encodeURIComponent(status)}`;
    }
    const res = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders(token),
    });
    if (!res.ok) throw new Error('Failed to fetch emergency incidents.');
    return res.json();
  }

  public async getTimeline(incidentId: number, token: string | null): Promise<EmergencyTimelineEvent[]> {
    const res = await fetch(`${API_BASE}/ai/emergency/timeline?incident_id=${incidentId}`, {
      method: 'GET',
      headers: this.getHeaders(token),
    });
    if (!res.ok) throw new Error('Failed to retrieve timeline events.');
    return res.json();
  }

  public async getResources(incidentId: number, token: string | null): Promise<EmergencyResource[]> {
    const res = await fetch(`${API_BASE}/ai/emergency/resources?incident_id=${incidentId}`, {
      method: 'GET',
      headers: this.getHeaders(token),
    });
    if (!res.ok) throw new Error('Failed to load incident resources.');
    return res.json();
  }

  public async getDashboard(token: string | null): Promise<EmergencyDashboardStats> {
    const res = await fetch(`${API_BASE}/ai/emergency/dashboard`, {
      method: 'GET',
      headers: this.getHeaders(token),
    });
    if (!res.ok) throw new Error('Failed to query command center dashboard metrics.');
    return res.json();
  }

  public async overrideIncident(
    id: number,
    payload: { severity: string; priority: string; affected_radius_meters: number; suggested_departments: string[] },
    token: string | null
  ): Promise<EmergencyIncident> {
    const res = await fetch(`${API_BASE}/ai/emergency/incidents/${id}/override`, {
      method: 'POST',
      headers: this.getHeaders(token),
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to commit manual override verification parameters.');
    return res.json();
  }
}

export const emergencyService = new EmergencyService();
export default emergencyService;
