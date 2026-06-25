import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useNotifications } from './NotificationContext';
import { forecastService } from '../services/forecastService';
import type { 
  ForecastDashboard, 
  ForecastTrends, 
  ForecastRisk, 
  EarlyWarning, 
  PreventiveRecommendation, 
  SimulationResult, 
  ForecastConfidenceProfile, 
  GeospatialHeatmapPin 
} from '../services/forecastService';

export interface ForecastContextType {
  dashboard: ForecastDashboard | null;
  trends: ForecastTrends | null;
  risks: ForecastRisk[];
  warnings: EarlyWarning[];
  recommendations: PreventiveRecommendation[];
  simulation: SimulationResult | null;
  confidence: ForecastConfidenceProfile | null;
  geospatial: GeospatialHeatmapPin[];
  
  isLoading: boolean;
  error: string | null;
  activeRange: string;
  setActiveRange: (range: string) => void;
  
  refreshAll: () => Promise<void>;
  triggerSimulation: (staffInc: number, maintTeams: number, campaigns: boolean) => Promise<void>;
  dispatchPreventiveAction: (id: number) => Promise<void>;
}

const ForecastContext = createContext<ForecastContextType | undefined>(undefined);

export const ForecastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, isAuthenticated } = useAuth();
  const { showNotification } = useNotifications();

  const [dashboard, setDashboard] = useState<ForecastDashboard | null>(null);
  const [trends, setTrends] = useState<ForecastTrends | null>(null);
  const [risks, setRisks] = useState<ForecastRisk[]>([]);
  const [warnings, setWarnings] = useState<EarlyWarning[]>([]);
  const [recommendations, setRecommendations] = useState<PreventiveRecommendation[]>([]);
  const [simulation, setSimulation] = useState<SimulationResult | null>(null);
  const [confidence, setConfidence] = useState<ForecastConfidenceProfile | null>(null);
  const [geospatial, setGeospatial] = useState<GeospatialHeatmapPin[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeRange, setActiveRange] = useState<string>('7days');

  const refreshAll = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    setError(null);
    try {
      const [dbDash, dbTrends, dbRisks, dbWarns, dbRecs, dbConf, dbGeo] = await Promise.all([
        forecastService.getDashboard(token),
        forecastService.getTrends(activeRange, token),
        forecastService.getRisks(token),
        forecastService.getWarnings(token),
        forecastService.getRecommendations(token),
        forecastService.getConfidence(token),
        forecastService.getGeospatial(token),
      ]);
      
      setDashboard(dbDash);
      setTrends(dbTrends);
      setRisks(dbRisks);
      setWarnings(dbWarns);
      setRecommendations(dbRecs.map(r => ({ ...r, triggered: false })));
      setConfidence(dbConf);
      setGeospatial(dbGeo);
    } catch (e: any) {
      setError(e.message || 'Failed to sync forecasting parameters.');
      showNotification('Failed to retrieve forecast coordinates data.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [token, isAuthenticated, activeRange, showNotification]);

  const triggerSimulation = useCallback(async (staffInc: number, maintTeams: number, campaigns: boolean) => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    try {
      const res = await forecastService.runSimulation({
        staff_increase: staffInc,
        maintenance_teams: maintTeams,
        awareness_campaigns: campaigns
      }, token);
      setSimulation(res);
      showNotification('Scenario simulation updated.', 'success');
    } catch {
      showNotification('Failed to calculate simulated policy impacts.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [token, isAuthenticated, showNotification]);

  const dispatchPreventiveAction = useCallback(async (id: number) => {
    setRecommendations(prev =>
      prev.map(r => (r.id === id ? { ...r, triggered: true } : r))
    );
    showNotification('Preventive deployment scheduled successfully.', 'success');
  }, [showNotification]);

  useEffect(() => {
    if (isAuthenticated) {
      refreshAll();
    }
  }, [isAuthenticated, activeRange, refreshAll]);

  return (
    <ForecastContext.Provider
      value={{
        dashboard,
        trends,
        risks,
        warnings,
        recommendations,
        simulation,
        confidence,
        geospatial,
        isLoading,
        error,
        activeRange,
        setActiveRange,
        refreshAll,
        triggerSimulation,
        dispatchPreventiveAction,
      }}
    >
      {children}
    </ForecastContext.Provider>
  );
};

export const useForecast = () => {
  const context = useContext(ForecastContext);
  if (context === undefined) {
    throw new Error('useForecast must be used within a ForecastProvider');
  }
  return context;
};
