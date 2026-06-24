import React from 'react';
import { ShieldAlert, ShieldCheck, Lock, EyeOff, AlertOctagon } from 'lucide-react';
import { motion } from 'framer-motion';

export const SecurityCenterPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center">
            <ShieldAlert className="w-8 h-8 mr-3 text-rose-500" />
            Security Center
          </h1>
          <p className="text-slate-400 mt-1">Monitor threats, access violations, rate limits, and zero-trust policies.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[
          { title: 'Failed Logins (24h)', value: '142', icon: Lock, color: 'amber' },
          { title: 'Blocked Requests', value: '4,521', icon: ShieldCheck, color: 'emerald' },
          { title: 'Suspicious Activity', value: '3', icon: EyeOff, color: 'rose' },
          { title: 'Rate Limit Hits', value: '89', icon: AlertOctagon, color: 'indigo' },
        ].map((stat, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`bg-slate-900 border border-slate-800 rounded-xl p-5 border-l-4 border-l-${stat.color}-500`}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-slate-400 text-sm font-medium">{stat.title}</p>
                <h3 className="text-2xl font-bold text-white mt-1">{stat.value}</h3>
              </div>
              <div className={`p-2 rounded-lg bg-${stat.color}-500/10 text-${stat.color}-400`}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Recent Security Events</h3>
        <div className="text-center py-12 text-slate-500">
          <ShieldCheck className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p>No high-severity security events detected in the last hour.</p>
        </div>
      </div>
    </div>
  );
};

export default SecurityCenterPage;
