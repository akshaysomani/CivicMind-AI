import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { adminService } from '../services/adminService';
import type {
  AdminUser,
  AgentHealth,
  AuditLog,
  SystemHealth,
  SystemMetric,
  SecurityStatus,
  PerformanceStats,
  CacheStats,
  SystemError,
  SystemLog
} from '../services/adminService';

interface AdminContextType {
  users: AdminUser[];
  agents: AgentHealth[];
  auditLogs: AuditLog[];
  systemHealth: SystemHealth | null;
  systemMetrics: SystemMetric | null;
  securityStatus: SecurityStatus | null;
  performanceStats: PerformanceStats | null;
  cacheStats: CacheStats | null;
  systemErrors: SystemError[];
  systemLogs: SystemLog[];
  loading: boolean;
  error: string | null;
  refreshUsers: () => Promise<void>;
  refreshAgents: () => Promise<void>;
  refreshAuditLogs: () => Promise<void>;
  refreshSystemHealth: () => Promise<void>;
  refreshSystemMetrics: () => Promise<void>;
  refreshSystemSecurity: () => Promise<void>;
  refreshSystemPerformance: () => Promise<void>;
  refreshSystemCache: () => Promise<void>;
  refreshSystemErrors: () => Promise<void>;
  refreshSystemLogs: () => Promise<void>;
  clearCache: (namespace?: string) => Promise<void>;
  refreshAll: () => Promise<void>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [agents, setAgents] = useState<AgentHealth[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  
  // Module 17 States
  const [systemMetrics, setSystemMetrics] = useState<SystemMetric | null>(null);
  const [securityStatus, setSecurityStatus] = useState<SecurityStatus | null>(null);
  const [performanceStats, setPerformanceStats] = useState<PerformanceStats | null>(null);
  const [cacheStats, setCacheStats] = useState<CacheStats | null>(null);
  const [systemErrors, setSystemErrors] = useState<SystemError[]>([]);
  const [systemLogs, setSystemLogs] = useState<SystemLog[]>([]);
  
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const refreshUsers = useCallback(async () => {
    try {
      const data = await adminService.getUsers();
      setUsers(data);
    } catch (err: any) {
      console.error(err);
    }
  }, []);

  const refreshAgents = useCallback(async () => {
    try {
      const data = await adminService.getAgents();
      setAgents(data);
    } catch (err: any) {
      console.error(err);
    }
  }, []);

  const refreshAuditLogs = useCallback(async () => {
    try {
      const data = await adminService.getAuditLogs();
      setAuditLogs(data);
    } catch (err: any) {
      console.error(err);
    }
  }, []);

  const refreshSystemHealth = useCallback(async () => {
    try {
      const data = await adminService.getSystemHealth();
      setSystemHealth(data);
    } catch (err: any) {
      console.error(err);
    }
  }, []);

  const refreshSystemMetrics = useCallback(async () => {
    try {
      const data = await adminService.getSystemMetrics();
      setSystemMetrics(data);
    } catch (err: any) {
      console.error(err);
    }
  }, []);

  const refreshSystemSecurity = useCallback(async () => {
    try {
      const data = await adminService.getSystemSecurity();
      setSecurityStatus(data);
    } catch (err: any) {
      console.error(err);
    }
  }, []);

  const refreshSystemPerformance = useCallback(async () => {
    try {
      const data = await adminService.getSystemPerformance();
      setPerformanceStats(data);
    } catch (err: any) {
      console.error(err);
    }
  }, []);

  const refreshSystemCache = useCallback(async () => {
    try {
      const data = await adminService.getSystemCache();
      setCacheStats(data);
    } catch (err: any) {
      console.error(err);
    }
  }, []);

  const refreshSystemErrors = useCallback(async () => {
    try {
      const data = await adminService.getSystemErrors();
      setSystemErrors(data);
    } catch (err: any) {
      console.error(err);
    }
  }, []);

  const refreshSystemLogs = useCallback(async () => {
    try {
      const data = await adminService.getSystemLogs();
      setSystemLogs(data);
    } catch (err: any) {
      console.error(err);
    }
  }, []);

  const clearCache = useCallback(async (namespace?: string) => {
    try {
      await adminService.clearSystemCache(namespace);
      await refreshSystemCache();
    } catch (err: any) {
      console.error(err);
    }
  }, [refreshSystemCache]);

  const refreshAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await Promise.all([
        refreshUsers(),
        refreshAgents(),
        refreshAuditLogs(),
        refreshSystemHealth(),
        refreshSystemMetrics(),
        refreshSystemSecurity(),
        refreshSystemPerformance(),
        refreshSystemCache(),
        refreshSystemErrors(),
        refreshSystemLogs()
      ]);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch admin data');
    } finally {
      setLoading(false);
    }
  }, [
    refreshUsers, 
    refreshAgents, 
    refreshAuditLogs, 
    refreshSystemHealth,
    refreshSystemMetrics,
    refreshSystemSecurity,
    refreshSystemPerformance,
    refreshSystemCache,
    refreshSystemErrors,
    refreshSystemLogs
  ]);

  useEffect(() => {
    refreshAll();
    
    // Auto-refresh stats and health indicators in real-time intervals
    const interval = setInterval(() => {
      refreshSystemHealth();
      refreshSystemMetrics();
      refreshSystemSecurity();
      refreshSystemPerformance();
    }, 15000);

    return () => clearInterval(interval);
  }, [refreshAll, refreshSystemHealth, refreshSystemMetrics, refreshSystemSecurity, refreshSystemPerformance]);

  return (
    <AdminContext.Provider value={{
      users,
      agents,
      auditLogs,
      systemHealth,
      systemMetrics,
      securityStatus,
      performanceStats,
      cacheStats,
      systemErrors,
      systemLogs,
      loading,
      error,
      refreshUsers,
      refreshAgents,
      refreshAuditLogs,
      refreshSystemHealth,
      refreshSystemMetrics,
      refreshSystemSecurity,
      refreshSystemPerformance,
      refreshSystemCache,
      refreshSystemErrors,
      refreshSystemLogs,
      clearCache,
      refreshAll
    }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};

