import React from 'react';
import { useAdmin } from '../../context/AdminContext';
import { CacheWidget } from '../../components/admin/CacheWidget';
import { Cpu } from 'lucide-react';

export const CacheManagementPage: React.FC = () => {
  const { cacheStats, clearCache, loading } = useAdmin();

  if (loading) {
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
            <Cpu className="w-8 h-8 mr-3 text-indigo-500" />
            Cache Management
          </h1>
          <p className="text-slate-400 mt-1">Configure database and LLM caching parameters and purge namespaces.</p>
        </div>
      </div>

      <div className="max-w-4xl">
        <CacheWidget stats={cacheStats} onClear={clearCache} />
      </div>
    </div>
  );
};

export default CacheManagementPage;
