import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { qaService } from '../services/qaService';
import type {
  QAResults,
  QACoverage,
  QAAccessibility,
  QAPerformance,
  QARelease,
  QAHealth
} from '../services/qaService';
import { useAuth } from './AuthContext';

interface QAContextType {
  results: QAResults | null;
  coverage: QACoverage | null;
  accessibility: QAAccessibility | null;
  performance: QAPerformance | null;
  release: QARelease | null;
  health: QAHealth | null;
  loading: boolean;
  error: string | null;
  runningTests: boolean;
  refreshResults: () => Promise<void>;
  refreshCoverage: () => Promise<void>;
  refreshAccessibility: () => Promise<void>;
  refreshPerformance: () => Promise<void>;
  refreshRelease: () => Promise<void>;
  refreshHealth: () => Promise<void>;
  triggerTestRun: () => Promise<void>;
  refreshAll: () => Promise<void>;
}

const QAContext = createContext<QAContextType | undefined>(undefined);

export const QAProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  
  const [results, setResults] = useState<QAResults | null>(null);
  const [coverage, setCoverage] = useState<QACoverage | null>(null);
  const [accessibility, setAccessibility] = useState<QAAccessibility | null>(null);
  const [performance, setPerformance] = useState<QAPerformance | null>(null);
  const [release, setRelease] = useState<QARelease | null>(null);
  const [health, setHealth] = useState<QAHealth | null>(null);
  
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [runningTests, setRunningTests] = useState<boolean>(false);

  const refreshResults = useCallback(async () => {
    try {
      const data = await qaService.getResults();
      setResults(data);
    } catch (err: any) {
      console.error("QA Results Fetch Error:", err);
    }
  }, []);

  const refreshCoverage = useCallback(async () => {
    try {
      const data = await qaService.getCoverage();
      setCoverage(data);
    } catch (err: any) {
      console.error("QA Coverage Fetch Error:", err);
    }
  }, []);

  const refreshAccessibility = useCallback(async () => {
    try {
      const data = await qaService.getAccessibility();
      setAccessibility(data);
    } catch (err: any) {
      console.error("QA Accessibility Fetch Error:", err);
    }
  }, []);

  const refreshPerformance = useCallback(async () => {
    try {
      const data = await qaService.getPerformance();
      setPerformance(data);
    } catch (err: any) {
      console.error("QA Performance Fetch Error:", err);
    }
  }, []);

  const refreshRelease = useCallback(async () => {
    try {
      const data = await qaService.getRelease();
      setRelease(data);
    } catch (err: any) {
      console.error("QA Release Fetch Error:", err);
    }
  }, []);

  const refreshHealth = useCallback(async () => {
    try {
      const data = await qaService.getHealth();
      setHealth(data);
    } catch (err: any) {
      console.error("QA Health Fetch Error:", err);
    }
  }, []);

  const triggerTestRun = useCallback(async () => {
    setRunningTests(true);
    setError(null);
    try {
      const res = await qaService.triggerTestRun();
      if (res.status === "started") {
        // Poll for results every 3 seconds, up to 15 times
        let attempts = 0;
        const interval = setInterval(async () => {
          attempts++;
          await refreshResults();
          await refreshHealth();
          if (attempts >= 10) {
            clearInterval(interval);
            setRunningTests(false);
          }
        }, 3000);
      } else {
        setRunningTests(false);
      }
    } catch (err: any) {
      setError(err.message || "Failed to trigger test runner.");
      setRunningTests(false);
    }
  }, [refreshResults, refreshHealth]);

  const refreshAll = useCallback(async () => {
    if (!currentUser || currentUser.role !== 'Admin') {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await Promise.all([
        refreshResults(),
        refreshCoverage(),
        refreshAccessibility(),
        refreshPerformance(),
        refreshRelease(),
        refreshHealth()
      ]);
    } catch (err: any) {
      setError("Failed to fetch some QA configurations.");
    } finally {
      setLoading(false);
    }
  }, [
    currentUser,
    refreshResults,
    refreshCoverage,
    refreshAccessibility,
    refreshPerformance,
    refreshRelease,
    refreshHealth
  ]);

  // Auto-refresh when admin logs in
  useEffect(() => {
    if (currentUser && currentUser.role === 'Admin') {
      refreshAll();
    }
  }, [currentUser, refreshAll]);


  return (
    <QAContext.Provider
      value={{
        results,
        coverage,
        accessibility,
        performance,
        release,
        health,
        loading,
        error,
        runningTests,
        refreshResults,
        refreshCoverage,
        refreshAccessibility,
        refreshPerformance,
        refreshRelease,
        refreshHealth,
        triggerTestRun,
        refreshAll
      }}
    >
      {children}
    </QAContext.Provider>
  );
};

export const useQA = () => {
  const context = useContext(QAContext);
  if (context === undefined) {
    throw new Error('useQA must be used within a QAProvider');
  }
  return context;
};
