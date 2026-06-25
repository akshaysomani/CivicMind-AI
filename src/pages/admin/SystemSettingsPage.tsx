import React, { useState } from 'react';
import { Save, Server, Globe, Shield, Bell } from 'lucide-react';
import { motion } from 'framer-motion';

export const SystemSettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('general');

  const tabs = [
    { id: 'general', name: 'General', icon: Globe },
    { id: 'ai', name: 'AI Models', icon: Server },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'notifications', name: 'Notifications', icon: Bell },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-white">System Settings</h1>
          <p className="text-slate-400">Global configuration, feature flags, and maintenance controls.</p>
        </div>
        <button className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-indigo-500/20">
          <Save className="w-4 h-4" />
          <span>Save Configuration</span>
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Settings Sidebar */}
        <div className="w-full lg:w-64 space-y-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id 
                  ? 'bg-indigo-500/10 text-indigo-400' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span>{tab.name}</span>
            </button>
          ))}
        </div>

        {/* Settings Content */}
        <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl p-6">
          <AnimateTabContent tab={activeTab} />
        </div>
      </div>
    </div>
  );
};

const AnimateTabContent = ({ tab }: { tab: string }) => {
  return (
    <motion.div
      key={tab}
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2 }}
    >
      {tab === 'general' && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-white border-b border-slate-800 pb-3">General Platform Settings</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Platform Name</label>
              <input type="text" defaultValue="CivicMind AI" className="w-full lg:w-1/2 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:border-indigo-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Support Email</label>
              <input type="email" defaultValue="support@civicmind.ai" className="w-full lg:w-1/2 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:border-indigo-500 focus:outline-none" />
            </div>
            <div className="pt-4 flex items-center justify-between border-t border-slate-800">
              <div>
                <h4 className="text-white font-medium">Maintenance Mode</h4>
                <p className="text-sm text-slate-400">Disable platform access for non-administrators.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-500"></div>
              </label>
            </div>
          </div>
        </div>
      )}

      {tab === 'ai' && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-white border-b border-slate-800 pb-3">AI & Vertex Models Guardrails</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-white font-medium text-sm">Prompt Injection Filter</h4>
                <p className="text-xs text-slate-400">Scan user prompts for malicious command overrides.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500"></div>
              </label>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <div>
                <h4 className="text-white font-medium text-sm">PII Redaction Engine</h4>
                <p className="text-xs text-slate-400">Scrub names, emails, phone numbers before hitting Gemini APIs.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500"></div>
              </label>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <div>
                <h4 className="text-white font-medium text-sm">RAG Source Grounding Check</h4>
                <p className="text-xs text-slate-400">Validate AI response overlap with retrieved documents.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500"></div>
              </label>
            </div>
          </div>
        </div>
      )}

      {tab === 'security' && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-white border-b border-slate-800 pb-3">Identity & Password Policies</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-white font-medium text-sm">Multi-Factor Authentication (MFA)</h4>
                <p className="text-xs text-slate-400">Force government and admin staff accounts to enroll in MFA.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500"></div>
              </label>
            </div>

            <div className="pt-4 border-t border-slate-800">
              <label className="block text-sm font-medium text-slate-300 mb-1">Inactivity Timeout Limit (Minutes)</label>
              <input type="number" defaultValue="15" className="w-24 bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-white focus:border-indigo-500 focus:outline-none" />
            </div>

            <div className="pt-4 border-t border-slate-800">
              <label className="block text-sm font-medium text-slate-300 mb-1">Max Login Lockout Attempts</label>
              <input type="number" defaultValue="5" className="w-24 bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-white focus:border-indigo-500 focus:outline-none" />
            </div>
          </div>
        </div>
      )}

      {tab === 'notifications' && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-white border-b border-slate-800 pb-3">Platform Notifications</h3>
          <p className="text-sm text-slate-400">Configure email and dispatch alerts configuration settings.</p>
        </div>
      )}
    </motion.div>
  );
};


export default SystemSettingsPage;
