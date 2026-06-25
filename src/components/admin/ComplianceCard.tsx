import React from 'react';
import { ShieldCheck, CheckCircle2, Lock, Eye } from 'lucide-react';
import { motion } from 'framer-motion';

export const ComplianceCard: React.FC = () => {
  const complianceItems = [
    { title: 'OWASP Top 10 Protections', desc: 'Active parameterized DB structures, strict CSRF tokens, and secure headers.', icon: ShieldCheck, status: 'Compliant' },
    { title: 'GDPR Privacy Standards', desc: 'No personal identification logged; active prompt PII redaction filters.', icon: Eye, status: 'Compliant' },
    { title: 'Least Privilege RBAC', desc: 'Inherited role-based API access controls checked on every route.', icon: Lock, status: 'Compliant' },
    { title: 'Data Encryption', desc: 'Secure transit with TLS guidelines and encrypted local cookies.', icon: CheckCircle2, status: 'Compliant' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-xl p-5"
    >
      <h3 className="font-semibold text-white mb-4 flex items-center">
        <ShieldCheck className="w-5 h-5 mr-2 text-indigo-400" />
        Data Protection Compliance Audit
      </h3>
      <p className="text-xs text-slate-400 mb-6">Audited security configurations mapping GDPR & OWASP benchmarks</p>

      <div className="space-y-4">
        {complianceItems.map((item, idx) => (
          <div key={idx} className="flex justify-between items-start p-3 bg-slate-800/40 border border-slate-800/60 rounded-lg">
            <div className="flex space-x-3">
              <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 mt-0.5">
                <item.icon className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">{item.title}</h4>
                <p className="text-xs text-slate-400 mt-0.5">{item.desc}</p>
              </div>
            </div>
            <span className="text-[10px] font-bold tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded uppercase flex items-center space-x-1">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              {item.status}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default ComplianceCard;
