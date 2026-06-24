import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useNotifications } from './NotificationContext';
import { useEmergency } from './EmergencyContext';
import { healthcareService } from '../services/healthcareService';
import type { 
  MedicalFacility, 
  HealthAdvisory, 
  HealthProgram, 
  HealthResource 
} from '../services/healthcareService';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  timestamp: Date;
  confidence?: number;
  isEmergencyEscalated?: boolean;
  suggestedAction?: string;
  knowledgeSources?: any[];
}

export interface HealthcareAnalytics {
  queriesCount: number;
  facilitySearchesCount: number;
  emergencyEscalationsCount: number;
  advisoryViewsCount: number;
  satisfactionRate: number;
}

interface HealthcareContextType {
  facilities: MedicalFacility[];
  advisories: HealthAdvisory[];
  programs: HealthProgram[];
  resources: HealthResource[];
  chatMessages: ChatMessage[];
  activeFacility: MedicalFacility | null;
  isLoading: boolean;
  analytics: HealthcareAnalytics;
  
  fetchInitialData: () => Promise<void>;
  searchFacilities: (type?: string, radius?: number, lat?: number, lng?: number) => Promise<void>;
  setActiveFacility: (facility: MedicalFacility | null) => void;
  sendChatMessage: (text: string) => Promise<void>;
  escalateMedicalEmergency: (payload: { title: string; description: string; latitude: number; longitude: number; address?: string; ward?: string }) => Promise<any>;
  clearChat: () => void;
  recordAdvisoryView: () => void;
}

const HealthcareContext = createContext<HealthcareContextType | undefined>(undefined);

export const HealthcareProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, isAuthenticated } = useAuth();
  const { showNotification } = useNotifications();
  const { fetchIncidents, refreshDashboardStats } = useEmergency();

  const [facilities, setFacilities] = useState<MedicalFacility[]>([]);
  const [advisories, setAdvisories] = useState<HealthAdvisory[]>([]);
  const [programs, setPrograms] = useState<HealthProgram[]>([]);
  const [resources, setResources] = useState<HealthResource[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [activeFacility, setActiveFacilityState] = useState<MedicalFacility | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [chatSessionId] = useState<string>(() => `health_session_${Math.random().toString(36).substring(7)}`);
  
  // Analytics state
  const [analytics, setAnalytics] = useState<HealthcareAnalytics>({
    queriesCount: 24,
    facilitySearchesCount: 48,
    emergencyEscalationsCount: 2,
    advisoryViewsCount: 112,
    satisfactionRate: 94.2
  });

  const fetchInitialData = useCallback(async () => {
    if (!isAuthenticated || !token) return;
    setIsLoading(true);
    try {
      const [facData, advData, progData, resData] = await Promise.all([
        healthcareService.getFacilities({}, token),
        healthcareService.getAdvisories(token),
        healthcareService.getPrograms(token),
        healthcareService.getResources(token)
      ]);
      setFacilities(facData);
      setAdvisories(advData);
      setPrograms(progData);
      setResources(resData);
    } catch (error) {
      console.error('Failed to pre-fetch healthcare metadata', error);
      showNotification('Failed to sync health resources data.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, token, showNotification]);

  const searchFacilities = useCallback(async (type?: string, radius?: number, lat?: number, lng?: number) => {
    if (!token) return;
    setIsLoading(true);
    try {
      const data = await healthcareService.getFacilities({
        type: type === 'All' ? undefined : type,
        radius_km: radius,
        lat,
        lng
      }, token);
      setFacilities(data);
      setAnalytics(prev => ({
        ...prev,
        facilitySearchesCount: prev.facilitySearchesCount + 1
      }));
    } catch (error) {
      console.error('Failed to search healthcare facilities', error);
      showNotification('Error querying medical centers.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [token, showNotification]);

  const setActiveFacility = useCallback((facility: MedicalFacility | null) => {
    setActiveFacilityState(facility);
  }, []);

  const sendChatMessage = useCallback(async (text: string) => {
    if (!token) return;
    
    // Add user message
    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date()
    };
    setChatMessages(prev => [...prev, userMsg]);
    
    setAnalytics(prev => ({
      ...prev,
      queriesCount: prev.queriesCount + 1
    }));

    try {
      const res = await healthcareService.chat(text, chatSessionId, token);
      const isEsc = res.analysis?.is_emergency || false;
      
      const agentMsg: ChatMessage = {
        id: `agent_${Date.now()}`,
        sender: 'agent',
        text: res.response,
        timestamp: new Date(),
        confidence: res.confidence,
        isEmergencyEscalated: isEsc,
        suggestedAction: res.analysis?.suggested_action,
        knowledgeSources: res.knowledge_sources
      };
      setChatMessages(prev => [...prev, agentMsg]);
      
      if (isEsc) {
        showNotification('ALERT: Potential medical emergency detected. Immediate escalation options unlocked.', 'warning');
      }
    } catch (error) {
      console.error(error);
      const errMsg: ChatMessage = {
        id: `err_${Date.now()}`,
        sender: 'agent',
        text: "I am unable to communicate with the medical advisory engine right now. Please try again or seek direct assistance.",
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, errMsg]);
    }
  }, [token, chatSessionId, showNotification]);

  const escalateMedicalEmergency = useCallback(async (payload: { title: string; description: string; latitude: number; longitude: number; address?: string; ward?: string }) => {
    if (!token) return;
    setIsLoading(true);
    try {
      const data = await healthcareService.escalateEmergency(payload, token);
      showNotification('DISPATCH ACTIVATED: Critical health emergency escalated. Responders alerted.', 'success');
      
      // Update analytics count
      setAnalytics(prev => ({
        ...prev,
        emergencyEscalationsCount: prev.emergencyEscalationsCount + 1
      }));

      // Refresh parent emergency incidents
      await fetchIncidents();
      await refreshDashboardStats();

      return data;
    } catch (error) {
      console.error(error);
      showNotification('Failed to escalate medical emergency to dispatch center.', 'error');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [token, fetchIncidents, refreshDashboardStats, showNotification]);

  const clearChat = useCallback(() => {
    setChatMessages([]);
  }, []);

  const recordAdvisoryView = useCallback(() => {
    setAnalytics(prev => ({
      ...prev,
      advisoryViewsCount: prev.advisoryViewsCount + 1
    }));
  }, []);

  useEffect(() => {
    if (isAuthenticated && token) {
      fetchInitialData();
    }
  }, [isAuthenticated, token, fetchInitialData]);

  return (
    <HealthcareContext.Provider
      value={{
        facilities,
        advisories,
        programs,
        resources,
        chatMessages,
        activeFacility,
        isLoading,
        analytics,
        fetchInitialData,
        searchFacilities,
        setActiveFacility,
        sendChatMessage,
        escalateMedicalEmergency,
        clearChat,
        recordAdvisoryView
      }}
    >
      {children}
    </HealthcareContext.Provider>
  );
};

export const useHealthcare = () => {
  const context = useContext(HealthcareContext);
  if (!context) {
    throw new Error('useHealthcare must be used within a HealthcareProvider');
  }
  return context;
};

export default HealthcareContext;
