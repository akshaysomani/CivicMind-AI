import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useNotifications } from './NotificationContext';
import { reportingService } from '../services/reportingService';
import type { 
  ExecutiveReportItem, 
  ReportTemplateItem, 
  ScheduledReportItem, 
  DecisionBriefingItem, 
  ReportingDashboardMetrics 
} from '../services/reportingService';

interface ReportingContextType {
  savedReports: ExecutiveReportItem[];
  templates: ReportTemplateItem[];
  scheduledReports: ScheduledReportItem[];
  briefings: DecisionBriefingItem[];
  dashboardMetrics: ReportingDashboardMetrics | null;
  loading: boolean;
  
  fetchSavedReports: () => Promise<void>;
  fetchTemplates: () => Promise<void>;
  generateReport: (payload: { report_type: string; category?: string; ward?: string }) => Promise<ExecutiveReportItem | null>;
  deleteReport: (id: number) => Promise<void>;
  scheduleReport: (payload: { name: string; report_type: string; frequency: string; recipients: string[] }) => Promise<void>;
  fetchScheduledReports: () => Promise<void>;
  deleteScheduledReport: (id: number) => Promise<void>;
  fetchBriefings: () => Promise<void>;
  fetchDashboardMetrics: () => Promise<void>;
  exportReport: (reportId: number, format: string) => Promise<void>;
}

const ReportingContext = createContext<ReportingContextType | undefined>(undefined);

export const ReportingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, isAuthenticated } = useAuth();
  const { showNotification } = useNotifications();

  const [savedReports, setSavedReports] = useState<ExecutiveReportItem[]>([]);
  const [templates, setTemplates] = useState<ReportTemplateItem[]>([]);
  const [scheduledReports, setScheduledReports] = useState<ScheduledReportItem[]>([]);
  const [briefings, setBriefings] = useState<DecisionBriefingItem[]>([]);
  const [dashboardMetrics, setDashboardMetrics] = useState<ReportingDashboardMetrics | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchSavedReports = useCallback(async () => {
    if (!token) return;
    try {
      const data = await reportingService.getSavedReports(token);
      setSavedReports(data);
    } catch (err: any) {
      console.error(err);
    }
  }, [token]);

  const fetchTemplates = useCallback(async () => {
    if (!token) return;
    try {
      const data = await reportingService.getTemplates(token);
      setTemplates(data);
    } catch (err: any) {
      console.error(err);
    }
  }, [token]);

  const fetchScheduledReports = useCallback(async () => {
    if (!token) return;
    try {
      const data = await reportingService.getScheduledReports(token);
      setScheduledReports(data);
    } catch (err: any) {
      console.error(err);
    }
  }, [token]);

  const fetchBriefings = useCallback(async () => {
    if (!token) return;
    try {
      const data = await reportingService.getBriefings(token);
      setBriefings(data);
    } catch (err: any) {
      console.error(err);
    }
  }, [token]);

  const fetchDashboardMetrics = useCallback(async () => {
    if (!token) return;
    try {
      const data = await reportingService.getDashboardMetrics(token);
      setDashboardMetrics(data);
    } catch (err: any) {
      console.error(err);
    }
  }, [token]);

  const generateReport = async (payload: { report_type: string; category?: string; ward?: string }) => {
    if (!token) return null;
    try {
      showNotification('Generating report via Gemini AI...', 'info');
      const newReport = await reportingService.generateReport(payload, token);
      await fetchSavedReports();
      await fetchDashboardMetrics();
      showNotification('Report generated and saved successfully.', 'success');
      return newReport;
    } catch (err: any) {
      showNotification(err.message || 'Failed to generate report.', 'error');
      return null;
    }
  };

  const deleteReport = async (id: number) => {
    if (!token) return;
    try {
      await reportingService.deleteReport(id, token);
      setSavedReports(prev => prev.filter(r => r.id !== id));
      await fetchDashboardMetrics();
      showNotification('Report deleted successfully.', 'success');
    } catch (err: any) {
      showNotification(err.message || 'Failed to delete report.', 'error');
    }
  };

  const scheduleReport = async (payload: { name: string; report_type: string; frequency: string; recipients: string[] }) => {
    if (!token) return;
    try {
      await reportingService.scheduleReport(payload, token);
      await fetchScheduledReports();
      showNotification('Recurring report schedule registered.', 'success');
    } catch (err: any) {
      showNotification(err.message || 'Failed to register schedule.', 'error');
    }
  };

  const deleteScheduledReport = async (id: number) => {
    if (!token) return;
    try {
      await reportingService.deleteScheduledReport(id, token);
      setScheduledReports(prev => prev.filter(s => s.id !== id));
      showNotification('Recurring report schedule deleted.', 'success');
    } catch (err: any) {
      showNotification(err.message || 'Failed to delete schedule setup.', 'error');
    }
  };

  const exportReport = async (reportId: number, format: string) => {
    if (!token) return;
    try {
      showNotification(`Preparing ${format.toUpperCase()} export...`, 'info');
      await reportingService.exportReport(reportId, format, token);
      showNotification(`${format.toUpperCase()} document downloaded.`, 'success');
    } catch (err: any) {
      showNotification(err.message || 'Failed to export document.', 'error');
    }
  };

  // Bulk load all context data when user is authenticated
  useEffect(() => {
    if (isAuthenticated && token) {
      setLoading(true);
      Promise.all([
        fetchSavedReports(),
        fetchTemplates(),
        fetchScheduledReports(),
        fetchBriefings(),
        fetchDashboardMetrics()
      ]).finally(() => setLoading(false));
    } else {
      setSavedReports([]);
      setTemplates([]);
      setScheduledReports([]);
      setBriefings([]);
      setDashboardMetrics(null);
    }
  }, [isAuthenticated, token, fetchSavedReports, fetchTemplates, fetchScheduledReports, fetchBriefings, fetchDashboardMetrics]);

  return (
    <ReportingContext.Provider value={{
      savedReports,
      templates,
      scheduledReports,
      briefings,
      dashboardMetrics,
      loading,
      fetchSavedReports,
      fetchTemplates,
      generateReport,
      deleteReport,
      scheduleReport,
      fetchScheduledReports,
      deleteScheduledReport,
      fetchBriefings,
      fetchDashboardMetrics,
      exportReport
    }}>
      {children}
    </ReportingContext.Provider>
  );
};

export const useReporting = () => {
  const context = useContext(ReportingContext);
  if (!context) {
    throw new Error('useReporting must be used within a ReportingProvider');
  }
  return context;
};
export default ReportingContext;
