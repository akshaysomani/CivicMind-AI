const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

export interface ReportContent {
  executive_summary: string;
  key_metrics: {
    total_users: number;
    active_reports: number;
    resolved_reports: number;
    active_emergencies: number;
    emergency_response_rate: string;
  };
  important_trends: string[];
  risk_assessment: {
    overall_risk_level: string;
    critical_risks: {
      domain: string;
      description: string;
      likelihood: string;
      severity: string;
    }[];
  };
  department_highlights: {
    department: string;
    performance_score: number;
    summary: string;
  }[];
  geospatial_highlights: {
    hotspots: {
      ward: string;
      type: string;
      count: number;
    }[];
  };
  ai_insights: string[];
  recommendations: {
    actionable_item: string;
    priority: string;
    confidence: number;
    evidence: string;
    responsible_department: string;
    expected_impact: string;
    suggested_timeline: string;
  }[];
  confidence_score: number;
  limitations: string;
}

export interface ExecutiveReportItem {
  id: number;
  title: string;
  report_type: string;
  created_at: string;
  content: ReportContent;
}

export interface ReportTemplateItem {
  id: string;
  name: string;
  description: string;
}

export interface ScheduledReportItem {
  id: number;
  name: string;
  report_type: string;
  frequency: string;
  recipients: string[];
  is_active: boolean;
  created_at: string;
}

export interface DecisionBriefingItem {
  role: string;
  title: string;
  briefing_text: string;
  urgent_actions: { title: string; priority: string }[];
  timestamp: string;
}

export interface ReportingDashboardMetrics {
  latest_reports_count: number;
  resolved_reports_count: number;
  active_emergencies_count: number;
  critical_risks: { domain: string; description: string; severity: string }[];
  executive_kpis: {
    resolution_rate: string;
    system_users: number;
    deployed_rules: number;
  };
  department_performance: { name: string; score: number; status: string }[];
}

class ReportingService {
  private getHeaders(token?: string | null): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  public async getSavedReports(token: string | null): Promise<ExecutiveReportItem[]> {
    const res = await fetch(`${API_BASE}/reports`, {
      method: 'GET',
      headers: this.getHeaders(token),
    });
    if (!res.ok) throw new Error('Failed to fetch saved reports.');
    return res.json();
  }

  public async getTemplates(token: string | null): Promise<ReportTemplateItem[]> {
    const res = await fetch(`${API_BASE}/reports/templates`, {
      method: 'GET',
      headers: this.getHeaders(token),
    });
    if (!res.ok) throw new Error('Failed to fetch report templates.');
    return res.json();
  }

  public async generateReport(
    payload: { report_type: string; category?: string; ward?: string },
    token: string | null
  ): Promise<ExecutiveReportItem> {
    const res = await fetch(`${API_BASE}/reports/generate`, {
      method: 'POST',
      headers: this.getHeaders(token),
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to generate report via AI reporting agent.');
    return res.json();
  }

  public async deleteReport(reportId: number, token: string | null): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/reports/${reportId}`, {
      method: 'DELETE',
      headers: this.getHeaders(token),
    });
    if (!res.ok) throw new Error('Failed to delete report.');
    return res.json();
  }

  public async scheduleReport(
    payload: { name: string; report_type: string; frequency: string; recipients: string[] },
    token: string | null
  ): Promise<ScheduledReportItem> {
    const res = await fetch(`${API_BASE}/reports/schedule`, {
      method: 'POST',
      headers: this.getHeaders(token),
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to schedule recurring report.');
    return res.json();
  }

  public async getScheduledReports(token: string | null): Promise<ScheduledReportItem[]> {
    const res = await fetch(`${API_BASE}/reports/scheduled`, {
      method: 'GET',
      headers: this.getHeaders(token),
    });
    if (!res.ok) throw new Error('Failed to fetch scheduled configurations.');
    return res.json();
  }

  public async deleteScheduledReport(scheduleId: number, token: string | null): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/reports/scheduled/${scheduleId}`, {
      method: 'DELETE',
      headers: this.getHeaders(token),
    });
    if (!res.ok) throw new Error('Failed to delete scheduled report setup.');
    return res.json();
  }

  public async getBriefings(token: string | null): Promise<DecisionBriefingItem[]> {
    const res = await fetch(`${API_BASE}/reports/briefings`, {
      method: 'GET',
      headers: this.getHeaders(token),
    });
    if (!res.ok) throw new Error('Failed to fetch decision briefings.');
    return res.json();
  }

  public async getDashboardMetrics(token: string | null): Promise<ReportingDashboardMetrics> {
    const res = await fetch(`${API_BASE}/reports/dashboard`, {
      method: 'GET',
      headers: this.getHeaders(token),
    });
    if (!res.ok) throw new Error('Failed to fetch reporting dashboard summaries.');
    return res.json();
  }

  public async exportReport(reportId: number, format: string, token: string | null): Promise<void> {
    const res = await fetch(`${API_BASE}/reports/export`, {
      method: 'POST',
      headers: this.getHeaders(token),
      body: JSON.stringify({ report_id: reportId, format }),
    });
    if (!res.ok) throw new Error('Failed to export document.');
    
    // Get headers to determine name
    const disposition = res.headers.get('Content-Disposition');
    let filename = `export.${format}`;
    if (disposition && disposition.indexOf('filename=') !== -1) {
      filename = disposition.split('filename=')[1].trim();
    }
    
    const blob = await res.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  }
}

export const reportingService = new ReportingService();
