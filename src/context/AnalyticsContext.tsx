import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useNotifications } from './NotificationContext';
import { analyticsService } from '../services/analyticsService';
import type { 
  CivicDashboardIndex, 
  AnalyticsKPIs, 
  AnalyticsTrends, 
  AIInsight, 
  DecisionRecommendation, 
  WardScorecard, 
  CommunityEngagement, 
  ExecutiveSummary 
} from '../services/analyticsService';

export interface AnalyticsContextType {
  dashboardIndex: CivicDashboardIndex | null;
  kpis: AnalyticsKPIs | null;
  trends: AnalyticsTrends | null;
  insights: AIInsight[];
  recommendations: DecisionRecommendation[];
  scorecards: WardScorecard[];
  community: CommunityEngagement | null;
  citySummary: ExecutiveSummary | null;
  
  isLoading: boolean;
  error: string | null;
  activeWard: string;
  setActiveWard: (ward: string) => void;
  
  refreshAll: () => Promise<void>;
  implementRecommendation: (id: number) => Promise<void>;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

export const AnalyticsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, isAuthenticated } = useAuth();
  const { showNotification } = useNotifications();

  const [dashboardIndex, setDashboardIndex] = useState<CivicDashboardIndex | null>(null);
  const [kpis, setKpis] = useState<AnalyticsKPIs | null>(null);
  const [trends, setTrends] = useState<AnalyticsTrends | null>(null);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [recommendations, setRecommendations] = useState<DecisionRecommendation[]>([]);
  const [scorecards, setScorecards] = useState<WardScorecard[]>([]);
  const [community, setCommunity] = useState<CommunityEngagement | null>(null);
  const [citySummary, setCitySummary] = useState<ExecutiveSummary | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeWard, setActiveWard] = useState<string>('All');

  const refreshAll = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    setError(null);
    try {
      const [dbSummary, dbKpis, dbTrends, dbInsights, dbRecs, dbScores, dbComm, dbSum] = await Promise.all([
        analyticsService.getDashboard(token),
        analyticsService.getKPIs(token),
        analyticsService.getTrends(activeWard === 'All' ? null : activeWard, token),
        analyticsService.getInsights(token),
        analyticsService.getRecommendations(token),
        analyticsService.getScorecards(token),
        analyticsService.getCommunity(token),
        analyticsService.getSummary('city', token),
      ]);
      
      setDashboardIndex(dbSummary);
      setKpis(dbKpis);
      setTrends(dbTrends);
      setInsights(dbInsights);
      setRecommendations(dbRecs.map(r => ({ ...r, implemented: false })));
      setScorecards(dbScores);
      setCommunity(dbComm);
      setCitySummary(dbSum);
    } catch (e: any) {
      setError(e.message || 'Failed to sync database analytics.');
      showNotification('Failed to retrieve fresh decision insights.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [token, isAuthenticated, activeWard, showNotification]);

  const implementRecommendation = useCallback(async (id: number) => {
    setRecommendations(prev =>
      prev.map(r => (r.id === id ? { ...r, implemented: true } : r))
    );
    showNotification('Allocating resources and planning dispatch workflows.', 'success');
  }, [showNotification]);

  // Initial loading on login/ward switch
  useEffect(() => {
    if (isAuthenticated) {
      refreshAll();
    }
  }, [isAuthenticated, activeWard, refreshAll]);

  return (
    <AnalyticsContext.Provider
      value={{
        dashboardIndex,
        kpis,
        trends,
        insights,
        recommendations,
        scorecards,
        community,
        citySummary,
        isLoading,
        error,
        activeWard,
        setActiveWard,
        refreshAll,
        implementRecommendation,
      }}
    >
      {children}
    </AnalyticsContext.Provider>
  );
};

export const useAnalytics = () => {
  const context = useContext(AnalyticsContext);
  if (context === undefined) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
};
