const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

export interface NotificationItem {
  id: number;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

export interface NotificationPreferences {
  email_enabled: boolean;
  sms_enabled: boolean;
  in_app_enabled: boolean;
  push_enabled: boolean;
  quiet_hours_start: string | null;
  quiet_hours_end: string | null;
}

export interface AlertDashboardMetrics {
  total_sent: number;
  unread_count: number;
  sent_by_type: Record<string, number>;
  active_rules_count: number;
  failed_runs_count: number;
  success_runs_count: number;
}

export interface WorkflowRuleItem {
  id: number;
  name: string;
  trigger: string;
  condition: string | null;
  action: string;
  delay: number;
  is_active: boolean;
  created_at: string;
}

export interface WorkflowHistoryItem {
  id: number;
  rule_id: number | null;
  rule_name: string;
  trigger_event: string;
  execution_status: 'success' | 'failed' | 'delayed';
  details: string | null;
  executed_at: string;
}

class NotificationService {
  private getHeaders(token?: string | null): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  public async getNotifications(token: string | null): Promise<NotificationItem[]> {
    const res = await fetch(`${API_BASE}/notifications`, {
      method: 'GET',
      headers: this.getHeaders(token),
    });
    if (!res.ok) throw new Error('Failed to fetch notifications.');
    return res.json();
  }

  public async getUnreadCount(token: string | null): Promise<{ count: number }> {
    const res = await fetch(`${API_BASE}/notifications/unread`, {
      method: 'GET',
      headers: this.getHeaders(token),
    });
    if (!res.ok) throw new Error('Failed to fetch unread notification count.');
    return res.json();
  }

  public async markRead(ids: number[] | null, token: string | null): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/notifications/read`, {
      method: 'POST',
      headers: this.getHeaders(token),
      body: JSON.stringify({ ids }),
    });
    if (!res.ok) throw new Error('Failed to mark notifications as read.');
    return res.json();
  }

  public async archive(ids: number[] | null, token: string | null): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/notifications/archive`, {
      method: 'POST',
      headers: this.getHeaders(token),
      body: JSON.stringify({ ids }),
    });
    if (!res.ok) throw new Error('Failed to archive notifications.');
    return res.json();
  }

  public async getPreferences(token: string | null): Promise<NotificationPreferences> {
    const res = await fetch(`${API_BASE}/notifications/preferences`, {
      method: 'GET',
      headers: this.getHeaders(token),
    });
    if (!res.ok) throw new Error('Failed to fetch notification preferences.');
    return res.json();
  }

  public async savePreferences(prefs: NotificationPreferences, token: string | null): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/notifications/preferences`, {
      method: 'POST',
      headers: this.getHeaders(token),
      body: JSON.stringify(prefs),
    });
    if (!res.ok) throw new Error('Failed to update notification preferences.');
    return res.json();
  }

  public async getAlertsDashboard(token: string | null): Promise<AlertDashboardMetrics> {
    const res = await fetch(`${API_BASE}/notifications/alerts/dashboard`, {
      method: 'GET',
      headers: this.getHeaders(token),
    });
    if (!res.ok) throw new Error('Failed to fetch alerts dashboard metrics.');
    return res.json();
  }

  public async getWorkflowRules(token: string | null): Promise<WorkflowRuleItem[]> {
    const res = await fetch(`${API_BASE}/notifications/workflow/rules`, {
      method: 'GET',
      headers: this.getHeaders(token),
    });
    if (!res.ok) throw new Error('Failed to fetch workflow rules.');
    return res.json();
  }

  public async createWorkflowRule(
    rule: Omit<WorkflowRuleItem, 'id' | 'created_at'>,
    token: string | null
  ): Promise<{ id: number; name: string; message: string }> {
    const res = await fetch(`${API_BASE}/notifications/workflow/rules`, {
      method: 'POST',
      headers: this.getHeaders(token),
      body: JSON.stringify(rule),
    });
    if (!res.ok) throw new Error('Failed to create workflow rule.');
    return res.json();
  }

  public async deleteWorkflowRule(ruleId: number, token: string | null): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/notifications/workflow/rules/${ruleId}`, {
      method: 'DELETE',
      headers: this.getHeaders(token),
    });
    if (!res.ok) throw new Error('Failed to delete workflow rule.');
    return res.json();
  }

  public async getWorkflowHistory(token: string | null): Promise<WorkflowHistoryItem[]> {
    const res = await fetch(`${API_BASE}/notifications/workflow/history`, {
      method: 'GET',
      headers: this.getHeaders(token),
    });
    if (!res.ok) throw new Error('Failed to fetch workflow history logs.');
    return res.json();
  }

  public async simulateTrigger(
    trigger: string,
    data: Record<string, any>,
    token: string | null
  ): Promise<{ status: string; trigger: string; message: string }> {
    const res = await fetch(`${API_BASE}/notifications/workflow/rules/simulate`, {
      method: 'POST',
      headers: this.getHeaders(token),
      body: JSON.stringify({ trigger, data }),
    });
    if (!res.ok) throw new Error('Failed to simulate workflow event trigger.');
    return res.json();
  }
}

export const notificationService = new NotificationService();
