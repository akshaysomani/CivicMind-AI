import React from 'react';
import { useAdmin } from '../../context/AdminContext';
import { HealthCard } from '../../components/admin/HealthCard';
import { LatencyChart } from '../../components/admin/LatencyChart';
import { MetricCard } from '../../components/admin/MetricCard';
import { Activity, Server, Cpu, Users, Clock } from 'lucide-react';

export const MonitoringPage: React.FC = () => {
  const { systemHealth, systemMetrics, loading } = useAdmin();

  if (loading || !systemHealth || !systemMetrics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center">
            <Activity className="w-8 h-8 mr-3 text-indigo-500" />
            System Monitoring
          </h1>
          <p className="text-slate-400 mt-1">Real-time health, performance metrics, and infrastructure observability.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="CPU Load"
          value={`${systemMetrics.cpu_usage_percent.toFixed(1)}%`}
          icon={Cpu}
          color="indigo"
        />
        <MetricCard
          title="Memory Consumption"
          value={`${systemMetrics.memory_usage_percent.toFixed(1)}%`}
          icon={Server}
          color="sky"
        />
        <MetricCard
          title="API Response Time"
          value={`${systemMetrics.avg_api_latency_ms.toFixed(1)}ms`}
          icon={Clock}
          color="emerald"
        />
        <MetricCard
          title="Active Users"
          value={systemMetrics.active_users_24h.toString()}
          icon={Users}
          color="amber"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <LatencyChart />
        </div>
        <div>
          <HealthCard
            dbStatus={systemHealth.databaseHealth}
            apiStatus={systemHealth.apiHealth}
            cacheStatus="Healthy"
            connections={systemHealth.activeUsers}
          />
        </div>
      </div>
    </div>
  );
};

export default MonitoringPage;

