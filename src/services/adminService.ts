import { delay } from '../utils/delay';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  department?: string;
  ward?: string;
  status: 'Active' | 'Inactive' | 'Suspended';
  lastLogin: string;
}

export interface AdminRole {
  id: string;
  name: string;
  description: string;
  usersCount: number;
}

export interface AdminPermission {
  id: string;
  module: string;
  action: string;
  description: string;
}

export interface AgentHealth {
  id: string;
  name: string;
  status: 'Healthy' | 'Degraded' | 'Offline';
  version: string;
  latencyMs: number;
  memoryUsageMb: number;
  successRate: number;
  errorRate: number;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  resource: string;
  status: 'Success' | 'Failed';
}

export interface SystemHealth {
  cpuUsage: number;
  memoryUsage: number;
  databaseHealth: 'Healthy' | 'Warning' | 'Critical';
  apiHealth: 'Healthy' | 'Warning' | 'Critical';
  activeUsers: number;
}

// Mock Data
const MOCK_USERS: AdminUser[] = [
  { id: 'usr-1', name: 'Alice Admin', email: 'alice@civicmind.ai', role: 'Super Administrator', status: 'Active', lastLogin: '2026-06-24T10:00:00Z' },
  { id: 'usr-2', name: 'Bob Official', email: 'bob@gov.city', role: 'Department Head', department: 'Public Works', status: 'Active', lastLogin: '2026-06-24T09:15:00Z' },
  { id: 'usr-3', name: 'Charlie Citizen', email: 'charlie@example.com', role: 'Citizen', status: 'Active', lastLogin: '2026-06-23T14:20:00Z' },
  { id: 'usr-4', name: 'Diana Ward', email: 'diana@gov.city', role: 'Ward Officer', ward: 'Ward 3', status: 'Inactive', lastLogin: '2026-06-10T08:00:00Z' },
];

const MOCK_AGENTS: AgentHealth[] = [
  { id: 'agt-1', name: 'Civic Triage Agent', status: 'Healthy', version: '2.4.1', latencyMs: 120, memoryUsageMb: 512, successRate: 99.8, errorRate: 0.2 },
  { id: 'agt-2', name: 'GIS Analysis Agent', status: 'Healthy', version: '1.8.0', latencyMs: 350, memoryUsageMb: 1024, successRate: 98.5, errorRate: 1.5 },
  { id: 'agt-3', name: 'Emergency Dispatch AI', status: 'Healthy', version: '3.0.2', latencyMs: 85, memoryUsageMb: 256, successRate: 99.9, errorRate: 0.1 },
  { id: 'agt-4', name: 'Predictive Maintenance', status: 'Degraded', version: '1.2.5', latencyMs: 850, memoryUsageMb: 2048, successRate: 92.0, errorRate: 8.0 },
];

const MOCK_AUDIT: AuditLog[] = [
  { id: 'aud-1', timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), user: 'alice@civicmind.ai', action: 'Update Role', resource: 'usr-2', status: 'Success' },
  { id: 'aud-2', timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(), user: 'bob@gov.city', action: 'Delete Report', resource: 'rpt-99', status: 'Failed' },
  { id: 'aud-3', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), user: 'SYSTEM', action: 'Agent Restart', resource: 'agt-4', status: 'Success' },
];

const MOCK_HEALTH: SystemHealth = {
  cpuUsage: 45,
  memoryUsage: 68,
  databaseHealth: 'Healthy',
  apiHealth: 'Healthy',
  activeUsers: 1420
};

export const adminService = {
  getUsers: async (): Promise<AdminUser[]> => {
    await delay(400);
    return [...MOCK_USERS];
  },
  
  getAgents: async (): Promise<AgentHealth[]> => {
    await delay(300);
    return [...MOCK_AGENTS];
  },

  getAuditLogs: async (): Promise<AuditLog[]> => {
    await delay(350);
    return [...MOCK_AUDIT];
  },

  getSystemHealth: async (): Promise<SystemHealth> => {
    await delay(200);
    return { ...MOCK_HEALTH };
  }
};
