import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { adminService, AdminUser, AgentHealth, AuditLog, SystemHealth } from '../services/adminService';

interface AdminContextType {
  users: AdminUser[];
  agents: AgentHealth[];
  auditLogs: AuditLog[];
  systemHealth: SystemHealth | null;
  loading: boolean;
  error: string | null;
  refreshUsers: () => Promise<void>;
  refreshAgents: () => Promise<void>;
  refreshAuditLogs: () => Promise<void>;
  refreshSystemHealth: () => Promise<void>;
  refreshAll: () => Promise<void>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [agents, setAgents] = useState<AgentHealth[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  
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

  const refreshAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await Promise.all([
        refreshUsers(),
        refreshAgents(),
        refreshAuditLogs(),
        refreshSystemHealth()
      ]);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch admin data');
    } finally {
      setLoading(false);
    }
  }, [refreshUsers, refreshAgents, refreshAuditLogs, refreshSystemHealth]);

  useEffect(() => {
    refreshAll();
    
    // Auto-refresh system health every 30 seconds
    const interval = setInterval(() => {
      refreshSystemHealth();
    }, 30000);

    return () => clearInterval(interval);
  }, [refreshAll, refreshSystemHealth]);

  return (
    <AdminContext.Provider value={{
      users,
      agents,
      auditLogs,
      systemHealth,
      loading,
      error,
      refreshUsers,
      refreshAgents,
      refreshAuditLogs,
      refreshSystemHealth,
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
