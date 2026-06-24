import React from 'react';
import { ShieldCheck, Plus, Edit2, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

const MOCK_ROLES = [
  { id: '1', name: 'Super Administrator', description: 'Full access to all platform features and settings.', usersCount: 2, level: 'Critical' },
  { id: '2', name: 'Administrator', description: 'Access to manage users, roles, and standard settings.', usersCount: 5, level: 'High' },
  { id: '3', name: 'Department Head', description: 'Can manage department staff, view advanced analytics, and configure workflows.', usersCount: 15, level: 'Medium' },
  { id: '4', name: 'Ward Officer', description: 'Handles local issues, citizen reports, and community feed within assigned ward.', usersCount: 42, level: 'Medium' },
  { id: '5', name: 'Emergency Officer', description: 'Access to real-time GIS, emergency dispatch, and live monitoring.', usersCount: 8, level: 'High' },
  { id: '6', name: 'Citizen', description: 'Standard access to reporting, community feed, and personal dashboard.', usersCount: 1400, level: 'Low' },
];

export const RoleManagementPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-white">Role Management</h1>
          <p className="text-slate-400">Configure roles and their baseline access levels.</p>
        </div>
        <button className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-indigo-500/20">
          <Plus className="w-4 h-4" />
          <span>Create Role</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MOCK_ROLES.map((role, idx) => (
          <motion.div 
            key={role.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-colors"
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center space-x-2">
                <div className={`p-2 rounded-lg ${
                  role.level === 'Critical' ? 'bg-rose-500/10 text-rose-400' :
                  role.level === 'High' ? 'bg-amber-500/10 text-amber-400' :
                  role.level === 'Medium' ? 'bg-indigo-500/10 text-indigo-400' :
                  'bg-emerald-500/10 text-emerald-400'
                }`}>
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-white">{role.name}</h3>
              </div>
            </div>
            
            <p className="text-sm text-slate-400 mb-6 h-10">{role.description}</p>
            
            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <div className="text-sm text-slate-300">
                <span className="font-semibold text-white">{role.usersCount}</span> Users
              </div>
              <div className="flex space-x-2">
                <button className="p-1.5 text-slate-400 hover:text-indigo-400 transition-colors bg-slate-800 rounded">
                  <Edit2 className="w-4 h-4" />
                </button>
                {role.level !== 'Critical' && (
                  <button className="p-1.5 text-slate-400 hover:text-rose-400 transition-colors bg-slate-800 rounded">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default RoleManagementPage;
