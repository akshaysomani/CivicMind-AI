import React from 'react';
import type { SecurityStatus } from '../../services/adminService';
import { ShieldCheck, ShieldAlert, Key, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface SecurityWidgetProps {
  status: SecurityStatus | null;
}

export const SecurityWidget: React.FC<SecurityWidgetProps> = ({ status }) => {
  if (!status) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-xl p-5"
    >
      <h3 className="font-semibold text-white mb-6 flex items-center">
        <ShieldCheck className="w-5 h-5 mr-2 text-indigo-400" />
        Active Security Shields
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Blocked Requests */}
        <div className="bg-slate-950/40 p-4 border border-slate-800 rounded-lg flex items-center space-x-3">
          <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-slate-400 text-xs font-medium">Blocked Requests (24h)</p>
            <h4 className="text-2xl font-bold text-white mt-0.5">{status.blocked_malicious_requests}</h4>
          </div>
        </div>

        {/* Failed Logins */}
        <div className="bg-slate-950/40 p-4 border border-slate-800 rounded-lg flex items-center space-x-3">
          <div className="p-2.5 rounded-lg bg-rose-500/10 text-rose-400">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <p className="text-slate-400 text-xs font-medium">Failed Logins (24h)</p>
            <h4 className="text-2xl font-bold text-white mt-0.5">{status.failed_login_attempts_24h}</h4>
          </div>
        </div>

        {/* MFA Enrolled */}
        <div className="bg-slate-950/40 p-4 border border-slate-800 rounded-lg flex items-center space-x-3">
          <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-400">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <p className="text-slate-400 text-xs font-medium">MFA Enrollment Rate</p>
            <h4 className="text-2xl font-bold text-white mt-0.5">{status.mfa_enrollment_rate_percent.toFixed(1)}%</h4>
          </div>
        </div>
      </div>

      <div className="border border-slate-800 bg-slate-950/40 rounded-lg p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-full">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">Compliance Standard</h4>
            <p className="text-xs text-slate-400">Security scans mapped to standard protocols</p>
          </div>
        </div>
        <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-3 py-1.5 rounded-lg">
          {status.security_compliance_status}
        </span>
      </div>
    </motion.div>
  );
};

export default SecurityWidget;
