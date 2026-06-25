import React from 'react';
import { useAdmin } from '../../context/AdminContext';
import { SecurityWidget } from '../../components/admin/SecurityWidget';
import { ThreatCard } from '../../components/admin/ThreatCard';
import { ComplianceCard } from '../../components/admin/ComplianceCard';
import { ShieldAlert } from 'lucide-react';

export const SecurityCenterPage: React.FC = () => {
  const { securityStatus, loading } = useAdmin();

  if (loading || !securityStatus) {
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
            <ShieldAlert className="w-8 h-8 mr-3 text-rose-500" />
            Security Center
          </h1>
          <p className="text-slate-400 mt-1">Monitor threats, access violations, rate limits, and compliance status.</p>
        </div>
      </div>

      <div className="space-y-6 max-w-5xl">
        <SecurityWidget status={securityStatus} />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ThreatCard threats={securityStatus.threats} />
          <ComplianceCard />
        </div>
      </div>
    </div>
  );
};

export default SecurityCenterPage;

