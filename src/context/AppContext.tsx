import React, { createContext, useContext, useState } from 'react';

export interface AppStats {
  communitiesConnected: number;
  aiDecisions: number;
  reportsGenerated: number;
  responseTime: string;
}

interface AppContextType {
  appName: string;
  version: string;
  stats: AppStats;
  userRole: 'guest' | 'citizen' | 'government' | 'admin';
  setUserRole: (role: 'guest' | 'citizen' | 'government' | 'admin') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userRole, setUserRole] = useState<'guest' | 'citizen' | 'government' | 'admin'>('guest');

  // Global mockup stats for Module 1 dashboard and counters
  const stats: AppStats = {
    communitiesConnected: 1420,
    aiDecisions: 89400,
    reportsGenerated: 34102,
    responseTime: '< 4.2 mins',
  };

  return (
    <AppContext.Provider
      value={{
        appName: 'CivicMind AI',
        version: '1.0.0-enterprise',
        stats,
        userRole,
        setUserRole,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
