import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useNotifications } from './NotificationContext';
import { schemeService } from '../services/schemeService';
import type { 
  Scheme, 
  EligibilityResult, 
  SavedSchemeBookmark, 
  GovernmentOffice, 
  SchemeResourceFAQ 
} from '../services/schemeService';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  timestamp: Date;
  confidence?: number;
  recommendations?: { id: number; title: string; category: string; reason: string }[];
  knowledgeSources?: any[];
}

export interface SchemeAnalytics {
  searchesCount: number;
  eligibilityChecksCount: number;
  recommendationsViewedCount: number;
  savedSchemesCount: number;
  comparisonsCount: number;
  satisfactionRate: number;
}

interface SchemeContextType {
  schemes: Scheme[];
  recommendations: Scheme[];
  eligibilityResults: EligibilityResult[];
  savedSchemes: SavedSchemeBookmark[];
  offices: GovernmentOffice[];
  resources: SchemeResourceFAQ[];
  chatMessages: ChatMessage[];
  compareSchemes: Scheme[];
  activeOffice: GovernmentOffice | null;
  isLoading: boolean;
  analytics: SchemeAnalytics;
  
  fetchInitialData: () => Promise<void>;
  searchSchemes: (query: string, category: string) => Promise<void>;
  runEligibilityCheck: (profile: any) => Promise<void>;
  saveScheme: (scheme: Scheme) => Promise<void>;
  unsaveScheme: (bookmarkId: number) => Promise<void>;
  loadComparison: (ids: number[]) => Promise<void>;
  clearComparison: () => void;
  sendChatMessage: (text: string) => Promise<void>;
  clearChat: () => void;
  setActiveOffice: (office: GovernmentOffice | null) => void;
  searchOffices: (radius?: number, lat?: number, lng?: number) => Promise<void>;
}

const SchemeContext = createContext<SchemeContextType | undefined>(undefined);

export const SchemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, isAuthenticated } = useAuth();
  const { showNotification } = useNotifications();

  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [recommendations, setRecommendations] = useState<Scheme[]>([]);
  const [eligibilityResults, setEligibilityResults] = useState<EligibilityResult[]>([]);
  const [savedSchemes, setSavedSchemes] = useState<SavedSchemeBookmark[]>([]);
  const [offices, setOffices] = useState<GovernmentOffice[]>([]);
  const [resources, setResources] = useState<SchemeResourceFAQ[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [compareSchemes, setCompareSchemes] = useState<Scheme[]>([]);
  const [activeOffice, setActiveOfficeState] = useState<GovernmentOffice | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [chatSessionId] = useState<string>(() => `scheme_session_${Math.random().toString(36).substring(7)}`);

  // Analytics state
  const [analytics, setAnalytics] = useState<SchemeAnalytics>({
    searchesCount: 42,
    eligibilityChecksCount: 18,
    recommendationsViewedCount: 95,
    savedSchemesCount: 0,
    comparisonsCount: 8,
    satisfactionRate: 96.5
  });

  const fetchInitialData = useCallback(async () => {
    if (!isAuthenticated || !token) return;
    setIsLoading(true);
    try {
      const [recData, savedData, officeData, resData, searchData] = await Promise.all([
        schemeService.getRecommendations(null, token),
        schemeService.getSavedBookmarks(token),
        schemeService.getOffices({}, token),
        schemeService.getResources(token),
        schemeService.search('', 'All', token)
      ]);
      setRecommendations(recData);
      setSavedSchemes(savedData);
      setOffices(officeData);
      setResources(resData);
      setSchemes(searchData);
      
      setAnalytics(prev => ({
        ...prev,
        savedSchemesCount: savedData.length
      }));
    } catch (error) {
      console.error('Failed to pre-fetch schemes data assets', error);
      showNotification('Failed to sync schemes resource libraries.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, token, showNotification]);

  const searchSchemes = useCallback(async (query: string, category: string) => {
    if (!token) return;
    setIsLoading(true);
    try {
      const data = await schemeService.search(query, category, token);
      setSchemes(data);
      setAnalytics(prev => ({
        ...prev,
        searchesCount: prev.searchesCount + 1
      }));
    } catch (error) {
      console.error('Failed to query schemes', error);
      showNotification('Error searching government schemes.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [token, showNotification]);

  const runEligibilityCheck = useCallback(async (profile: any) => {
    if (!token) return;
    setIsLoading(true);
    try {
      const data = await schemeService.checkEligibility(profile, token);
      setEligibilityResults(data);
      
      setAnalytics(prev => ({
        ...prev,
        eligibilityChecksCount: prev.eligibilityChecksCount + 1
      }));
      showNotification('Eligibility check completed. Profile reasoning loaded below.', 'success');
    } catch (error) {
      console.error(error);
      showNotification('Failed to execute eligibility constraints engine.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [token, showNotification]);

  const saveScheme = useCallback(async (scheme: Scheme) => {
    if (!token) return;
    try {
      const res = await schemeService.saveBookmark({
        scheme_id: scheme.id,
        scheme_title: scheme.title,
        scheme_category: scheme.category
      }, token);
      
      if (res.status === 'success') {
        showNotification(`Saved '${scheme.title}' to your bookmarks list.`, 'success');
        const updatedBookmarks = await schemeService.getSavedBookmarks(token);
        setSavedSchemes(updatedBookmarks);
        setAnalytics(prev => ({
          ...prev,
          savedSchemesCount: updatedBookmarks.length
        }));
      } else if (res.status === 'already_saved') {
        showNotification('Scheme is already in your bookmarked saved list.', 'info');
      }
    } catch (error) {
      console.error(error);
      showNotification('Failed to bookmark scheme.', 'error');
    }
  }, [token, showNotification]);

  const unsaveScheme = useCallback(async (bookmarkId: number) => {
    if (!token) return;
    try {
      const res = await schemeService.deleteBookmark(bookmarkId, token);
      if (res.status === 'success') {
        showNotification('Removed scheme bookmark.', 'success');
        const updatedBookmarks = await schemeService.getSavedBookmarks(token);
        setSavedSchemes(updatedBookmarks);
        setAnalytics(prev => ({
          ...prev,
          savedSchemesCount: updatedBookmarks.length
        }));
      }
    } catch (error) {
      console.error(error);
      showNotification('Failed to delete scheme bookmark.', 'error');
    }
  }, [token, showNotification]);

  const loadComparison = useCallback(async (ids: number[]) => {
    if (!token || ids.length === 0) {
      setCompareSchemes([]);
      return;
    }
    setIsLoading(true);
    try {
      const data = await schemeService.compare(ids, token);
      setCompareSchemes(data);
      setAnalytics(prev => ({
        ...prev,
        comparisonsCount: prev.comparisonsCount + 1
      }));
    } catch (error) {
      console.error(error);
      showNotification('Failed to compare selected schemes.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [token, showNotification]);

  const clearComparison = useCallback(() => {
    setCompareSchemes([]);
  }, []);

  const sendChatMessage = useCallback(async (text: string) => {
    if (!token) return;
    
    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date()
    };
    setChatMessages(prev => [...prev, userMsg]);

    try {
      const res = await schemeService.chat(text, chatSessionId, token);
      const agentMsg: ChatMessage = {
        id: `agent_${Date.now()}`,
        sender: 'agent',
        text: res.response,
        timestamp: new Date(),
        confidence: res.confidence,
        recommendations: res.analysis?.recommendations,
        knowledgeSources: res.knowledge_sources
      };
      setChatMessages(prev => [...prev, agentMsg]);
    } catch (error) {
      console.error(error);
      const errMsg: ChatMessage = {
        id: `err_${Date.now()}`,
        sender: 'agent',
        text: "I am having trouble consulting the Schemes Advisory agent. Please try again or visit help centers.",
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, errMsg]);
    }
  }, [token, chatSessionId]);

  const clearChat = useCallback(() => {
    setChatMessages([]);
  }, []);

  const setActiveOffice = useCallback((office: GovernmentOffice | null) => {
    setActiveOfficeState(office);
  }, []);

  const searchOffices = useCallback(async (radius?: number, lat?: number, lng?: number) => {
    if (!token) return;
    setIsLoading(true);
    try {
      const data = await schemeService.getOffices({ radius_km: radius, lat, lng }, token);
      setOffices(data);
    } catch (error) {
      console.error(error);
      showNotification('Failed to query government service desks.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [token, showNotification]);

  useEffect(() => {
    if (isAuthenticated && token) {
      fetchInitialData();
    }
  }, [isAuthenticated, token, fetchInitialData]);

  return (
    <SchemeContext.Provider
      value={{
        schemes,
        recommendations,
        eligibilityResults,
        savedSchemes,
        offices,
        resources,
        chatMessages,
        compareSchemes,
        activeOffice,
        isLoading,
        analytics,
        fetchInitialData,
        searchSchemes,
        runEligibilityCheck,
        saveScheme,
        unsaveScheme,
        loadComparison,
        clearComparison,
        sendChatMessage,
        clearChat,
        setActiveOffice,
        searchOffices
      }}
    >
      {children}
    </SchemeContext.Provider>
  );
};

export const useSchemes = () => {
  const context = useContext(SchemeContext);
  if (!context) {
    throw new Error('useSchemes must be used within a SchemeProvider');
  }
  return context;
};

export default SchemeContext;
