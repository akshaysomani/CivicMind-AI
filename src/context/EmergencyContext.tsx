import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useNotifications } from './NotificationContext';
import { emergencyService } from '../services/emergencyService';
import type { 
  EmergencyIncident, 
  EmergencyTimelineEvent, 
  EmergencyResource, 
  EmergencyDashboardStats 
} from '../services/emergencyService';

interface EmergencyContextType {
  dashboardStats: EmergencyDashboardStats | null;
  incidents: EmergencyIncident[];
  activeIncident: EmergencyIncident | null;
  timelineEvents: EmergencyTimelineEvent[];
  allocatedResources: EmergencyResource[];
  isLoading: boolean;

  refreshDashboardStats: () => Promise<void>;
  fetchIncidents: (status?: string | null) => Promise<void>;
  selectIncident: (incident: EmergencyIncident | null) => Promise<void>;
  classifyNewIncident: (payload: { report_id?: number; title: string; description: string; latitude: number; longitude: number; address?: string; ward?: string }) => Promise<void>;
  respondToIncidentWithPlaybook: (incidentId: number, playbookName: string, assignedOfficerId: number | null) => Promise<void>;
  overrideIncidentParams: (id: number, severity: string, priority: string, radius: number, depts: string[]) => Promise<void>;
}

const EmergencyContext = createContext<EmergencyContextType | undefined>(undefined);

export const EmergencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, isAuthenticated } = useAuth();
  const { showNotification } = useNotifications();

  const [dashboardStats, setDashboardStats] = useState<EmergencyDashboardStats | null>(null);
  const [incidents, setIncidents] = useState<EmergencyIncident[]>([]);
  const [activeIncident, setActiveIncident] = useState<EmergencyIncident | null>(null);
  const [timelineEvents, setTimelineEvents] = useState<EmergencyTimelineEvent[]>([]);
  const [allocatedResources, setAllocatedResources] = useState<EmergencyResource[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const refreshDashboardStats = useCallback(async () => {
    if (!isAuthenticated || !token) return;
    try {
      const stats = await emergencyService.getDashboard(token);
      setDashboardStats(stats);
    } catch (error) {
      console.error('Failed to sync emergency command center metrics', error);
    }
  }, [isAuthenticated, token]);

  const fetchIncidents = useCallback(async (status: string | null = null) => {
    if (!isAuthenticated || !token) return;
    setIsLoading(true);
    try {
      const data = await emergencyService.getIncidents(status, token);
      setIncidents(data);
    } catch (error) {
      console.error('Failed to query active emergency incidents', error);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, token]);

  const selectIncident = useCallback(async (incident: EmergencyIncident | null) => {
    setActiveIncident(incident);
    if (!incident || !token) {
      setTimelineEvents([]);
      setAllocatedResources([]);
      return;
    }

    try {
      const [events, resources] = await Promise.all([
        emergencyService.getTimeline(incident.id, token),
        emergencyService.getResources(incident.id, token)
      ]);
      setTimelineEvents(events);
      setAllocatedResources(resources);
    } catch (error) {
      console.error('Failed to load incident detail logs', error);
    }
  }, [token]);

  const classifyNewIncident = useCallback(async (payload: { report_id?: number; title: string; description: string; latitude: number; longitude: number; address?: string; ward?: string }) => {
    if (!isAuthenticated || !token) return;
    setIsLoading(true);
    try {
      const incident = await emergencyService.classifyIncident(payload, token);
      showNotification(`Emergency Incident classified as '${incident.type}' and queued.`, 'success');
      await fetchIncidents();
      await refreshDashboardStats();
    } catch (error) {
      showNotification('Failed to classify emergency incident.', 'error');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, token, fetchIncidents, refreshDashboardStats, showNotification]);

  const respondToIncidentWithPlaybook = useCallback(async (incidentId: number, playbookName: string, assignedOfficerId: number | null) => {
    if (!isAuthenticated || !token) return;
    setIsLoading(true);
    try {
      const result = await emergencyService.respondToIncident(incidentId, playbookName, assignedOfficerId, token);
      if (result.status === 'success') {
        showNotification(`Activated Playbook '${playbookName}'. Responders dispatched.`, 'success');
        await selectIncident(result.incident);
        await fetchIncidents();
        await refreshDashboardStats();
      }
    } catch (error) {
      showNotification('Failed to trigger response actions.', 'error');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, token, selectIncident, fetchIncidents, refreshDashboardStats, showNotification]);

  const overrideIncidentParams = useCallback(async (id: number, severity: string, priority: string, radius: number, depts: string[]) => {
    if (!isAuthenticated || !token) return;
    setIsLoading(true);
    try {
      const updated = await emergencyService.overrideIncident(
        id, 
        { 
          severity, 
          priority, 
          affected_radius_meters: radius, 
          suggested_departments: depts 
        }, 
        token
      );
      showNotification('Emergency manual override configurations applied.', 'success');
      await selectIncident(updated);
      await fetchIncidents();
      await refreshDashboardStats();
    } catch (error) {
      showNotification('Failed to save manual override updates.', 'error');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, token, selectIncident, fetchIncidents, refreshDashboardStats, showNotification]);

  useEffect(() => {
    if (isAuthenticated && token) {
      refreshDashboardStats();
      fetchIncidents();
    }
  }, [isAuthenticated, token, refreshDashboardStats, fetchIncidents]);

  return (
    <EmergencyContext.Provider
      value={{
        dashboardStats,
        incidents,
        activeIncident,
        timelineEvents,
        allocatedResources,
        isLoading,
        refreshDashboardStats,
        fetchIncidents,
        selectIncident,
        classifyNewIncident,
        respondToIncidentWithPlaybook,
        overrideIncidentParams
      }}
    >
      {children}
    </EmergencyContext.Provider>
  );
};

export const useEmergency = () => {
  const context = useContext(EmergencyContext);
  if (!context) {
    throw new Error('useEmergency must be used within an EmergencyProvider');
  }
  return context;
};
export default EmergencyContext;
