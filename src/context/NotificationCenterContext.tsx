import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useNotifications } from './NotificationContext';
import { notificationService } from '../services/notificationService';
import type { 
  NotificationItem, 
  NotificationPreferences, 
  AlertDashboardMetrics, 
  WorkflowRuleItem, 
  WorkflowHistoryItem 
} from '../services/notificationService';

interface NotificationCenterContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  preferences: NotificationPreferences | null;
  workflowRules: WorkflowRuleItem[];
  workflowHistory: WorkflowHistoryItem[];
  metrics: AlertDashboardMetrics | null;
  loading: boolean;
  
  fetchNotifications: () => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  markNotificationsRead: (ids: number[] | null) => Promise<void>;
  archiveNotifications: (ids: number[] | null) => Promise<void>;
  fetchPreferences: () => Promise<void>;
  savePreferences: (prefs: NotificationPreferences) => Promise<void>;
  fetchMetrics: () => Promise<void>;
  fetchWorkflowRules: () => Promise<void>;
  createWorkflowRule: (rule: Omit<WorkflowRuleItem, 'id' | 'created_at'>) => Promise<void>;
  deleteWorkflowRule: (id: number) => Promise<void>;
  fetchWorkflowHistory: () => Promise<void>;
  simulateRuleTrigger: (trigger: string, data: Record<string, any>) => Promise<void>;
}

const NotificationCenterContext = createContext<NotificationCenterContextType | undefined>(undefined);

export const NotificationCenterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, isAuthenticated } = useAuth();
  const { showNotification } = useNotifications();
  
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [workflowRules, setWorkflowRules] = useState<WorkflowRuleItem[]>([]);
  const [workflowHistory, setWorkflowHistory] = useState<WorkflowHistoryItem[]>([]);
  const [metrics, setMetrics] = useState<AlertDashboardMetrics | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    if (!token) return;
    try {
      const data = await notificationService.getNotifications(token);
      setNotifications(data);
    } catch (err: any) {
      console.error(err);
    }
  }, [token]);

  const fetchUnreadCount = useCallback(async () => {
    if (!token) return;
    try {
      const { count } = await notificationService.getUnreadCount(token);
      setUnreadCount(count);
    } catch (err: any) {
      console.error(err);
    }
  }, [token]);

  const fetchPreferences = useCallback(async () => {
    if (!token) return;
    try {
      const data = await notificationService.getPreferences(token);
      setPreferences(data);
    } catch (err: any) {
      console.error(err);
    }
  }, [token]);

  const fetchWorkflowRules = useCallback(async () => {
    if (!token) return;
    try {
      const data = await notificationService.getWorkflowRules(token);
      setWorkflowRules(data);
    } catch (err: any) {
      console.error(err);
    }
  }, [token]);

  const fetchWorkflowHistory = useCallback(async () => {
    if (!token) return;
    try {
      const data = await notificationService.getWorkflowHistory(token);
      setWorkflowHistory(data);
    } catch (err: any) {
      console.error(err);
    }
  }, [token]);

  const fetchMetrics = useCallback(async () => {
    if (!token) return;
    try {
      const data = await notificationService.getAlertsDashboard(token);
      setMetrics(data);
    } catch (err: any) {
      console.error(err);
    }
  }, [token]);

  const markNotificationsRead = async (ids: number[] | null) => {
    if (!token) return;
    try {
      await notificationService.markRead(ids, token);
      await fetchNotifications();
      await fetchUnreadCount();
      await fetchMetrics();
      showNotification('Notifications marked as read.', 'success');
    } catch (err: any) {
      showNotification(err.message || 'Failed to mark notifications read.', 'error');
    }
  };

  const archiveNotifications = async (ids: number[] | null) => {
    if (!token) return;
    try {
      await notificationService.archive(ids, token);
      await fetchNotifications();
      await fetchUnreadCount();
      await fetchMetrics();
      showNotification('Notifications archived successfully.', 'success');
    } catch (err: any) {
      showNotification(err.message || 'Failed to archive notifications.', 'error');
    }
  };

  const savePreferences = async (newPrefs: NotificationPreferences) => {
    if (!token) return;
    try {
      await notificationService.savePreferences(newPrefs, token);
      setPreferences(newPrefs);
      showNotification('Preferences updated.', 'success');
    } catch (err: any) {
      showNotification(err.message || 'Failed to update preferences.', 'error');
    }
  };

  const createWorkflowRule = async (rule: Omit<WorkflowRuleItem, 'id' | 'created_at'>) => {
    if (!token) return;
    try {
      await notificationService.createWorkflowRule(rule, token);
      await fetchWorkflowRules();
      await fetchMetrics();
      showNotification('Custom workflow rule created.', 'success');
    } catch (err: any) {
      showNotification(err.message || 'Failed to create rule.', 'error');
    }
  };

  const deleteWorkflowRule = async (id: number) => {
    if (!token) return;
    try {
      await notificationService.deleteWorkflowRule(id, token);
      await fetchWorkflowRules();
      await fetchMetrics();
      showNotification('Workflow rule deleted.', 'success');
    } catch (err: any) {
      showNotification(err.message || 'Failed to delete rule.', 'error');
    }
  };

  const simulateRuleTrigger = async (trigger: string, data: Record<string, any>) => {
    if (!token) return;
    try {
      await notificationService.simulateTrigger(trigger, data, token);
      // Give a tiny delay for backend process before reloading
      setTimeout(async () => {
        await fetchNotifications();
        await fetchUnreadCount();
        await fetchWorkflowHistory();
        await fetchMetrics();
      }, 1000);
      showNotification(`Simulated trigger: ${trigger}`, 'success');
    } catch (err: any) {
      showNotification(err.message || 'Simulation failed.', 'error');
    }
  };

  // Bulk load all context data when user is authenticated
  useEffect(() => {
    if (isAuthenticated && token) {
      setLoading(true);
      Promise.all([
        fetchNotifications(),
        fetchUnreadCount(),
        fetchPreferences(),
        fetchWorkflowRules(),
        fetchWorkflowHistory(),
        fetchMetrics()
      ]).finally(() => setLoading(false));
    } else {
      setNotifications([]);
      setUnreadCount(0);
      setPreferences(null);
      setWorkflowRules([]);
      setWorkflowHistory([]);
      setMetrics(null);
    }
  }, [isAuthenticated, token, fetchNotifications, fetchUnreadCount, fetchPreferences, fetchWorkflowRules, fetchWorkflowHistory, fetchMetrics]);

  return (
    <NotificationCenterContext.Provider value={{
      notifications,
      unreadCount,
      preferences,
      workflowRules,
      workflowHistory,
      metrics,
      loading,
      fetchNotifications,
      fetchUnreadCount,
      markNotificationsRead,
      archiveNotifications,
      fetchPreferences,
      savePreferences,
      fetchMetrics,
      fetchWorkflowRules,
      createWorkflowRule,
      deleteWorkflowRule,
      fetchWorkflowHistory,
      simulateRuleTrigger
    }}>
      {children}
    </NotificationCenterContext.Provider>
  );
};

export const useNotificationCenter = () => {
  const context = useContext(NotificationCenterContext);
  if (!context) {
    throw new Error('useNotificationCenter must be used within a NotificationCenterProvider');
  }
  return context;
};
