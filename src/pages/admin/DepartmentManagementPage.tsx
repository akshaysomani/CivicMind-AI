import React from 'react';
import { Building2, Map, Users, Plus } from 'lucide-react';

const MOCK_DEPTS = [
  { id: '1', name: 'Public Works', type: 'Infrastructure', head: 'John Davis', staff: 145 },
  { id: '2', name: 'Health Department', type: 'Healthcare', head: 'Dr. Sarah Connor', staff: 320 },
  { id: '3', name: 'Emergency Services', type: 'Safety', head: 'Chief Mike Smith', staff: 450 },
  { id: '4', name: 'Sanitation', type: 'Infrastructure', head: 'Robert Johnson', staff: 210 },
];

export const DepartmentManagementPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-white">Department Management</h1>
          <p className="text-slate-400">Manage government departments, wards, and zones.</p>
        </div>
        <button className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-indigo-500/20">
          <Plus className="w-4 h-4" />
          <span>Add Department</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-center space-x-4">
          <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-lg">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-slate-400">Total Departments</p>
            <h3 className="text-2xl font-bold text-white">12</h3>
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-center space-x-4">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-lg">
            <Map className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-slate-400">Managed Wards</p>
            <h3 className="text-2xl font-bold text-white">45</h3>
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-center space-x-4">
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-lg">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-slate-400">Gov. Officers</p>
            <h3 className="text-2xl font-bold text-white">1,125</h3>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-slate-800/50 text-xs uppercase text-slate-400">
            <tr>
              <th className="px-4 py-3">Department Name</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Department Head</th>
              <th className="px-4 py-3 text-right">Staff Count</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_DEPTS.map(dept => (
              <tr key={dept.id} className="border-b border-slate-800 hover:bg-slate-800/20">
                <td className="px-4 py-3 font-medium text-white">{dept.name}</td>
                <td className="px-4 py-3 text-slate-400">{dept.type}</td>
                <td className="px-4 py-3 text-slate-400">{dept.head}</td>
                <td className="px-4 py-3 text-right font-medium">{dept.staff}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DepartmentManagementPage;
