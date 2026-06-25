import React from 'react';
import { useAdmin } from '../../context/AdminContext';
import { ErrorTimeline } from '../../components/admin/ErrorTimeline';
import { AlertCircle } from 'lucide-react';

export const ErrorMonitoringPage: React.FC = () => {
  const { systemErrors, loading } = useAdmin();

  const handleRetry = (id: string) => {
    alert(`Retry simulation triggered for error Job ID: ${id}`);
  };

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
            <AlertCircle className="w-8 h-8 mr-3 text-rose-500" />
            Error Monitoring
          </h1>
          <p className="text-slate-400 mt-1">Real-time unhandled server exceptions, correlation tracks, and retry tasks.</p>
        </div>
      </div>

      <div className="max-w-4xl">
        <ErrorTimeline errors={systemErrors} onRetry={handleRetry} />
      </div>
    </div>
  );
};

export default ErrorMonitoringPage;
